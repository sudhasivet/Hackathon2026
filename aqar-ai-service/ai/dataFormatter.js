// clean row
function cleanRow(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined || v === '') continue
    if (typeof v === 'string') out[k] = v.trim()
    else out[k] = v
  }
  return out
}

function unique(rows, field) {
  return [...new Set(rows.map(r => r[field]).filter(Boolean))]
}
function countDistinct(rows, field) {
  return new Set(rows.map(r => r[field]).filter(Boolean)).size
}
function sumField(rows, field) {
  return rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0)
}
function avgField(rows, field) {
  const vals = rows.map(r => parseFloat(r[field])).filter(n => !isNaN(n))
  if (!vals.length) return 0
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}
const formatters = {

  '1.1': (rows) => ({
    totalCourses:    rows.length,
    totalPrograms:   countDistinct(rows, 'program_name'),
    programs:        unique(rows, 'program_name'),
    years:           unique(rows, 'year_of_introduction').sort(),
    latestYear:      unique(rows, 'year_of_introduction').sort().pop() || '',
  }),

  '1.1.3': (rows) => ({
    totalTeachers:   countDistinct(rows, 'teacher_name'),
    teachers:        unique(rows, 'teacher_name'),
    bodies:          unique(rows, 'body_name'),
    totalBodies:     countDistinct(rows, 'body_name'),
    years:           unique(rows, 'year').sort(),
  }),

  '1.2.1': (rows) => ({
    totalPrograms:   rows.length,
    cbcsPrograms:    rows.filter(r => r.cbcs_status === 'Yes').length,
    programs:        unique(rows, 'program_name'),
    years:           unique(rows, 'year_introduction').sort(),
  }),

  '1.2.2': (rows) => ({
    totalCourses:    rows.length,
    courseNames:     unique(rows, 'program_name'),
    totalEnrolled:   sumField(rows, 'students_enrolled'),
    totalCompleting: sumField(rows, 'students_completing'),
    years:           unique(rows, 'year_of_offering').sort(),
    avgDuration:     avgField(rows, 'duration'),
  }),

  '1.3.2': (rows) => ({
    totalCourses:    countDistinct(rows, 'course_name'),
    totalStudents:   rows.length,
    programs:        unique(rows, 'program_name'),
    courses:         unique(rows, 'course_name'),
    years:           unique(rows, 'year_offering').sort(),
  }),

  '1.3.3': (rows) => ({
    totalStudents:   rows.length,
    programs:        unique(rows, 'program_name'),
    totalPrograms:   countDistinct(rows, 'program_name'),
  }),

  '2.1': (rows) => ({
    totalStudents:   rows.length,
    years:           unique(rows, 'year_of_enrollment').sort(),
    latestYear:      unique(rows, 'year_of_enrollment').sort().pop() || '',
  }),

  '2.1.1': (rows) => ({
    totalPrograms:   rows.length,
    programs:        unique(rows, 'program_name'),
    totalSanctioned: sumField(rows, 'sanctioned_seats'),
    totalAdmitted:   sumField(rows, 'students_admitted'),
    fillRate:        rows.length
      ? ((sumField(rows, 'students_admitted') / sumField(rows, 'sanctioned_seats')) * 100).toFixed(1)
      : 0,
  }),

  '2.1.2': (rows) => {
    const latest = rows[rows.length - 1] || {}
    return {
      years:           unique(rows, 'year').sort(),
      totalAdmittedSC: sumField(rows, 'admitted_sc'),
      totalAdmittedST: sumField(rows, 'admitted_st'),
      totalAdmittedOBC:sumField(rows, 'admitted_obc'),
      totalAdmittedGen:sumField(rows, 'admitted_gen'),
      totalReserved:   sumField(rows, 'admitted_sc') + sumField(rows, 'admitted_st') + sumField(rows, 'admitted_obc'),
      latestYear:      unique(rows, 'year').sort().pop() || '',
    }
  },

  '2.4.1': (rows) => ({
    totalTeachers:      rows.length,
    designations:       unique(rows, 'designation'),
    departments:        unique(rows, 'department_name'),
    avgExperience:      avgField(rows, 'years_of_experience'),
    permanentCount:     rows.filter(r => r.nature_of_appointment === 'Permanent').length,
    sanctionedPosts:    rows.length,
    stillServing:       rows.filter(r => r.still_serving === 'Yes').length,
    years:              unique(rows, 'year_of_appointment').sort(),
  }),

  '2.6.3': (rows) => {
    const appeared = sumField(rows, 'students_appeared')
    const passed   = sumField(rows, 'students_passed')
    return {
      totalPrograms: rows.length,
      programs:      unique(rows, 'program_name'),
      years:         unique(rows, 'year').sort(),
      totalAppeared: appeared,
      totalPassed:   passed,
      passRate:      appeared ? ((passed / appeared) * 100).toFixed(1) : 0,
    }
  },

  '2.4.2': (rows) => ({
    totalPhDTeachers:  countDistinct(rows, 'teacher_name'),
    qualifications:    unique(rows, 'qualification'),
    researchGuides:    rows.filter(r => r.is_research_guide === 'Yes').length,
    totalScholars:     rows.filter(r => r.scholar_name).length,
    years:             unique(rows, 'qualification_year').sort(),
  }),

  '3.1': (rows) => ({
    totalTeachers:  rows.length,
    male:           rows.filter(r => r.gender === 'Male').length,
    female:         rows.filter(r => r.gender === 'Female').length,
    designations:   unique(rows, 'designation'),
    departments:    unique(rows, 'department_name'),
  }),

  '3.1.1': (rows) => ({
    totalProjects:    rows.length,
    govtProjects:     rows.filter(r => r.agency_type === 'Government').length,
    nonGovtProjects:  rows.filter(r => r.agency_type === 'Non-Government').length,
    totalAmount:      sumField(rows, 'amount_sanctioned').toFixed(2),
    agencies:         unique(rows, 'funding_agency'),
    years:            unique(rows, 'year_of_award').sort(),
    departments:      unique(rows, 'pi_department'),
  }),

  '3.2.2': (rows) => ({
    totalEvents:      rows.length,
    totalParticipants:sumField(rows, 'participants'),
    eventNames:       unique(rows, 'seminar_name'),
    years:            unique(rows, 'year').sort(),
  }),

  '3.3.2': (rows) => ({
    totalPapers:    rows.length,
    journals:       unique(rows, 'journal_name'),
    totalJournals:  countDistinct(rows, 'journal_name'),
    departments:    unique(rows, 'dept_name'),
    years:          unique(rows, 'year').sort(),
    authors:        unique(rows, 'authors'),
  }),

  '3.3.3': (rows) => ({
    totalPublications: rows.length,
    national:          rows.filter(r => r.national_international === 'National').length,
    international:     rows.filter(r => r.national_international === 'International').length,
    publishers:        unique(rows, 'publisher'),
    years:             unique(rows, 'year_of_publication').sort(),
    teachers:          unique(rows, 'teacher_name'),
  }),

  '3.4.2': (rows) => ({
    totalAwards: rows.length,
    awards:      unique(rows, 'award_name'),
    bodies:      unique(rows, 'awarding_body'),
    years:       unique(rows, 'year_of_award').sort(),
  }),

  '3.4.3': (rows) => ({
    totalActivities:    rows.length,
    totalParticipants:  sumField(rows, 'students_participated'),
    activities:         unique(rows, 'activity_name'),
    agencies:           unique(rows, 'organising_agency'),
    schemes:            unique(rows, 'scheme_name'),
    years:              unique(rows, 'year').sort(),
  }),

  '3.5.1': (rows) => ({
    totalCollaborations: rows.length,
    agencies:            unique(rows, 'collaborating_agency'),
    natures:             unique(rows, 'nature_of_activity'),
    years:               unique(rows, 'year').sort(),
  }),

  '3.5.2': (rows) => ({
    totalMOUs:     rows.length,
    organisations: unique(rows, 'institution_industry'),
    years:         unique(rows, 'year_of_signing').sort(),
    participants:  sumField(rows, 'participants_count'),
  }),

  '4.1.3': (rows) => ({
    totalRooms: rows.length,
    ictTypes:   unique(rows, 'ict_type'),
    rooms:      unique(rows, 'room_name'),
  }),

  '4.1.4': (rows) => ({
    years:              unique(rows, 'year').sort(),
    totalBudget:        sumField(rows, 'budget_allocated').toFixed(2),
    totalExpenditure:   sumField(rows, 'expenditure_augmentation').toFixed(2),
    totalMaintenance:   (sumField(rows, 'maintenance_academic') + sumField(rows, 'maintenance_physical')).toFixed(2),
  }),

  '4.2.2': (rows) => ({
    totalResources:      rows.length,
    resourceTypes:       unique(rows, 'library_resource'),
    totalExpenditure:    sumField(rows, 'total_library_expenditure').toFixed(2),
    ejournalExpenditure: sumField(rows, 'expenditure_ejournals_ebooks').toFixed(2),
  }),

  '5.1.1': (rows) => ({
    years:              unique(rows, 'year').sort(),
    schemes:            unique(rows, 'scheme_name'),
    govtStudents:       sumField(rows, 'govt_students_count'),
    govtAmount:         sumField(rows, 'govt_amount').toFixed(0),
    instStudents:       sumField(rows, 'institution_students_count'),
    instAmount:         sumField(rows, 'institution_amount').toFixed(0),
    totalBeneficiaries: sumField(rows, 'govt_students_count') + sumField(rows, 'institution_students_count'),
  }),

  '5.1.3': (rows) => ({
    totalPrograms:   rows.length,
    programs:        unique(rows, 'program_name'),
    totalEnrolled:   sumField(rows, 'students_enrolled'),
  }),

  '5.1.4': (rows) => ({
    years:              unique(rows, 'year').sort(),
    totalCompetitive:   sumField(rows, 'competitive_exam_students'),
    totalCounselling:   sumField(rows, 'career_counselling_students'),
    totalPlaced:        sumField(rows, 'students_placed_campus'),
    activities:         unique(rows, 'competitive_exam_activity'),
  }),

  '5.2.1': (rows) => ({
    totalPlaced:  rows.length,
    employers:    unique(rows, 'employer_name'),
    programs:     unique(rows, 'program_graduated'),
    years:        unique(rows, 'year').sort(),
  }),

  '5.2.2': (rows) => ({
    totalStudents:  rows.length,
    institutions:   unique(rows, 'institution_joined'),
    programs:       unique(rows, 'program_admitted'),
  }),

  '5.2.3': (rows) => ({
    totalQualified: rows.length,
    years:          unique(rows, 'year').sort(),
  }),

  '5.3.1': (rows) => ({
    totalAwards:  rows.length,
    levels:       unique(rows, 'level'),
    types:        unique(rows, 'sports_or_cultural'),
    years:        unique(rows, 'year').sort(),
  }),

  '5.3.3': (rows) => ({
    totalEvents:   rows.length,
    eventNames:    unique(rows, 'event_name'),
  }),

  '6.2.3': (rows) => ({
    totalAreas: rows.length,
    areas:      unique(rows, 'area'),
    years:      unique(rows, 'year_implemented').sort(),
  }),

  '6.3.2': (rows) => ({
    totalTeachers:  countDistinct(rows, 'teacher_name'),
    totalAmount:    sumField(rows, 'amount').toFixed(0),
    conferences:    unique(rows, 'conference_name'),
    years:          unique(rows, 'year').sort(),
  }),

  '6.3.3': (rows) => ({
    totalPrograms:    rows.length,
    totalParticipants:sumField(rows, 'participants_count'),
    years:            unique(rows, 'dates').sort(),
  }),

  '6.3.4': (rows) => ({
    totalTeachers:  countDistinct(rows, 'teacher_name'),
    programs:       unique(rows, 'program_title'),
    totalFDPs:      rows.length,
  }),

  '6.4.2': (rows) => ({
    totalGrants:  rows.length,
    totalAmount:  sumField(rows, 'amount').toFixed(2),
    agencies:     unique(rows, 'agency_name'),
    purposes:     unique(rows, 'purpose'),
    years:        unique(rows, 'year').sort(),
  }),

  '6.5.3': (rows) => ({
    years:            unique(rows, 'year').sort(),
    nirf:             rows.some(r => r.nirf_participation && r.nirf_participation.length > 2),
    iso:              rows.some(r => r.iso_certification && r.iso_certification.length > 2),
    nba:              rows.some(r => r.nba_certification && r.nba_certification.length > 2),
  }),

  '7.1.1': (rows) => ({
    totalPrograms:    rows.length,
    programs:         unique(rows, 'title'),
    totalParticipants:sumField(rows, 'participants_total'),
    totalMale:        sumField(rows, 'participants_male'),
    totalFemale:      sumField(rows, 'participants_female'),
  }),

  '7.1.3': (rows) => ({
    totalFacilities:   rows.length,
    available:         rows.filter(r => r.available === 'Yes').map(r => r.facility),
    notAvailable:      rows.filter(r => r.available === 'No').map(r => r.facility),
    totalBeneficiaries:sumField(rows, 'beneficiaries'),
  }),

  '7.1.4': (rows) => ({
    totalInitiatives:  rows.length,
    totalParticipants: sumField(rows, 'participants_count'),
    years:             unique(rows, 'year').sort(),
    initiatives:       unique(rows, 'initiative_name'),
  }),

  '7.1.5': (rows) => ({
    totalCodes:  rows.length,
    titles:      unique(rows, 'title'),
    years:       unique(rows, 'date_of_publication').sort(),
  }),

  '7.1.11': (rows) => ({
    totalEvents:       rows.length,
    events:            unique(rows, 'activity'),
    totalParticipants: sumField(rows, 'participants_total'),
  }),
}

function formatMetricData(metricId, rawRows) {
  const rows = rawRows.map(cleanRow).filter(r => Object.keys(r).length > 0)
  const formatter = formatters[metricId]
  if (!formatter) {
    return { totalRecords: rows.length, hasData: rows.length > 0 }
  }
  return { ...formatter(rows), hasData: rows.length > 0, totalRecords: rows.length }
}

module.exports = { formatMetricData }
