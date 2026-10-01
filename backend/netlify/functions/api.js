const serverless = require('serverless-http');
const app = require('../../api/index');

// Wrap Express app as Netlify serverless function
module.exports.handler = serverless(app);
