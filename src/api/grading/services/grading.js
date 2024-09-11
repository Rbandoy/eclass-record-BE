'use strict';

/**
 * grading service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::grading.grading');
