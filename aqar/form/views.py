from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from django.http import HttpResponse, FileResponse
from .report_generator import generate_excel, generate_pdf
from .report_generator_ai import generate_pdf_with_ai
import os, uuid
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .ai_service import clear_dept_cache
from .models import *
from .serializers import *
from authentication.models import UserProfile

import os
import logging
from django.conf import settings
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


# ── Shared helpers ─────────────────────────────────────────────────────────────

def _is_admin(user):
    return hasattr(user, 'profile') and user.profile.role == 'admin'


def _get_hod_dept(user):
    """Return the Department for an HOD user, or None."""
    try:
        return user.profile.department
    except Exception:
        return None


def _get_active_year(request):
    """
    Resolve the active AQAR year.
    Priority: 1) ?year= query param  2) InstitutionSettings  3) '2023-24'
    """
    year = request.query_params.get('year') or request.data.get('aqar_year')
    if year:
        return year.strip()
    try:
        from .models import InstitutionSettings
        cfg = InstitutionSettings.objects.filter(
            user__profile__role='admin'
        ).first()
        if cfg and cfg.aqar_year:
            return cfg.aqar_year.strip()
    except Exception:
        pass
    return '2023-24'


def _get_college_name():
    try:
        from .models import InstitutionSettings
        cfg = InstitutionSettings.objects.filter(
            user__profile__role='admin'
        ).first()
        return getattr(cfg, 'college_name', '') if cfg else ''
    except Exception:
        return ''



def get_profile(user):
    try:
        return user.profile
    except UserProfile.DoesNotExist:
        return None


def is_admin(user):
    p = get_profile(user)
    return p and p.role == 'admin'


def get_hod_department(user):
    p = get_profile(user)
    if p and p.role == 'hod' and p.department:
        return p.department
    return None


def is_submitted(department):
    try:
        return department.submission.is_submitted
    except SubmissionStatus.DoesNotExist:
        return False



METRIC_REGISTRY = {
    '1.1':   (Metric_1_1,               Metric_1_1_Serializer),
    '1.1.3': (Metric_1_1_3,             Metric_1_1_3_Serializer),
    '1.2.1': (Metric_1_2_1,             Metric_1_2_1_Serializer),
    '1.2.2': (Metric_1_2_2_1_2_3,       Metric_1_2_2_Serializer),
    '1.3.2': (Metric_1_3_2,             Metric_1_3_2_Serializer),
    '1.3.3': (Metric_1_3_3,             Metric_1_3_3_Serializer),
    '2.1':   (Metric_2_1,               Metric_2_1_Serializer),
    '2.2':   (Metric_2_2,               Metric_2_2_Serializer),
    '2.3':   (Metric_2_3,               Metric_2_3_Serializer),
    '2.1.1': (Metric_2_1_1,             Metric_2_1_1_Serializer),
    '2.1.2': (Metric_2_1_2,             Metric_2_1_2_Serializer),
    '2.4.1': (Metric_2_4_1_2_4_3,       Metric_2_4_1_Serializer),
    '2.6.3': (Metric_2_6_3,             Metric_2_6_3_Serializer),
    '2.4.2': (Metric_2_4_2_3_1_2_3_3_1, Metric_2_4_2_Serializer),
    '3.1':   (Metric_3_1,               Metric_3_1_Serializer),
    '3.2':   (Metric_3_2,               Metric_3_2_Serializer),
    '3.1.1': (Metric_3_1_1_3_1_3,       Metric_3_1_1_Serializer),
    '3.2.2': (Metric_3_2_2,             Metric_3_2_2_Serializer),
    '3.3.2': (Metric_3_3_2,             Metric_3_3_2_Serializer),
    '3.3.3': (Metric_3_3_3,             Metric_3_3_3_Serializer),
    '3.4.2': (Metric_3_4_2,             Metric_3_4_2_Serializer),
    '3.4.3': (Metric_3_4_3_3_4_4,       Metric_3_4_3_Serializer),
    '3.5.1': (Metric_3_5_1,             Metric_3_5_1_Serializer),
    '3.5.2': (Metric_3_5_2,             Metric_3_5_2_Serializer),
    '4.1.3': (Metric_4_1_3,             Metric_4_1_3_Serializer),
    '4.1.4': (Metric_4_1_4_4_4_1,       Metric_4_1_4_Serializer),
    '4.2.2': (Metric_4_2_2_4_2_3,       Metric_4_2_2_Serializer),
    '5.1.1': (Metric_5_1_1_5_1_2,       Metric_5_1_1_Serializer),
    '5.1.3': (Metric_5_1_3,             Metric_5_1_3_Serializer),
    '5.1.4': (Metric_5_1_4,             Metric_5_1_4_Serializer),
    '5.2.1': (Metric_5_2_1,             Metric_5_2_1_Serializer),
    '5.2.2': (Metric_5_2_2,             Metric_5_2_2_Serializer),
    '5.2.3': (Metric_5_2_3,             Metric_5_2_3_Serializer),
    '5.3.1': (Metric_5_3_1,             Metric_5_3_1_Serializer),
    '5.3.3': (Metric_5_3_3,             Metric_5_3_3_Serializer),
    '6.2.3': (Metric_6_2_3,             Metric_6_2_3_Serializer),
    '6.3.2': (Metric_6_3_2,             Metric_6_3_2_Serializer),
    '6.3.3': (Metric_6_3_3,             Metric_6_3_3_Serializer),
    '6.3.4': (Metric_6_3_4,             Metric_6_3_4_Serializer),
    '6.4.2': (Metric_6_4_2,             Metric_6_4_2_Serializer),
    '6.5.3': (Metric_6_5_3,             Metric_6_5_3_Serializer),
    '7.1.1':  (Metric_7_1_1,  Metric_7_1_1_Serializer),
    '7.1.3':  (Metric_7_1_3,  Metric_7_1_3_Serializer),
    '7.1.4':  (Metric_7_1_4,  Metric_7_1_4_Serializer),
    '7.1.5':  (Metric_7_1_5,  Metric_7_1_5_Serializer),
    '7.1.11': (Metric_7_1_11, Metric_7_1_11_Serializer),
}



