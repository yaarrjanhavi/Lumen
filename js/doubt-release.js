/**
 * Lumen: Doubt Release ("Let It Go") matching user's template
 * User writes a doubt into the card, presses enter, and watches it dissolve into the wind.
 */

class LumenDoubtRelease {
  constructor() {
    this.input = null;
    this.note = null;
  }

  init() {
    this.input = document.getElementById('doubt-input');
    this.note = document.getElementById('doubt-note');

    this.bindEvents();
  }

  bindEvents() {
    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.releaseDoubt();
      }
    });

    document.getElementById('doubt-release-btn')?.addEventListener('click', () => {
      this.releaseDoubt();
    });
  }

  releaseDoubt() {
    const text = this.input?.value.trim();
    if (!text) return;

    window.LumenAudio?.playBubblePop();

    if (this.input) {
      this.input.style.transition = 'all 1.4s ease-out';
      this.input.style.transform = 'translateY(-30px) scale(0.95)';
      this.input.style.opacity = '0';
    }

    if (this.note) {
      this.note.textContent = "releasing into the wind...";
    }

    setTimeout(() => {
      window.LumenAudio?.playZenChime();
      if (this.input) {
        this.input.value = '';
        this.input.placeholder = "what if it doesn't work out...";
        this.input.style.transform = '';
        this.input.style.opacity = '1';
      }
      if (this.note) {
        this.note.innerHTML = `<span>released to the sky ✿ doubt has no seat here.</span> <button id="doubt-release-btn" class="nav-btn" style="padding: 2px 8px; font-size: 0.75rem;">release</button>`;
        document.getElementById('doubt-release-btn')?.addEventListener('click', () => this.releaseDoubt());
      }
    }, 1500);
  }
}

window.LumenDoubtRelease = new LumenDoubtRelease();
