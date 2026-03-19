import io
from datetime import datetime

from openpyxl import Workbook
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# ── Metric registry — (Model, fields, display_headers) ───────────────────────
# We import lazily inside the function to avoid circular import issues.

METRIC_META = {
    '1.1':        ('Metric_1_1',               ['program_code','program_name','course_code','course_name','year_of_introduction'],
                   ['Program Code','Program Name','Course Code','Course Name','Year of Introduction']),
    '1.1.3':      ('Metric_1_1_3',             ['year','teacher_name','body_name'],
                   ['Year','Name of Teacher','Name of Body']),
    '1.2.1':      ('Metric_1_2_1',             ['program_code','program_name','year_introduction','cbcs_status','cbcs_year'],
                   ['Programme Code','Programme Name','Year of Introduction','CBCS Status','Year of CBCS Implementation']),
    '1.2.2':      ('Metric_1_2_2_1_2_3',       ['program_name','course_code','year_of_offering','times_offered','duration','students_enrolled','students_completing'],
                   ['Program Name','Course Code','Year of Offering','Times Offered','Duration','Students Enrolled','Students Completing']),
    '1.3.2':      ('Metric_1_3_2',             ['program_name','program_code','course_name','course_code','year_offering','student_name'],
                   ['Program Name','Program Code','Course Name','Course Code','Year','Student Name']),
    '1.3.3':      ('Metric_1_3_3',             ['program_name','program_code','student_name'],
                   ['Programme Name','Programme Code','Student Name']),
    '2.1':        ('Metric_2_1',               ['year_of_enrollment','student_name','enrollment_number','date_of_enrollment'],
                   ['Year of Enrollment','Student Name','Enrollment No.','Date of Enrollment']),
    '2.2':        ('Metric_2_2',               ['year','reserved_seats'],
                   ['Year','Reserved Seats']),
    '2.3':        ('Metric_2_3',               ['year_of_passing','student_name','enrollment_number'],
                   ['Year of Passing','Student Name','Enrollment No.']),
    '2.1.1':      ('Metric_2_1_1',             ['program_name','program_code','sanctioned_seats','students_admitted'],
                   ['Programme Name','Code','Sanctioned Seats','Students Admitted']),
    '2.1.2':      ('Metric_2_1_2',             ['year','earmarked_sc','earmarked_st','earmarked_obc','earmarked_gen','earmarked_others','admitted_sc','admitted_st','admitted_obc','admitted_gen','admitted_others'],
                   ['Year','Earmarked SC','Earmarked ST','Earmarked OBC','Earmarked Gen','Earmarked Others','Admitted SC','Admitted ST','Admitted OBC','Admitted Gen','Admitted Others']),
    '2.4.1':      ('Metric_2_4_1_2_4_3',       ['teacher_name','pan','designation','year_of_appointment','nature_of_appointment','department_name','years_of_experience','still_serving'],
                   ['Teacher Name','PAN','Designation','Year of Appointment','Nature','Department','Years of Experience','Still Serving?']),
    '2.6.3':      ('Metric_2_6_3',             ['year','program_code','program_name','students_appeared','students_passed'],
                   ['Year','Program Code','Program Name','Students Appeared','Students Passed']),
    '2.4.2':      ('Metric_2_4_2_3_1_2_3_3_1', ['teacher_name','qualification','qualification_year','is_research_guide','recognition_year','still_serving','scholar_name','scholar_reg_year'],
                   ['Teacher Name','Qualification','Year','Research Guide?','Recognition Year','Still Serving?','Scholar Name','Scholar Reg. Year']),
    '3.1':        ('Metric_3_1',               ['teacher_name','email','gender','designation','date_of_joining','sanctioned_posts'],
                   ['Teacher Name','Email','Gender','Designation','Date of Joining','Sanctioned Posts']),
    '3.2':        ('Metric_3_2',               ['year','sanctioned_posts'],
                   ['Year','Sanctioned Posts']),
    '3.1.1':      ('Metric_3_1_1_3_1_3',       ['project_name','pi_name','pi_department','year_of_award','amount_sanctioned','duration','funding_agency','agency_type'],
                   ['Project Name','PI Name','Department','Year of Award','Amount (Lakhs)','Duration','Funding Agency','Type']),
    '3.2.2':      ('Metric_3_2_2',             ['year','seminar_name','participants','date_from_to'],
                   ['Year','Name of Workshop/Seminar','Participants','Date']),
    '3.3.2':      ('Metric_3_3_2',             ['paper_title','authors','dept_name','journal_name','year','issn'],
                   ['Title of Paper','Author(s)','Department','Journal Name','Year','ISSN']),
    '3.3.3':      ('Metric_3_3_3',             ['sl_no','teacher_name','book_chapter_title','paper_title','national_international','year_of_publication','isbn_issn','publisher'],
                   ['Sl.No.','Teacher Name','Book/Chapter Title','Paper Title','National/International','Year','ISBN/ISSN','Publisher']),
    '3.4.2':      ('Metric_3_4_2',             ['activity_name','award_name','awarding_body','year_of_award'],
                   ['Activity Name','Award/Recognition','Awarding Body','Year']),
    '3.4.3':      ('Metric_3_4_3_3_4_4',       ['activity_name','organising_agency','scheme_name','year','students_participated'],
                   ['Activity Name','Organising Agency','Scheme Name','Year','Students Participated']),
    '3.5.1':      ('Metric_3_5_1',             ['sl_no','activity_title','collaborating_agency','participant_name','year','duration','nature_of_activity'],
                   ['Sl.No.','Activity Title','Collaborating Agency','Participant','Year','Duration','Nature']),
    '3.5.2':      ('Metric_3_5_2',             ['organisation','institution_industry','year_of_signing','duration','participants_count'],
                   ['Organisation','Institution/Industry','Year of Signing','Duration','Participants']),
    '4.1.3':      ('Metric_4_1_3',             ['room_name','ict_type'],
                   ['Room Name/Number','Type of ICT Facility']),
    '4.1.4':      ('Metric_4_1_4_4_4_1',       ['year','budget_allocated','expenditure_augmentation','total_expenditure_ex_salary','maintenance_academic','maintenance_physical'],
                   ['Year','Budget Allocated','Expenditure (Augmentation)','Total Expenditure','Maintenance (Academic)','Maintenance (Physical)']),
    '4.2.2':      ('Metric_4_2_2_4_2_3',       ['library_resource','membership_details','expenditure_ejournals_ebooks','total_library_expenditure'],
                   ['Library Resource','Membership Details','Expenditure (e-journals/e-books)','Total Library Expenditure']),
    '5.1.1':      ('Metric_5_1_1_5_1_2',       ['year','scheme_name','govt_students_count','govt_amount','institution_students_count','institution_amount'],
                   ['Year','Scheme Name','Govt Students','Govt Amount','Institution Students','Institution Amount']),
    '5.1.3':      ('Metric_5_1_3',             ['program_name','date_implemented','students_enrolled'],
                   ['Program Name','Date Implemented','Students Enrolled']),
    '5.1.4':      ('Metric_5_1_4',             ['year','competitive_exam_activity','competitive_exam_students','career_counselling_activity','career_counselling_students','students_placed_campus'],
                   ['Year','Competitive Exam Activity','Students','Career Counselling Activity','Students','Campus Placements']),
    '5.2.1':      ('Metric_5_2_1',             ['year','student_name','program_graduated','employer_name','pay_package'],
                   ['Year','Student Name','Program Graduated','Employer','Pay Package']),
    '5.2.2':      ('Metric_5_2_2',             ['student_name','program_graduated','institution_joined','program_admitted'],
                   ['Student Name','Program Graduated','Institution Joined','Programme Admitted To']),
    '5.2.3':      ('Metric_5_2_3',             ['year','roll_number','student_name'],
                   ['Year','Roll Number','Student Name']),
    '5.3.1':      ('Metric_5_3_1',             ['year','award_name','team_or_individual','level','sports_or_cultural','student_name'],
                   ['Year','Award/Medal','Team/Individual','Level','Sports/Cultural','Student Name']),
    '5.3.3':      ('Metric_5_3_3',             ['event_date','event_name','student_name'],
                   ['Event Date','Event Name','Student Name']),
    '6.2.3':      ('Metric_6_2_3',             ['area','vendor_details','year_implemented'],
                   ['Area of E-Governance','Vendor Details','Year of Implementation']),
    '6.3.2':      ('Metric_6_3_2',             ['year','teacher_name','conference_name','amount'],
                   ['Year','Teacher Name','Conference/Workshop','Amount (₹)']),
    '6.3.3':      ('Metric_6_3_3',             ['dates','teaching_program_title','nonteaching_program_title','participants_count'],
                   ['Dates','Teaching Program Title','Non-Teaching Program Title','Participants']),
    '6.3.4':      ('Metric_6_3_4',             ['teacher_name','program_title','duration'],
                   ['Teacher Name','Program Title','Duration']),
    '6.4.2':      ('Metric_6_4_2',             ['year','agency_name','purpose','amount'],
                   ['Year','Agency/Individual','Purpose','Amount (Lakhs)']),
    '6.5.3':      ('Metric_6_5_3',             ['year','conferences_seminars','nirf_participation','iso_certification','nba_certification'],
                   ['Year','Conferences/Seminars','NIRF Participation','ISO Certification','NBA Certification']),
}

