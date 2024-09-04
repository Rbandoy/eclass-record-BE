'use strict';

/**
 * enroll-student service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::enroll-student.enroll-student');
