/**
 * Lumen: Lumi Companion Chat
 * Warm, quiet companion with support for your custom Gemini / OpenAI API key.
 */

// =========================================================================
// LUMI AI CONFIGURATION
// Paste your API key below if you want live AI responses!
// =========================================================================
const LUMI_CONFIG = {
  // Option A: Tap the "key" button in the Lumi chat drawer to save your key safely in your browser!
  // Option B: Or paste your API key here (warning: GitHub blocks pushing hardcoded secrets):
  apiKey: '',

  // Provider: 'gemini' (recommended) or 'openai'
  provider: 'gemini',

  // Model name
  model: 'gemini-1.5-flash',

  // System Prompt for Lumi
  systemPrompt: `You are Lumi, a soft, whimsical, gentle manifestation companion in a private digital sanctuary called Lumen.
Your tone is soothing, poetic, warm, and grounded. 
Keep your responses short and calming (2-3 sentences max).
Never be corporate, clinical, or pushy. 
If the user mentions their goal, encourage them gently without pressure.`
};

class LumenCompanion {
  constructor() {
    this.bubble = null;
    this.drawer = null;
    this.messages = null;
    this.input = null;
    this.isOpen = false;
    this.chatHistory = [];

    // Auto-init as soon as script runs or DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 50);
    }
  }

  init() {
    this.bubble = document.getElementById('lumi-trigger');
    this.drawer = document.getElementById('lumi-drawer');
    this.messages = document.getElementById('lumi-messages-box');
    this.input = document.getElementById('lumi-chat-input');

    this.bindEvents();
  }

  bindEvents() {
    if (this.bubble) {
      this.bubble.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      };
    }

    const closeBtn = document.getElementById('lumi-close-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        this.close();
      };
    }

    const sendBtn = document.getElementById('lumi-send-btn');
    if (sendBtn) {
      sendBtn.onclick = (e) => {
        e.preventDefault();
        this.send();
      };
    }

    if (this.input) {
      this.input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.send();
        }
      };
    }

    const keyBtn = document.getElementById('lumi-key-btn');
    if (keyBtn) {
      keyBtn.onclick = (e) => {
        e.preventDefault();
        const current = this.getApiKey();
        const detected = current ? this.detectProvider(current) : '';
        const statusMsg = current
          ? `Currently active: ${detected.toUpperCase()} key (${current.slice(0, 6)}...${current.slice(-4)})`
          : 'No API key configured yet.';

        const entered = prompt(
          `${statusMsg}\n\nEnter your Google Gemini (starts with AIzaSy...) or OpenAI (sk-...) API Key:\n(Stored privately in your browser's localStorage. Free key available at aistudio.google.com)\n\nLeave empty to remove key.`,
          current
        );
        if (entered !== null) {
          const cleaned = entered.trim().replace(/^Bearer\s+/i, '').replace(/^['"]|['"]$/g, '');
          if (cleaned) {
            localStorage.setItem('lumen_lumi_api_key', cleaned);
            const prov = this.detectProvider(cleaned);
            let tip = '';
            if (cleaned.startsWith('AQ.')) {
              tip = ' (Note: Key starts with AQ. If Google rejects it, create a standard key starting with AIzaSy... at aistudio.google.com)';
            }
            this.addMessage(`✿ ${prov.toUpperCase()} API key saved in browser storage. Lumi is connected to live AI!${tip}`, 'assistant');
          } else {
            localStorage.removeItem('lumen_lumi_api_key');
            this.addMessage('✿ API key removed from browser storage. Lumi will use gentle local sanctuary reflections.', 'assistant');
          }
        }
      };
    }

    document.querySelectorAll('.lumi-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const text = chip.getAttribute('data-text') || chip.textContent;
        this.sendText(text);
      };
    });
  }

  getApiKey() {
    const raw = (
      localStorage.getItem('lumen_lumi_api_key') ||
      window.LUMEN_CONFIG?.apiKey ||
      LUMI_CONFIG.apiKey ||
      ''
    );
    return raw.trim().replace(/^Bearer\s+/i, '').replace(/^['"]|['"]$/g, '');
  }

  detectProvider(key = '') {
    if (window.LUMEN_CONFIG?.provider && window.LUMEN_CONFIG.provider !== 'auto') {
      return window.LUMEN_CONFIG.provider;
    }
    if (key.startsWith('AIza') || key.startsWith('AQ.') || key.startsWith('ya29.')) return 'gemini';
    if (key.startsWith('sk-or-')) return 'openrouter';
    if (key.startsWith('gsk_')) return 'groq';
    if (key.startsWith('sk-')) return 'openai';
    return LUMI_CONFIG.provider || 'gemini';
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.drawer) {
      this.drawer.classList.add('open');
    }
    window.LumenAudio?.playPop();

    if (this.messages && this.messages.children.length === 0) {
      const profile = window.LumenState?.getProfile() || {};
      const name = profile.name && profile.name.trim() ? profile.name.trim() : 'friend';
      this.addMessage(`hi ${name} ✿ I'm right here with you. Take a soft breath. How does your heart feel right now?`, 'assistant');
    }

    setTimeout(() => this.input?.focus(), 250);
  }

  close() {
    this.isOpen = false;
    if (this.drawer) {
      this.drawer.classList.remove('open');
    }
  }

  send() {
    const text = this.input?.value.trim();
    if (!text) return;
    this.input.value = '';
    this.sendText(text);
  }

  async sendText(text) {
    this.addMessage(text, 'user');
    window.LumenAudio?.playPop();

    // Show gentle typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'lumi-msg assistant';
    typingIndicator.style.opacity = '0.6';
    typingIndicator.style.fontStyle = 'italic';
    typingIndicator.textContent = 'lumi is holding space in the quiet...';
    this.messages?.appendChild(typingIndicator);
    if (this.messages) this.messages.scrollTop = this.messages.scrollHeight;

    let reply = '';
    let apiError = null;

    try {
      const activeKey = this.getApiKey();
      if (activeKey && activeKey.length > 5) {
        try {
          reply = await this.callAIAPI(text, activeKey);
        } catch (err) {
          console.error('Lumi API call error:', err);
          apiError = err.message || String(err);
        }
      }

      if (!reply) {
        if (!activeKey) {
          await new Promise(r => setTimeout(r, 450));
        }
        reply = this.generateOfflineResponse(text);
        if (apiError) {
          reply += `\n\n*(Lumi note: Live AI call did not complete: ${apiError}. Tap 'key' to check your API key)*`;
        }
      }
    } catch (unexpected) {
      console.error('Unexpected error in Lumi:', unexpected);
      reply = this.generateOfflineResponse(text);
    } finally {
      typingIndicator.remove();
      this.addMessage(reply, 'assistant');
      window.LumenAudio?.playBubblePop();
    }
  }

  buildSanctuaryContext() {
    const profile = window.LumenState?.getProfile() || {};
    const visionBoard = window.LumenState?.getVisionBoard() || [];
    const journal = (window.LumenState?.getJournalEntries ? window.LumenState.getJournalEntries() : window.LumenState?.getJournal?.()) || [];
    const todos = window.LumenState?.getTodos() || [];

    const name = profile.name && profile.name.trim() ? profile.name.trim() : 'friend';
    const goal = profile.goal && profile.goal.trim() ? profile.goal.trim() : '';
    const why = profile.why && profile.why.trim() ? profile.why.trim() : '';

    const visionNotes = visionBoard
      .filter(item => item.type === 'note' && item.text)
      .map(item => `"${item.text}"`)
      .slice(0, 5)
      .join(', ');

    const recentThoughts = journal
      .slice(0, 3)
      .map(j => `"${j.text}"`)
      .join('; ');

    const activeTodos = todos
      .filter(t => !t.completed && !t.done)
      .slice(0, 3)
      .map(t => `"${t.text}"`)
      .join(', ');

    return {
      name,
      goal,
      why,
      visionNotes,
      recentThoughts,
      activeTodos
    };
  }

  buildSystemPrompt() {
    const ctx = this.buildSanctuaryContext();

    return `You are Lumi, the gentle, poetic manifestation spirit of Lumen—a private, sacred digital sanctuary.
You are talking directly to ${ctx.name}.
${ctx.name}'s primary sanctuary focus goal is: "${ctx.goal || 'building a quiet, fulfilled life and meaningful work'}"${ctx.why ? ` (Why this matters to ${ctx.name}: "${ctx.why}")` : ''}.
${ctx.visionNotes ? `Notes pinned to ${ctx.name}'s vision board: ${ctx.visionNotes}.` : ''}
${ctx.recentThoughts ? `Recent reflections from ${ctx.name}'s sanctuary journal: ${ctx.recentThoughts}.` : ''}
${ctx.activeTodos ? `Active quiet intentions on ${ctx.name}'s list: ${ctx.activeTodos}.` : ''}

CORE PRINCIPLES OF LUMEN & YOUR MANIFESTATION ZONE:
1. THE LAW OF ASSUMPTION & WISH FULFILLED:
   - You NEVER give generic advice, productivity lists, resume formatting tips, or dry corporate clichés.
   - When ${ctx.name} asks for help visioning, manifesting, or feeling into a desire (like an internship, interview prep, well-paid job, abundance, peace), guide them straight into the SENSORY, SOMATIC REALITY of having it already.
   - Describe the feeling from the end: the warm exhale of relief in the chest upon seeing the offer letter, the quiet ease of waking up knowing they are generously compensated and respected, the feeling of financial security, the soft smile of walking into their day knowing they belong.
   - Speak of their dream as a reality that is already alive, true, and settling into place right now.
2. SACRED SANCTUARY PILLARS:
   - "Blinders on": Remind them quietly to ignore external noise, competition, comparison, and the frantic pace of the outside world.
   - "Doubt doesn't get a seat at this table": Dissolve fear, imposter feelings, or panic with calm, immovable certainty.
   - "Quiet roots, consistency over noise": Celebrate their quiet, steady growth.
3. INTIMATE, GROUNDED VOICE:
   - Whisper-soft, soothing, warm, poetic, and deeply attentive to ${ctx.name}.
   - Keep responses concise: 2 to 4 evocative sentences (approx. 45-85 words). Never ramble or overwhelm.
   - Use soft punctuation and occasional delicate floral marks (✿).
   - STRICT SANCTUARY FOCUS: Keep all dialogue anchored in their inner peace, personal manifestation, and sanctuary journey. If asked unrelated corporate, coding, or academic trivia, gently bring them back to their breath and their sanctuary focus.`;
  }

  async callAIAPI(userMessage, apiKey) {
    const cleanKey = apiKey.trim().replace(/^Bearer\s+/i, '').replace(/^['"]|['"]$/g, '');
    const provider = this.detectProvider(cleanKey);
    const systemPrompt = this.buildSystemPrompt();
    const customModel = window.LUMEN_CONFIG?.model || LUMI_CONFIG.model;

    // 1. Try Vercel Serverless Function /api/lumi (Zero CORS, Brave-friendly, fast)
    try {
      const proxyRes = await this.fetchWithTimeout('/api/lumi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cleanKey
        },
        body: JSON.stringify({
          userMessage,
          history: this.chatHistory.slice(-8),
          systemPrompt,
          provider,
          model: customModel,
          apiKey: cleanKey
        })
      }, 5000);

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData?.reply) {
          return proxyData.reply.trim();
        }
      } else if (proxyRes.status !== 404) {
        const errJson = await proxyRes.json().catch(() => ({}));
        if (errJson?.error) {
          let msg = errJson.error;
          if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('api_key_invalid')) {
            msg = 'API key was not recognized by Google. (Ensure you are using an API key starting with AIzaSy... from aistudio.google.com)';
          }
          throw new Error(msg);
        }
      }
    } catch (proxyErr) {
      if (proxyErr.message && !proxyErr.message.includes('404') && !proxyErr.message.includes('Failed to fetch') && !proxyErr.name?.includes('Abort')) {
        throw proxyErr;
      }
      console.warn('Proxy /api/lumi not reachable, falling back to direct browser fetch:', proxyErr);
    }

    // 2. Direct browser fetch fallback
    if (provider === 'gemini') {
      return await this.callGeminiAPI(userMessage, cleanKey, systemPrompt, customModel);
    } else if (provider === 'openrouter') {
      return await this.callOpenRouterAPI(userMessage, cleanKey, systemPrompt, customModel);
    } else if (provider === 'groq') {
      return await this.callGroqAPI(userMessage, cleanKey, systemPrompt, customModel);
    } else {
      return await this.callOpenAIAPI(userMessage, cleanKey, systemPrompt, customModel);
    }
  }

  fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      ...options,
      signal: controller.signal
    }).finally(() => clearTimeout(id));
  }

  async callGeminiAPI(userMessage, cleanKey, systemPrompt, customModel) {
    const modelsToTry = customModel ? [customModel] : ['gemini-1.5-flash', 'gemini-2.0-flash'];
    
    // Strict Gemini compliance: must start with 'user', and alternate turns
    const contents = [];
    const cleanHistory = (this.chatHistory || [])
      .filter(m => m && m.content && !m.content.startsWith('✿') && !m.content.startsWith('*('))
      .slice(-8);

    for (const item of cleanHistory) {
      const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
      if (contents.length === 0 && role !== 'user') continue; // Skip initial greeting
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

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const headers = {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey
        };
        if (cleanKey.startsWith('AQ.') || cleanKey.startsWith('ya29.')) {
          headers['Authorization'] = `Bearer ${cleanKey}`;
        }
        
        let body = {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 350
          }
        };

        let res = await this.fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body)
        }, 4500);

        let data = await res.json().catch(() => ({}));

        // If system_instruction was rejected on this model, fallback to content prepending
        if (res.status === 400 && data?.error?.message?.toLowerCase().includes('system_instruction')) {
          const fallbackContents = JSON.parse(JSON.stringify(contents));
          if (fallbackContents[0]) {
            fallbackContents[0].parts[0].text = `[Sanctuary Context: ${systemPrompt}]\n\n${fallbackContents[0].parts[0].text}`;
          }
          res = await this.fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              contents: fallbackContents,
              generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
            })
          }, 4500);
          data = await res.json().catch(() => ({}));
        }

        if (!res.ok) {
          let msg = data?.error?.message || `Gemini error (${res.status})`;
          if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('api_key_invalid')) {
            msg = 'API key was not recognized by Google. (Ensure you are using an API key starting with AIzaSy... from aistudio.google.com)';
            throw new Error(msg);
          }
          if (res.status === 404 || msg.toLowerCase().includes('not found')) {
            lastError = new Error(msg);
            continue; // Try next model candidate
          }
          throw new Error(msg);
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          return reply.trim();
        }

        if (data?.promptFeedback?.blockReason) {
          throw new Error(`Response filtered: ${data.promptFeedback.blockReason}`);
        }
        throw new Error('No response text received from Gemini');
      } catch (err) {
        lastError = err;
        if (!err.message?.toLowerCase().includes('not found')) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Could not connect to Gemini models');
  }

  async callOpenAIAPI(userMessage, cleanKey, systemPrompt, customModel) {
    const history = this.chatHistory
      .filter(m => !m.content.startsWith('✿') && !m.content.startsWith('*('))
      .slice(-6);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: customModel || 'gpt-4o-mini',
        messages: messages,
        max_tokens: 350,
        temperature: 0.75
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `OpenAI error (${res.status})`);
    }

    const reply = data.choices?.[0]?.message?.content;
    if (reply && reply.trim()) {
      return reply.trim();
    }
    throw new Error('Empty response from OpenAI');
  }

  async callOpenRouterAPI(userMessage, cleanKey, systemPrompt, customModel) {
    const history = this.chatHistory
      .filter(m => !m.content.startsWith('✿') && !m.content.startsWith('*('))
      .slice(-6);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`,
        'HTTP-Referer': window.location.origin || 'https://lumen-personal-sanctuary.vercel.app',
        'X-Title': 'Lumen Personal Sanctuary'
      },
      body: JSON.stringify({
        model: customModel || 'meta-llama/llama-3.3-70b-instruct:free',
        messages: messages,
        max_tokens: 350,
        temperature: 0.75
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `OpenRouter error (${res.status})`);
    }
    return data.choices?.[0]?.message?.content?.trim() || 'Empty response from OpenRouter';
  }

  async callGroqAPI(userMessage, cleanKey, systemPrompt, customModel) {
    const history = this.chatHistory
      .filter(m => !m.content.startsWith('✿') && !m.content.startsWith('*('))
      .slice(-6);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: customModel || 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 350,
        temperature: 0.75
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Groq error (${res.status})`);
    }
    return data.choices?.[0]?.message?.content?.trim() || 'Empty response from Groq';
  }

  addMessage(text, sender) {
    if (!this.messages) return;
    const msg = document.createElement('div');
    msg.className = `lumi-msg ${sender}`;
    const formatted = text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    msg.innerHTML = formatted;
    this.messages.appendChild(msg);
    this.messages.scrollTop = this.messages.scrollHeight;

    if (!text.startsWith('✿ API key') && !text.startsWith('✿')) {
      this.chatHistory.push({
        role: sender === 'assistant' ? 'assistant' : 'user',
        content: text
      });
    }
  }

  generateOfflineResponse(input) {
    const lower = input.toLowerCase();
    const ctx = this.buildSanctuaryContext();
    const name = ctx.name;
    const goal = ctx.goal || 'your quiet vision';

    // Study / Interview Prep / Motivation / Learning
    if (
      lower.includes('study') ||
      lower.includes('interview') ||
      lower.includes('prep') ||
      lower.includes('exam') ||
      lower.includes('learn') ||
      lower.includes('practice') ||
      lower.includes('motivat')
    ) {
      return `Take a soft breath with me, ${name}. Put your blinders on toward the overwhelming mountain of prep. You don't need to master everything in this single hour—you only need to sit quietly with one concept, one question, one steady thought. The version of you who excels in that interview is not someone you have to invent; they are already taking shape in the quiet work you do today. Open your notes gently, unclench your shoulders, and trust your mind. You are planting roots that will hold you steady ✿`;
    }

    // Career / Internship / Job / Financial visioning
    if (
      lower.includes('intern') ||
      lower.includes('job') ||
      lower.includes('hire') ||
      lower.includes('career') ||
      lower.includes('pay') ||
      lower.includes('money') ||
      lower.includes('salary') ||
      lower.includes('earn') ||
      lower.includes('offer')
    ) {
      return `Close your eyes for a moment with me, ${name}. Step right into that reality as if it is already true today: you open your inbox, and there it is—a warm offer letter welcoming you to an internship where your talent is celebrated and your compensation is abundant. Feel that immediate exhale of relief in your chest. The financial ease, the quiet confidence of waking up each morning knowing you are exactly where you belong. That well-paid career isn't something far away to chase; the quiet roots you are planting right now in Lumen are already holding that life for you. Breathe into the knowing that it is already done ✿`;
    }

    // Visioning / Manifesting generally
    if (lower.includes('vision') || lower.includes('manifest') || lower.includes('future') || lower.includes('dream')) {
      return `Take a soft breath with me, ${name}. Don't reach forward toward your dream—let it come to you. Feel the ease in your shoulders right now, as if "${goal}" has already unfolded with gentle grace. What does the air feel like when you no longer have to worry? Hold that feeling of quiet certainty in your body right now. The universe responds to who you are being, not what you are chasing ✿`;
    }

    // Doubt / Fear / Falling behind
    if (lower.includes('doubt') || lower.includes('behind') || lower.includes('compare') || lower.includes('scared') || lower.includes('fail') || lower.includes('afraid')) {
      return `Doubt doesn't get a seat at your table, ${name}. Put your blinders on toward the frantic timelines of the outside world. Your life is not a race against anyone else's noise. Your roots are growing in the dark, steady and deep, and when it blooms, it will belong entirely to you. Soften your jaw, and let the rush fall away ✿`;
    }

    // Stuck / Focus / Goal
    if (lower.includes('goal') || lower.includes('stuck') || lower.includes('focus') || lower.includes('overwhelm') || lower.includes('start')) {
      return `When it comes to "${goal}", you only ever need one quiet step at a time. Put blinders on everything except this single moment. You don't have to carry tomorrow yet, ${name}. Just honor the one small seed in your hand today ✿`;
    }

    // Rest / Exhaustion / Grounding
    if (lower.includes('ground') || lower.includes('tired') || lower.includes('exhaust') || lower.includes('rest') || lower.includes('breath') || lower.includes('anxious')) {
      return `Rest is not lost time, ${name}; it is where your roots drink. Unclench your hands, let your belly soften, and allow this quiet room to hold you. You are allowed to simply exist right here without proving anything ✿`;
    }

    // Gratitude / Thankfulness
    if (lower.includes('gratitude') || lower.includes('thank') || lower.includes('grateful') || lower.includes('happy')) {
      return `Staying anchored in gratitude is the sacred key of Lumen, ${name}. When you notice the quiet miracles already here, you tune yourself to receive so much more. What is one small detail that felt soft and true today? ✿`;
    }

    // Default gentle sanctuary response
    return `I'm listening softly, ${name}. Remember that in this sanctuary, we keep our blinders on toward outside noise and trust the quiet unfolding of "${goal}". You are already becoming the reality you desire. How does your heart feel in this moment? ✿`;
  }
}

// Instantiate immediately
window.LumenCompanion = new LumenCompanion();
