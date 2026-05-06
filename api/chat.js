// Vercel Serverless Function — api/chat.js
// Reads GROQ_API_KEY from Vercel Environment Variables (Project Settings → Env Vars)
// Key name must be exactly: GROQ_API_KEY (no VITE_ prefix)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Read body — Vercel automatically parses JSON
  const body = req.body || {};
  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty messages array.' });
  }

  // Read API key from Vercel env vars
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Manna] GROQ_API_KEY is missing. Add it in Vercel → Project Settings → Environment Variables.');
    return res.status(500).json({
      error: 'Server is missing GROQ_API_KEY. Please add it in Vercel Project Settings → Environment Variables, then redeploy.',
    });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: 'You are Logos, a gentle Bible companion. Always cite ESV verses with book/chapter/verse. Give theological context. Be warm and spiritually nourishing. Use a reverent, pastoral tone. End every response with a reflection question prefaced by "Reflect:"',
          },
          ...messages,
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      const msg = err?.error?.message || 'Groq API returned status ' + groqRes.status;
      console.error('[Manna] Groq error:', msg);
      return res.status(groqRes.status).json({ error: msg });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || '';

    if (!reply) {
      return res.status(500).json({ error: 'Groq returned an empty response.' });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[Manna] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + (err.message || 'unknown') });
  }
}