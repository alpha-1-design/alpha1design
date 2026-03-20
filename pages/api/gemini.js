// /pages/api/gemini.js
// Server-side Gemini API call — GEMINI_API_KEY is never sent to the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, tone, type } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to your environment variables.' });
  }

  const systemPrompt = buildSystemPrompt(type, tone);
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1024,
            topP: 0.95,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || 'Gemini API error',
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return res.status(500).json({ error: 'Gemini returned an empty response.' });
    }

    return res.status(200).json({ result: text });

  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function buildSystemPrompt(type, tone) {
  const toneMap = {
    professional: 'Write in a polished, professional tone.',
    casual:       'Write in a friendly, conversational tone.',
    witty:        'Write with clever wit and a light touch of humor.',
    bold:         'Write with confidence, directness, and impact.',
    minimal:      'Write concisely. Every word must earn its place.',
  };

  const typeMap = {
    blog:  'You are an expert blog writer. Write engaging, well-structured blog content.',
    email: 'You are an expert email copywriter. Write clear, effective emails with a subject line.',
    tweet: 'Write a compelling tweet or thread (under 280 chars per tweet). Be sharp and engaging.',
    code:  'You are a senior developer. Write clean, well-commented code with an explanation.',
    ad:    'Write persuasive ad copy with a strong hook, benefit statement, and call to action.',
    free:  'You are a versatile creative writer. Respond to the prompt thoughtfully and skillfully.',
  };

  const t  = toneMap[tone] || toneMap.professional;
  const ty = typeMap[type] || typeMap.free;

  return `${ty} ${t} Be specific, original, and high quality. Output only the content itself — no meta-commentary.`;
}
