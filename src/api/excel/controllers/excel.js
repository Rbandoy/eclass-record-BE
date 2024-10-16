const fs = require('fs'); // Use promises API
const path = require('path');

module.exports = {
  async uploadExcel(ctx) {
    const { files } = ctx.request;

    // Check if files and file are present
    if (!files || !files.file) {
      return ctx.badRequest('No file uploaded');
    }

    const file = files.file;
    const tempFilePath = file.path; // Path to the uploaded file
    const destinationDir = path.join(__dirname, '..', 'uploads'); // Directory for saving files
    const destinationPath = path.join(destinationDir, file.name); // Complete path for the new file

    // Log the file object to understand its structure
    console.log('Uploaded file:', file);

    try {
      // Ensure the uploads directory exists
      await fs.mkdir(destinationDir, { recursive: true });

      // Read the file from the temporary path and write it to the destination path
      const fileData = await fs.readFile(tempFilePath); // Read the file data
      await fs.writeFile(destinationPath, fileData); // Write the file data to the destination

      // Optionally, you can remove the temporary file if needed
      // await fs.unlink(tempFilePath);

      ctx.send({ message: 'File saved successfully' });
    } catch (err) {
      console.error('Error saving file:', err);
      return ctx.internalServerError('Error saving file');
    }
  },
  async getFiles(ctx) {
    const token = ctx.request.headers.authorization?.split(' ')[1]; // Bearer token
    console.log('User token:', token);
    const directoryPath = path.join(__dirname, '../uploads'); // Adjust the path as necessary
    try {
      const files = fs.readdirSync(directoryPath);
      console.log(files)
      ctx.send({ files });
    } catch (err) {
      console.log(err)
      ctx.send({ error: 'Error reading directory' }, 500);
    }
  },
  async loadFile(ctx) {
    const { filename } = ctx.params;

    try {

        console.log(ctx)
        const directoryPath = path.join(__dirname, '../uploads');
        const filePath = path.join(directoryPath, filename);

        // Log the file path for debugging
        console.log('File path:', filePath);

        if (!fs.existsSync(filePath)) {
            return ctx.send({ error: 'File not found' }, 404);
        }

        // Set response type and content disposition
        ctx.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        ctx.set('Content-Disposition', `attachment; filename="${filename}"`);

        // Use fs.createReadStream to send the file
        ctx.body = fs.createReadStream(filePath);
    } catch (err) {
        console.error('Error loading file:', err);
        ctx.send({ error: 'Error loading file' }, 500);
    }
}


};
