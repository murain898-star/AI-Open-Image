import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Invalid amount. Minimum amount is 100 paise." });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(400).json({ error: "Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Vercel Environment Variables." });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const options = { amount, currency, receipt };

    const order = await razorpay.orders.create(options);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
      isMock: false
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to create Razorpay order: " + (err.error?.description || err.message || "Unknown error"),
      details: String(err)
    });
  }
}
