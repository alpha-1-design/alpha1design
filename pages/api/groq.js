// /pages/api/groq.js
// Server-side Groq API call — GROQ_API_KEY is never sent to the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, tone, type, stream } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

  let apiKey = req.body.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Groq API key required. Add your key in settings or set GROQ_API_KEY env var.' });

  const systemPrompt = buildSystemPrompt(type, tone);

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          temperature: 0.85,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || 'Groq API error' });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content || '';
            if (text) res.write(text);
          } catch {}
        }
      }
      res.end();
      return;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: 'Groq returned an empty response.' });
    return res.status(200).json({ result: text });

  } catch (err) {
    console.error('Groq error:', err);
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
