/**
 * Vercel Serverless Function: /api/lumi
 * Proxies requests to Gemini / OpenAI securely from the server.
 * Bypasses all browser CORS, Brave Shields, and adblocker issues!
 */

export default async function handler(req, res) {
  // Enable CORS if accessed from other origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userMessage, history, systemPrompt, provider, model } = req.body || {};
    const apiKey = (
      req.headers['x-api-key'] ||
      req.body?.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.LUMI_API_KEY ||
      ''
    ).trim();

    if (!apiKey) {
      return res.status(400).json({ error: 'No API key provided. Add it in the key modal, config.js, or Vercel Environment Variables.' });
    }

    const detectedProvider = (provider && provider !== 'auto') 
      ? provider 
      : (apiKey.startsWith('sk-') ? 'openai' : 'gemini');

    if (detectedProvider === 'gemini') {
      const modelsToTry = model ? [model] : ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
      
      // Build compliant Gemini contents (must start with 'user' and alternate)
      const contents = [];
      const cleanHistory = (history || [])
        .filter(m => m && m.content && !m.content.startsWith('✿') && !m.content.startsWith('*('))
        .slice(-8);

      for (const item of cleanHistory) {
        const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
        if (contents.length === 0 && role !== 'user') continue;
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n\n${item.content}`;
        } else {
          contents.push({ role, parts: [{ text: item.content }] });
        }
      }

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n\n${userMessage}`;
      } else {
        contents.push({ role: 'user', parts: [{ text: userMessage }] });
      }

      if (contents[0].role !== 'user') contents.shift();

      let lastError = null;
      for (const m of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          };
          if (apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.')) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }

          const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
            })
          });

          let geminiData = await geminiRes.json().catch(() => ({}));

          if (geminiRes.status === 400 && geminiData?.error?.message?.toLowerCase().includes('system_instruction')) {
            const fallbackContents = JSON.parse(JSON.stringify(contents));
            if (fallbackContents[0]) {
              fallbackContents[0].parts[0].text = `[Sanctuary Context: ${systemPrompt}]\n\n${fallbackContents[0].parts[0].text}`;
            }
            geminiRes = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                contents: fallbackContents,
                generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
              })
            });
            geminiData = await geminiRes.json().catch(() => ({}));
          }

          if (!geminiRes.ok) {
            const errText = geminiData?.error?.message || `Gemini ${geminiRes.status}`;
            if (geminiRes.status === 404 || errText.toLowerCase().includes('not found')) {
              lastError = new Error(errText);
              continue;
            }
            throw new Error(errText);
          }

          const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.status(200).json({ reply: replyText.trim() });
          }
        } catch (err) {
          lastError = err;
          if (!err.message?.toLowerCase().includes('not found')) break;
        }
      }

      throw lastError || new Error('No valid response from Gemini');
    } else {
      // OpenAI branch
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ];

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages,
          max_tokens: 350,
          temperature: 0.75
        })
      });

      const openAiData = await openAiRes.json();
      if (!openAiRes.ok) {
        throw new Error(openAiData?.error?.message || `OpenAI ${openAiRes.status}`);
      }

      return res.status(200).json({ reply: openAiData.choices?.[0]?.message?.content?.trim() });
    }
  } catch (err) {
    console.error('API /api/lumi error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

// Dual export support for Node CommonJS and Vercel ESM
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
}

