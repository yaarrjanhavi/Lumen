/**
 * Lumen: Pomodoro Focus Timer ("Lock In")
 * Updates the circular conic-gradient ring and plays a gentle singing bowl chime.
 */

class LumenPomodoro {
  constructor() {
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.timerInterval = null;
    this.isRunning = false;

    this.ringEl = null;
    this.timeEl = null;
    this.labelEl = null;
    this.toggleBtn = null;
  }

  init() {
    this.ringEl = document.getElementById('pomo-ring');
    this.timeEl = document.getElementById('pomo-time');
    this.labelEl = document.getElementById('pomo-label');
    this.toggleBtn = document.getElementById('pomo-toggle-btn');

    this.bindEvents();
    this.updateDisplay();
    this.updateRing(0);
  }

  bindEvents() {
    this.ringEl?.addEventListener('click', () => {
      this.toggle();
    });

    this.toggleBtn?.addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('pomo-reset-btn')?.addEventListener('click', () => {
      this.reset();
    });

    document.querySelectorAll('.pomo-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins') || '25', 10);
        this.setDuration(mins);
      });
    });
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  setDuration(mins) {
    this.pause();
    this.totalSeconds = mins * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.updateRing(0);
    if (this.labelEl) this.labelEl.textContent = 'focus session';
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.toggleBtn) this.toggleBtn.textContent = 'pause';
    if (this.labelEl) this.labelEl.textContent = 'locked in · gentle focus';
    window.LumenAudio?.playPop();

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplay();
        const progress = 1 - (this.remainingSeconds / this.totalSeconds);
        this.updateRing(progress);
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.toggleBtn) this.toggleBtn.textContent = 'begin';
    if (this.labelEl) this.labelEl.textContent = 'paused';
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    this.updateRing(0);
    if (this.labelEl) this.labelEl.textContent = 'focus session';
  }

  completeSession() {
    this.pause();
    window.LumenAudio?.playZenChime();
    if (this.labelEl) this.labelEl.textContent = 'session complete ✿ fully bloomed';
    window.LumenState?.recordActivity('flower');
    this.updateRing(1);
  }

  updateDisplay() {
    if (!this.timeEl) return;
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    this.timeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateRing(progress) {
    if (!this.ringEl) return;
    const deg = Math.floor(progress * 360);
    this.ringEl.style.background = `conic-gradient(var(--sage) 0deg ${deg}deg, #ECE6DC ${deg}deg 360deg)`;
  }
}

window.LumenPomodoro = new LumenPomodoro();