CRITERIA_ORDER = [
    ('Criterion I',   'Curricular Aspects',                  ['1.1','1.1.3','1.2.1','1.2.2','1.3.2','1.3.3']),
    ('Criterion II',  'Teaching-Learning & Evaluation',      ['2.1','2.2','2.3','2.1.1','2.1.2','2.4.1','2.6.3']),
    ('Criterion III', 'Research, Innovations & Extension',   ['2.4.2','3.1','3.2','3.1.1','3.2.2','3.3.2','3.3.3','3.4.2','3.4.3','3.5.1','3.5.2']),
    ('Criterion IV',  'Infrastructure & Learning Resources', ['4.1.3','4.1.4','4.2.2']),
    ('Criterion V',   'Student Support & Progression',       ['5.1.1','5.1.3','5.1.4','5.2.1','5.2.2','5.2.3','5.3.1','5.3.3']),
    ('Criterion VI',  'Governance, Leadership & Management', ['6.2.3','6.3.2','6.3.3','6.3.4','6.4.2','6.5.3']),
]


def _get_rows(dept, model_name, fields):
    """Fetch rows from DB for a metric."""
    from . import models as m
    Model = getattr(m, model_name, None)
    if not Model:
        return []
    qs = Model.objects.filter(department=dept)
    result = []
    for obj in qs:
        row = []
        for f in fields:
            val = getattr(obj, f, '')
            if val is None:
                val = ''
            row.append(str(val))
        result.append(row)
    return result


