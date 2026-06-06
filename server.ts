import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

let razorpayClient: Razorpay | null = null;

function getRazorpayKeys() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  return { key_id, key_secret };
}

function getRazorpay(): Razorpay {
  const { key_id, key_secret } = getRazorpayKeys();
  
  if (!key_id || !key_secret) {
    throw new Error("Razorpay API keys are missing.");
  }
  
  return new Razorpay({
    key_id,
    key_secret,
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API POST create-order
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Invalid amount. Minimum amount is 100 paise." });
      }

      const { key_id, key_secret } = getRazorpayKeys();

      const razorpay = getRazorpay();
      const options = {
        amount, // amount in smallest currency unit (paise)
        currency,
        receipt,
      };

      const order = await razorpay.orders.create(options);
      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: key_id,
        isMock: false
      });
    } catch (err: any) {
      // Intentionally not using console.error here to prevent AI Studio error loop 
      // if the user provides invalid test keys.
      let statusCode = 500;
      let errorMessage = "Failed to create Razorpay order: " + (err.error?.description || err.message || "Unknown error");
      if (err.statusCode === 401) {
        statusCode = 401;
        errorMessage = "Razorpay API Keys failed authentication. Is your RAZORPAY_KEY_ID or SECRET correct? Try regenerating your API keys from your Razorpay Dashboard and add them to the Environment Variables (Settings).";
      } else if (err.message === "Razorpay API keys are missing.") {
      	statusCode = 400;
        errorMessage = "Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Environment Variables (Settings).";
      }
      res.status(statusCode).json({ error: errorMessage, details: err });
    }
  });

  // API POST verify-payment
  app.post("/api/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required Razorpay payment details" });
    }

    const { key_secret } = getRazorpayKeys();
    const secret = key_secret;
    if (!secret) {
      return res.status(500).json({ error: "Razorpay secret not configured on server" });
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