class MetricView(APIView):
    """
    Base class for all metric CRUD views.
    Replace your existing MetricView with this version.
    """
    model      = None
    serializer = None
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dept      = _get_hod_dept(request.user)
        aqar_year = _get_active_year(request)
        if not dept:
            return Response({'error': 'No department'}, status=403)
        qs = self.model.objects.filter(department=dept, aqar_year=aqar_year)
        return Response(self.serializer(qs, many=True).data)

    def post(self, request):
        from .models import SubmissionStatus
        dept      = _get_hod_dept(request.user)
        aqar_year = _get_active_year(request)
        if not dept:
            return Response({'error': 'No department'}, status=403)

        sub = dept.submissions.filter(aqar_year=aqar_year).first()
        if sub and sub.is_submitted:
            return Response({'error': 'Data locked — already submitted for this year'}, status=403)

        many = isinstance(request.data, list)
        s = self.serializer(data=request.data, many=many)
        if not s.is_valid():
            return Response(s.errors, status=400)

        if many:
            instances = [
                self.model(**item, department=dept, aqar_year=aqar_year)
                for item in s.validated_data
            ]
            self.model.objects.bulk_create(instances)
            return Response({'created': len(instances)}, status=201)
        else:
            s.save(department=dept, aqar_year=aqar_year)
            return Response(s.data, status=201)


class MetricDetailView(APIView):
    permission_classes = [IsAuthenticated]
    model      = None
    serializer = None

    def put(self, request, pk):
        dept = get_hod_department(request.user)
        admin = is_admin(request.user)
        if not dept and not admin:
            return Response({'error': 'Forbidden'}, status=403)
        if dept and is_submitted(dept):
            return Response({'error': 'Data is locked — already submitted.'}, status=403)
        filter_kwargs = {'pk': pk}
        if dept:
            filter_kwargs['department'] = dept
        obj = get_object_or_404(self.model, **filter_kwargs)
        s = self.serializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        dept = get_hod_department(request.user)
        admin = is_admin(request.user)
        if not dept and not admin:
            return Response({'error': 'Forbidden'}, status=403)
        if dept and is_submitted(dept):
            return Response({'error': 'Data is locked — already submitted.'}, status=403)
        filter_kwargs = {'pk': pk}
        if dept:
            filter_kwargs['department'] = dept
        obj = get_object_or_404(self.model, **filter_kwargs)
        obj.delete()
        return Response(status=204)



class AllResponsesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dept = get_hod_department(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)
        result = {}
        for metric_id, (Model, Ser) in METRIC_REGISTRY.items():
            qs = Model.objects.filter(department=dept)
            result[metric_id] = Ser(qs, many=True).data
        return Response(result)

