const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: 'rzp_test_Sx6YXM7UKWYvDv', key_secret: 'eOG0UdLxa0HjyHF9jB64B6jK' });
rzp.orders.create({ amount: 100, currency: "INR", receipt: "receipt#1" })
  .then(console.log)
  .catch(console.error);