def _dept_summary(dept):
    """Build criterion-wise completion summary."""
    summary = []
    for crit_name, crit_sub, metric_ids in CRITERIA_ORDER:
        total = len(metric_ids)
        filled = 0
        for mid in metric_ids:
            if mid not in METRIC_META:
                continue
            model_name, fields, _ = METRIC_META[mid]
            rows = _get_rows(dept, model_name, fields)
            if rows:
                filled += 1
        summary.append({
            'criterion': crit_name,
            'subtitle': crit_sub,
            'filled': filled,
            'total': total,
            'pct': round((filled / total) * 100) if total else 0,
        })
    return summary


# ══════════════════════════════════════════════════════════════════════════════
# EXCEL REPORT
# ══════════════════════════════════════════════════════════════════════════════

def generate_excel(dept, college_name='', aqar_year=''):
    wb = Workbook()

    # Colour palette
    DARK_BLUE  = '1E3A5F'
    MID_BLUE   = '2D5986'
    LIGHT_BLUE = 'D6E4F0'
    ACCENT     = '0EA5E9'
    WHITE      = 'FFFFFF'
    GREY_BG    = 'F4F6F9'
    GREEN      = '22C55E'
    ORANGE     = 'F97316'

    def _hdr_font(sz=11, bold=True, color=WHITE):
        return Font(name='Arial', size=sz, bold=bold, color=color)

    def _cell_font(sz=10, bold=False, color='1A1A2E'):
        return Font(name='Arial', size=sz, bold=bold, color=color)

    def _fill(hex_color):
        return PatternFill('solid', fgColor=hex_color)

    def _border():
        s = Side(style='thin', color='CCCCCC')
        return Border(left=s, right=s, top=s, bottom=s)

    def _center():
        return Alignment(horizontal='center', vertical='center', wrap_text=True)

    def _left():
        return Alignment(horizontal='left', vertical='center', wrap_text=True)

    # ── Cover sheet ──────────────────────────────────────────────────────────
    ws = wb.active
    ws.title = 'Cover'
    ws.sheet_view.showGridLines = False

    # Merge and style header
    ws.merge_cells('A1:H1')
    ws['A1'] = 'AQAR DATA REPORT'
    ws['A1'].font = Font(name='Arial', size=22, bold=True, color=WHITE)
    ws['A1'].fill = _fill(DARK_BLUE)
    ws['A1'].alignment = _center()
    ws.row_dimensions[1].height = 50

    ws.merge_cells('A2:H2')
    ws['A2'] = 'Annual Quality Assurance Report — Data Submission'
    ws['A2'].font = Font(name='Arial', size=12, color=ACCENT)
    ws['A2'].fill = _fill(MID_BLUE)
    ws['A2'].alignment = _center()
    ws.row_dimensions[2].height = 28

    ws.merge_cells('A3:H3')
    ws['A3'] = ''
    ws['A3'].fill = _fill(DARK_BLUE)
    ws.row_dimensions[3].height = 8

    # Info rows
    info = [
        ('Department', dept.name),
        ('Stream', 'Aided' if dept.stream == 'aided' else 'Self Finance'),
        ('College', college_name or '—'),
        ('AQAR Year', aqar_year or '—'),
        ('Generated On', datetime.now().strftime('%d %B %Y, %I:%M %p')),
        ('Submitted By', str(dept.hod) if dept.hod else '—'),
    ]
    for i, (label, value) in enumerate(info, start=5):
        ws.row_dimensions[i].height = 24
        ws.merge_cells(f'A{i}:C{i}')
        ws[f'A{i}'] = label
        ws[f'A{i}'].font = _hdr_font(11, True, DARK_BLUE)
        ws[f'A{i}'].fill = _fill(LIGHT_BLUE)
        ws[f'A{i}'].alignment = _left()
        ws[f'A{i}'].border = _border()
        ws.merge_cells(f'D{i}:H{i}')
        ws[f'D{i}'] = value
        ws[f'D{i}'].font = _cell_font(11, False)
        ws[f'D{i}'].alignment = _left()
        ws[f'D{i}'].border = _border()

    # Summary table
    summary = _dept_summary(dept)
    start_row = 13
    ws.merge_cells(f'A{start_row}:H{start_row}')
    ws[f'A{start_row}'] = 'CRITERION-WISE COMPLETION SUMMARY'
    ws[f'A{start_row}'].font = _hdr_font(12, True, WHITE)
    ws[f'A{start_row}'].fill = _fill(DARK_BLUE)
    ws[f'A{start_row}'].alignment = _center()
    ws.row_dimensions[start_row].height = 30

    hdr_row = start_row + 1
    for col, hdr in enumerate(['Criterion', 'Description', 'Metrics Filled', 'Total Metrics', 'Completion %'], 1):
        cell = ws.cell(row=hdr_row, column=col, value=hdr)
        cell.font = _hdr_font(10, True, WHITE)
        cell.fill = _fill(MID_BLUE)
        cell.alignment = _center()
        cell.border = _border()

    total_filled = total_total = 0
    for i, s in enumerate(summary):
        r = hdr_row + 1 + i
        ws.row_dimensions[r].height = 22
        pct = s['pct']
        row_fill = _fill(GREY_BG) if i % 2 == 0 else _fill(WHITE)
        pct_color = GREEN if pct == 100 else (ACCENT if pct >= 50 else ORANGE)

        for col, val in enumerate([s['criterion'], s['subtitle'], s['filled'], s['total'], f"{pct}%"], 1):
            cell = ws.cell(row=r, column=col, value=val)
            cell.font = Font(name='Arial', size=10,
                             bold=(col == 5),
                             color=(pct_color if col == 5 else '1A1A2E'))
            cell.fill = row_fill
            cell.alignment = _center() if col >= 3 else _left()
            cell.border = _border()

        total_filled += s['filled']
        total_total  += s['total']

    # Totals row
    tot_row = hdr_row + 1 + len(summary)
    ws.row_dimensions[tot_row].height = 26
    overall_pct = round((total_filled / total_total) * 100) if total_total else 0
    for col, val in enumerate(['TOTAL', '', total_filled, total_total, f"{overall_pct}%"], 1):
        cell = ws.cell(row=tot_row, column=col, value=val)
        cell.font = _hdr_font(10, True, WHITE)
        cell.fill = _fill(DARK_BLUE)
        cell.alignment = _center() if col >= 3 else _left()
        cell.border = _border()

    # Column widths for cover
    for col_letter, width in [('A',18),('B',32),('C',14),('D',14),('E',14),('F',10),('G',10),('H',10)]:
        ws.column_dimensions[col_letter].width = width

    # ── One sheet per criterion ───────────────────────────────────────────────
    for crit_name, crit_sub, metric_ids in CRITERIA_ORDER:
        short = crit_name.replace('Criterion ', 'C')
        ws = wb.create_sheet(title=short)
        ws.sheet_view.showGridLines = False
        cur_row = 1

        # Criterion header
        ws.merge_cells(f'A{cur_row}:J{cur_row}')
        ws[f'A{cur_row}'] = f'{crit_name} — {crit_sub}'
        ws[f'A{cur_row}'].font = Font(name='Arial', size=14, bold=True, color=WHITE)
        ws[f'A{cur_row}'].fill = _fill(DARK_BLUE)
        ws[f'A{cur_row}'].alignment = _center()
        ws.row_dimensions[cur_row].height = 36
        cur_row += 2

        for mid in metric_ids:
            if mid not in METRIC_META:
                continue
            model_name, fields, headers = METRIC_META[mid]
            rows = _get_rows(dept, model_name, fields)

            # Metric title row
            ws.merge_cells(f'A{cur_row}:J{cur_row}')
            ws[f'A{cur_row}'] = f'Metric {mid}'
            ws[f'A{cur_row}'].font = Font(name='Arial', size=11, bold=True, color=WHITE)
            ws[f'A{cur_row}'].fill = _fill(MID_BLUE)
            ws[f'A{cur_row}'].alignment = _left()
            ws[f'A{cur_row}'].border = _border()
            ws.row_dimensions[cur_row].height = 26
            cur_row += 1

            if not rows:
                ws.merge_cells(f'A{cur_row}:J{cur_row}')
                ws[f'A{cur_row}'] = '— No data entered —'
                ws[f'A{cur_row}'].font = Font(name='Arial', size=10, italic=True, color='999999')
                ws[f'A{cur_row}'].alignment = _left()
                cur_row += 2
                continue

            # Header row
            for col_idx, hdr in enumerate(headers, 1):
                cell = ws.cell(row=cur_row, column=col_idx, value=hdr)
                cell.font = _hdr_font(9, True, WHITE)
                cell.fill = _fill(ACCENT)
                cell.alignment = _center()
                cell.border = _border()
            ws.row_dimensions[cur_row].height = 20
            cur_row += 1

            # Data rows
            for r_idx, row_data in enumerate(rows):
                bg = _fill(GREY_BG) if r_idx % 2 == 0 else _fill(WHITE)
                for col_idx, val in enumerate(row_data, 1):
                    cell = ws.cell(row=cur_row, column=col_idx, value=val)
                    cell.font = _cell_font(9)
                    cell.fill = bg
                    cell.alignment = _left()
                    cell.border = _border()
                ws.row_dimensions[cur_row].height = 18
                cur_row += 1

            # Row count
            ws.merge_cells(f'A{cur_row}:J{cur_row}')
            ws[f'A{cur_row}'] = f'Total records: {len(rows)}'
            ws[f'A{cur_row}'].font = Font(name='Arial', size=9, italic=True, color=MID_BLUE)
            ws[f'A{cur_row}'].alignment = _left()
            cur_row += 2

        # Auto-fit column widths
        for col_cells in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col_cells[0].column)
            for cell in col_cells:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
            ws.column_dimensions[col_letter].width = min(max(max_len + 2, 10), 40)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.read()


