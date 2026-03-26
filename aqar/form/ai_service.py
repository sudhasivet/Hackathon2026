import json
import logging
import os
import requests
from typing import Optional

logger = logging.getLogger(__name__)

AI_SERVICE_URL = 'https://hackathon2026-o1pa.onrender.com'
AI_TIMEOUT     = int(os.environ.get('AI_TIMEOUT', 120))


def _fetch_metric_rows(dept, model_name: str, fields: list) -> list:
    """Fetch rows from DB and serialise to plain dicts."""
    from . import models as m
    Model = getattr(m, model_name, None)
    if not Model:
        return []
    rows = []
    for obj in Model.objects.filter(department=dept):
        rows.append({f: str(getattr(obj, f, '') or '') for f in fields})
    return rows


# All metrics the AI service can generate paragraphs for
SUPPORTED_METRICS = {
    '1.1':    ('Metric_1_1',               ['program_code','program_name','course_code','course_name','year_of_introduction']),
    '1.1.3':  ('Metric_1_1_3',             ['year','teacher_name','body_name']),
    '1.2.1':  ('Metric_1_2_1',             ['program_code','program_name','year_introduction','cbcs_status','cbcs_year']),
    '1.2.2':  ('Metric_1_2_2_1_2_3',       ['program_name','year_of_offering','times_offered','duration','students_enrolled','students_completing']),
    '1.3.2':  ('Metric_1_3_2',             ['program_name','program_code','course_name','course_code','year_offering','student_name']),
    '1.3.3':  ('Metric_1_3_3',             ['program_name','program_code','student_name']),
    '2.1':    ('Metric_2_1',               ['year_of_enrollment','student_name','enrollment_number','date_of_enrollment']),
    '2.1.1':  ('Metric_2_1_1',             ['program_name','program_code','sanctioned_seats','students_admitted']),
    '2.1.2':  ('Metric_2_1_2',             ['year','earmarked_sc','earmarked_st','earmarked_obc','earmarked_gen','earmarked_others','admitted_sc','admitted_st','admitted_obc','admitted_gen','admitted_others']),
    '2.4.1':  ('Metric_2_4_1_2_4_3',       ['teacher_name','pan','designation','year_of_appointment','nature_of_appointment','department_name','years_of_experience','still_serving']),
    '2.6.3':  ('Metric_2_6_3',             ['year','program_code','program_name','students_appeared','students_passed']),
    '2.4.2':  ('Metric_2_4_2_3_1_2_3_3_1', ['teacher_name','qualification','qualification_year','is_research_guide','recognition_year','still_serving','scholar_name','scholar_reg_year']),
    '3.1.1':  ('Metric_3_1_1_3_1_3',       ['project_name','pi_name','pi_department','year_of_award','amount_sanctioned','duration','funding_agency','agency_type']),
    '3.2.2':  ('Metric_3_2_2',             ['year','seminar_name','participants','date_from_to']),
    '3.3.2':  ('Metric_3_3_2',             ['paper_title','authors','dept_name','journal_name','year','issn']),
    '3.3.3':  ('Metric_3_3_3',             ['sl_no','teacher_name','book_chapter_title','national_international','year_of_publication','isbn_issn','publisher']),
    '3.4.3':  ('Metric_3_4_3_3_4_4',       ['activity_name','organising_agency','scheme_name','year','students_participated']),
    '3.5.2':  ('Metric_3_5_2',             ['organisation','institution_industry','year_of_signing','duration','participants_count']),
    '4.1.3':  ('Metric_4_1_3',             ['room_name','ict_type']),
    '4.1.4':  ('Metric_4_1_4_4_4_1',       ['year','budget_allocated','expenditure_augmentation','total_expenditure_ex_salary','maintenance_academic','maintenance_physical']),
    '5.1.1':  ('Metric_5_1_1_5_1_2',       ['year','scheme_name','govt_students_count','govt_amount','institution_students_count','institution_amount']),
    '5.2.1':  ('Metric_5_2_1',             ['year','student_name','program_graduated','employer_name','pay_package']),
    '6.2.3':  ('Metric_6_2_3',             ['area','vendor_details','year_implemented']),
    '6.5.3':  ('Metric_6_5_3',             ['year','conferences_seminars','nirf_participation','iso_certification','nba_certification']),
    '7.1.1':  ('Metric_7_1_1',             ['title','period_from','period_to','participants_male','participants_female','participants_total']),
    '7.1.3':  ('Metric_7_1_3',             ['facility','available','beneficiaries']),
    '7.1.11': ('Metric_7_1_11',            ['activity','duration_from','duration_to','participants_male','participants_female','participants_total']),
}


def generate_ai_paragraphs(dept, college_name: str = '', aqar_year: str = '') -> dict:
    """
    Collect DB data for all supported metrics and send to AI service.
    Returns dict of { metricId: paragraph_text }.
    Falls back gracefully if the AI service is unavailable.
    """
    # Build payload
    metrics_data = {}
    for metric_id, (model_name, fields) in SUPPORTED_METRICS.items():
        rows = _fetch_metric_rows(dept, model_name, fields)
        metrics_data[metric_id] = rows

    payload = {
        'metricsData':    metrics_data,
        'deptId':         dept.id,
        'departmentName': dept.name,
        'collegeName':    college_name or '',
        'aqarYear':       aqar_year or '2023-24',
    }

    try:
        resp = requests.post(
            f'{AI_SERVICE_URL}/api/generate/all',
            json=payload,
            timeout=AI_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        # Extract text from each metric result
        return {mid: result.get('text', '') for mid, result in data.items() if isinstance(result, dict)}
    except requests.Timeout:
        logger.warning('[AI] Service timeout — using data-only report')
        return {}
    except requests.ConnectionError:
        logger.warning('[AI] Service unavailable — using data-only report')
        return {}
    except Exception as e:
        logger.error(f'[AI] Unexpected error: {e}')
        return {}


def generate_single_paragraph(metric_id: str, dept, college_name: str = '', aqar_year: str = '') -> Optional[str]:
    """Generate paragraph for a single metric."""
    if metric_id not in SUPPORTED_METRICS:
        return None
    model_name, fields = SUPPORTED_METRICS[metric_id]
    rows = _fetch_metric_rows(dept, model_name, fields)
    payload = {
        'metricId':       metric_id,
        'rows':           rows,
        'deptId':         dept.id,
        'departmentName': dept.name,
        'collegeName':    college_name or '',
        'aqarYear':       aqar_year or '2023-24',
    }
    try:
        resp = requests.post(
            f'{AI_SERVICE_URL}/api/generate/metric',
            json=payload,
            timeout=AI_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get('text', '')
    except Exception as e:
        logger.error(f'[AI] Single metric generation failed for {metric_id}: {e}')
        return None


def clear_dept_cache(dept_id: int):
    """Clear AI cache for a department (call after HOD saves data)."""
    try:
        requests.post(
            f'{AI_SERVICE_URL}/api/cache/clear',
            json={'deptId': dept_id},
            timeout=5,
        )
    except Exception:
        pass 