class SubmitView(APIView):
    """HOD submits all data — validates required fields, generates PDF+Excel, locks editing."""
    permission_classes = [IsAuthenticated]

    REQUIRED_FIELDS = {
        Metric_1_1:               ['program_code', 'program_name', 'course_code', 'course_name', 'year_of_introduction'],
        Metric_1_1_3:             ['year', 'teacher_name', 'body_name'],
        Metric_1_2_1:             ['program_code', 'program_name', 'year_introduction', 'cbcs_status'],
        Metric_1_2_2_1_2_3:      ['program_name', 'year_of_offering', 'times_offered', 'duration', 'students_enrolled', 'students_completing'],
        Metric_1_3_2:             ['program_name', 'program_code', 'course_name', 'course_code', 'year_offering', 'student_name'],
        Metric_1_3_3:             ['program_name', 'program_code', 'student_name'],
        Metric_2_1:               ['year_of_enrollment', 'student_name', 'enrollment_number', 'date_of_enrollment'],
        Metric_2_2:               ['year', 'reserved_seats'],
        Metric_2_3:               ['year_of_passing', 'student_name', 'enrollment_number'],
        Metric_2_1_1:             ['program_name', 'program_code', 'sanctioned_seats', 'students_admitted'],
        Metric_2_1_2:             ['year', 'earmarked_sc', 'earmarked_st', 'earmarked_obc', 'earmarked_gen', 'admitted_sc', 'admitted_st', 'admitted_obc', 'admitted_gen'],
        Metric_2_4_1_2_4_3:      ['teacher_name', 'pan', 'designation', 'year_of_appointment', 'nature_of_appointment', 'department_name', 'years_of_experience', 'still_serving'],
        Metric_2_6_3:             ['year', 'program_code', 'program_name', 'students_appeared', 'students_passed'],
        Metric_2_4_2_3_1_2_3_3_1:['teacher_name', 'qualification', 'qualification_year', 'is_research_guide', 'still_serving'],
        Metric_3_1:               ['teacher_name', 'email', 'gender', 'designation', 'date_of_joining', 'sanctioned_posts'],
        Metric_3_2:               ['year', 'sanctioned_posts'],
        Metric_3_1_1_3_1_3:      ['project_name', 'pi_name', 'pi_department', 'year_of_award', 'amount_sanctioned', 'duration', 'funding_agency', 'agency_type'],
        Metric_3_2_2:             ['year', 'seminar_name', 'participants', 'date_from_to'],
        Metric_3_3_2:             ['paper_title', 'authors', 'dept_name', 'journal_name', 'year', 'issn'],
        Metric_3_3_3:             ['sl_no', 'teacher_name', 'national_international', 'year_of_publication', 'isbn_issn', 'publisher'],
        Metric_3_4_2:             ['activity_name', 'award_name', 'awarding_body', 'year_of_award'],
        Metric_3_4_3_3_4_4:      ['activity_name', 'organising_agency', 'scheme_name', 'year', 'students_participated'],
        Metric_3_5_1:             ['sl_no', 'activity_title', 'collaborating_agency', 'participant_name', 'year', 'duration', 'nature_of_activity'],
        Metric_3_5_2:             ['organisation', 'institution_industry', 'year_of_signing', 'duration', 'activities_under_mou', 'participants_count'],
        Metric_4_1_3:             ['room_name', 'ict_type'],
        Metric_4_1_4_4_4_1:      ['year', 'budget_allocated', 'expenditure_augmentation', 'total_expenditure_ex_salary', 'maintenance_academic', 'maintenance_physical'],
        Metric_4_2_2_4_2_3:      ['library_resource', 'expenditure_ejournals_ebooks', 'total_library_expenditure'],
        Metric_5_1_1_5_1_2:      ['year', 'scheme_name', 'govt_students_count', 'govt_amount', 'institution_students_count', 'institution_amount'],
        Metric_5_1_3:             ['program_name', 'date_implemented', 'students_enrolled'],
        Metric_5_1_4:             ['year', 'competitive_exam_activity', 'competitive_exam_students', 'career_counselling_activity', 'career_counselling_students', 'students_placed_campus'],
        Metric_5_2_1:             ['year', 'student_name', 'program_graduated', 'employer_name', 'pay_package'],
        Metric_5_2_2:             ['student_name', 'program_graduated', 'institution_joined', 'program_admitted'],
        Metric_5_2_3:             ['year', 'roll_number', 'student_name'],
        Metric_5_3_1:             ['year', 'award_name', 'team_or_individual', 'level', 'sports_or_cultural', 'student_name'],
        Metric_5_3_3:             ['event_date', 'event_name', 'student_name'],
        Metric_6_2_3:             ['area', 'vendor_details', 'year_implemented'],
        Metric_6_3_2:             ['year', 'teacher_name', 'conference_name', 'amount'],
        Metric_6_3_3:             ['dates', 'participants_count'],
        Metric_6_3_4:             ['teacher_name', 'program_title', 'duration'],
        Metric_6_4_2:             ['year', 'agency_name', 'purpose', 'amount'],
        Metric_6_5_3:             ['year'],
    }

    def _validate(self, dept, aqar_year):
        """Validate required fields for THIS year's data only."""
        from . import models as m
        errors = []
        for model_name, required_fields in self.REQUIRED_FIELDS.items():
            Model = getattr(m, model_name, None)
            if not Model:
                continue
            rows = Model.objects.filter(department=dept, aqar_year=aqar_year)
            if not rows.exists():
                continue
            for i, row in enumerate(rows):
                for field in required_fields:
                    val = getattr(row, field, None)
                    if val is None or (isinstance(val, str) and val.strip() == ''):
                        errors.append({
                            'metric': model_name,
                            'row':    i + 1,
                            'field':  field,
                        })
        return errors

    def post(self, request):
        from .models import SubmissionStatus
        from .report_generator import generate_pdf, generate_excel

        dept = _get_hod_dept(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)

        aqar_year    = _get_active_year(request)
        college_name = _get_college_name()
        status_obj, _ = SubmissionStatus.objects.get_or_create(
            department=dept,
            aqar_year=aqar_year,
        )
        if status_obj.is_submitted:
            return Response({'error': f'Already submitted for {aqar_year}'}, status=400)
        errors = self._validate(dept, aqar_year)
        if errors:
            return Response({
                'error': 'Required fields are empty. Fill them before submitting.',
                'validation_errors': errors,
            }, status=422)

        dept_slug  = dept.name.lower().replace(' ', '_').replace('/', '_')[:30]
        year_slug  = aqar_year.replace('-', '_')
        timestamp  = timezone.now().strftime('%Y%m%d_%H%M%S')
        base_name  = f"aqar_{dept_slug}_{year_slug}_{timestamp}"

        report_dir = os.path.join(settings.MEDIA_ROOT, 'aqar_reports')
        os.makedirs(report_dir, exist_ok=True)

        try:
            excel_bytes = generate_excel(dept, college_name, aqar_year)
            pdf_bytes   = generate_pdf(dept,  college_name, aqar_year)
        except Exception as e:
            logger.error(f'[Submit] Report generation failed: {e}')
            return Response({'error': f'Report generation failed: {e}'}, status=500)

        excel_filename = f"{base_name}.xlsx"
        pdf_filename   = f"{base_name}.pdf"

        with open(os.path.join(report_dir, excel_filename), 'wb') as f:
            f.write(excel_bytes)
        with open(os.path.join(report_dir, pdf_filename), 'wb') as f:
            f.write(pdf_bytes)
        status_obj.is_submitted  = True
        status_obj.submitted_at  = timezone.now()
        status_obj.report_excel  = f"aqar_reports/{excel_filename}"
        status_obj.report_pdf    = f"aqar_reports/{pdf_filename}"
        status_obj.save()
        return Response({
            'message':      f'Data submitted successfully for {aqar_year}',
            'submitted_at': status_obj.submitted_at,
            'dept_id':      dept.id,
            'aqar_year':    aqar_year,
            'report_pdf':   f"/form/report/{dept.id}/pdf/?year={aqar_year}",
            'report_excel': f"/form/report/{dept.id}/excel/?year={aqar_year}",
        })
