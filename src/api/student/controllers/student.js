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
      activated: true
    };

    // Proceed with fetching the grade-masterlist entries using the core find method
    const { data, meta } = await super.find(ctx);

    // Fetch related student data for each grade-masterlist entry
    const studentPromises = data.map(async (entry) => {
      const studentId = entry.attributes.student_id; // Assuming student_id is in the entry
      let grades = [];

      if (studentId) {
        // Query the grade-masterlist collection by student_id
        const gradeData = await strapi.entityService.findMany('api::grade-masterlist.grade-masterlist', {
          filters: { student_id: { $eq: studentId } }, // Use the studentId from the entry 
        });

        // If grades exist, extract subject details including units
        if (gradeData.length > 0) {
          grades = await Promise.all(gradeData.map(async (grade) => {
            console.log(grade)
            // Fetch the subject details based on subject_no
            const subjectData = await strapi.entityService.findMany('api::subject.subject', {
              filters: { code: { $eq: grade.subject_no } }, // Assuming `code` is the unique identifier for subjects
            });
            console.log(subjectData)
            // Get the first matching subject (if exists)
            const subject = subjectData.length > 0 ? subjectData[0] : null;

            return {
              id: grade.id,
              subject_no: grade.subject_no, // Assuming subject_no exists in grade-masterlist
              description: grade.description, // Fetch description from subject or set to 'N/A' if not found
              grade: grade.grade, // Fetch grade from grade-masterlist
              units: subject ? subject.units : 0 // Fetch units from subject or set to 0 if not found
            };
          }));
        }
      }

      return {
        ...entry,
        grades: grades || [], // Add student grades, or empty array if not found
      };
    });

    // Wait for all student data to be fetched
    const modifiedData = await Promise.all(studentPromises);

    // Return the modified data with the student information included
    return { data: modifiedData, meta };
  }
}));
