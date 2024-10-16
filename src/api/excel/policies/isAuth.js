module.exports = async (ctx, next) => {
  // Check if the user is authenticated and has the 'admin' role
  console.log(ctx.state.user)
  if (ctx.state.user && ctx.state.user.role && (ctx.state.user.role.name === 'Admin' || ctx.state.user.role.name === 'Instructor')) {
    return await next();
  }
  return ctx.unauthorized('You are not allowed to perform this action');
};
