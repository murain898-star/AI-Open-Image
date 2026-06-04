const https = require('https');

function testKeys(key_id, key_secret) {
  const req = https.request('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(key_id + ':' + key_secret).toString('base64')
    }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log(key_id, '->', res.statusCode, data));
  });

  req.write(JSON.stringify({ amount: 100, currency: 'INR', receipt: 'test' }));
  req.end();
}

testKeys('rzp_test_SxSEqYagz9PPCo', 'NrtMme7AVMdKNEQIpbRAqZic'); // from prompt
testKeys('rzp_test_Sx6YXM7UKWYvDv', 'eOG0UdLxa0HjyHF9jB64B6jK'); // original test keys
testKeys('rzp_test_Sx6QLhT0wnZkDv', 'FLxvJmJBOMsdD4WsnYQonLTt'); // from process.env
