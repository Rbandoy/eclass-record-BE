// Path: ./src/api/excel/routes/excel.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/upload-excel',
      handler: 'excel.uploadExcel', // Make sure the handler points to the correct method in the controller
      config: {
        auth: false, // Adjust authentication as per your needs
      },
    },
    {
      method: 'GET',
      path: '/files',
      handler: 'excel.getFiles',
      config: {
        auth: false, // Set to true if you want to require authentication
      },
    },
    {
      method: 'GET',
      path: '/uploads/:filename', // Use ':filename' to capture the filename from the URL
      handler: 'excel.loadFile',   // Ensure this matches your controller's method name
      config: {
        auth: false, // Set to true if you want to require authentication
      },
    },
  ], 
};
