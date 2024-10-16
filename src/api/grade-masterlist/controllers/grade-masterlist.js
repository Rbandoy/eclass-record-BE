'use strict';

/**
 * grade-masterlist controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::grade-masterlist.grade-masterlist', ({ strapi }) => ({

  // Override the default 'create' method with upsert and duplicate deletion logic
  async create(ctx) {
    try {
      // Log the incoming request body
      console.log(ctx.request.body);

      // Retrieve the request data
      const data = ctx.request.body.data;

      // Function to check if a grade entry exists in the grade-masterlist based on both subject_no and student_id
      const checkGradeMasterlistExists = async (subjectNo, studentId) => {
        return await strapi.entityService.findMany('api::grade-masterlist.grade-masterlist', {
          filters: {
            subject_no: { $eq: subjectNo },
            student_id: { $eq: studentId }
          },
        });
      };

      // Function to check if a subject exists based on subject_no
      const checkSubjectExists = async (subjectNo) => {
        const subjectData = await strapi.entityService.findMany('api::subject.subject', {
          filters: { code: { $eq: subjectNo } }, // Assuming 'code' is the identifier
        });
        return subjectData.length > 0; // Return true if subject exists
      };

      // Function to delete duplicates based on subject_no and student_id
      const deleteDuplicates = async (subjectNo, studentId) => {
        const existingEntries = await checkGradeMasterlistExists(subjectNo, studentId);

        if (existingEntries.length > 1) {
          // If there are duplicates, keep the first and delete the rest
          for (let i = 1; i < existingEntries.length; i++) {
            await strapi.entityService.delete('api::grade-masterlist.grade-masterlist', existingEntries[i].id);
          }
        }
        // Return the entry to keep
        return existingEntries[0];
      };

      // Upsert the grade-masterlist entry (update if exists, create if not)
      const upsertGradeMasterlist = async (entryData) => {
        const subjectExists = await checkSubjectExists(entryData.subject_no); // Check if subject exists

        if (!subjectExists) {
          ctx.throw(400, `Subject with code ${entryData.subject_no} does not exist.`);
        }

        let existingEntry = await checkGradeMasterlistExists(entryData.subject_no, entryData.student_id);

        if (existingEntry.length > 0) {
          // Delete any duplicates and return the one entry to update
          await deleteDuplicates(entryData.subject_no, entryData.student_id);
          existingEntry = await checkGradeMasterlistExists(entryData.subject_no, entryData.student_id);

          // Update the existing entry
          return await strapi.entityService.update('api::grade-masterlist.grade-masterlist', existingEntry[0].id, {
            data: entryData,
          });
        } else {
          // Create a new entry if none exists
          return await strapi.entityService.create('api::grade-masterlist.grade-masterlist', {
            data: entryData,
          });
        }
      };

      // Handle both single and array input
      if (typeof data === "object" && !Array.isArray(data)) {
        // For single entry
        const result = await upsertGradeMasterlist(data);
        return result; // Return the upserted entry
      } else if (Array.isArray(data)) {
        // For multiple entries
        const upsertedEntries = [];

        for (const element of data) {
          const result = await upsertGradeMasterlist(element);
          upsertedEntries.push(result);
        }

        return upsertedEntries; // Return all upserted entries
      } else {
        ctx.throw(400, 'Invalid data format');
      }
    } catch (error) {
      console.error('Error in grade-masterlist upsert method:', error);
      ctx.throw(500, 'Internal server error');
    }
  }
}));
