/**
 * Lumen — Lumi Companion Chat
 * Warm, quiet companion tucked in the corner matching the user's template
 */

class LumenCompanion {
  constructor() {
    this.bubble = null;
    this.drawer = null;
    this.messages = null;
    this.input = null;
    this.isOpen = false;
  }

  init() {
    this.bubble = document.getElementById('lumi-trigger');
    this.drawer = document.getElementById('lumi-drawer');
    this.messages = document.getElementById('lumi-messages-box');
    this.input = document.getElementById('lumi-chat-input');

    this.bindEvents();
  }

  bindEvents() {
    this.bubble?.addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('lumi-close-btn')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('lumi-send-btn')?.addEventListener('click', () => {
      this.send();
    });

    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.send();
      }
    });

    document.querySelectorAll('.lumi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-text') || chip.textContent;
        this.sendText(text);
      });
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.drawer?.classList.add('open');
    window.LumenAudio?.playPop();

    if (this.messages && this.messages.children.length === 0) {
      const profile = window.LumenState.getProfile();
      const name = profile.name && profile.name !== 'Gentle Soul' ? profile.name : 'friend';
      this.addMessage(`hi ${name} ✿ I'm right here with you. Take a soft breath — how does your heart feel right now?`, 'assistant');
    }

    setTimeout(() => this.input?.focus(), 250);
  }

  close() {
    this.isOpen = false;
    this.drawer?.classList.remove('open');
  }

  send() {
    const text = this.input?.value.trim();
    if (!text) return;
    this.input.value = '';
    this.sendText(text);
  }

  sendText(text) {
    this.addMessage(text, 'user');
    window.LumenAudio?.playPop();

    setTimeout(() => {
      const reply = this.generateResponse(text);
      this.addMessage(reply, 'assistant');
      window.LumenAudio?.playBubblePop();
    }, 600);
  }

  addMessage(text, sender) {
    if (!this.messages) return;
    const msg = document.createElement('div');
    msg.className = `lumi-msg ${sender}`;
    msg.textContent = text;
    this.messages.appendChild(msg);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  generateResponse(input) {
    const lower = input.toLowerCase();
    const profile = window.LumenState.getProfile();
    const name = profile.name && profile.name !== 'Gentle Soul' ? profile.name : 'friend';
    const goal = profile.goal || 'what you started';

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

window.LumenCompanion = new LumenCompanion();