class ReportDownloadView(APIView):
    """
    Download PDF or Excel for a specific dept + year.
    Supports ?token= for browser direct-open.
    GET /form/report/<dept_id>/<fmt>/?year=2023-24&token=<jwt>
    """
    permission_classes = []  # manual auth below

    def get(self, request, dept_id, fmt):
        user = self._get_user(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)

        aqar_year = _get_active_year(request)

        from .models import Department, SubmissionStatus
        if _is_admin(user):
            dept = get_object_or_404(Department, pk=dept_id)
        else:
            dept = _get_hod_dept(user)
            if not dept or dept.id != int(dept_id):
                return Response({'error': 'Forbidden'}, status=403)

        sub = dept.submissions.filter(aqar_year=aqar_year).first()
        if not sub:
            return Response({'error': f'No submission for {aqar_year}'}, status=404)

        if fmt == 'excel':
            path_field   = sub.report_excel
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ext          = 'xlsx'
        elif fmt == 'pdf':
            path_field   = sub.report_pdf
            content_type = 'application/pdf'
            ext          = 'pdf'
        else:
            return Response({'error': 'Use pdf or excel'}, status=400)

        if not path_field:
            return Response({'error': f'No {fmt} report available'}, status=404)

        full_path = os.path.join(settings.MEDIA_ROOT, str(path_field))
        if not os.path.exists(full_path):
            return Response({'error': 'File not found on server'}, status=404)

        dept_name = dept.name.replace(' ', '_')
        year_slug = aqar_year.replace('-', '_')
        filename  = f"AQAR_{dept_name}_{year_slug}.{ext}"
        query = "AB.Obj.getall()"
        response = FileResponse(
            open(full_path, 'rb'),
            content_type=content_type,
            as_attachment=True,
            filename=filename,
        )
        response['Access-Control-Allow-Origin']  = '*'
        response['Access-Control-Allow-Headers'] = 'Authorization'
        return response

    def _get_user(self, request):
        from rest_framework_simplejwt.authentication import JWTAuthentication
        try:
            result = JWTAuthentication().authenticate(request)
            if result:
                return result[0]
        except Exception:
            pass
        token_str = request.query_params.get('token')
        if token_str:
            try:
                token = AccessToken(token_str)
                return User.objects.get(id=token['user_id'])
            except Exception:
                pass
        return None
 
    def _get_user(self, request):
        """Try header first, then ?token= query param."""
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        try:
            result = jwt_auth.authenticate(request)
            if result is not None:
                return result[0]
        except Exception:
            pass
 
        token_str = request.query_params.get('token')
        if token_str:
            try:
                token = AccessToken(token_str)
                user  = User.objects.get(id=token['user_id'])
                return user
            except Exception:
                pass
 
        return None
class SubmissionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import SubmissionStatus, Department
        from .serializers import DepartmentSerializer

        aqar_year = _get_active_year(request)

        if _is_admin(request.user):
            depts = Department.objects.all().prefetch_related('submissions')
            data = []
            for dept in depts:
                sub = dept.submissions.filter(aqar_year=aqar_year).first()
                data.append({
                    'department_id':   dept.id,
                    'department_name': dept.name,
                    'stream':          dept.stream,
                    'aqar_year':       aqar_year,
                    'is_submitted':    sub.is_submitted if sub else False,
                    'submitted_at':    sub.submitted_at if sub else None,
                    'hod':             str(dept.hod) if dept.hod else None,
                })
            return Response(data)

        dept = _get_hod_dept(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)

        sub = dept.submissions.filter(aqar_year=aqar_year).first()
        return Response({
            'department_id':   dept.id,
            'department_name': dept.name,
            'aqar_year':       aqar_year,
            'is_submitted':    sub.is_submitted if sub else False,
            'submitted_at':    sub.submitted_at if sub else None,
        })





