import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required Razorpay payment details" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Razorpay secret not configured on Vercel" });
  }

  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Payment is successful and signature is valid
    res.json({ status: "success", message: "Payment verified successfully" });
  } else {
    // Signature mismatch
    res.status(400).json({ status: "failure", error: "Payment signature mismatch" });
  }
}
