/**
 * Lumen: Ambient Soundscape & Song Controller
 * Manages soundscapes (stillness, rain, garden, bowl, chime),
 * user-added custom songs, and header mute toggle.
 */

class LumenAmbient {
  constructor() {
    this.currentMode = 'off';
    this.currentCustomSrc = null;
    this.volume = 0.3;
    this.customSongs = [];
  }

  init() {
    this.loadCustomSongs();
    this.renderCustomSongs();
    this.bindEvents();
  }

  loadCustomSongs() {
    try {
      const stored = localStorage.getItem('lumen_custom_songs');
      this.customSongs = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.customSongs = [];
    }
  }

  saveCustomSongs() {
    try {
      localStorage.setItem('lumen_custom_songs', JSON.stringify(this.customSongs));
    } catch (e) {
      console.warn('Could not save custom songs to localStorage:', e);
    }
  }

  bindEvents() {
    // Default soundscape strip buttons
    document.querySelectorAll('.soundscape-btn:not(#add-song-btn):not(.custom-song-btn)').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.soundscape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const soundType = btn.getAttribute('data-sound') || 'off';
        const label = btn.textContent.trim();
        this.setSound(soundType, null, label);
      });
    });

    // Add Song button & file input
    const addBtn = document.getElementById('add-song-btn');
    const fileInput = document.getElementById('song-file-input');

    addBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 24);
          const newSong = {
            id: 'song_' + Date.now(),
            name: cleanName,
            dataUrl: base64
          };
          this.customSongs.push(newSong);
          this.saveCustomSongs();
          this.renderCustomSongs();

          // Automatically play the new song!
          const btn = document.querySelector(`.custom-song-btn[data-id="${newSong.id}"]`);
          btn?.click();
          window.LumenAudio?.playPop();
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      }
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
        this.updateNowPlaying('');
      } else {
        window.LumenAudio?.setAmbient(this.currentMode, this.volume, this.currentCustomSrc);
        window.LumenAudio?.playPop();
        this.updateNowPlaying(this.currentMode === 'off' ? '' : `now playing: ${this.currentMode} ✿`);
      }
    });

    this.updateMuteUI(window.LumenState.getSettings().soundEnabled);
  }

  renderCustomSongs() {
    const container = document.getElementById('custom-songs-container');
    if (!container) return;
    container.innerHTML = '';

    this.customSongs.forEach(song => {
      const btn = document.createElement('button');
      btn.className = 'soundscape-btn custom-song-btn';
      btn.setAttribute('data-sound', 'custom');
      btn.setAttribute('data-id', song.id);
      btn.innerHTML = `
        <span>${song.name}</span>
        <span class="custom-song-del" data-del-id="${song.id}" title="Remove this song" style="margin-left: 6px; font-size: 0.7rem; opacity: 0.6;">✕</span>
      `;

      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('custom-song-del')) {
          e.stopPropagation();
          this.removeCustomSong(song.id);
          return;
        }

        document.querySelectorAll('.soundscape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setSound('custom', song.dataUrl, song.name);
      });

      container.appendChild(btn);
    });
  }

  removeCustomSong(id) {
    if (this.currentMode === 'custom' && this.currentCustomId === id) {
      this.setSound('off', null, 'stillness');
      document.querySelector('.soundscape-btn[data-sound="off"]')?.classList.add('active');
    }
    this.customSongs = this.customSongs.filter(s => s.id !== id);
    this.saveCustomSongs();
    this.renderCustomSongs();
  }

  setSound(type, customSrc = null, label = '') {
    this.currentMode = type;
    this.currentCustomSrc = customSrc;
    window.LumenAudio?.setAmbient(type, this.volume, customSrc);

    if (type === 'off') {
      this.updateNowPlaying('');
    } else {
      this.updateNowPlaying(`now playing: ${label || type} ✿`);
    }
  }

  updateNowPlaying(text) {
    const el = document.getElementById('soundscape-now-playing');
    if (el) {
      el.textContent = text;
    }
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
