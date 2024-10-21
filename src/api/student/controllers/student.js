'use strict';

/**
 * student controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student.student', ({ strapi }) => ({

  // Override the default 'find' method
  async find(ctx) {
    // Custom logic before fetching the grade-masterlist entries
    console.log(ctx.query.filters);

    // Add your custom query conditions for grade-masterlist if necessary
    ctx.query.filters = {
      ...ctx.query.filters,
    };

    // Proceed with fetching the grade-masterlist entries using the core find method
    const { data, meta } = await super.find(ctx);

    
    // Fetch related student data for each grade-masterlist entry
    const studentPromises = data.map(async (entry) => {
      const studentId = entry.attributes.student_id; // Assuming student_id is in the entry
      let grades = [];
      let schoolYears = [];
      let active_evaluation = []
      if (studentId) {
        // Fetch active school year
        const schoolyears = await strapi.entityService.findMany('api::school-year.school-year', {
          filters: { active: { $eq: true } }, // Filter for active school years
        });
        schoolYears = schoolYears.concat(schoolyears)
        console.log(schoolyears)
        // For each school year, fetch the grades
        for (const item of schoolyears) {
          const gradeData = await strapi.entityService.findMany('api::grade-masterlist.grade-masterlist', {
            filters: { student_id: { $eq: studentId }, sy: { $eq: item.year }, semester: { $eq: item.sem } }, // Use the studentId from the entry 
          });

          const evaluationData = await strapi.entityService.findMany('api::evaluation-result.evaluation-result', {
            filters: { student_id: { $eq: studentId }, school_year: { $eq: item.year }, sem: { $eq: item.sem } }, // Use the populate: { user: true },
            populate: { evaluator: true },
          });
          console.log(evaluationData, studentId, item.year, item.sem)
          active_evaluation = active_evaluation.concat(evaluationData)

          // If grades exist, extract subject details including units
          if (gradeData.length > 0) {
            const subjectGrades = await Promise.all(gradeData.map(async (grade) => {
              // Fetch the subject details based on subject_no
              const subjectData = await strapi.entityService.findMany('api::subject.subject', {
                filters: { code: { $eq: grade.subject_no } }, // Assuming `code` is the unique identifier for subjects
              });

              // Get the first matching subject (if exists)
              const subject = subjectData.length > 0 ? subjectData[0] : null;

              return {
                id: grade.id,
                subject_no: grade.subject_no, // Assuming subject_no exists in grade-masterlist
                description: grade.description, // Fetch description from grade-masterlist
                grade: grade.grade, // Fetch grade from grade-masterlist
                units: subject ? subject.units : 0, // Fetch units from subject or set to 0 if not found
                sy: item.year,
                semester: item.sem
              };
            }));

            grades = grades.concat(subjectGrades);
          }
        }
      }

      return {
        ...entry,
        grades: grades || [], // Add student grades, or an empty array if not found
        active_evaluation: active_evaluation,
        school_year: schoolYears[0]
      };
    });

    // Wait for all student data to be fetched
    const modifiedData = await Promise.all(studentPromises);

    // Return the modified data with the student information included
    return { data: modifiedData, meta};
  }
}));
