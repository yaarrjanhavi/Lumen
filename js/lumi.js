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
        const entered = prompt('Enter your Gemini or OpenAI API Key\n(Safely stored only in this browser, never pushed to GitHub):', current);
        if (entered !== null) {
          localStorage.setItem('lumen_lumi_api_key', entered.trim());
          if (entered.trim()) {
            this.addMessage('✿ API key saved in your browser.', 'assistant');
          } else {
            this.addMessage('✿ API key removed. Using gentle offline responses.', 'assistant');
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
    return localStorage.getItem('lumen_lumi_api_key') || LUMI_CONFIG.apiKey || '';
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
    typingIndicator.textContent = 'lumi is reflecting...';
    this.messages?.appendChild(typingIndicator);
    if (this.messages) this.messages.scrollTop = this.messages.scrollHeight;

    let reply = '';
    const activeKey = this.getApiKey().trim();

    // If an API key is available (from localStorage or config), call the AI!
    if (activeKey && activeKey.length > 8) {
      try {
        reply = await this.callAIAPI(text, activeKey);
      } catch (err) {
        console.warn('Lumi API call error, falling back to local wisdom:', err);
        reply = this.generateOfflineResponse(text);
      }
    } else {
      // Local empathetic response generator
      await new Promise(r => setTimeout(r, 600));
      reply = this.generateOfflineResponse(text);
    }

    typingIndicator.remove();
    this.addMessage(reply, 'assistant');
    window.LumenAudio?.playBubblePop();
  }

  async callAIAPI(userMessage, apiKey) {
    const profile = window.LumenState?.getProfile() || {};
    const contextInfo = `User's name: "${profile.name || 'friend'}". User's one focus goal: "${profile.goal || 'not set yet'}". Context: "${profile.why || ''}".`;

    if (LUMI_CONFIG.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: LUMI_CONFIG.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${LUMI_CONFIG.systemPrompt}\nUser Context: ${contextInfo}` },
            ...this.chatHistory.slice(-4),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 120,
          temperature: 0.7
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'OpenAI API error');
      return data.choices[0].message.content.trim();
    } else {
      // Default: Google Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${LUMI_CONFIG.model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `[System Note: ${LUMI_CONFIG.systemPrompt} User Context: ${contextInfo}]\nUser says: ${userMessage}` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 120,
            temperature: 0.7
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Gemini API error');
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
      throw new Error('No response text received from Gemini');
    }
  }

  addMessage(text, sender) {
    if (!this.messages) return;
    const msg = document.createElement('div');
    msg.className = `lumi-msg ${sender}`;
    msg.textContent = text;
    this.messages.appendChild(msg);
    this.messages.scrollTop = this.messages.scrollHeight;

    this.chatHistory.push({ role: sender === 'assistant' ? 'assistant' : 'user', content: text });
  }

  generateOfflineResponse(input) {
    const lower = input.toLowerCase();
    const profile = window.LumenState?.getProfile() || {};
    const name = profile.name && profile.name.trim() ? profile.name.trim() : 'friend';
    const goal = profile.goal || 'your quiet vision';

    if (lower.includes('doubt') || lower.includes('behind') || lower.includes('compare')) {
      return `Doubt doesn't get a seat at your table, ${name}. Your timeline is entirely your own. Breathe out the rush ✿`;
    }

    if (lower.includes('goal') || lower.includes('stuck') || lower.includes('focus')) {
      return `When it comes to "${goal}", even the quietest single step counts. You don't have to carry the whole mountain today.`;
    }

    if (lower.includes('ground') || lower.includes('tired') || lower.includes('rest')) {
      return `Rest is part of the work, ${name}. Drop your shoulders, unclench your jaw, and let the quiet hold you for a moment.`;
    }

    if (lower.includes('gratitude') || lower.includes('thankful') || lower.includes('grateful')) {
      return `Noticing the small things is where peace lives. What felt slow and gentle for you today?`;
    }

    return `I'm listening softly, ${name}. Remember to keep your blinders on toward the outside noise. You're unfolding just fine ✿`;
  }
}

// Instantiate immediately
window.LumenCompanion = new LumenCompanion();
