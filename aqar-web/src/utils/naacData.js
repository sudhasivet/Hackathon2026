export const YEARS = ['2019-20', '2020-21', '2021-22', '2022-23', '2023-24']

export const col = (key, label, type = 'text', opts = {}) => ({ key, label, type, ...opts })
export const countWords = (text = '') =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length

// Input types:
//   'text'     — free text
//   'year'     — academic year select from YEARS list (e.g. 2022-23)
//   'date'     — calendar date picker
//   'number'   — numeric
//   'email'    — email
//   'url'      — URL link
//   'select'   — dropdown with options[]
//   'textarea' — multi-line text

const C1_METRICS = [
  {
    id: '1.1', title: 'Courses Offered Across All Programs',
    type: 'TBL', modelKey: 'Metric_1_1',
    columns: [
      col('program_code',         'Program Code',         'text', { required: true }),
      col('program_name',         'Program Name',         'text', { required: true }),
      col('course_code',          'Course Code',          'text', { required: true }),
      col('course_name',          'Course Name',          'text', { required: true }),
      col('year_of_introduction', 'Year of Introduction', 'year', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '1.1.3', title: 'Teachers in Curriculum / Academic Bodies',
    type: 'TBL', modelKey: 'Metric_1_1_3',
    columns: [
      col('year',         'Year',                                           'year', { required: true }),
      col('teacher_name', 'Name of Teacher Participated',                   'text', { required: true }),
      col('body_name',    'Name of the Body in which Teacher Participated', 'text', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '1.2.1', title: 'Programs with CBCS / Elective Course System',
    type: 'TBL', modelKey: 'Metric_1_2_1',
    columns: [
      col('program_code',      'Programme Code',                 'text',   { required: true }),
      col('program_name',      'Programme Name',                 'text',   { required: true }),
      col('year_introduction', 'Year of Introduction',           'year',   { required: true }),
      col('cbcs_status',       'CBCS Implementation Status',     'select', { options: ['Yes', 'No'], required: true }),
      col('cbcs_year',         'Year of Implementation of CBCS', 'year',   { required: false }),
      col('document_link',     'Link to Relevant Document',      'url',    { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '1.2.2 , 1.2.3', title: 'Add-on / Certificate Programs & Student Enrolment',
    type: 'TBL', modelKey: 'Metric_1_2_2_1_2_3',
    columns: [
      col('program_name',        'Name of Add-on / Certificate Program',    'text',   { required: true }),
      col('course_code',         'Course Code (if any)',                     'text',   { required: false }),
      col('year_of_offering',    'Year of Offering',                         'year',   { required: true }),
      col('times_offered',       'No. of Times Offered During the Year',     'number', { required: true }),
      col('duration',            'Duration of Course',                       'text',   { required: true }),
      col('students_enrolled',   'Number of Students Enrolled in the Year',  'number', { required: true }),
      col('students_completing', 'Number of Students Completing the Course', 'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '1.3.2', title: 'Courses with Experiential Learning (Project / Field / Internship)',
    type: 'TBL', modelKey: 'Metric_1_3_2',
    columns: [
      col('program_name',  'Program Name',             'text', { required: true }),
      col('program_code',  'Program Code',             'text', { required: true }),
      col('course_name',   'Name of the Course',       'text', { required: true }),
      col('course_code',   'Course Code',              'text', { required: true }),
      col('year_offering', 'Year of Offering',         'year', { required: true }),
      col('student_name',  'Name of the Student',      'text', { required: true }),
      col('document_link', 'Link to Relevant Document','url',  { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '1.3.3', title: 'Students Undertaking Project / Field Work / Internships',
    type: 'TBL', modelKey: 'Metric_1_3_3',
    columns: [
      col('program_name',  'Programme Name',            'text', { required: true }),
      col('program_code',  'Programme Code',            'text', { required: true }),
      col('student_name',  'Name of Student',           'text', { required: true }),
      col('document_link', 'Link to Relevant Document', 'url',  { required: false }),
    ],
    docRequired: false,
  },
]

const C2_METRICS = [
  {
    id: '2.1', title: 'Students Enrolled During the Year',
    type: 'TBL', modelKey: 'Metric_2_1',
    columns: [
      col('year_of_enrollment', 'Year of Enrollment',        'year', { required: true }),
      col('student_name',       'Name of Student',           'text', { required: true }),
      col('enrollment_number',  'Student Enrollment Number', 'text', { required: true }),
      col('date_of_enrollment', 'Date of Enrolment',         'date', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '2.2', title: 'Seats Earmarked for Reserved Category',
    type: 'TBL', modelKey: 'Metric_2_2',
    columns: [
      col('year',           'Year',                                             'year',   { required: true }),
      col('reserved_seats', 'Number of Seats Earmarked for Reserved Category',  'number', { required: true }),
      col('document_link',  'Upload Supporting Document',                        'url',    { required: false }),
    ],
    docRequired: true,
  },
  {
    id: '2.3', title: 'Outgoing / Final Year Students',
    type: 'TBL', modelKey: 'Metric_2_3',
    columns: [
      col('year_of_passing',   'Year of Passing Final Year Exam', 'year', { required: true }),
      col('student_name',      'Name of Student',                 'text', { required: true }),
      col('enrollment_number', 'Enrollment Number',               'text', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '2.1.1', title: 'Enrolment Number — Programme-wise Sanctioned vs Admitted',
    type: 'TBL', modelKey: 'Metric_2_1_1',
    columns: [
      col('program_name',      'Programme Name',              'text',   { required: true }),
      col('program_code',      'Programme Code',              'text',   { required: true }),
      col('sanctioned_seats',  'Number of Seats Sanctioned',  'number', { required: true }),
      col('students_admitted', 'Number of Students Admitted', 'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '2.1.2', title: 'Seats Filled Against Reserved Categories (SC/ST/OBC/Gen/Others)',
    type: 'TBL', modelKey: 'Metric_2_1_2',
    columns: [
      col('year',             'Year',              'year',   { required: true }),
      col('earmarked_sc',     'Earmarked SC',      'number', { required: true }),
      col('earmarked_st',     'Earmarked ST',      'number', { required: true }),
      col('earmarked_obc',    'Earmarked OBC',     'number', { required: true }),
      col('earmarked_gen',    'Earmarked General', 'number', { required: true }),
      col('earmarked_others', 'Earmarked Others',  'number', { required: false }),
      col('admitted_sc',      'Admitted SC',       'number', { required: true }),
      col('admitted_st',      'Admitted ST',       'number', { required: true }),
      col('admitted_obc',     'Admitted OBC',      'number', { required: true }),
      col('admitted_gen',     'Admitted General',  'number', { required: true }),
      col('admitted_others',  'Admitted Others',   'number', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '2.4.1', title: 'Full-Time Teachers — Sanctioned Posts & Experience',
    type: 'TBL', modelKey: 'Metric_2_4_1_2_4_3',
    columns: [
      col('teacher_name',          'Name of Full-time Teacher',                     'text',   { required: true }),
      col('pan',                   'PAN',                                            'text',   { required: true }),
      col('designation',           'Designation',                                   'select', { options: ['Assistant Professor', 'Associate Professor', 'Professor', 'Guest Lecturer', 'Other'], required: true }),
      col('year_of_appointment',   'Year of Appointment',                           'year',   { required: true }),
      col('nature_of_appointment', 'Nature of Appointment',                         'select', { options: ['Against Sanctioned Post', 'Temporary', 'Permanent'], required: true }),
      col('department_name',       'Name of the Department',                        'text',   { required: true }),
      col('years_of_experience',   'Total Years of Experience in Same Institution', 'number', { required: true }),
      col('still_serving',         'Still Serving?',                                'select', { options: ['Yes', 'No'], required: true }),
    ],
    docRequired: false,
  },
  {
    id: '2.6.3', title: 'Pass Percentage of Students',
    type: 'TBL', modelKey: 'Metric_2_6_3',
    columns: [
      col('year',              'Year',                                           'year',   { required: true }),
      col('program_code',      'Program Code',                                   'text',   { required: true }),
      col('program_name',      'Program Name',                                   'text',   { required: true }),
      col('students_appeared', 'Number of Students Appeared in Final Year Exam', 'number', { required: true }),
      col('students_passed',   'Number of Students Passed in Final Year Exam',   'number', { required: true }),
    ],
    docRequired: false,
  },
]

const C3_METRICS = [
  {
    id: '3.1', title: 'Full-Time Teachers (Master List)',
    type: 'TBL', modelKey: 'Metric_3_1',
    columns: [
      col('teacher_name',     'Name of Teacher',                                 'text',   { required: true }),
      col('id_number',        'ID / Aadhaar Number (not mandatory)',             'text',   { required: false }),
      col('email',            'Email',                                           'email',  { required: true }),
      col('gender',           'Gender',                                          'select', { options: ['Male', 'Female', 'Other'], required: true }),
      col('designation',      'Designation',                                     'select', { options: ['Assistant Professor', 'Associate Professor', 'Professor', 'Guest Lecturer', 'Other'], required: true }),
      col('date_of_joining',  'Date of Joining Institution',                     'date',   { required: true }),
      col('sanctioned_posts', 'Number of Sanctioned Posts During the Five Year', 'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '3.2', title: 'Sanctioned Posts During the Year',
    type: 'TBL', modelKey: 'Metric_3_2',
    columns: [
      col('year',             'Year',                       'year',   { required: true }),
      col('sanctioned_posts', 'Number of Sanctioned Posts', 'number', { required: true }),
      col('document_link',    'Upload Supporting Document', 'url',    { required: false }),
    ],
    docRequired: true,
  },
  {
    id: '2.4.2', title: 'PhD Teachers / Research Guides / PhD Scholars (2.4.2, 3.1.2, 3.3.1)',
    type: 'TBL', modelKey: 'Metric_2_4_2_3_1_2_3_3_1',
    columns: [
      col('teacher_name',       'Name of Full-time Teacher with PhD/DM/etc.', 'text',     { required: true }),
      col('qualification',      'Qualification',                               'select',   { options: ['Ph.D.', 'D.M.', 'M.Ch.', 'D.N.B Superspeciality', 'D.Sc.', 'D.Litt.'], required: true }),
      col('qualification_year', 'Year of Obtaining Qualification',             'year',     { required: true }),
      col('is_research_guide',  'Recognised as Research Guide?',               'select',   { options: ['Yes', 'No'], required: true }),
      col('recognition_year',   'Year of Recognition as Research Guide',       'year',     { required: false }),
      col('still_serving',      'Still Serving?',                              'select',   { options: ['Yes', 'No'], required: true }),
      col('scholar_name',       'Name of the Scholar',                         'text',     { required: false }),
      col('scholar_reg_year',   'Year of Registration of the Scholar',         'year',     { required: false }),
      col('thesis_title',       'Title of the Thesis',                         'textarea', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '3.1.1', title: 'Research Grants from Govt / Non-Govt Agencies (3.1.1, 3.1.3)',
    type: 'TBL', modelKey: 'Metric_3_1_1_3_1_3',
    columns: [
      col('project_name',      'Name of Project / Endowment / Chair', 'text',   { required: true }),
      col('pi_name',           'Name of Principal Investigator',       'text',   { required: true }),
      col('pi_department',     'Department of PI',                     'text',   { required: true }),
      col('year_of_award',     'Year of Award',                        'year',   { required: true }),
      col('amount_sanctioned', 'Amount Sanctioned (₹ Lakhs)',          'number', { required: true }),
      col('duration',          'Duration of the Project',              'text',   { required: true }),
      col('funding_agency',    'Name of Funding Agency',               'text',   { required: true }),
      col('agency_type',       'Type (Government / Non-Government)',    'select', { options: ['Government', 'Non-Government'], required: true }),
    ],
    docRequired: false,
  },
  {
    id: '3.2.2', title: 'Workshops / Seminars on Research Methodology, IPR, Entrepreneurship',
    type: 'TBL', modelKey: 'Metric_3_2_2',
    columns: [
      col('year',          'Year',                               'year',   { required: true }),
      col('seminar_name',  'Name of Workshop / Seminar',         'text',   { required: true }),
      col('participants',  'Number of Participants',              'number', { required: true }),
      col('date_from_to',  'Date From – To (e.g. 10-01-2023 to 12-01-2023)', 'text', { required: true }),
      col('activity_link', 'Link to Activity Report on Website', 'url',    { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '3.3.2', title: 'Research Papers in UGC-Listed Journals',
    type: 'TBL', modelKey: 'Metric_3_3_2',
    columns: [
      col('paper_title',  'Title of Paper',                        'text',     { required: true }),
      col('authors',      'Name of the Author(s)',                 'textarea', { required: true }),
      col('dept_name',    'Department of the Teacher',             'text',     { required: true }),
      col('journal_name', 'Name of Journal',                       'text',     { required: true }),
      col('year',         'Year of Publication',                   'year',     { required: true }),
      col('issn',         'ISSN Number',                           'text',     { required: true }),
      col('ugc_link',     'Link to UGC Enlistment of the Journal', 'url',      { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '3.3.3', title: 'Books, Chapters & Conference Papers per Teacher',
    type: 'TBL', modelKey: 'Metric_3_3_3',
    columns: [
      col('sl_no',                  'Sl. No.',                                    'number',   { required: true }),
      col('teacher_name',           'Name of the Teacher',                        'text',     { required: true }),
      col('book_chapter_title',     'Title of the Book / Chapter Published',      'text',     { required: false }),
      col('paper_title',            'Title of the Paper',                         'text',     { required: false }),
      col('proceedings_title',      'Title of the Proceedings of the Conference', 'text',     { required: false }),
      col('conference_name',        'Name of the Conference',                     'text',     { required: false }),
      col('national_international', 'National / International',                   'select',   { options: ['National', 'International'], required: true }),
      col('year_of_publication',    'Year of Publication',                        'year',     { required: true }),
      col('isbn_issn',              'ISBN / ISSN Number',                         'text',     { required: true }),
      col('publisher',              'Name of the Publisher',                      'text',     { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '3.4.2', title: 'Awards for Extension Activities',
    type: 'TBL', modelKey: 'Metric_3_4_2',
    columns: [
      col('activity_name', 'Name of the Activity',                          'text', { required: true }),
      col('award_name',    'Name of Award / Recognition',                   'text', { required: true }),
      col('awarding_body', 'Name of Awarding Government / Recognised Body', 'text', { required: true }),
      col('year_of_award', 'Year of Award',                                 'year', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '3.4.3', title: 'Extension / Outreach Programmes & Student Participation (3.4.3, 3.4.4)',
    type: 'TBL', modelKey: 'Metric_3_4_3_3_4_4',
    columns: [
      col('activity_name',         'Name of the Activity',                           'text',   { required: true }),
      col('organising_agency',     'Organising Unit / Agency / Collaborating Agency', 'text',   { required: true }),
      col('scheme_name',           'Name of the Scheme',                             'text',   { required: true }),
      col('year',                  'Year of the Activity',                           'year',   { required: true }),
      col('students_participated', 'Number of Students Participated',                'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '3.5.1', title: 'Collaborative Activities (Research / Faculty / Student Exchange)',
    type: 'TBL', modelKey: 'Metric_3_5_1',
    columns: [
      col('sl_no',               'Sl. No.',                                     'number',   { required: true }),
      col('activity_title',      'Title of the Collaborative Activity',         'text',     { required: true }),
      col('collaborating_agency','Name of Collaborating Agency with Contact',   'textarea', { required: true }),
      col('participant_name',    'Name of the Participant',                     'text',     { required: true }),
      col('year',                'Year of Collaboration',                       'year',     { required: true }),
      col('duration',            'Duration',                                    'text',     { required: true }),
      col('nature_of_activity',  'Nature of the Activity',                     'text',     { required: true }),
      col('document_link',       'Link to Relevant Document',                  'url',      { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '3.5.2', title: 'Functional MoUs with Institutions / Industries',
    type: 'TBL', modelKey: 'Metric_3_5_2',
    columns: [
      col('organisation',         'Organisation with which MoU is Signed',            'text',     { required: true }),
      col('institution_industry', 'Name of Institution / Industry / Corporate House', 'text',     { required: true }),
      col('year_of_signing',      'Year of Signing MoU',                              'year',     { required: true }),
      col('duration',             'Duration of MoU',                                  'text',     { required: true }),
      col('activities_under_mou', 'Actual Activities Under Each MoU Year-wise',       'textarea', { required: true }),
      col('participants_count',   'Number of Students / Teachers Participated',        'number',   { required: true }),
    ],
    docRequired: false,
  },
]

const C4_METRICS = [
  {
    id: '4.1.3', title: 'ICT-Enabled Classrooms and Seminar Halls',
    type: 'TBL', modelKey: 'Metric_4_1_3',
    columns: [
      col('room_name',  'Room Number / Name of Classroom / Seminar Hall', 'text',   { required: true }),
      col('ict_type',   'Type of ICT Facility',                           'select', {
        options: ['LCD Projector', 'Smart Board', 'Wi-Fi', 'LAN', 'LMS', 'Video Conferencing', 'Other'],
        required: true,
      }),
      col('photo_link', 'Link to Geotagged Photos and Master Time Table', 'url',    { required: false }),
    ],
    docRequired: true,
  },
  {
    id: '4.1.4', title: 'Infrastructure Augmentation & Maintenance Expenditure (4.1.4, 4.4.1)',
    type: 'TBL', modelKey: 'Metric_4_1_4_4_4_1',
    columns: [
      col('year',                        'Year',                                                      'year',   { required: true }),
      col('budget_allocated',            'Budget Allocated for Infrastructure Augmentation (₹ Lakhs)', 'number', { required: true }),
      col('expenditure_augmentation',    'Expenditure for Infrastructure Augmentation (₹ Lakhs)',      'number', { required: true }),
      col('total_expenditure_ex_salary', 'Total Expenditure Excluding Salary (₹ Lakhs)',               'number', { required: true }),
      col('maintenance_academic',        'Expenditure on Maintenance of Academic Facilities (₹ Lakhs)','number', { required: true }),
      col('maintenance_physical',        'Expenditure on Maintenance of Physical Facilities (₹ Lakhs)','number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '4.2.2', title: 'Library E-Resources Subscriptions & Expenditure (4.2.2, 4.2.3)',
    type: 'TBL', modelKey: 'Metric_4_2_2_4_2_3',
    columns: [
      col('library_resource',             'Library Resource', 'select', {
        options: ['Books', 'Journals', 'e-journals', 'e-books', 'e-ShodhSindhu', 'Shodhganga', 'Databases', 'Remote access to e-resources'],
        required: true,
      }),
      col('membership_details',           'Details of Memberships / Subscriptions',        'textarea', { required: false }),
      col('expenditure_ejournals_ebooks', 'Expenditure on e-journals / e-books (₹ Lakhs)', 'number',   { required: true }),
      col('expenditure_other_eresources', 'Expenditure on Other e-Resources (₹ Lakhs)',    'number',   { required: false }),
      col('total_library_expenditure',    'Total Library Expenditure (₹ Lakhs)',            'number',   { required: true }),
      col('document_link',                'Link to Relevant Document',                      'url',      { required: false }),
    ],
    docRequired: false,
  },
]

const C5_METRICS = [
  {
    id: '5.1.1', title: 'Students Benefited by Scholarships — Govt & Institution (5.1.1, 5.1.2)',
    type: 'TBL', modelKey: 'Metric_5_1_1_5_1_2',
    columns: [
      col('year',                       'Year',                                               'year',   { required: true }),
      col('scheme_name',                'Name of the Scheme',                                 'text',   { required: true }),
      col('govt_students_count',        'Number of Students Benefited by Government Scheme',  'number', { required: true }),
      col('govt_amount',                'Amount from Government Scheme (₹)',                  'number', { required: true }),
      col('institution_students_count', 'Number of Students Benefited by Institution Scheme', 'number', { required: true }),
      col('institution_amount',         'Amount from Institution Scheme (₹)',                 'number', { required: true }),
      col('document_link',              'Link to Relevant Document',                          'url',    { required: false }),
    ],
    docRequired: true,
  },
  {
    id: '5.1.3', title: 'Capacity Building & Skills Enhancement Initiatives',
    type: 'TBL', modelKey: 'Metric_5_1_3',
    columns: [
      col('program_name',      'Name of the Capability Enhancement Program', 'text',     { required: true }),
      col('program_type',      'Type of Program',                            'select',   { options: ['Soft skills', 'Language and communication skills', 'Life skills', 'ICT/computing skills'], required: true }),
      col('date_implemented',  'Date of Implementation',                     'date',     { required: true }),
      col('students_enrolled', 'Number of Students Enrolled',                'number',   { required: true }),
      col('agency_name',       'Name of Agency / Consultant with Contact',   'textarea', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '5.1.4', title: 'Guidance for Competitive Exams & Career Counselling',
    type: 'TBL', modelKey: 'Metric_5_1_4',
    columns: [
      col('year',                        'Year',                                               'year',   { required: true }),
      col('competitive_exam_activity',   'Name of Activity for Competitive Exam Guidance',     'text',   { required: true }),
      col('competitive_exam_students',   'Number of Students — Competitive Exam Guidance',     'number', { required: true }),
      col('career_counselling_activity', 'Name of Activity for Career Counselling',            'text',   { required: true }),
      col('career_counselling_students', 'Number of Students — Career Counselling',            'number', { required: true }),
      col('students_placed_campus',      'Number of Students Placed through Campus Placement', 'number', { required: true }),
      col('document_link',               'Link to Relevant Document',                          'url',    { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '5.2.1', title: 'Placement of Outgoing Students',
    type: 'TBL', modelKey: 'Metric_5_2_1',
    columns: [
      col('year',              'Year',                       'year', { required: true }),
      col('student_name',      'Name of Student Placed',     'text', { required: true }),
      col('program_graduated', 'Program Graduated From',     'text', { required: true }),
      col('employer_name',     'Name of Employer',           'text', { required: true }),
      col('pay_package',       'Pay Package at Appointment', 'text', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '5.2.2', title: 'Students Progressing to Higher Education',
    type: 'TBL', modelKey: 'Metric_5_2_2',
    columns: [
      col('student_name',       'Name of Student',              'text', { required: true }),
      col('program_graduated',  'Program Graduated From',        'text', { required: true }),
      col('institution_joined', 'Name of Institution Joined',    'text', { required: true }),
      col('program_admitted',   'Name of Programme Admitted To', 'text', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '5.2.3', title: 'Students Qualifying in State / National / International Exams',
    type: 'TBL', modelKey: 'Metric_5_2_3',
    columns: [
      col('year',             'Year',                                    'year',   { required: true }),
      col('roll_number',      'Registration / Roll Number for the Exam', 'text',   { required: true }),
      col('student_name',     'Name of Student Selected / Qualified',    'text',   { required: true }),
      col('exam_qualified',   'Examination Qualified',                   'select', {
        options: ['NET', 'SLET', 'GATE', 'GMAT', 'CAT', 'GRE', 'JAM', 'IELTS', 'TOEFL', 'Civil Services', 'State Government Examinations', 'Other'],
        required: true,
      }),
      col('net',              'NET',                  'number', { required: false }),
      col('slet',             'SLET',                 'number', { required: false }),
      col('gate',             'GATE',                 'number', { required: false }),
      col('gmat',             'GMAT',                 'number', { required: false }),
      col('cat',              'CAT',                  'number', { required: false }),
      col('gre',              'GRE',                  'number', { required: false }),
      col('jam',              'JAM',                  'number', { required: false }),
      col('ielts',            'IELTS',                'number', { required: false }),
      col('toefl',            'TOEFL',                'number', { required: false }),
      col('civil_services',   'Civil Services',       'number', { required: false }),
      col('state_govt_exams', 'State Govt Exams',     'number', { required: false }),
      col('other_exams',      'Other Exams',          'number', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '5.3.1', title: 'Awards / Medals in Sports & Cultural Activities',
    type: 'TBL', modelKey: 'Metric_5_3_1',
    columns: [
      col('year',               'Year',                'year',   { required: true }),
      col('award_name',         'Name of Award / Medal','text',  { required: true }),
      col('team_or_individual', 'Team / Individual',   'select', { options: ['Team', 'Individual'], required: true }),
      col('level',              'Level',               'select', { options: ['University', 'State', 'National', 'International'], required: true }),
      col('sports_or_cultural', 'Sports / Cultural',   'select', { options: ['Sports', 'Cultural'], required: true }),
      col('student_name',       'Name of Student',     'text',   { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '5.3.3', title: 'Sports & Cultural Events / Competitions Participated',
    type: 'TBL', modelKey: 'Metric_5_3_3',
    columns: [
      col('event_date',   'Date of Event / Activity',     'date', { required: true }),
      col('event_name',   'Name of Event / Activity',     'text', { required: true }),
      col('student_name', 'Name of Student Participated', 'text', { required: true }),
    ],
    docRequired: false,
  },
]

const C6_METRICS = [
  {
    id: '6.2.3', title: 'E-Governance Implementation',
    type: 'TBL', modelKey: 'Metric_6_2_3',
    columns: [
      col('area',             'Area of E-Governance',              'select', {
        options: ['Administration', 'Finance and Accounts', 'Student Admission and Support', 'Examination'],
        required: true,
      }),
      col('vendor_details',   'Name of Vendor with Contact Details', 'textarea', { required: true }),
      col('year_implemented', 'Year of Implementation',              'year',     { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '6.3.2', title: 'Financial Support for Teachers — Conferences / Professional Bodies',
    type: 'TBL', modelKey: 'Metric_6_3_2',
    columns: [
      col('year',              'Year',                                         'year',   { required: true }),
      col('teacher_name',      'Name of Teacher',                              'text',   { required: true }),
      col('conference_name',   'Name of Conference / Workshop Attended',       'text',   { required: true }),
      col('professional_body', 'Name of Professional Body for Membership Fee', 'text',   { required: false }),
      col('amount',            'Amount of Support (₹)',                        'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '6.3.3', title: 'Professional Development & Administrative Training Programs',
    type: 'TBL', modelKey: 'Metric_6_3_3',
    columns: [
      col('dates',                     'Dates (From – To)',                                          'text',   { required: true }),
      col('teaching_program_title',    'Title of Professional Development Program (Teaching)',        'text',   { required: false }),
      col('nonteaching_program_title', 'Title of Administrative Training Program (Non-Teaching)',     'text',   { required: false }),
      col('participants_count',        'Number of Participants',                                     'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '6.3.4', title: 'Faculty Development Programmes (FDP)',
    type: 'TBL', modelKey: 'Metric_6_3_4',
    columns: [
      col('teacher_name',  'Name of Teacher who Attended', 'text', { required: true }),
      col('program_title', 'Title of the Program',         'text', { required: true }),
      col('duration',      'Duration (From – To)',         'text', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '6.4.2', title: 'Funds / Grants from Non-Government Bodies',
    type: 'TBL', modelKey: 'Metric_6_4_2',
    columns: [
      col('year',        'Year',                                      'year',     { required: true }),
      col('agency_name', 'Name of Non-Government Funding Agency',     'text',     { required: true }),
      col('purpose',     'Purpose of the Grant',                      'textarea', { required: true }),
      col('amount',      'Funds / Grants Received (₹ Lakhs)',         'number',   { required: true }),
      col('audit_link',  'Link to Audited Statement of Accounts',     'url',      { required: false }),
    ],
    docRequired: true,
  },
  {
    id: '6.5.3', title: 'Quality Assurance Initiatives — IQAC, NIRF, ISO, NBA',
    type: 'TBL', modelKey: 'Metric_6_5_3',
    columns: [
      col('year',                  'Year',                                                       'year',     { required: true }),
      col('conferences_seminars',  'Conferences / Seminars / Workshops on Quality Conducted',    'textarea', { required: false }),
      col('aaa_followup',          'Academic Administrative Audit (AAA) & Follow-up Action',     'textarea', { required: false }),
      col('nirf_participation',    'Participation in NIRF along with Status',                    'textarea', { required: false }),
      col('iso_certification',     'ISO Certification — Nature and Validity Period',             'textarea', { required: false }),
      col('nba_certification',     'NBA or Any Other Certification with Program Specifications', 'textarea', { required: false }),
      col('collaborative_quality', 'Collaborative Quality Initiatives with Other Institution(s)','textarea', { required: false }),
      col('orientation_program',   'Orientation Programme on Quality Issues — Date (From-To)',   'textarea', { required: false }),
    ],
    docRequired: false,
  },
]

// ── Criterion VII — Institutional Values and Social Responsibilities ───────────
// Source: Criterion_VII_template.xlsx
// 7.1.1  → Gender Equity           (cols: Title | Period from | Period To | Male | Female | Total)
// 7.1.3  → Divyangjan Friendliness (cols: Item facilities | Yes/No | Number of beneficiaries)
// 7.1.4  → Inclusion & Situatedness(cols: Year | locational | community | Date | Duration | Name | Issues | Participants)
// 7.1.5  → Human Values & Ethics   (cols: Title | Date of publication | Followup)
// 7.1.11 → Commemorative Days      (cols: Activity | Duration From | Duration To | Male | Female | Total)
const C7_METRICS = [
  {
    id: '7.1.1',
    title: 'Gender Equity Promotion Programmes',
    type: 'TBL', modelKey: 'Metric_7_1_1',
    columns: [
      col('title',               'Title of the Programme',       'text',   { required: true }),
      col('period_from',         'Period From',                  'date',   { required: true }),
      col('period_to',           'Period To',                    'date',   { required: true }),
      col('participants_male',   'No. of Participants — Male',   'number', { required: true }),
      col('participants_female', 'No. of Participants — Female', 'number', { required: true }),
      col('participants_total',  'No. of Participants — Total',  'number', { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '7.1.3',
    title: 'Differently Abled (Divyangjan) Friendliness',
    type: 'TBL', modelKey: 'Metric_7_1_3',
    columns: [
      col('facility', 'Item / Facility', 'select', {
        options: [
          'Physical facilities',
          'Provision for lift',
          'Ramp / Rails',
          'Braille Software / facilities',
          'Rest Rooms',
          'Scribes for examination',
          'Special skill development for differently abled students',
          'Any other similar facility',
        ],
        required: true,
      }),
      col('available',     'Available (Yes/No)',      'select', { options: ['Yes', 'No'], required: true }),
      col('beneficiaries', 'Number of Beneficiaries', 'number', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '7.1.4',
    title: 'Inclusion and Situatedness',
    type: 'TBL', modelKey: 'Metric_7_1_4',
    columns: [
      col('year',                   'Year',                                                                      'year',     { required: true }),
      col('locational_initiatives', 'Number of Initiatives to Address Locational Advantages and Disadvantages', 'number',   { required: true }),
      col('community_initiatives',  'Number of Initiatives to Engage with and Contribute to Local Community',   'number',   { required: true }),
      col('date',                   'Date of Initiative',                                                       'date',     { required: true }),
      col('duration',               'Duration',                                                                 'text',     { required: true }),
      col('initiative_name',        'Name of Initiative',                                                       'text',     { required: true }),
      col('issues_addressed',       'Issues Addressed',                                                         'textarea', { required: true }),
      col('participants_count',     'Number of Participating Students and Staff',                               'number',   { required: true }),
    ],
    docRequired: false,
  },
  {
    id: '7.1.5',
    title: 'Human Values and Professional Ethics',
    type: 'TBL', modelKey: 'Metric_7_1_5',
    columns: [
      col('title',               'Title of Code / Policy / Publication', 'text',     { required: true }),
      col('date_of_publication', 'Date of Publication',                  'date',     { required: true }),
      col('followup',            'Follow-up Action Taken',               'textarea', { required: false }),
    ],
    docRequired: false,
  },
  {
    id: '7.1.11',
    title: 'National and International Commemorative Days, Events and Festivals',
    type: 'TBL', modelKey: 'Metric_7_1_11',
    columns: [
      col('activity',            'Activity / Event / Festival Name',  'text',   { required: true }),
      col('duration_from',       'Duration From',                      'date',   { required: true }),
      col('duration_to',         'Duration To',                        'date',   { required: true }),
      col('participants_male',   'No. of Participants — Male',         'number', { required: true }),
      col('participants_female', 'No. of Participants — Female',       'number', { required: true }),
      col('participants_total',  'No. of Participants — Total',        'number', { required: true }),
    ],
    docRequired: false,
  },
]

export const CRITERIA = [
  { key: 'c1', label: 'Criterion I',   subtitle: 'Curricular Aspects',                          icon: '📚', color: '#0ea5e9', metrics: C1_METRICS },
  { key: 'c2', label: 'Criterion II',  subtitle: 'Teaching-Learning & Evaluation',              icon: '🎓', color: '#22c55e', metrics: C2_METRICS },
  { key: 'c3', label: 'Criterion III', subtitle: 'Research, Innovations & Extension',           icon: '🔬', color: '#f97316', metrics: C3_METRICS },
  { key: 'c4', label: 'Criterion IV',  subtitle: 'Infrastructure & Learning Resources',         icon: '🏛️', color: '#a855f7', metrics: C4_METRICS },
  { key: 'c5', label: 'Criterion V',   subtitle: 'Student Support & Progression',               icon: '🎯', color: '#eab308', metrics: C5_METRICS },
  { key: 'c6', label: 'Criterion VI',  subtitle: 'Governance, Leadership & Management',        icon: '⚙️', color: '#14b8a6', metrics: C6_METRICS },
  { key: 'c7', label: 'Criterion VII', subtitle: 'Institutional Values & Social Responsibilities', icon: '🌿', color: '#ec4899', metrics: C7_METRICS },
]

export const ALL_METRICS       = CRITERIA.flatMap(c => c.metrics)
export const getMetricById     = (id)  => ALL_METRICS.find(m => m.id === id)
export const getCriterionByKey = (key) => CRITERIA.find(c => c.key === key)

export const initResponses = () =>
  Object.fromEntries(ALL_METRICS.map(m => [m.id, { rows: [], documents: [], saved: false }]))

export const isMetricComplete = (metric, response) => response?.rows?.length > 0

export const getCriterionCompletion = (criterion, responses) => {
  const total = criterion.metrics.length
  const done  = criterion.metrics.filter(m => isMetricComplete(m, responses[m.id])).length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, pct }
}

export const getOverallCompletion = (responses) => {
  const total = ALL_METRICS.length
  const done  = ALL_METRICS.filter(m => isMetricComplete(m, responses[m.id])).length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, pct }
}