# ══════════════════════════════════════════════════════════════════════════════
# PDF REPORT
# ══════════════════════════════════════════════════════════════════════════════

def generate_pdf(dept, college_name='', aqar_year=''):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2.5*cm,
        title=f'AQAR Report — {dept.name}',
    )

    # Styles
    styles = getSampleStyleSheet()
    W = A4[0] - 4*cm  # usable width

    S_TITLE = ParagraphStyle('ReportTitle',
        fontSize=22, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1E3A5F'),
        spaceAfter=6, alignment=TA_CENTER)

    S_SUBTITLE = ParagraphStyle('ReportSubtitle',
        fontSize=12, fontName='Helvetica',
        textColor=colors.HexColor('#0EA5E9'),
        spaceAfter=18, alignment=TA_CENTER)

    S_CRIT = ParagraphStyle('CriterionHead',
        fontSize=14, fontName='Helvetica-Bold',
        textColor=colors.white,
        spaceBefore=12, spaceAfter=6)

    S_METRIC = ParagraphStyle('MetricHead',
        fontSize=11, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1E3A5F'),
        spaceBefore=10, spaceAfter=4)

    S_BODY = ParagraphStyle('Body',
        fontSize=9, fontName='Helvetica',
        textColor=colors.HexColor('#1A1A2E'),
        spaceAfter=4, leading=14)

    S_SMALL = ParagraphStyle('Small',
        fontSize=8, fontName='Helvetica-Oblique',
        textColor=colors.HexColor('#64748B'),
        spaceAfter=8)

    S_INFO_LABEL = ParagraphStyle('InfoLabel',
        fontSize=10, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1E3A5F'))

    S_INFO_VAL = ParagraphStyle('InfoVal',
        fontSize=10, fontName='Helvetica',
        textColor=colors.HexColor('#1A1A2E'))

    story = []

    # ── Cover page ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1.5*cm))

    # Title banner table
    banner = Table([[Paragraph('AQAR DATA REPORT', S_TITLE)]], colWidths=[W])
    banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1E3A5F')),
        ('TOPPADDING',    (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('ROUNDEDCORNERS', [6]),
    ]))
    story.append(banner)
    story.append(Spacer(1, 0.3*cm))

    sub_banner = Table([[Paragraph('Annual Quality Assurance Report — Data Submission', S_SUBTITLE)]], colWidths=[W])
    sub_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#2D5986')),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sub_banner)
    story.append(Spacer(1, 0.8*cm))

    # Info box
    info_data = [
        [Paragraph('Department', S_INFO_LABEL),  Paragraph(dept.name, S_INFO_VAL)],
        [Paragraph('Stream', S_INFO_LABEL),       Paragraph('Aided' if dept.stream == 'aided' else 'Self Finance', S_INFO_VAL)],
        [Paragraph('College', S_INFO_LABEL),      Paragraph(college_name or '—', S_INFO_VAL)],
        [Paragraph('AQAR Year', S_INFO_LABEL),    Paragraph(aqar_year or '—', S_INFO_VAL)],
        [Paragraph('Generated On', S_INFO_LABEL), Paragraph(datetime.now().strftime('%d %B %Y, %I:%M %p'), S_INFO_VAL)],
        [Paragraph('Submitted By', S_INFO_LABEL), Paragraph(str(dept.hod) if dept.hod else '—', S_INFO_VAL)],
    ]
    info_table = Table(info_data, colWidths=[5*cm, W - 5*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#D6E4F0')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#F4F6F9')),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#D6E4F0'), colors.HexColor('#F4F6F9')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 1*cm))

    # ── Summary table ─────────────────────────────────────────────────────────
    story.append(HRFlowable(width=W, thickness=2, color=colors.HexColor('#1E3A5F')))
    story.append(Spacer(1, 0.3*cm))

    sum_hdr = ParagraphStyle('SumHdr', fontSize=13, fontName='Helvetica-Bold',
                              textColor=colors.HexColor('#1E3A5F'), spaceAfter=8)
    story.append(Paragraph('CRITERION-WISE COMPLETION SUMMARY', sum_hdr))

    summary = _dept_summary(dept)
    sum_data = [[
        Paragraph('Criterion', ParagraphStyle('TH', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white)),
        Paragraph('Description', ParagraphStyle('TH', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white)),
        Paragraph('Filled', ParagraphStyle('TH', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)),
        Paragraph('Total', ParagraphStyle('TH', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)),
        Paragraph('%', ParagraphStyle('TH', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)),
    ]]
    for s in summary:
        pct = s['pct']
        pct_color = '#22C55E' if pct == 100 else ('#0EA5E9' if pct >= 50 else '#F97316')
        sum_data.append([
            Paragraph(s['criterion'], S_BODY),
            Paragraph(s['subtitle'],  S_BODY),
            Paragraph(str(s['filled']), ParagraphStyle('Ctr', fontSize=9, fontName='Helvetica', alignment=TA_CENTER)),
            Paragraph(str(s['total']),  ParagraphStyle('Ctr', fontSize=9, fontName='Helvetica', alignment=TA_CENTER)),
            Paragraph(f"{pct}%", ParagraphStyle('Pct', fontSize=9, fontName='Helvetica-Bold',
                                                 textColor=colors.HexColor(pct_color), alignment=TA_CENTER)),
        ])

    sum_table = Table(sum_data, colWidths=[3.5*cm, 7*cm, 2*cm, 2*cm, 2*cm])
    sum_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A5F')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING',   (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i in range(1, len(sum_data)):
        bg = colors.HexColor('#F4F6F9') if i % 2 == 0 else colors.white
        sum_style.append(('BACKGROUND', (0,i), (-1,i), bg))
    sum_table.setStyle(TableStyle(sum_style))
    story.append(sum_table)

    # ── Criterion sections ────────────────────────────────────────────────────
    for crit_name, crit_sub, metric_ids in CRITERIA_ORDER:
        story.append(PageBreak())

        # Criterion banner
        crit_banner = Table(
            [[Paragraph(f'{crit_name} — {crit_sub}', S_CRIT)]],
            colWidths=[W]
        )
        crit_banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1E3A5F')),
            ('TOPPADDING',    (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ]))
        story.append(crit_banner)
        story.append(Spacer(1, 0.4*cm))

        for mid in metric_ids:
            if mid not in METRIC_META:
                continue
            model_name, fields, headers = METRIC_META[mid]
            rows = _get_rows(dept, model_name, fields)

            metric_block = []
            metric_block.append(Paragraph(f'Metric {mid}', S_METRIC))

            if not rows:
                metric_block.append(Paragraph('No data entered for this metric.', S_SMALL))
                metric_block.append(Spacer(1, 0.2*cm))
                story.append(KeepTogether(metric_block))
                continue

            # Build table
            th_style = ParagraphStyle('TH2', fontSize=8, fontName='Helvetica-Bold', textColor=colors.white)
            td_style = ParagraphStyle('TD2', fontSize=8, fontName='Helvetica', textColor=colors.HexColor('#1A1A2E'), leading=11)

            table_data = [[Paragraph(h, th_style) for h in headers]]
            for row_data in rows:
                table_data.append([Paragraph(str(v) if v else '—', td_style) for v in row_data])

            n_cols = len(headers)
            col_w  = W / n_cols

            t = Table(table_data, colWidths=[col_w] * n_cols, repeatRows=1)
            t_style = [
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0EA5E9')),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('TOPPADDING',    (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING',   (0,0), (-1,-1), 4),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]
            for i in range(1, len(table_data)):
                bg = colors.HexColor('#F4F6F9') if i % 2 == 0 else colors.white
                t_style.append(('BACKGROUND', (0,i), (-1,i), bg))
            t.setStyle(TableStyle(t_style))

            metric_block.append(t)
            metric_block.append(Paragraph(f'Total records: {len(rows)}', S_SMALL))
            metric_block.append(Spacer(1, 0.3*cm))
            story.append(KeepTogether(metric_block))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()