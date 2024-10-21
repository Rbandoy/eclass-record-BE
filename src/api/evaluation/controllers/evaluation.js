'use strict';

const student = require("../../student/controllers/student");

/**
 * A set of functions called "actions" for `evaluation`
 */

module.exports = {
  getStudent: async (ctx, next) => {
    try {
     
      const student_id = ctx.request.params.id;
      const student_grades = await strapi.entityService.findMany('api::grade-masterlist.grade-masterlist', {
        filters: { 
          student_id: { $eq: student_id }
        },
      });

      const student_details = await strapi.entityService.findMany('api::student.student', {
        filters: {  
          student_id: { $eq: student_id }
        },
      });

      const prospectus = await strapi.entityService.findMany('api::subject.subject', {
        sort: ['code:asc','year:asc', 'sem:asc'],
      });

      console.log(student_grades)

      const programs = prospectus.map(program => {
        student_grades.forEach(grade => {
          if (grade.subject_no == program.code && grade.remarks === "PASSED") {
            program.passed = true
          }
        })

        return program
      })

      ctx.body = {grades: student_grades, student_info: student_details, prospectos: programs}; 

    } catch (err) {
      ctx.body = err;
    }
  },
  createEvaluation: async (ctx, next) => {
    const data = ctx.request.body.data;
    console.log(data)
    // Process each evaluation in a synchronous manner
    for (const evaluate of data) {
      const {
        school_year,
        sem,
        student_id,
        subject_code,
        description,
        laboratory,
        lecture,
        time,
        day,
        instructor,
        units,
        evaluator
      } = evaluate;
  
      try {
        // Check if the entry exists
        const evaluations = await strapi.entityService.findMany('api::evaluation-result.evaluation-result', {
          filters: { student_id, subject_code, school_year, sem },
        });
  
        // Delete duplicate entries if more than one exists
        if (evaluations.length > 1) {
          for (let i = 1; i < evaluations.length; i++) {
            await strapi.entityService.delete('api::evaluation-result.evaluation-result', evaluations[i].id);
            console.log("Deleted:", evaluations[i].id);
          }
        }
  
        // If an entry exists, update it
        if (evaluations.length > 0) {
          const evaluation = await strapi.entityService.update('api::evaluation-result.evaluation-result', evaluations[0].id, {
            data: {
              school_year,
              sem,
              student_id,
              subject_code,
              description,
              laboratory,
              lecture,
              time,
              day,
              instructor,
              units,
              evaluator
            },
          });
          console.log("Updated:", evaluation);
        } else {
          // Entry does not exist, create a new one
          const evaluation = await strapi.entityService.create('api::evaluation-result.evaluation-result', {
            data: {
              student_id,
              subject_code,
              school_year,
              sem,
              description,
              laboratory,
              lecture,
              time,
              day,
              instructor,
              units,
              evaluator
            },
          });
          console.log("Created:", evaluation);
        }
      } catch (err) {
        console.error("Error processing evaluation:", err);
      }
    }
    
    // Optionally, you can respond after processing all evaluations
    ctx.send({ message: "Evaluations processed successfully." });
  }
  
};
