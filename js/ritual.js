/**
 * Lumen — The Practice: 5-Step Ritual
 * Links the five steps along the quiet path to their matching sanctuary spaces
 */

class LumenRitual {
  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.step').forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const num = parseInt(stepEl.getAttribute('data-step') || '1', 10);
        window.LumenAudio?.playPop();

        if (num === 1) {
          // Blinders: gentle grounding chime
          window.LumenAudio?.playZenChime();
        } else if (num === 2) {
          // One Goal: scroll to goal card
          document.getElementById('hero-goal-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (num === 3) {
          // No Doubt: scroll to "let it go"
          document.getElementById('letitgo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          document.getElementById('doubt-input')?.focus();
        } else if (num === 4) {
          // Lock in: scroll to pomodoro
          document.getElementById('lockin')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (num === 5) {
          // Gratitude: scroll to journal
          document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
}

window.LumenRitual = new LumenRitual();
