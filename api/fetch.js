export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const expected = (process.env.APP_PASSWORD || '').trim();
  const provided = (req.headers['x-app-password'] || '').trim();
  if (!expected) {
    return res.status(500).json({ error: { message: '서버 설정 오류: APP_PASSWORD 환경변수가 등록되지 않았어요.' } });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: { message: '비밀번호가 올바르지 않아요.' } });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: { message: 'url required' } });
  }

  let parsed;
  try { parsed = new URL(url); }
  catch { return res.status(400).json({ error: { message: '올바른 URL 형식이 아니에요.' } }); }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: { message: 'http:// 또는 https:// URL만 지원해요.' } });
  }
  // basic SSRF defense — block internal/loopback hostnames
  const host = parsed.hostname.toLowerCase();
  const blocked = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1)/;
  if (blocked.test(host) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) {
    return res.status(400).json({ error: { message: '내부 네트워크 주소는 허용되지 않아요.' } });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CareerFitBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!upstream.ok) {
      return res.status(502).json({ error: { message: `링크를 가져오지 못했어요 (HTTP ${upstream.status}).` } });
    }

    // size guard — read up to ~3MB then stop
    const reader = upstream.body.getReader();
    const chunks = [];
    let total = 0;
    const MAX = 3 * 1024 * 1024;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX) {
        reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const buf = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) { buf.set(c, pos); pos += c.length; }
    const raw = new TextDecoder('utf-8', { fatal: false }).decode(buf);

    const text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      return res.status(502).json({ error: { message: '링크에서 텍스트를 추출하지 못했어요. JS로 렌더링되는 페이지일 수 있어요.' } });
    }

    return res.status(200).json({ text: text.slice(0, 15000) });
  } catch (err) {
    const msg = err.name === 'AbortError'
      ? '링크 응답이 너무 느려요 (15초 초과).'
      : (err.message || '링크 가져오기 실패');
    return res.status(502).json({ error: { message: msg } });
  }
}
