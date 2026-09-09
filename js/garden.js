/**
 * Lumen: Little Garden Mini-Game
 * Minimalist, soft plant tending without emoji clutter.
 * Tapping waters the plant and gently progresses its bloom.
 */

class LumenGarden {
  constructor() {
    this.container = null;
    this.stage = 1; // 0: seed/earth, 1: sprout, 2: leafy stem, 3: flowering
    this.hintEl = null;
  }

  init() {
    this.container = document.getElementById('garden-pot-display');
    this.hintEl = document.getElementById('garden-hint-text');

    const gardenData = window.LumenState.getGarden();
    if (gardenData && gardenData[0]) {
      this.stage = gardenData[0].stage || 1;
    }

    this.render();
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('garden-tap-zone')?.addEventListener('click', (e) => {
      this.waterPlant(e);
    });
  }

  waterPlant(e) {
    // Water drop effect
    this.createWaterSplash(e);
    window.LumenAudio?.playSeedPlant();

    // Advance stage gently (cycles from 1 to 4)
    this.stage = (this.stage % 4) + 1;
    window.LumenState.waterPlot(0);

    const hints = [
      "planted with care · resting softly",
      "tap to water · growing quietly",
      "reaching upward toward the light",
      "in gentle bloom ✿"
    ];

    if (this.hintEl) {
      this.hintEl.textContent = hints[this.stage - 1];
    }

    this.render();
  }

  createWaterSplash(e) {
    const card = document.getElementById('garden-tap-zone');
    if (!card) return;

    for (let i = 0; i < 4; i++) {
      const splash = document.createElement('span');
      splash.className = 'water-splash';
      splash.textContent = '•';
      splash.style.left = `${45 + (Math.random() * 20 - 10)}%`;
      splash.style.top = `${40 + (Math.random() * 20 - 10)}%`;
      card.appendChild(splash);
      setTimeout(() => splash.remove(), 600);
    }
  }

  render() {
    if (!this.container) return;

    // Hand-drawn botanical SVG stages
    let plantGraphic = '';

    if (this.stage === 1) {
      // Gentle twin sprout
      plantGraphic = `
        <path d="M45 52 Q43 38 45 30" stroke="#7A9A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M45 32 Q37 25 33 29 Q40 35 45 32" fill="#7A9A70"/>
        <path d="M45 30 Q53 23 57 27 Q50 33 45 30" fill="#7A9A70"/>
      `;
    } else if (this.stage === 2) {
      // Stem with leafy tendrils
      plantGraphic = `
        <path d="M45 52 Q42 32 45 18" stroke="#7A9A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M44 38 Q32 30 28 36 Q38 42 44 38" fill="#7A9A70"/>
        <path d="M45 28 Q56 20 60 26 Q51 32 45 28" fill="#7A9A70"/>
        <circle cx="45" cy="16" r="4.5" fill="#F5D9E6" stroke="#7A9A70" stroke-width="1.2"/>
      `;
    } else if (this.stage === 3) {
      // Semi bloom
      plantGraphic = `
        <path d="M45 52 Q43 32 45 18" stroke="#7A9A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M44 38 Q32 30 28 36 Q38 42 44 38" fill="#7A9A70"/>
        <path d="M45 28 Q56 20 60 26 Q51 32 45 28" fill="#7A9A70"/>
        <circle cx="40" cy="14" r="6" fill="#F5D9E6" opacity="0.9"/>
        <circle cx="50" cy="14" r="6" fill="#F5D9E6" opacity="0.9"/>
        <circle cx="45" cy="10" r="6" fill="#F5D9E6" opacity="0.9"/>
        <circle cx="45" cy="14" r="3.5" fill="#EFE0A8"/>
      `;
    } else {
      // Radiant full bloom with petals
      plantGraphic = `
        <path d="M45 52 Q43 32 45 18" stroke="#7A9A70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M44 38 Q32 30 28 36 Q38 42 44 38" fill="#7A9A70"/>
        <path d="M45 28 Q56 20 60 26 Q51 32 45 28" fill="#7A9A70"/>
        <g transform="translate(45, 14)">
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
            <path d="M0 0 C-4 -9, 4 -9, 0 0" transform="rotate(${deg})" fill="#F5D9E6" stroke="rgba(120,80,90,0.2)"/>
          `).join('')}
          <circle cx="0" cy="0" r="4" fill="#EFE0A8"/>
        </g>
      `;
    }

    this.container.innerHTML = `
      <svg class="garden-pot-svg" viewBox="0 0 90 90" fill="none">
        ${plantGraphic}
        <!-- Terracotta / Ceramic Minimalist Pot -->
        <path d="M26 50 L64 50 L58 80 L32 80 Z" fill="#E8DCD0" stroke="#7A6F60" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="23" y="46" width="44" height="6" rx="2" fill="#DFD2C4" stroke="#7A6F60" stroke-width="1.6"/>
        <path d="M34 65 Q45 70 56 65" stroke="rgba(122, 111, 96, 0.3)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `;
  }
}

window.LumenGarden = new LumenGarden();
