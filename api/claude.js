export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const password = req.headers['x-app-password'];
  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: { message: '비밀번호가 올바르지 않아요.' } });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: '서버 설정 오류: API 키가 등록되지 않았습니다.' } });
  }

  const { messages, system, model, max_tokens } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: { message: 'messages required' } });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-5',
        max_tokens: max_tokens || 2048,
        system,
        messages,
      }),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message || 'Upstream error' } });
  }
}
