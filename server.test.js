const http = require('http');
const { server, start } = require('./server');

function makeRequest(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    http
      .request({ hostname: 'localhost', port, path, method }, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () =>
          resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(body) })
        );
      })
      .on('error', reject)
      .end();
  });
}

describe('HTTP Server', () => {
  let port;

  beforeAll((done) => {
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('GET /health returns 200 with status ok', async () => {
    const res = await makeRequest(port, '/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /health returns Content-Type application/json', async () => {
    const res = await makeRequest(port, '/health');
    expect(res.headers['content-type']).toBe('application/json');
  });

  test('GET /unknown returns 404', async () => {
    const res = await makeRequest(port, '/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('GET / returns 404', async () => {
    const res = await makeRequest(port, '/');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('POST /health returns 404', async () => {
    const res = await makeRequest(port, '/health', 'POST');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('DELETE /health returns 404', async () => {
    const res = await makeRequest(port, '/health', 'DELETE');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('start()', () => {
  test('calls server.listen with the given port and logs to console', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const listenSpy = jest.spyOn(server, 'listen').mockImplementation((_port, cb) => {
      cb();
      return server;
    });

    start(3000);

    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith('Server running on port 3000');

    logSpy.mockRestore();
    listenSpy.mockRestore();
  });
});
