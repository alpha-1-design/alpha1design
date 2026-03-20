// /pages/api/mistral.js
// Server-side Mistral API call — MISTRAL_API_KEY is never sent to the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, tone, type } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Mistral API key not configured. Add MISTRAL_API_KEY to your environment variables.' });

  const systemPrompt = buildSystemPrompt(type, tone);

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 1024,
        temperature: 0.85,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Mistral API error' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: 'Mistral returned an empty response.' });
    return res.status(200).json({ result: text });

  } catch (err) {
    console.error('Mistral error:', err);
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
  return `${typeMap[type] || typeMap.free} ${toneMap[tone] || toneMap.professional} Output only the content itself — no meta-commentary.`;
}