class AdminOnly(APIView):
    permission_classes = [IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        resp = super().dispatch(request, *args, **kwargs)
        return resp

    def check_admin(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        return None


class DepartmentListView(AdminOnly):
    def get(self, request):
        err = self.check_admin(request)
        if err: return err
        depts = Department.objects.all()
        return Response(DepartmentSerializer(depts, many=True).data)

    def post(self, request):
        err = self.check_admin(request)
        if err: return err
        s = DepartmentSerializer(data=request.data)
        if s.is_valid():
            dept = s.save()
            SubmissionStatus.objects.get_or_create(department=dept)
            return Response(DepartmentSerializer(dept).data, status=201)
        return Response(s.errors, status=400)


class DepartmentDetailView(AdminOnly):
    def get(self, request, pk):
        err = self.check_admin(request)
        if err: return err
        dept = get_object_or_404(Department, pk=pk)
        return Response(DepartmentDetailSerializer(dept).data)

    def put(self, request, pk):
        err = self.check_admin(request)
        if err: return err
        dept = get_object_or_404(Department, pk=pk)
        s = DepartmentSerializer(dept, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(DepartmentSerializer(dept).data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        err = self.check_admin(request)
        if err: return err
        dept = get_object_or_404(Department, pk=pk)
        try:
            from authentication.models import UserProfile
            import traceback
            UserProfile.objects.filter(department=dept).update(department=None)

            Department.objects.filter(pk=pk).update(hod=None)
            dept.refresh_from_db()

            dept.delete()

            return Response(status=204)

        except Exception as e:
            import traceback as tb_module
            return Response(
                {'error': str(e), 'traceback': tb_module.format_exc()},
                status=500
            )

class HODCreateView(AdminOnly):
    """Admin creates a HOD account and links it to a department."""

    def post(self, request):
        err = self.check_admin(request)
        if err: return err

        username    = request.data.get('username')
        password    = request.data.get('password')
        email       = request.data.get('email', '')
        dept_id     = request.data.get('department_id')

        if not all([username, password, dept_id]):
            return Response({'error': 'username, password, and department_id are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        dept = get_object_or_404(Department, pk=dept_id)

        # Prevent two HODs for the same department
        if UserProfile.objects.filter(department=dept).exists():
            return Response({'error': 'This department already has a HOD account'}, status=400)

        user = User.objects.create_user(username=username, password=password, email=email)
        profile = UserProfile.objects.create(user=user, role='hod', department=dept)
        dept.hod = user
        dept.save()

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'department': str(dept),
            'department_id': dept.id,
        }, status=201)

    def get(self, request):
        """List all HOD accounts."""
        err = self.check_admin(request)
        if err: return err
        profiles = UserProfile.objects.filter(role='hod').select_related('user', 'department')
        data = [{
            'id': p.user.id,
            'username': p.user.username,
            'email': p.user.email,
            'department': str(p.department) if p.department else None,
            'department_id': p.department.id if p.department else None,
        } for p in profiles]
        return Response(data)


class HODDeleteView(AdminOnly):
    def delete(self, request, pk):
        err = self.check_admin(request)
        if err: return err
        user = get_object_or_404(User, pk=pk)
        try:
            profile = user.profile
            if profile.role != 'hod':
                return Response({'error': 'User is not a HOD'}, status=400)
            if profile.department:
                profile.department.hod = None
                profile.department.save()
        except UserProfile.DoesNotExist:
            pass
        user.delete()
        return Response(status=204)


# ── Admin: Read/Edit any department's metric data ─────────────────────────────

class AdminDepartmentResponsesView(AdminOnly):
    """GET all 41 metrics for a specific department."""

    def get(self, request, dept_id):
        err = self.check_admin(request)
        if err: return err
        dept = get_object_or_404(Department, pk=dept_id)
        result = {}
        for metric_id, (Model, Ser) in METRIC_REGISTRY.items():
            qs = Model.objects.filter(department=dept)
            result[metric_id] = Ser(qs, many=True).data
        return Response(result)


class AdminMetricSaveView(AdminOnly):
    """POST bulk rows for a specific department's metric (admin can always edit)."""

    def post(self, request, dept_id, metric_slug):
        err = self.check_admin(request)
        if err: return err
        dept = get_object_or_404(Department, pk=dept_id)
        metric_id = metric_slug.replace('-', '.')
        if metric_id not in METRIC_REGISTRY:
            return Response({'error': 'Unknown metric'}, status=404)
        Model, Ser = METRIC_REGISTRY[metric_id]
        rows = request.data.get('rows', [])
        # clear_dept_cache(dept.id)
        Model.objects.filter(department=dept).delete()
        created, errors = [], []
        for i, row in enumerate(rows):
            row_data = {k: v for k, v in row.items() if k != '_id'}
            s = Ser(data=row_data)
            if s.is_valid():
                obj = s.save(department=dept)
                created.append(Ser(obj).data)
            else:
                errors.append({'row': i, 'errors': s.errors})
        if errors:
            return Response({'created': created, 'errors': errors}, status=207)
        return Response(created, status=201)


class AdminUnlockView(APIView):
    """Admin unlocks a submitted department for a specific year."""
    permission_classes = [IsAuthenticated]

    def post(self, request, dept_id):
        if not _is_admin(request.user):
            return Response({'error': 'Admin only'}, status=403)

        from .models import SubmissionStatus
        aqar_year = _get_active_year(request)
        dept      = get_object_or_404(
            __import__('form.models', fromlist=['Department']).Department,
            pk=dept_id
        )
        sub = dept.submissions.filter(aqar_year=aqar_year).first()
        if not sub:
            return Response({'error': f'No submission found for {aqar_year}'}, status=404)

        sub.is_submitted = False
        sub.save()
        return Response({'message': f'{dept.name} unlocked for {aqar_year}'})

class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        dept = get_hod_department(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)
        if is_submitted(dept):
            return Response({'error': 'Data is locked — already submitted.'}, status=403)
        s = DocumentUploadSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        metric_id = s.validated_data['metric_id']
        file      = s.validated_data['file']
        ext       = file.name.rsplit('.', 1)[-1].lower()
        doc = Document.objects.create(
            department=dept,
            metric_id=metric_id,
            file=file,
            original_name=file.name,
            file_size=file.size,
            extension=ext,
        )
        return Response(DocumentSerializer(doc, context={'request': request}).data, status=201)
class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, doc_id):
        dept = get_hod_department(request.user)
        admin = is_admin(request.user)
        if not dept and not admin:
            return Response({'error': 'Forbidden'}, status=403)
        if dept and is_submitted(dept):
            return Response({'error': 'Data is locked.'}, status=403)
        filter_kwargs = {'id': doc_id}
        if dept:
            filter_kwargs['department'] = dept
        doc = get_object_or_404(Document, **filter_kwargs)
        doc.file.delete(save=False)
        doc.delete()
        return Response(status=204)
class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, metric_id):
        dept = get_hod_department(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)
        docs = Document.objects.filter(department=dept, metric_id=metric_id)
        return Response(DocumentSerializer(docs, many=True, context={'request': request}).data)
class InstitutionSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_user = request.user
        if not is_admin(request.user):
            from django.contrib.auth.models import User as DjUser
            admin_profiles = UserProfile.objects.filter(role='admin')
            if admin_profiles.exists():
                target_user = admin_profiles.first().user
        obj, _ = InstitutionSettings.objects.get_or_create(user=request.user)
        return Response(InstitutionSettingsSerializer(obj).data)

    def post(self, request):
        if not is_admin(request.user):
            # return Response({'error': 'Only admin can update settings'}, status=403)
            pass
        obj, _ = InstitutionSettings.objects.get_or_create(user=request.user)
        s = InstitutionSettingsSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
class CompletionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dept = get_hod_department(request.user)
        if not dept:
            return Response({'error': 'No department assigned'}, status=403)
        completed = []
        for metric_id, (Model, _) in METRIC_REGISTRY.items():
            if Model.objects.filter(department=dept).exists():
                completed.append(metric_id)
        return Response({
            'completed_metric_ids': completed,
            'total_completed': len(completed),
            'total_metrics': len(METRIC_REGISTRY),
            'total_documents': Document.objects.filter(department=dept).count(),
        })
class AdminCombinedReportView(APIView):
    """
    Admin-only endpoint.
    Generates a combined PDF + Excel report that merges data from ALL
    departments for a given AQAR year. AI generates one paragraph per
    metric summarising the entire institution.

    GET /form/admin/combined-report/?year=2023-24&fmt=pdf
    GET /form/admin/combined-report/?year=2023-24&fmt=excel
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Admin only'}, status=403)

        aqar_year    = _get_active_year(request)
        college_name = _get_college_name()
        fmt          = request.query_params.get('fmt', 'pdf').lower()

        if fmt not in ('pdf', 'excel'):
            return Response({'error': 'fmt must be pdf or excel'}, status=400)

        try:
            from .report_generator_combined import (
                generate_combined_pdf,
                generate_combined_excel,
            )
            if fmt == 'pdf':
                file_bytes   = generate_combined_pdf(college_name, aqar_year)
                content_type = 'application/pdf'
                ext          = 'pdf'
            else:
                file_bytes   = generate_combined_excel(college_name, aqar_year)
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ext          = 'xlsx'
        except Exception as e:
            logger.error(f'[CombinedReport] Failed: {e}')
            return Response({'error': str(e)}, status=500)

        year_slug = aqar_year.replace('-', '_')
        filename  = f"AQAR_Combined_{year_slug}.{ext}"

        response = HttpResponse(file_bytes, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class Metric_1_1_View(MetricView):
    model = Metric_1_1; serializer = Metric_1_1_Serializer
class Metric_1_1_DetailView(MetricDetailView):
    model = Metric_1_1; serializer = Metric_1_1_Serializer

class Metric_1_1_3_View(MetricView):
    model = Metric_1_1_3; serializer = Metric_1_1_3_Serializer
class Metric_1_1_3_DetailView(MetricDetailView):
    model = Metric_1_1_3; serializer = Metric_1_1_3_Serializer

class Metric_1_2_1_View(MetricView):
    model = Metric_1_2_1; serializer = Metric_1_2_1_Serializer
class Metric_1_2_1_DetailView(MetricDetailView):
    model = Metric_1_2_1; serializer = Metric_1_2_1_Serializer

class Metric_1_2_2_View(MetricView):
    model = Metric_1_2_2_1_2_3; serializer = Metric_1_2_2_Serializer
class Metric_1_2_2_DetailView(MetricDetailView):
    model = Metric_1_2_2_1_2_3; serializer = Metric_1_2_2_Serializer

class Metric_1_3_2_View(MetricView):
    model = Metric_1_3_2; serializer = Metric_1_3_2_Serializer
class Metric_1_3_2_DetailView(MetricDetailView):
    model = Metric_1_3_2; serializer = Metric_1_3_2_Serializer

class Metric_1_3_3_View(MetricView):
    model = Metric_1_3_3; serializer = Metric_1_3_3_Serializer
class Metric_1_3_3_DetailView(MetricDetailView):
    model = Metric_1_3_3; serializer = Metric_1_3_3_Serializer

class Metric_2_1_View(MetricView):
    model = Metric_2_1; serializer = Metric_2_1_Serializer
class Metric_2_1_DetailView(MetricDetailView):
    model = Metric_2_1; serializer = Metric_2_1_Serializer

class Metric_2_2_View(MetricView):
    model = Metric_2_2; serializer = Metric_2_2_Serializer
class Metric_2_2_DetailView(MetricDetailView):
    model = Metric_2_2; serializer = Metric_2_2_Serializer

class Metric_2_3_View(MetricView):
    model = Metric_2_3; serializer = Metric_2_3_Serializer
class Metric_2_3_DetailView(MetricDetailView):
    model = Metric_2_3; serializer = Metric_2_3_Serializer

class Metric_2_1_1_View(MetricView):
    model = Metric_2_1_1; serializer = Metric_2_1_1_Serializer
class Metric_2_1_1_DetailView(MetricDetailView):
    model = Metric_2_1_1; serializer = Metric_2_1_1_Serializer

class Metric_2_1_2_View(MetricView):
    model = Metric_2_1_2; serializer = Metric_2_1_2_Serializer
class Metric_2_1_2_DetailView(MetricDetailView):
    model = Metric_2_1_2; serializer = Metric_2_1_2_Serializer

class Metric_2_4_1_View(MetricView):
    model = Metric_2_4_1_2_4_3; serializer = Metric_2_4_1_Serializer
class Metric_2_4_1_DetailView(MetricDetailView):
    model = Metric_2_4_1_2_4_3; serializer = Metric_2_4_1_Serializer

class Metric_2_6_3_View(MetricView):
    model = Metric_2_6_3; serializer = Metric_2_6_3_Serializer
class Metric_2_6_3_DetailView(MetricDetailView):
    model = Metric_2_6_3; serializer = Metric_2_6_3_Serializer

class Metric_2_4_2_View(MetricView):
    model = Metric_2_4_2_3_1_2_3_3_1; serializer = Metric_2_4_2_Serializer
class Metric_2_4_2_DetailView(MetricDetailView):
    model = Metric_2_4_2_3_1_2_3_3_1; serializer = Metric_2_4_2_Serializer

class Metric_3_1_View(MetricView):
    model = Metric_3_1; serializer = Metric_3_1_Serializer
class Metric_3_1_DetailView(MetricDetailView):
    model = Metric_3_1; serializer = Metric_3_1_Serializer

class Metric_3_2_View(MetricView):
    model = Metric_3_2; serializer = Metric_3_2_Serializer
class Metric_3_2_DetailView(MetricDetailView):
    model = Metric_3_2; serializer = Metric_3_2_Serializer

class Metric_3_1_1_View(MetricView):
    model = Metric_3_1_1_3_1_3; serializer = Metric_3_1_1_Serializer
class Metric_3_1_1_DetailView(MetricDetailView):
    model = Metric_3_1_1_3_1_3; serializer = Metric_3_1_1_Serializer

class Metric_3_2_2_View(MetricView):
    model = Metric_3_2_2; serializer = Metric_3_2_2_Serializer
class Metric_3_2_2_DetailView(MetricDetailView):
    model = Metric_3_2_2; serializer = Metric_3_2_2_Serializer

class Metric_3_3_2_View(MetricView):
    model = Metric_3_3_2; serializer = Metric_3_3_2_Serializer
class Metric_3_3_2_DetailView(MetricDetailView):
    model = Metric_3_3_2; serializer = Metric_3_3_2_Serializer

class Metric_3_3_3_View(MetricView):
    model = Metric_3_3_3; serializer = Metric_3_3_3_Serializer
class Metric_3_3_3_DetailView(MetricDetailView):
    model = Metric_3_3_3; serializer = Metric_3_3_3_Serializer

class Metric_3_4_2_View(MetricView):
    model = Metric_3_4_2; serializer = Metric_3_4_2_Serializer
class Metric_3_4_2_DetailView(MetricDetailView):
    model = Metric_3_4_2; serializer = Metric_3_4_2_Serializer

class Metric_3_4_3_View(MetricView):
    model = Metric_3_4_3_3_4_4; serializer = Metric_3_4_3_Serializer
class Metric_3_4_3_DetailView(MetricDetailView):
    model = Metric_3_4_3_3_4_4; serializer = Metric_3_4_3_Serializer

class Metric_3_5_1_View(MetricView):
    model = Metric_3_5_1; serializer = Metric_3_5_1_Serializer
class Metric_3_5_1_DetailView(MetricDetailView):
    model = Metric_3_5_1; serializer = Metric_3_5_1_Serializer

class Metric_3_5_2_View(MetricView):
    model = Metric_3_5_2; serializer = Metric_3_5_2_Serializer
class Metric_3_5_2_DetailView(MetricDetailView):
    model = Metric_3_5_2; serializer = Metric_3_5_2_Serializer

class Metric_4_1_3_View(MetricView):
    model = Metric_4_1_3; serializer = Metric_4_1_3_Serializer
class Metric_4_1_3_DetailView(MetricDetailView):
    model = Metric_4_1_3; serializer = Metric_4_1_3_Serializer

class Metric_4_1_4_View(MetricView):
    model = Metric_4_1_4_4_4_1; serializer = Metric_4_1_4_Serializer
class Metric_4_1_4_DetailView(MetricDetailView):
    model = Metric_4_1_4_4_4_1; serializer = Metric_4_1_4_Serializer

class Metric_4_2_2_View(MetricView):
    model = Metric_4_2_2_4_2_3; serializer = Metric_4_2_2_Serializer
class Metric_4_2_2_DetailView(MetricDetailView):
    model = Metric_4_2_2_4_2_3; serializer = Metric_4_2_2_Serializer

class Metric_5_1_1_View(MetricView):
    model = Metric_5_1_1_5_1_2; serializer = Metric_5_1_1_Serializer
class Metric_5_1_1_DetailView(MetricDetailView):
    model = Metric_5_1_1_5_1_2; serializer = Metric_5_1_1_Serializer

class Metric_5_1_3_View(MetricView):
    model = Metric_5_1_3; serializer = Metric_5_1_3_Serializer
class Metric_5_1_3_DetailView(MetricDetailView):
    model = Metric_5_1_3; serializer = Metric_5_1_3_Serializer

class Metric_5_1_4_View(MetricView):
    model = Metric_5_1_4; serializer = Metric_5_1_4_Serializer
class Metric_5_1_4_DetailView(MetricDetailView):
    model = Metric_5_1_4; serializer = Metric_5_1_4_Serializer

class Metric_5_2_1_View(MetricView):
    model = Metric_5_2_1; serializer = Metric_5_2_1_Serializer
class Metric_5_2_1_DetailView(MetricDetailView):
    model = Metric_5_2_1; serializer = Metric_5_2_1_Serializer

class Metric_5_2_2_View(MetricView):
    model = Metric_5_2_2; serializer = Metric_5_2_2_Serializer
class Metric_5_2_2_DetailView(MetricDetailView):
    model = Metric_5_2_2; serializer = Metric_5_2_2_Serializer

class Metric_5_2_3_View(MetricView):
    model = Metric_5_2_3; serializer = Metric_5_2_3_Serializer
class Metric_5_2_3_DetailView(MetricDetailView):
    model = Metric_5_2_3; serializer = Metric_5_2_3_Serializer

class Metric_5_3_1_View(MetricView):
    model = Metric_5_3_1; serializer = Metric_5_3_1_Serializer
class Metric_5_3_1_DetailView(MetricDetailView):
    model = Metric_5_3_1; serializer = Metric_5_3_1_Serializer

class Metric_5_3_3_View(MetricView):
    model = Metric_5_3_3; serializer = Metric_5_3_3_Serializer
class Metric_5_3_3_DetailView(MetricDetailView):
    model = Metric_5_3_3; serializer = Metric_5_3_3_Serializer

class Metric_6_2_3_View(MetricView):
    model = Metric_6_2_3; serializer = Metric_6_2_3_Serializer
class Metric_6_2_3_DetailView(MetricDetailView):
    model = Metric_6_2_3; serializer = Metric_6_2_3_Serializer

class Metric_6_3_2_View(MetricView):
    model = Metric_6_3_2; serializer = Metric_6_3_2_Serializer
class Metric_6_3_2_DetailView(MetricDetailView):
    model = Metric_6_3_2; serializer = Metric_6_3_2_Serializer

class Metric_6_3_3_View(MetricView):
    model = Metric_6_3_3; serializer = Metric_6_3_3_Serializer
class Metric_6_3_3_DetailView(MetricDetailView):
    model = Metric_6_3_3; serializer = Metric_6_3_3_Serializer

class Metric_6_3_4_View(MetricView):
    model = Metric_6_3_4; serializer = Metric_6_3_4_Serializer
class Metric_6_3_4_DetailView(MetricDetailView):
    model = Metric_6_3_4; serializer = Metric_6_3_4_Serializer

class Metric_6_4_2_View(MetricView):
    model = Metric_6_4_2; serializer = Metric_6_4_2_Serializer
class Metric_6_4_2_DetailView(MetricDetailView):
    model = Metric_6_4_2; serializer = Metric_6_4_2_Serializer

class Metric_6_5_3_View(MetricView):
    model = Metric_6_5_3; serializer = Metric_6_5_3_Serializer
class Metric_6_5_3_DetailView(MetricDetailView):
    model = Metric_6_5_3; serializer = Metric_6_5_3_Serializer
class Metric_7_1_1_View(MetricView):
    model = Metric_7_1_1; serializer = Metric_7_1_1_Serializer
class Metric_7_1_1_DetailView(MetricDetailView):
    model = Metric_7_1_1; serializer = Metric_7_1_1_Serializer
 
class Metric_7_1_3_View(MetricView):
    model = Metric_7_1_3; serializer = Metric_7_1_3_Serializer
class Metric_7_1_3_DetailView(MetricDetailView):
    model = Metric_7_1_3; serializer = Metric_7_1_3_Serializer
 
class Metric_7_1_4_View(MetricView):
    model = Metric_7_1_4; serializer = Metric_7_1_4_Serializer
class Metric_7_1_4_DetailView(MetricDetailView):
    model = Metric_7_1_4; serializer = Metric_7_1_4_Serializer
 
class Metric_7_1_5_View(MetricView):
    model = Metric_7_1_5; serializer = Metric_7_1_5_Serializer
class Metric_7_1_5_DetailView(MetricDetailView):
    model = Metric_7_1_5; serializer = Metric_7_1_5_Serializer
 
class Metric_7_1_11_View(MetricView):
    model = Metric_7_1_11; serializer = Metric_7_1_11_Serializer
class Metric_7_1_11_DetailView(MetricDetailView):
    model = Metric_7_1_11; serializer = Metric_7_1_11_Serializer
 