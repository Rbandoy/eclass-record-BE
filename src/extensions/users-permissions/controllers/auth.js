'use strict';

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  async register(ctx) {
    const pluginStore = await strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'users-permissions',
    });
    strapi.log.debug('Debug message here');
    const settings = await pluginStore.get({
      key: 'advanced',
    });

    const { email, username, password, role: roleType } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('email is required');
    }

    if (!username) {
      return ctx.badRequest('username is required');
    }

    if (!password) {
      return ctx.badRequest('password is required');
    }

    // Default to 'Authenticated' if no role is provided
    const role = await strapi.query('role', 'users-permissions').findOne({
      type: roleType || 'authenticated',
    });

    if (!role) {
      return ctx.badRequest('Role not found');
    }

    const userWithSameEmail = await strapi.query('user', 'users-permissions').findOne({ email });

    if (userWithSameEmail) {
      return ctx.badRequest('Email already taken');
    }

    const userWithSameUsername = await strapi.query('user', 'users-permissions').findOne({ username });

    if (userWithSameUsername) {
      return ctx.badRequest('Username already taken');
    }

    const newUser = {
      email,
      username,
      password,
      role: role.id, // Set the role dynamically
      confirmed: true,
    };

    const user = await strapi.plugins['users-permissions'].services.user.add(newUser);

    const sanitizedUser = sanitizeEntity(user, {
      model: strapi.plugins['users-permissions'].models.user,
    });

    ctx.send({
      jwt: strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      }),
      user: sanitizedUser,
    });
  },
};
