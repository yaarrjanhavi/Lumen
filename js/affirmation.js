/**
 * Lumen — Daily Affirmation Flip Card matching the user's template
 */

const AFFIRMATION_LIST = [
  "you don't have to rush this.",
  "bloom at your own quiet pace.",
  "doubt doesn't get a seat at this table.",
  "one thing at a time is enough.",
  "your roots are growing deeper every day.",
  "honor the slow, quiet unfolding.",
  "you are allowed to do your own thing, quietly."
];

class LumenAffirmation {
  constructor() {
    this.cardFace = null;
    this.quoteEl = null;
    this.index = 0;
  }

  init() {
    this.cardFace = document.getElementById('affirmation-face');
    this.quoteEl = document.getElementById('affirmation-quote-text');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.cardFace?.addEventListener('click', () => {
      this.cardFace.style.transform = 'scale(0.96)';
      setTimeout(() => {
        this.index = (this.index + 1) % AFFIRMATION_LIST.length;
        this.render();
        this.cardFace.style.transform = '';
        window.LumenAudio?.playPop();
      }, 150);
    });
  }

  render() {
    if (this.quoteEl) {
      this.quoteEl.textContent = AFFIRMATION_LIST[this.index];
    }
  }
}

window.LumenAffirmation = new LumenAffirmation();
