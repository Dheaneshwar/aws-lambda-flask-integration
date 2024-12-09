const https = require('https');

const postRequest = (defaultOptions, payload) => 
  new Promise((resolve, reject) => {
    const options = { ...defaultOptions, method: 'POST' };
    const req = https.request(options, res => {
      let buffer = '';
      res.on('data', chunk => (buffer += chunk));
      res.on('end', () => resolve(JSON.parse(buffer)));
    });
    req.on('error', e => reject(e.message));
    req.write(JSON.stringify(payload)); // Write the payload data
    req.end();
  });

exports.handler = async (event) => {
  const defaultOptions = {
    host: '<public-ip>', // Replace with your EC2 public IP
    port: 5000,          // Flask app port
    path: '/process-file', // Flask endpoint
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Extract bucket name and file key from the event
  const payload = {
    bucket_name: event.bucket_name, // Expected from event
    file_key: event.file_key,       // Expected from event
  };

  try {
    const apiResponse = await postRequest(defaultOptions, payload);
    return {
      statusCode: 200,
      body: JSON.stringify(apiResponse),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
