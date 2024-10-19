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

      const prospectus = await strapi.entityService.findMany('api::subject.subject');

      ctx.body = {grades: student_grades, student_info: student_details, prospectos: prospectus}; 

    } catch (err) {
      ctx.body = err;
    }
  }
};
