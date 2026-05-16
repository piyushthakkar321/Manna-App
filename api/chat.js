// Vercel Serverless Function — api/chat.js
// Reads GROQ_API_KEY from Vercel Environment Variables

// In-memory rate limiter (resets per cold start — good enough for serverless)
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;
const MAX_MAP_SIZE = 5000; // safety ceiling

function isRateLimited(ip) {
  const now = Date.now();

  // Purge stale entries when map gets large
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now - val.start > WINDOW_MS) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  rateLimitMap.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

export default async function handler(req, res) {
  const ALLOWED_ORIGIN = 'https://manna-app-henna.vercel.app';
  const origin = req.headers.origin;

  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  } else {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  // Rate limit by IP
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }

  // Body size guard (50KB max)
  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > 50000) {
    return res.status(413).json({ error: 'Request too large.' });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty messages array.' });
  }

  // Sanitize messages — strip injected system roles, cap length and count
  const MAX_MESSAGES = 20;
  const MAX_MSG_LENGTH = 2000;

  const sanitizedMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-MAX_MESSAGES)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, MAX_MSG_LENGTH).trim(),
    }))
    .filter(m => m.content.length > 0);

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Manna] GROQ_API_KEY is missing from environment variables.');
    return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
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
          ...sanitizedMessages,
        ],
      }),
    });

  if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      const msg = err?.error?.message || 'Groq API returned status ' + groqRes.status;
      console.error('[Manna] Groq error:', msg);
      // Return a safe status but never expose internal Groq error text to the client
      const safeStatus = groqRes.status >= 500 ? 502 : groqRes.status;
      return res.status(safeStatus).json({ error: 'Unable to reach the spiritual companion right now. Please try again shortly.' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || '';

    if (!reply) return res.status(500).json({ error: 'Groq returned an empty response.' });

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[Manna] Unexpected error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}