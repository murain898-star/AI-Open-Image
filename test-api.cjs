const http = require('http');

const req = http.request('http://localhost:3000/api/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});

req.write(JSON.stringify({ amount: 100, currency: 'INR', receipt: 'test' }));
req.end();
