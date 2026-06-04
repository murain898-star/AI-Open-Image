fetch('http://127.0.0.1:3000/api/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 100, currency: 'INR', receipt: 'test' })
}).then(r => r.json()).then(console.log).catch(console.error);
