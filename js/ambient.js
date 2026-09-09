/**
 * Lumen — Ambient Soundscape Controller
 * Manages minimal soundscape buttons (stillness, soft rain, garden breeze, singing bowl)
 * and the mute toggle in the header.
 */

class LumenAmbient {
  constructor() {
    this.currentMode = 'off';
    this.volume = 0.25;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Soundscape strip buttons
    document.querySelectorAll('.soundscape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.soundscape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const soundType = btn.getAttribute('data-sound') || 'off';
        this.setSound(soundType);
      });
    });

    // Sound toggle in header
    const muteBtn = document.getElementById('sound-toggle-btn');
    muteBtn?.addEventListener('click', () => {
      const current = window.LumenState.getSettings().soundEnabled;
      const next = !current;
      window.LumenState.setSetting('soundEnabled', next);
      this.updateMuteUI(next);

      if (!next) {
        window.LumenAudio?.setAmbient('off');
      } else {
        window.LumenAudio?.setAmbient(this.currentMode, this.volume);
        window.LumenAudio?.playPop();
      }
    });

    this.updateMuteUI(window.LumenState.getSettings().soundEnabled);
  }

  setSound(type) {
    this.currentMode = type;
    window.LumenAudio?.setAmbient(type, this.volume);
  }

  updateMuteUI(isEnabled) {
    const icon = document.getElementById('sound-icon-svg');
    if (!icon) return;

    if (isEnabled) {
      icon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      `;
    } else {
      icon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    }
  }
}

window.LumenAmbient = new LumenAmbient();
