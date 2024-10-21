module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/evaluation/:id',
     handler: 'evaluation.getStudent',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'POST',
      path: '/create-evaluation',
      handler: 'evaluation.createEvaluation',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};
