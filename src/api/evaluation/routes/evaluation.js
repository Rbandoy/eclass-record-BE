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
  ],
};
