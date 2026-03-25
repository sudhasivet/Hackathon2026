const FIELD_INFO = {


  '1.1': {
    title: '1.1 Number of courses offered by the Institution across all programs during the year',
    description: 'List all courses offered by the institution across all programs during the year. Each row represents one course.',
    fields: {
      program_code:         { label: 'Program Code',          info: 'The unique code assigned to the program (e.g., BSC, BCA, MBA). Enter the official program code as used in university records.' },
      program_name:         { label: 'Program Name',          info: 'Full name of the program under which the course is offered (e.g., Bachelor of Science, Master of Business Administration).' },
      course_code:          { label: 'Course Code',           info: 'The unique code assigned to the individual course (e.g., CS101, MA201). Enter as registered with the affiliating university.' },
      course_name:          { label: 'Course Name',           info: 'Full name of the course as per the curriculum (e.g., Data Structures, Financial Accounting).' },
      year_of_introduction: { label: 'Year of Introduction',  info: 'The year the course was first introduced/offered in the institution (e.g., 2019-20).' },
    },
  },

  '1.1.3': {
    title: '1.1.3 Teachers participating in curriculum development and academic bodies',
    description: 'Teachers of the Institution who participate in activities related to curriculum development and assessment of the affiliating University and/or are represented on academic bodies during the year:\n1. Academic council/BoS of Affiliating university\n2. Setting of question papers for UG/PG programs\n3. Design and Development of Curriculum for Add on/certificate/Diploma Courses\n4. Assessment/evaluation process of the affiliating University',
    fields: {
      year:         { label: 'Year',             info: 'The academic year in which the teacher participated in the activity (e.g., 2022-23).' },
      teacher_name: { label: 'Name of Teacher',  info: 'Full name of the full-time teacher who participated in the curriculum development or academic body activity.' },
      body_name:    { label: 'Name of the Body', info: 'Name of the academic body or activity in which the teacher participated. Examples: Academic Council, Board of Studies (BoS), Question Paper Setting Committee, Curriculum Design Committee, Evaluation/Assessment Committee.' },
    },
  },

  '1.2.1': {
    title: '1.2.1 Number of Programmes with CBCS / Elective Course System',
    description: 'Number of Programmes in which Choice Based Credit System (CBCS) / elective course system has been implemented.',
    fields: {
      program_code:      { label: 'Programme Code',              info: 'Official code of the programme (e.g., BSC, BA, BCA) as registered with the affiliating university.' },
      program_name:      { label: 'Programme Name',              info: 'Full name of the programme (e.g., Bachelor of Science in Computer Science).' },
      year_introduction: { label: 'Year of Introduction',        info: 'Year in which the programme was first introduced in the institution.' },
      cbcs_status:       { label: 'Status of CBCS (Yes/No)',     info: 'Whether CBCS / elective course system has been implemented in this programme. Select Yes if implemented, No if not yet implemented.' },
      cbcs_year:         { label: 'Year of CBCS Implementation', info: 'The year in which CBCS / elective course system was implemented for this programme. Leave blank if not yet implemented.' },
      document_link:     { label: 'Link to Relevant Document',   info: 'Paste the URL/link to the relevant document (e.g., university circular, programme structure) available on the institution or university website.' },
    },
  },

  '1.2.2': {
    title: '1.2.2 Add-on / Certificate Programs Offered & 1.2.3 Students Enrolled',
    description: '1.2.2: Number of Add on/Certificate programs offered during the year.\n1.2.3: Number of students enrolled in Certificate/Add-on programs as against the total number of students during the year.',
    fields: {
      program_name:        { label: 'Name of Program',                info: 'Full name of the Add-on or Certificate program offered (e.g., Certificate in Communicative English, Add-on Course in Tally).' },
      course_code:         { label: 'Course Code (if any)',           info: 'Course code assigned to the Add-on/Certificate program, if any. Leave blank if no code is assigned.' },
      year_of_offering:    { label: 'Year of Offering',               info: 'The academic year in which this Add-on/Certificate program was offered (e.g., 2022-23).' },
      times_offered:       { label: 'No. of Times Offered',           info: 'Number of times this program was offered during the year (e.g., if offered in both semesters, enter 2).' },
      duration:            { label: 'Duration of Course',             info: 'Duration of the Add-on/Certificate program (e.g., 30 hours, 3 months, 1 semester).' },
      students_enrolled:   { label: 'Number of Students Enrolled',    info: 'Total number of students who enrolled in this Add-on/Certificate program during the year.' },
      students_completing: { label: 'Number of Students Completing',  info: 'Total number of students who successfully completed this Add-on/Certificate program during the year.' },
    },
  },

  '1.3.2': {
    title: '1.3.2 Courses with Experiential Learning (Project / Field Work / Internship)',
    description: 'Number of courses that include experiential learning through project work/field work/internship during the year. Each row represents one student in such a course.',
    fields: {
      program_name:  { label: 'Program Name',       info: 'Name of the program under which the experiential learning course is offered (e.g., B.Sc. Chemistry, MBA).' },
      program_code:  { label: 'Program Code',       info: 'Official code of the program as registered with the affiliating university.' },
      course_name:   { label: 'Name of the Course', info: 'Full name of the course that includes experiential learning through project work, field work, or internship.' },
      course_code:   { label: 'Course Code',        info: 'Code assigned to the experiential learning course.' },
      year_offering: { label: 'Year of Offering',   info: 'Academic year in which this course with experiential learning was offered (e.g., 2022-23).' },
      student_name:  { label: 'Name of Student',    info: 'Full name of the student who studied the course on experiential learning through project work/field work/internship.' },
      document_link: { label: 'Link to Document',   info: 'URL/link to the relevant supporting document available on the institution website (e.g., internship completion certificate, field work report).' },
    },
  },

  '1.3.3': {
    title: '1.3.3 Students Undertaking Project Work / Field Work / Internships',
    description: 'Number of students undertaking project work/field work/internships.\nNote: Check with SOP if the same student can be counted more than once.',
    fields: {
      program_name:  { label: 'Programme Name',   info: 'Name of the programme under which the student is enrolled (e.g., B.Com, M.Sc. Physics).' },
      program_code:  { label: 'Programme Code',   info: 'Official code of the programme.' },
      student_name:  { label: 'Name of Student',  info: 'Full name of the student undertaking project work, field work, or internship.' },
      document_link: { label: 'Link to Document', info: 'URL/link to the relevant supporting document (e.g., internship letter, project completion certificate) on the institution website.' },
    },
  },


  '2.1': {
    title: '2.1 Number of students during the year',
    description: 'List all students enrolled during the year. Each row represents one student admission.',
    fields: {
      year_of_enrollment: { label: 'Year of Enrollment',        info: 'The academic year in which the student was enrolled (e.g., 2022-23).' },
      student_name:       { label: 'Name of Student',           info: 'Full name of the student as per admission records.' },
      enrollment_number:  { label: 'Student Enrollment Number', info: 'The unique enrollment/admission number assigned to the student by the institution or affiliating university.' },
      date_of_enrollment: { label: 'Date of Enrolment',         info: 'The exact date on which the student was enrolled/admitted (DD-MM-YYYY format).' },
    },
  },

  '2.2': {
    title: '2.2 Number of seats earmarked for reserved category as per GOI/State Govt. rule',
    description: 'Number of seats earmarked for reserved category as per GOI/State Government rule during the year. Upload supporting document (sanction order/seat matrix).',
    fields: {
      year:           { label: 'Year',                       info: 'The academic year for which reserved seats are being reported (e.g., 2022-23).' },
      reserved_seats: { label: 'Number of Reserved Seats',   info: 'Total number of seats earmarked for reserved categories (SC, ST, OBC, Divyangjan, etc.) as per applicable GOI/State Government reservation policy.' },
      document_link:  { label: 'Upload Supporting Document', info: 'Paste the link to the uploaded supporting document (e.g., government order, university seat matrix) that confirms the reserved seats. Upload the document to the institution website first, then paste the URL here.' },
    },
  },

  '2.3': {
    title: '2.3 Number of outgoing / final year students during the year',
    description: 'List all outgoing/final year students during the year.',
    fields: {
      year_of_passing:   { label: 'Year of Passing Final Exam', info: 'The academic year in which the student appeared/passed the final year examination (e.g., 2022-23).' },
      student_name:      { label: 'Name of Student',            info: 'Full name of the outgoing/final year student.' },
      enrollment_number: { label: 'Enrollment Number',          info: 'The enrollment/admission number of the student.' },
    },
  },

  '2.1.1': {
    title: '2.1.1 Enrolment Number — Sanctioned vs Admitted',
    description: 'Enrolment data comparing number of seats sanctioned versus number of students actually admitted, programme-wise.',
    fields: {
      program_name:      { label: 'Programme Name',              info: 'Full name of the programme (e.g., B.Sc. Computer Science, B.Com).' },
      program_code:      { label: 'Programme Code',              info: 'Official code of the programme as per affiliating university records.' },
      sanctioned_seats:  { label: 'Number of Seats Sanctioned',  info: 'Total number of seats sanctioned/approved by the affiliating university or regulatory body for this programme.' },
      students_admitted: { label: 'Number of Students Admitted', info: 'Actual number of students admitted to this programme during the year.' },
    },
  },

  '2.1.2': {
    title: '2.1.2 Seats filled against reserved categories (SC/ST/OBC/Gen/Others)',
    description: 'Number of seats filled against seats reserved for various categories (SC, ST, OBC, Divyangjan, etc.) as per applicable reservation policy during the year (exclusive of supernumerary seats).\nNote: For Minority Institutions, the "Others" column may be used and the status of reservation for minorities specified along with supporting documents.',
    fields: {
      year:             { label: 'Year',              info: 'The academic year for which data is being reported (e.g., 2022-23).' },
      earmarked_sc:     { label: 'Earmarked SC',      info: 'Number of seats earmarked/reserved for Scheduled Caste (SC) category as per GOI/State Government rule.' },
      earmarked_st:     { label: 'Earmarked ST',      info: 'Number of seats earmarked/reserved for Scheduled Tribe (ST) category as per GOI/State Government rule.' },
      earmarked_obc:    { label: 'Earmarked OBC',     info: 'Number of seats earmarked/reserved for Other Backward Classes (OBC) category as per GOI/State Government rule.' },
      earmarked_gen:    { label: 'Earmarked General', info: 'Number of seats earmarked for General (unreserved) category.' },
      earmarked_others: { label: 'Earmarked Others',  info: 'Number of seats earmarked for other categories (Divyangjan, EWS, Minorities, etc.).' },
      admitted_sc:      { label: 'Admitted SC',       info: 'Actual number of students admitted from the Scheduled Caste (SC) category during the year.' },
      admitted_st:      { label: 'Admitted ST',       info: 'Actual number of students admitted from the Scheduled Tribe (ST) category during the year.' },
      admitted_obc:     { label: 'Admitted OBC',      info: 'Actual number of students admitted from the Other Backward Classes (OBC) category during the year.' },
      admitted_gen:     { label: 'Admitted General',  info: 'Actual number of students admitted from the General (unreserved) category during the year.' },
      admitted_others:  { label: 'Admitted Others',   info: 'Actual number of students admitted from other reserved categories (Divyangjan, EWS, Minorities, etc.) during the year.' },
    },
  },

  '2.4.1': {
    title: '2.4.1 Full-Time Teachers Against Sanctioned Posts & 2.4.3 Teaching Experience',
    description: '2.4.1: Number of full time teachers against sanctioned posts during the year.\n2.4.3: Number of years of teaching experience of full time teachers in the same institution (Data for the latest completed academic year).',
    fields: {
      teacher_name:          { label: 'Name of Full-time Teacher',  info: 'Full name of the full-time teacher as per official records.' },
      pan:                   { label: 'PAN',                         info: 'Permanent Account Number (PAN) of the teacher. Used for unique identification of the teacher.' },
      designation:           { label: 'Designation',                 info: 'Official designation of the teacher (e.g., Assistant Professor, Associate Professor, Professor).' },
      year_of_appointment:   { label: 'Year of Appointment',         info: 'The year in which the teacher was appointed to the current position in this institution (e.g., 2018).' },
      nature_of_appointment: { label: 'Nature of Appointment',       info: 'Type of appointment. Specify: Against Sanctioned Post, Temporary, Permanent, Contract, or Guest Faculty.' },
      department_name:       { label: 'Name of the Department',      info: 'Name of the department to which the teacher belongs (e.g., Department of Commerce, Department of Computer Science).' },
      years_of_experience:   { label: 'Total Years of Experience',   info: 'Total number of years of teaching experience in this same institution only (not total career experience). Data should be for the latest completed academic year.' },
      still_serving:         { label: 'Still Serving / Last Year',   info: 'Whether the teacher is still serving (write "Yes") or if they have left, mention the last year of service (e.g., "No - 2021").' },
    },
  },

  '2.6.3': {
    title: '2.6.3 Pass Percentage of Students during the year',
    description: 'Pass percentage of students during the year, programme-wise.',
    fields: {
      year:              { label: 'Year',                                  info: 'The academic year for which pass percentage data is being reported (e.g., 2022-23).' },
      program_code:      { label: 'Program Code',                          info: 'Official code of the programme (e.g., BSC, BCA, MBA).' },
      program_name:      { label: 'Program Name',                          info: 'Full name of the programme (e.g., Bachelor of Commerce, Master of Science in Physics).' },
      students_appeared: { label: 'Students Appeared in Final Year Exam',  info: 'Total number of students who appeared in the final year examination for this programme during the year.' },
      students_passed:   { label: 'Students Passed in Final Year Exam',    info: 'Total number of students who passed the final year examination. Pass percentage = (Passed ÷ Appeared) × 100.' },
    },
  },

  // ─── CRITERION III ──────────────────────────────────────────────────────────

  '3.1': {
    title: '3.1 Number of full time teachers during the year',
    description: 'Master list of all full-time teachers in the institution during the year.',
    fields: {
      teacher_name:     { label: 'Name',                          info: 'Full name of the full-time teacher as per official records.' },
      id_number:        { label: 'ID / Aadhaar Number',           info: 'ID number or Aadhaar number of the teacher. NOTE: This field is NOT mandatory as per NAAC guidelines.' },
      email:            { label: 'Email',                         info: 'Official email address of the teacher (preferably institutional email).' },
      gender:           { label: 'Gender',                        info: 'Gender of the teacher: Male, Female, or Other.' },
      designation:      { label: 'Designation',                   info: 'Current designation of the teacher (e.g., Assistant Professor, Associate Professor, Professor, Principal).' },
      date_of_joining:  { label: 'Date of Joining Institution',   info: 'The exact date on which the teacher joined this institution (DD-MM-YYYY format).' },
      sanctioned_posts: { label: 'Number of Sanctioned Posts',    info: 'Number of sanctioned posts in the institution during the five-year assessment period. This is the total sanctioned strength of the institution.' },
    },
  },

  '3.2': {
    title: '3.2 Number of Sanctioned posts during the year',
    description: 'Year-wise number of sanctioned teaching posts during the year. Upload supporting document (sanction order).',
    fields: {
      year:             { label: 'Year',                        info: 'The academic year for which the sanctioned posts data is being reported (e.g., 2022-23).' },
      sanctioned_posts: { label: 'Number of Sanctioned Posts',  info: 'Total number of teaching posts sanctioned by the management/government for the institution during this year.' },
      document_link:    { label: 'Upload Supporting Document',  info: 'Paste the URL/link to the uploaded supporting document (e.g., government/management sanction order) on the institution website confirming the number of sanctioned posts.' },
    },
  },

  '2.4.2': {
    title: '2.4.2 PhD Teachers / 3.1.2 Research Guides / 3.3.1 PhD Scholars',
    description: '2.4.2: Number of full time teachers with Ph.D./D.M./M.Ch./D.N.B Superspeciality/D.Sc./D.Litt. during the year (consider only highest degree for count).\n3.1.2: Number of teachers recognized as research guides (latest completed academic year).\n3.3.1: Number of Ph.Ds registered per eligible teacher during the year.',
    fields: {
      teacher_name:       { label: 'Name of Teacher',               info: 'Full name of the full-time teacher who holds Ph.D./D.M./M.Ch./D.N.B Superspeciality/D.Sc./D.Litt. degree.' },
      qualification:      { label: 'Qualification',                 info: 'The highest doctoral qualification held (e.g., Ph.D., D.M., M.Ch., D.N.B Superspeciality, D.Sc., D.Litt.).' },
      qualification_year: { label: 'Year of Obtaining',             info: 'The year in which the teacher obtained the highest doctoral/superspeciality qualification.' },
      is_research_guide:  { label: 'Recognised as Research Guide',  info: 'Whether the teacher is recognised as a Research Guide for Ph.D./D.M./M.Ch./D.N.B Superspeciality/D.Sc./D.Litt. by the affiliating university. Select Yes or No.' },
      recognition_year:   { label: 'Year of Recognition as Guide',  info: 'The year in which the teacher was recognised as a research guide by the university. Leave blank if not a research guide.' },
      still_serving:      { label: 'Still Serving / Last Year',     info: 'Whether the teacher is still serving ("Yes") or if they have left, mention the last year of service (e.g., "No - 2021").' },
      scholar_name:       { label: 'Name of Scholar',               info: 'Full name of the Ph.D. scholar registered under this teacher as guide. Add multiple rows for multiple scholars.' },
      scholar_reg_year:   { label: 'Year of Registration of Scholar', info: 'The year in which the Ph.D. scholar was registered under this teacher.' },
      thesis_title:       { label: 'Title of Thesis',               info: 'Title of the Ph.D. thesis being worked on by the scholar. May be tentative if research is ongoing.' },
    },
  },

  '3.1.1': {
    title: '3.1.1 Research Grants & 3.1.3 Departments with Funded Research Projects',
    description: '3.1.1: Grants received from Government and non-governmental agencies for research projects/endowments in the institution during the year (INR in Lakhs).\n3.1.3: Number of departments having Research projects funded by government and non-government agencies during the year.',
    fields: {
      project_name:      { label: 'Name of Project / Endowment', info: 'Full name/title of the research project, endowment, or Chair for which grant was received.' },
      pi_name:           { label: 'Name of Principal Investigator', info: 'Full name of the Principal Investigator (PI) or Co-Investigator of the research project.' },
      pi_department:     { label: 'Department of PI',             info: 'Name of the department to which the Principal Investigator belongs.' },
      year_of_award:     { label: 'Year of Award',               info: 'The year in which the research project/grant was awarded to the institution.' },
      amount_sanctioned: { label: 'Amount Sanctioned (₹ Lakhs)', info: 'Total amount sanctioned/awarded for the research project in INR Lakhs. Enter numeric value only (e.g., 5.50 for ₹5.5 Lakhs).' },
      duration:          { label: 'Duration of Project',         info: 'Duration of the research project (e.g., 2 years, 3 years, 18 months).' },
      funding_agency:    { label: 'Name of Funding Agency',      info: 'Full name of the funding agency (e.g., UGC, DST, ICSSR, CSIR, DBT, SERB, Industry name, NGO name).' },
      agency_type:       { label: 'Type of Agency',              info: 'Type of the funding agency. Select Government if funded by a government body, Non-Government if funded by a private/NGO/industry body.' },
    },
  },

  '3.2.2': {
    title: '3.2.2 Workshops/Seminars on Research Methodology, IPR and Entrepreneurship',
    description: 'Number of workshops/seminars conducted on Research Methodology, Intellectual Property Rights (IPR) and entrepreneurship during the year.',
    fields: {
      year:          { label: 'Year',                        info: 'The academic year in which the workshop/seminar was conducted (e.g., 2022-23).' },
      seminar_name:  { label: 'Name of Workshop / Seminar', info: 'Full name/title of the workshop or seminar conducted (e.g., Workshop on Research Methodology, Seminar on Intellectual Property Rights, Entrepreneurship Development Programme).' },
      participants:  { label: 'Number of Participants',     info: 'Total number of participants (students + faculty + others) who attended the workshop/seminar.' },
      date_from_to:  { label: 'Date From – To',             info: 'Date range of the workshop/seminar in DD-MM-YYYY to DD-MM-YYYY format (e.g., 10-06-2023 to 12-06-2023). For single-day events, enter the same date for both From and To.' },
      activity_link: { label: 'Link to Activity Report',    info: 'URL/link to the activity report on the institution website. The report should include photographs, attendance, and proceedings.' },
    },
  },

  '3.3.2': {
    title: '3.3.2 Research Papers in Journals notified on UGC website',
    description: 'Number of research papers per teacher in the Journals notified on UGC website during the year. Each row = one published research paper.',
    fields: {
      paper_title:  { label: 'Title of Paper',                    info: 'Full title of the research paper as published in the journal.' },
      authors:      { label: 'Name of Author(s)',                  info: 'Full names of all authors. Separate multiple authors with commas. The teacher from this institution must be listed.' },
      dept_name:    { label: 'Department of the Teacher',          info: 'Name of the department of the teacher (author) from this institution (e.g., Department of Chemistry, Department of Tamil).' },
      journal_name: { label: 'Name of Journal',                    info: 'Full name of the journal. The journal must be listed/notified on the UGC CARE portal.' },
      year:         { label: 'Year of Publication',                info: 'The year in which the research paper was published (e.g., 2023).' },
      issn:         { label: 'ISSN Number',                        info: 'ISSN (International Standard Serial Number) of the journal. Every UGC-listed journal has a unique ISSN. Enter in XXXX-XXXX format.' },
      ugc_link:     { label: 'Link to UGC Enlistment of Journal', info: 'URL/link to the UGC CARE portal page showing this journal\'s enlistment. This validates the journal is UGC-recognized. Visit: https://ugccare.unipune.ac.in' },
    },
  },

  '3.3.3': {
    title: '3.3.3 Books, Chapters in Edited Volumes & Conference Papers per Teacher',
    description: 'Number of books and chapters in edited volumes/books published and papers published in national/international conference proceedings per teacher during the year.',
    fields: {
      sl_no:                  { label: 'Sl. No.',                     info: 'Serial number for the entry. Enter sequential numbers starting from 1.' },
      teacher_name:           { label: 'Name of Teacher',             info: 'Full name of the teacher (author) from this institution.' },
      book_chapter_title:     { label: 'Title of Book / Chapter',     info: 'Full title of the book or book chapter published. Leave blank if this entry is for a conference paper only.' },
      paper_title:            { label: 'Title of Paper',              info: 'Full title of the paper published in conference proceedings. Leave blank if this entry is for a book/chapter only.' },
      proceedings_title:      { label: 'Title of Proceedings',        info: 'Full title of the conference proceedings publication (e.g., Proceedings of International Conference on Advanced Computing 2023).' },
      conference_name:        { label: 'Name of Conference',          info: 'Full name of the conference where the paper was presented/published.' },
      national_international: { label: 'National / International',    info: 'Whether the conference/publication was at National level or International level.' },
      year_of_publication:    { label: 'Year of Publication',         info: 'The year in which the book, chapter, or conference paper was published.' },
      isbn_issn:              { label: 'ISBN / ISSN Number',          info: 'ISBN (for books/chapters, 13 digits) or ISSN (for conference proceedings, XXXX-XXXX format) of the publication.' },
      publisher:              { label: 'Name of Publisher',           info: 'Full name of the publisher (e.g., Springer, Elsevier, Wiley, Oxford University Press, PHI Learning).' },
    },
  },

  '3.4.2': {
    title: '3.4.2 Awards for Extension Activities from Government Bodies',
    description: 'Number of awards and recognitions received for extension activities from government/government recognized bodies during the year.',
    fields: {
      activity_name: { label: 'Name of the Activity',        info: 'Name/title of the extension activity for which the award/recognition was received (e.g., NSS Blood Donation Camp, NCC Best Cadet Programme, Swachh Bharat Campaign).' },
      award_name:    { label: 'Name of Award / Recognition', info: 'Full name of the award or recognition received (e.g., Best NSS Unit Award, District Level Best NCC Award).' },
      awarding_body: { label: 'Name of Awarding Body',       info: 'Full name of the government or government-recognized body that gave the award (e.g., Ministry of Youth Affairs, State Government, UGC, District Collector\'s Office).' },
      year_of_award: { label: 'Year of Award',               info: 'The year in which the award/recognition was received (e.g., 2022-23).' },
    },
  },

  '3.4.3': {
    title: '3.4.3 Extension & Outreach Programmes & 3.4.4 Student Participation',
    description: '3.4.3: Extension and outreach programmes conducted through NSS/NCC/Government bodies (including Swachh Bharat, AIDS awareness, Gender issues etc.) and/or in collaboration with industry, community and NGOs during the year.\n3.4.4: Number of students participating in the extension activities listed in 3.4.3.',
    fields: {
      activity_name:         { label: 'Name of the Activity',            info: 'Full name/title of the extension or outreach programme (e.g., NSS Special Camp, Blood Donation Camp, Swachh Bharat Abhiyan, Women Empowerment Workshop).' },
      organising_agency:     { label: 'Organising Unit / Agency',        info: 'Name of the organising unit, agency, or collaborating agency (e.g., NSS Unit, NCC, Red Cross, Local NGO, Industry Partner, Gram Panchayat).' },
      scheme_name:           { label: 'Name of the Scheme',              info: 'Name of the government scheme under which this activity was conducted (e.g., Swachh Bharat Mission, Unnat Bharat Abhiyan, Fit India Movement). Enter "Institutional" if not under any government scheme.' },
      year:                  { label: 'Year of Activity',                info: 'The academic year in which the extension/outreach programme was conducted (e.g., 2022-23).' },
      students_participated: { label: 'Number of Students Participated', info: 'Total number of students who participated in this extension/outreach programme.' },
    },
  },

  '3.5.1': {
    title: '3.5.1 Collaborative Activities for Research / Faculty Exchange / Student Exchange',
    description: 'Number of Collaborative activities for research, Faculty exchange, Student exchange/internship during the year.',
    fields: {
      sl_no:                { label: 'Sl. No.',                     info: 'Serial number for the entry. Enter sequential numbers starting from 1.' },
      activity_title:       { label: 'Title of Collaborative Activity', info: 'Full title/name of the collaborative activity (e.g., Joint Research Project on Renewable Energy, Faculty Exchange Programme, Student Exchange Internship).' },
      collaborating_agency: { label: 'Collaborating Agency',        info: 'Full name and contact details of the collaborating institution/organization (e.g., IIT Madras - iitmadras.ac.in, XYZ Company - contact@xyz.com).' },
      participant_name:     { label: 'Name of Participant',         info: 'Full name of the faculty member or student who participated in the collaborative activity.' },
      year:                 { label: 'Year of Collaboration',       info: 'The year or academic year in which the collaborative activity took place (e.g., 2022-23).' },
      duration:             { label: 'Duration',                    info: 'Duration of the collaborative activity (e.g., 2 weeks, 1 month, 6 months, 1 year).' },
      nature_of_activity:   { label: 'Nature of Activity',          info: 'Type of the collaborative activity. Examples: Research Collaboration, Faculty Exchange, Student Exchange, Internship, Joint Seminar, Curriculum Development.' },
      document_link:        { label: 'Link to Relevant Document',   info: 'URL/link to the relevant supporting document (e.g., MoU, collaboration letter, activity report) on the institution website.' },
    },
  },

  '3.5.2': {
    title: '3.5.2 Functional MoUs with Institutions / Universities / Industries',
    description: 'Number of functional MoUs with institutions, other universities, industries, corporate houses etc. during the year.',
    fields: {
      organisation:         { label: 'Organisation Type',              info: 'Type/category of the organisation with which MoU is signed (e.g., University, Industry, Corporate House, Research Institution, NGO).' },
      institution_industry: { label: 'Name of Institution / Industry', info: 'Full name of the institution, industry, or corporate house with which the MoU is signed. Include contact details if available.' },
      year_of_signing:      { label: 'Year of Signing MoU',           info: 'The year in which the MoU was signed (e.g., 2022).' },
      duration:             { label: 'Duration',                       info: 'The validity period of the MoU (e.g., 3 years, 5 years). Specify start and end dates if available.' },
      activities_under_mou: { label: 'Actual Activities Under MoU',   info: 'List actual activities conducted under this MoU year-wise during the assessment period (e.g., 2019-20: Joint workshop; 2020-21: Student internship; 2021-22: Faculty exchange). Be specific — list actual activities, not just plans.' },
      participants_count:   { label: 'Students/Teachers Participated', info: 'Total number of students and/or teachers who participated in activities conducted under this MoU.' },
    },
  },

  // ─── CRITERION IV ───────────────────────────────────────────────────────────

  '4.1.3': {
    title: '4.1.3 Classrooms and Seminar Halls with ICT-enabled Facilities',
    description: 'Number of classrooms and seminar halls with ICT-enabled facilities such as smart class, LMS, etc.\n(Data for the latest completed academic year)',
    fields: {
      room_name:  { label: 'Room Number / Name',       info: 'Room number or name of the classroom/seminar hall with ICT/LCD/WiFi/LAN facilities (e.g., Room 101, Seminar Hall A, Smart Classroom 2).' },
      ict_type:   { label: 'Type of ICT Facility',     info: 'Type of ICT facility in this room. Examples: LCD Projector, Smart Board, WiFi, LAN, LMS Access, Smart Class System, Interactive Display, PA System.' },
      photo_link: { label: 'Link to Geotagged Photos', info: 'URL/link to geotagged photographs of the ICT-enabled room AND the master timetable uploaded on the institution website. Geotagged photos verify the physical existence of facilities.' },
    },
  },

  '4.1.4': {
    title: '4.1.4 Infrastructure Expenditure & 4.4.1 Maintenance Expenditure',
    description: '4.1.4: Expenditure, excluding salary for infrastructure augmentation during the year (INR in Lakhs).\n4.4.1: Expenditure incurred on maintenance of infrastructure (physical and academic support facilities) excluding salary component during the year (INR in Lakhs).\nAll amounts in INR Lakhs.',
    fields: {
      year:                        { label: 'Year',                                  info: 'The academic year for which expenditure data is being reported (e.g., 2022-23).' },
      budget_allocated:            { label: 'Budget Allocated (₹ Lakhs)',            info: 'Total budget allocated for infrastructure augmentation during the year, in INR Lakhs (excluding salary). As per audited accounts.' },
      expenditure_augmentation:    { label: 'Expenditure for Augmentation (₹ Lakhs)', info: 'Actual expenditure for infrastructure augmentation (new infrastructure, equipment, expansion) during the year, in INR Lakhs (excluding salary).' },
      total_expenditure_ex_salary: { label: 'Total Expenditure Excl. Salary (₹ Lakhs)', info: 'Total institutional expenditure excluding salary component for the year, in INR Lakhs. Source this from audited financial statements.' },
      maintenance_academic:        { label: 'Maintenance of Academic Facilities (₹ Lakhs)', info: 'Expenditure on maintenance of academic support facilities (labs, library equipment, computers, classroom equipment) excluding salary, in INR Lakhs.' },
      maintenance_physical:        { label: 'Maintenance of Physical Facilities (₹ Lakhs)', info: 'Expenditure on maintenance of physical facilities (buildings, sports ground, hostel, vehicles) excluding salary, in INR Lakhs.' },
    },
  },

  '4.2.2': {
    title: '4.2.2 Library E-Resource Subscriptions & 4.2.3 Library Expenditure',
    description: '4.2.2: Institution subscriptions for e-resources: 1. e-journals, 2. e-ShodhSindhu, 3. Shodhganga membership, 4. e-books, 5. Databases, 6. Remote access to e-resources.\n4.2.3: Expenditure for purchase of books/e-books and subscription to journals/e-journals during the year (INR in Lakhs).',
    fields: {
      library_resource:             { label: 'Library Resource Type',                info: 'Type of library resource. Select from: Books, Journals, e-journals, e-books, e-ShodhSindhu, Shodhganga, Databases, or Local/Remote access to e-resources.' },
      membership_details:           { label: 'Details of Memberships/Subscriptions', info: 'If the institution has subscription/membership for this resource, provide details (e.g., JSTOR - 2000 journals, N-LIST - 6000+ e-journals). Enter "No subscription" if not subscribed.' },
      expenditure_ejournals_ebooks: { label: 'Expenditure on e-journals/e-books (₹ Lakhs)', info: 'Amount spent on e-journals and e-books subscription during the year, in INR Lakhs. Enter 0 if no expenditure.' },
      expenditure_other_eresources: { label: 'Expenditure on Other e-Resources (₹ Lakhs)', info: 'Amount spent on other e-resources (databases, remote access, etc.) during the year, in INR Lakhs. Enter 0 if no expenditure.' },
      total_library_expenditure:    { label: 'Total Library Expenditure (₹ Lakhs)',  info: 'Total expenditure of the library for the year in INR Lakhs, including books, journals, e-resources, and other library materials.' },
      document_link:                { label: 'Link to Relevant Document',            info: 'URL/link to the supporting document (e.g., subscription invoice, purchase order, audited library account) on the institution website.' },
    },
  },

  // ─── CRITERION V ────────────────────────────────────────────────────────────

  '5.1.1': {
    title: '5.1.1 Government Scholarships & 5.1.2 Institutional Scholarships',
    description: '5.1.1: Number of students benefited by scholarships and freeships provided by the Government during the year.\n5.1.2: Number of students benefitted by scholarships, freeships etc. provided by the institution/non-government bodies, industries, individuals, philanthropists during the year.',
    fields: {
      year:                       { label: 'Year',                                 info: 'The academic year for which scholarship data is being reported (e.g., 2022-23).' },
      scheme_name:                { label: 'Name of the Scheme',                   info: 'Full name of the scholarship or freeship scheme (e.g., Post Matric Scholarship for SC/ST, Tamil Nadu Government BC/MBC Scholarship, Merit Scholarship by Institution, Industry Scholarship by XYZ Ltd.).' },
      govt_students_count:        { label: 'No. of Students (Govt Scheme)',        info: 'Number of students who benefited from this government scholarship/freeship scheme during the year.' },
      govt_amount:                { label: 'Amount (Govt Scheme) (₹)',             info: 'Total amount disbursed under this government scheme to students during the year (in Indian Rupees).' },
      institution_students_count: { label: 'No. of Students (Institution Scheme)', info: 'Number of students who benefited from the institutional/non-government scholarship/freeship during the year.' },
      institution_amount:         { label: 'Amount (Institution Scheme) (₹)',      info: 'Total amount disbursed under the institutional/non-government scheme to students during the year (in Indian Rupees).' },
      document_link:              { label: 'Link to Relevant Document',            info: 'URL/link to the supporting document (e.g., scholarship disbursement list, sanction order) on the institution website.' },
    },
  },

  '5.1.3': {
    title: '5.1.3 Capacity Building and Skills Enhancement Initiatives',
    description: 'Capacity building and skills enhancement initiatives by the institution including:\n1. Soft skills\n2. Language and communication skills\n3. Life skills (Yoga, physical fitness, health and hygiene)\n4. ICT/computing skills',
    fields: {
      program_name:      { label: 'Name of the Program',            info: 'Full name/title of the capability enhancement or skills program (e.g., Soft Skills Development Workshop, Communication Skills Training, Yoga and Wellness Program, Python Programming for Beginners).' },
      date_implemented:  { label: 'Date of Implementation (DD-MM-YYYY)', info: 'The date on which the program was conducted, in DD-MM-YYYY format (e.g., 15-07-2023). For multi-day programs, enter the start date.' },
      students_enrolled: { label: 'Number of Students Enrolled',    info: 'Total number of students who enrolled and participated in this capability enhancement program.' },
      agency_name:       { label: 'Name of Agency / Consultant',    info: 'Name and contact details of the external agency or consultant involved, if any. Enter "Conducted by Institution" if organized internally.' },
    },
  },

  '5.1.4': {
    title: '5.1.4 Guidance for Competitive Exams and Career Counselling',
    description: 'Number of students benefitted by guidance for competitive examinations and career counseling offered by the Institution during the year.',
    fields: {
      year:                        { label: 'Year',                                  info: 'The academic year for which this data is being reported (e.g., 2022-23).' },
      competitive_exam_activity:   { label: 'Activity for Competitive Exam Guidance', info: 'Name/title of the activity for competitive examination guidance (e.g., UPSC Coaching Camp, TNPSC Guidance Program, NET/GATE Preparation Classes).' },
      competitive_exam_students:   { label: 'No. of Students — Competitive Exam',    info: 'Number of students who attended/participated in the competitive examination guidance activity.' },
      career_counselling_activity: { label: 'Activity for Career Counselling',       info: 'Name/title of the career counselling activity (e.g., Campus Recruitment Training, Career Guidance Session, Industry Interface Programme, Entrepreneurship Orientation).' },
      career_counselling_students: { label: 'No. of Students — Career Counselling',  info: 'Number of students who attended/participated in the career counselling activity.' },
      students_placed_campus:      { label: 'Students Placed via Campus Placement',  info: 'Number of students who were placed through campus placement drives organized by the institution during the year.' },
      document_link:               { label: 'Link to Relevant Document',             info: 'URL/link to the supporting document (e.g., activity report, placement list, attendance register) on the institution website.' },
    },
  },

  '5.2.1': {
    title: '5.2.1 Placement of Outgoing Students',
    description: 'Number of placement of outgoing students during the year. Each row = one placed student.',
    fields: {
      year:              { label: 'Year',                       info: 'The academic year in which the student was placed (e.g., 2022-23).' },
      student_name:      { label: 'Name of Student & Contact', info: 'Full name of the placed student and their contact details (mobile number or email). Contact details are used for verification.' },
      program_graduated: { label: 'Program Graduated From',    info: 'Name of the programme from which the student graduated and got placed (e.g., B.Sc. Computer Science, MBA).' },
      employer_name:     { label: 'Name of Employer & Contact', info: 'Full name of the employer (company/organization) where placed, along with contact details (website, phone, or email).' },
      pay_package:       { label: 'Pay Package at Appointment', info: 'The salary/pay package offered to the student at the time of placement (e.g., ₹3.5 LPA, ₹25,000/month). Enter as stated in the appointment letter.' },
    },
  },

  '5.2.2': {
    title: '5.2.2 Students Progressing to Higher Education',
    description: 'Number of students progressing to higher education during the year.',
    fields: {
      student_name:       { label: 'Name of Student',               info: 'Full name of the student who enrolled into higher education after graduating from this institution.' },
      program_graduated:  { label: 'Program Graduated From',        info: 'Name of the programme from which the student graduated from this institution (e.g., B.Com, B.Sc. Physics).' },
      institution_joined: { label: 'Name of Institution Joined',    info: 'Full name of the institution/university where the student enrolled for higher education (e.g., IIT Madras, Anna University, University of Madras).' },
      program_admitted:   { label: 'Name of Programme Admitted To', info: 'Name of the higher education programme the student was admitted to (e.g., M.Sc. Physics, MBA, M.Phil. Commerce, Ph.D. in Tamil).' },
    },
  },

  '5.2.3': {
    title: '5.2.3 Students Qualifying in State/National/International Examinations',
    description: 'Number of students qualifying in state/national/international level examinations during the year (e.g., JAM/CLAT/GATE/GMAT/CAT/GRE/TOEFL/Civil Services/State government examinations).\nInstruction: Do NOT include individual university\'s entrance examinations.',
    fields: {
      year:              { label: 'Year',                       info: 'The academic year in which the student qualified in the examination (e.g., 2022-23).' },
      roll_number:       { label: 'Registration / Roll Number', info: 'Registration number or roll number of the student for the qualifying examination. Used for verification.' },
      student_name:      { label: 'Name of Student',           info: 'Full name of the student who qualified in the state/national/international examination.' },
      net:               { label: 'NET',                        info: 'UGC-NET (National Eligibility Test for Lectureship/JRF). Enter 1 if qualified, else leave blank.' },
      slet:              { label: 'SLET',                       info: 'SLET (State Level Eligibility Test). Enter 1 if qualified, else leave blank.' },
      gate:              { label: 'GATE',                       info: 'GATE (Graduate Aptitude Test in Engineering). Enter 1 if qualified, else leave blank.' },
      gmat:              { label: 'GMAT',                       info: 'GMAT (Graduate Management Admission Test). Enter 1 if qualified, else leave blank.' },
      cat:               { label: 'CAT',                        info: 'CAT (Common Admission Test for IIMs). Enter 1 if qualified, else leave blank.' },
      gre:               { label: 'GRE',                        info: 'GRE (Graduate Record Examinations for US universities). Enter 1 if qualified, else leave blank.' },
      jam:               { label: 'JAM',                        info: 'JAM (Joint Admission Test for M.Sc. at IITs/IISc). Enter 1 if qualified, else leave blank.' },
      ielts:             { label: 'IELTS',                      info: 'IELTS (International English Language Testing System). Enter 1 if qualified/scored, else leave blank.' },
      toefl:             { label: 'TOEFL',                      info: 'TOEFL (Test of English as a Foreign Language). Enter 1 if qualified/scored, else leave blank.' },
      civil_services:    { label: 'Civil Services',             info: 'UPSC Civil Services Examination (IAS/IPS/IFS etc.). Enter 1 if qualified, else leave blank.' },
      state_govt_exams:  { label: 'State Govt Exams',           info: 'State Government examinations (e.g., TNPSC Group exams, State PSC). Enter 1 if qualified, else leave blank.' },
      other_exams:       { label: 'Other Exams',                info: 'Any other State/Central Government agency examinations not listed above. Do NOT include individual university entrance exams. Enter 1 if qualified, else leave blank.' },
    },
  },

  '5.3.1': {
    title: '5.3.1 Awards/Medals for Outstanding Performance in Sports/Cultural Activities',
    description: 'Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national/international level.\nNote: Award for a team event should be counted as one.',
    fields: {
      year:               { label: 'Year',                  info: 'The academic year in which the award/medal was received (e.g., 2022-23).' },
      award_name:         { label: 'Name of Award / Medal', info: 'Full name of the award or medal received (e.g., Gold Medal in 100m Sprint, Best Singer Award, First Prize in Dance Competition).' },
      team_or_individual: { label: 'Team / Individual',     info: 'Whether the award is for a Team event or an Individual performance. A team award is counted as one award regardless of team size.' },
      level:              { label: 'Level',                 info: 'Level at which the award was received: University, State, National, or International.' },
      sports_or_cultural: { label: 'Sports / Cultural',     info: 'Whether the award is for a Sports activity or a Cultural activity.' },
      student_name:       { label: 'Name of Student',       info: 'Full name of the student who received the award/medal. For team events, list the team captain or all members (one row per team event, not per member).' },
    },
  },

  '5.3.3': {
    title: '5.3.3 Sports and Cultural Events/Competitions Participated',
    description: 'Number of sports and cultural events/competitions in which students participated during the year (organized by the institution/other institutions).\nNote: Classify the data and provide year-wise.',
    fields: {
      event_date:   { label: 'Date of Event (DD-MM-YYYY)',   info: 'Date on which the sports/cultural event or competition was held, in DD-MM-YYYY format.' },
      event_name:   { label: 'Name of Event / Activity',     info: 'Full name of the sports or cultural event/competition (e.g., Inter-Collegiate Cricket Tournament, State Level Classical Dance Competition, Annual Sports Meet).' },
      student_name: { label: 'Name of Student Participated', info: 'Full name of the student who participated. List all participating students individually — one row per student per event.' },
    },
  },

  // ─── CRITERION VI ───────────────────────────────────────────────────────────

  '6.2.3': {
    title: '6.2.3 Implementation of E-Governance',
    description: 'Implementation of e-governance in areas of operation:\n1. Administration\n2. Finance and Accounts\n3. Student Admission and Support\n4. Examination',
    fields: {
      area:             { label: 'Area of E-Governance',     info: 'The area in which e-governance has been implemented. Select from: Administration, Finance and Accounts, Student Admission and Support, or Examination. Add one row per area.' },
      vendor_details:   { label: 'Name of Vendor & Contact', info: 'Name and contact details of the software vendor/service provider (e.g., Fedena - www.fedena.com, ERP Company XYZ - contact@xyz.in). Enter "In-house developed" if developed internally.' },
      year_implemented: { label: 'Year of Implementation',   info: 'The year in which this e-governance system was deployed in the institution (e.g., 2020).' },
    },
  },

  '6.3.2': {
    title: '6.3.2 Financial Support for Teachers — Conferences/Professional Bodies',
    description: 'Number of teachers provided with financial support to attend conferences/workshops and towards membership fee of professional bodies during the year.',
    fields: {
      year:              { label: 'Year',                           info: 'The academic year in which the financial support was provided to the teacher (e.g., 2022-23).' },
      teacher_name:      { label: 'Name of Teacher',               info: 'Full name of the teacher who received financial support from the institution.' },
      conference_name:   { label: 'Conference / Workshop Attended', info: 'Full name of the conference or workshop for which financial support was provided. Leave blank if support was only for professional body membership.' },
      professional_body: { label: 'Professional Body for Membership', info: 'Name of the professional body for which membership fee was provided (e.g., Indian Chemical Society, Computer Society of India). Leave blank if support was only for conference attendance.' },
      amount:            { label: 'Amount of Support (₹)',          info: 'Total amount of financial support provided to the teacher (in Indian Rupees) for attending the conference/workshop or towards membership fee.' },
    },
  },

  '6.3.3': {
    title: '6.3.3 Professional Development & Administrative Training Programs',
    description: 'Number of professional development/administrative training programs organized by the institution for teaching and non-teaching staff during the year.\nNote: Classify the data and provide year-wise.',
    fields: {
      dates:                     { label: 'Dates (From – To)',                      info: 'Date range of the program in DD-MM-YYYY to DD-MM-YYYY format (e.g., 10-06-2023 to 12-06-2023).' },
      teaching_program_title:    { label: 'Title — Teaching Staff Program',         info: 'Full title of the professional development program for teaching staff (e.g., Workshop on Outcome Based Education, FDP on Research Methodology). Leave blank if only for non-teaching staff.' },
      nonteaching_program_title: { label: 'Title — Non-Teaching Staff Program',     info: 'Full title of the administrative training program for non-teaching staff (e.g., Training on Office Management, ERP Software Training). Leave blank if only for teaching staff.' },
      participants_count:        { label: 'Number of Participants',                 info: 'Total number of participants (teaching + non-teaching staff combined) who attended the program.' },
    },
  },

  '6.3.4': {
    title: '6.3.4 Faculty Development Programmes (FDP)',
    description: 'Number of teachers undergoing online/face-to-face Faculty Development Programmes (FDP) during the year (Professional Development Programmes, Orientation/Induction Programmes, Refresher Course, Short Term Course etc.)',
    fields: {
      teacher_name:  { label: 'Name of Teacher who Attended', info: 'Full name of the teacher who underwent the Faculty Development Programme (FDP).' },
      program_title: { label: 'Title of the Program',          info: 'Full title of the FDP attended (e.g., Refresher Course in Commerce, Orientation Programme for New Faculty, Short Term Course on Research Methods, FDP on Blended Learning). Include the organizing institution name if possible.' },
      duration:      { label: 'Duration (From – To)',          info: 'Duration of the FDP in DD-MM-YYYY to DD-MM-YYYY format (e.g., 01-06-2023 to 14-06-2023).' },
    },
  },

  '6.4.2': {
    title: '6.4.2 Funds/Grants from Non-Government Bodies',
    description: 'Funds/Grants received from non-government bodies, individuals, philanthropists during the year (not covered in Criterion III).',
    fields: {
      year:        { label: 'Year',                                info: 'The academic year in which the funds/grants were received (e.g., 2022-23).' },
      agency_name: { label: 'Name of Funding Agency / Individual', info: 'Full name of the non-government funding agency, individual, or philanthropist (e.g., XYZ Trust, Alumni Association, Sri ABC Charitable Foundation).' },
      purpose:     { label: 'Purpose of the Grant',                info: 'Specific purpose for which the funds/grants were received (e.g., Library Development, Laboratory Equipment, Scholarship for Meritorious Students, Infrastructure Development).' },
      amount:      { label: 'Funds / Grants Received (₹ Lakhs)',   info: 'Total amount received in INR Lakhs (e.g., 2.50 for ₹2.5 Lakhs). This must match the audited accounts.' },
      audit_link:  { label: 'Link to Audited Statement',           info: 'URL/link to the Audited Statement of Accounts page that reflects this receipt, uploaded on the institution website. Audited accounts are mandatory for all financial data.' },
    },
  },

  '6.5.3': {
    title: '6.5.3 Quality Assurance Initiatives — IQAC, NIRF, ISO, NBA',
    description: 'Quality assurance initiatives of the institution including:\n1. Regular meeting of IQAC; Feedback collected, analysed and used for improvements\n2. Collaborative quality initiatives with other institution(s)\n3. Participation in NIRF\n4. Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)',
    fields: {
      year:                  { label: 'Year',                                  info: 'The academic year for which quality assurance data is being reported (e.g., 2022-23).' },
      conferences_seminars:  { label: 'Conferences/Seminars/Workshops on Quality', info: 'Details of conferences, seminars, and workshops on quality conducted by IQAC (e.g., "Workshop on Outcome Based Education - 15-06-2023, 45 participants"). Include date and number of participants.' },
      aaa_followup:          { label: 'Academic Administrative Audit (AAA)',   info: 'Details of Academic Administrative Audit conducted and follow-up actions taken. Include: who conducted the audit, date, and key action points implemented.' },
      nirf_participation:    { label: 'Participation in NIRF',                 info: 'Status of participation in NIRF (National Institutional Ranking Framework). Mention: year of participation, category applied under, and ranking obtained (if any).' },
      iso_certification:     { label: 'ISO Certification',                     info: 'Details of ISO Certification. Mention: ISO standard (e.g., ISO 9001:2015), certifying body, nature of certification, and validity period (from-to dates).' },
      nba_certification:     { label: 'NBA / Other Certification',             info: 'Details of NBA (National Board of Accreditation) or other quality certification. Mention: programme name, NBA tier, validity period, and programme specifications.' },
      collaborative_quality: { label: 'Collaborative Quality Initiatives',     info: 'Details of collaborative quality initiatives with other institutions. Mention: name of the partner institution and the specific activity/initiative conducted jointly.' },
      orientation_program:   { label: 'Orientation Programme on Quality',      info: 'Details of orientation programmes on quality issues for teachers and students. Include: title, date (From-To in DD-MM-YYYY), and number of participants.' },
    },
  },
}

export default FIELD_INFO

export const getFieldInfo   = (metricId, fieldKey) => FIELD_INFO[metricId]?.fields?.[fieldKey] || null
export const getMetricInfo  = (metricId)            => FIELD_INFO[metricId] || null
