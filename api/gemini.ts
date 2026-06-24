export default async function handler(req, res) {
  try {
    // Determine the target path
    const path = req.query.path || '';
    const targetPath = '/' + path;

    const targetUrl = `https://generativelanguage.googleapis.com${targetPath}`;
    const serverKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

    if (!serverKey) {
      return res.status(500).json({ error: "Server API key is not configured." });
    }

    const headers = new Headers();
    // Copy relevant headers from the original request
    if (req.headers['content-type']) {
      headers.set('content-type', req.headers['content-type']);
    }
    // Set the API key header required by Google Gen AI
    headers.set('x-goog-api-key', serverKey);

    const options = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    };

    const googleRes = await fetch(targetUrl, options);
    const data = await googleRes.text();

    res.status(googleRes.status);
    googleRes.headers.forEach((value, key) => {
      // Exclude content-encoding to avoid double-compression issues on Vercel
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });
    
    res.send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to proxy request to Google Gen AI." });
  }
}
