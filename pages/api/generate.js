// /pages/api/generate.js
// Server-side Claude API call — ANTHROPIC_API_KEY is never sent to the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, tone, type, stream } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let apiKey = req.body.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key required. Add your key in settings.' });
  }

  const systemPrompt = buildSystemPrompt(type, tone);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ result: text });

  } catch (err) {
    console.error('Generate error:', err);
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

  const t = toneMap[tone] || toneMap.professional;
  const ty = typeMap[type] || typeMap.free;

  return `${ty} ${t} Be specific, original, and high quality. Output only the content itself — no meta-commentary.`;
}
