'use strict';

/**
 * fileupload service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fileupload.fileupload');
