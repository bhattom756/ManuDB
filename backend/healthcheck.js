const http = require('http');

const port = process.env.PORT || 5000;
const options = {
  hostname: 'localhost',
  port: port,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log(`Healthcheck: Checking http://localhost:${port}/api/health`);

const req = http.request(options, (res) => {
  console.log(`Healthcheck: Status ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('Healthcheck: Success');
    process.exit(0);
  } else {
    console.log('Healthcheck: Failed - Non-200 status');
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.log('Healthcheck: Error -', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Healthcheck: Timeout');
  req.destroy();
  process.exit(1);
});

req.end();
