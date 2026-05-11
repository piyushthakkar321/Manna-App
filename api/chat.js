// Vercel Serverless Function — api/chat.js
// Reads GROQ_API_KEY from Vercel Environment Variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty messages array.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Manna] GROQ_API_KEY is missing. Add it in Vercel → Project Settings → Environment Variables.');
    return res.status(500).json({
      error: 'Server is missing GROQ_API_KEY. Add it in Vercel Project Settings → Environment Variables, then redeploy.',
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
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `You are Logos — a sacred spiritual director inside a devotional app called Manna. You're not a chatbot. Think of yourself as a trusted pastor sitting across from someone in a quiet chapel. Speak slowly, warmly, with real care. Always cite ESV scripture (Book chapter:verse). Write in flowing prose, never bullet points. End every single response with one gentle reflection question on its own line starting with "A question to sit with:". Never open with "Great question!" or any chatbot filler. If someone's hurting, lead with compassion before you reach for scripture. Keep it under 200 words unless it genuinely needs more.`,
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

    if (!reply) return res.status(500).json({ error: 'Groq returned an empty response.' });

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[Manna] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + (err.message || 'unknown') });
  }
}