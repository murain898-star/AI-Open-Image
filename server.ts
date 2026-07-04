import express from "express";
import path from "path";
import fs from "fs";
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

  // Middleware to parse JSON bodies with large limit for images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API POST create-order
  app.all("/api/gemini/*", async (req, res) => {
    try {
      const serverKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

      if (!serverKey) {
        return res.status(500).json({ error: "Server API key is not configured." });
      }

      const targetPath = req.originalUrl.replace('/api/gemini', '');
      const originalUrlString = `https://generativelanguage.googleapis.com${targetPath}`;
      const parsedUrl = new URL(originalUrlString);
      parsedUrl.searchParams.set('key', serverKey);
      const targetUrl = parsedUrl.toString();

      const headers: any = {};
      if (req.headers['content-type']) {
        headers['content-type'] = req.headers['content-type'];
      }
      headers['x-goog-api-key'] = serverKey;

      const options: any = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        // req.body is already parsed as object by express.json(), so we need to stringify it back
        options.body = JSON.stringify(req.body);
      }

      const googleRes = await fetch(targetUrl, options);
      const data = await googleRes.text();

      res.status(googleRes.status);
      googleRes.headers.forEach((value, key) => {
        // Exclude content-encoding to avoid double-compression issues
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });
      
      res.send(data);
    } catch (err: any) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Failed to proxy request to Google Gen AI." });
    }
  });

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
      res.status(statusCode).json({ error: errorMessage, details: err ? String(err) : "Unknown error" });
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
    // SPA fallback with dynamic OpenGraph / WhatsApp preview replacement
    app.get("*", (req, res) => {
      const htmlPath = path.join(distPath, "index.html");
      try {
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, "utf8");
          const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
          const host = req.get("host");
          const currentUrl = `${protocol}://${host}`;
          
          // Replace all occurrences of the hardcoded vercel domain with current deployment domain
          html = html.replace(/https:\/\/ai-open-image\.vercel\.app/g, currentUrl);
          
          res.send(html);
        } else {
          res.sendFile(htmlPath);
        }
      } catch (err) {
        console.error("Error reading index.html for dynamic OG injection:", err);
        res.sendFile(htmlPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
