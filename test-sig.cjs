const crypto = require('crypto');

function testSig() {
  const id = 'rzp_test_SxSEqYagz9PPCo';
  const secret = 'NrtMme7AVMdKNEQIpbRAqZic';
  const order_id = 'order_test';
  const payment_id = 'pay_test';

  const sig = crypto.createHmac("sha256", secret).update(order_id + '|' + payment_id).digest("hex");
  console.log("Sig:", sig);
}
testSig();
