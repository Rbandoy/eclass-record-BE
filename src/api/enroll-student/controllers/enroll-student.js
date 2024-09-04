'use strict';

/**
 * enroll-student controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enroll-student.enroll-student', ({ strapi }) => ({
  async find(ctx) {
    // Static query - adjust it based on your needs
    const staticQuery = { courseName: 'Math 101', status: 'enrolled' };

    // Fetching data based on the static query
    const students = await strapi.db.query('api::enroll-student.enroll-student').findMany({
      where: staticQuery
    });

    // Return the fetched data
    return students;
  },
}));