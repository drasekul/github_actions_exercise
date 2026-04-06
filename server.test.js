const http = require('http');
const server = require('./server');

describe('HTTP Server', () => {
  let address;

  beforeAll((done) => {
    server.listen(0, () => {
      address = server.address();
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('GET /health returns 200 with status ok', async () => {
    const res = await new Promise((resolve, reject) => {
      http
        .get(`http://localhost:${address.port}/health`, (response) => {
          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });
          response.on('end', () =>
            resolve({ statusCode: response.statusCode, body: JSON.parse(body) })
          );
        })
        .on('error', reject);
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /unknown returns 404', async () => {
    const res = await new Promise((resolve, reject) => {
      http
        .get(`http://localhost:${address.port}/unknown`, (response) => {
          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });
          response.on('end', () =>
            resolve({ statusCode: response.statusCode, body: JSON.parse(body) })
          );
        })
        .on('error', reject);
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
