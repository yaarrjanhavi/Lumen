/**
 * Lumen: Conversational Onboarding Flow
 * Soft, gentle 3-step welcome dialogue with Lumi
 */

class LumenOnboarding {
  constructor() {
    this.currentStep = 1;
    this.nameInput = null;
    this.goalInput = null;
    this.whyInput = null;
    this.modal = null;
  }

  init() {
    this.modal = document.getElementById('onboarding-modal');
    this.nameInput = document.getElementById('onboard-name');
    this.goalInput = document.getElementById('onboard-goal');
    this.whyInput = document.getElementById('onboard-why');

    const profile = window.LumenState.getProfile();
    if (!profile.onboarded) {
      this.open();
    }

    this.bindEvents();
  }

  bindEvents() {
    // Step navigation buttons
    document.getElementById('onboard-next-1')?.addEventListener('click', () => {
      const name = this.nameInput?.value.trim();
      if (name) {
        this.goToStep(2);
      } else {
        this.shakeInput(this.nameInput);
      }
    });

    document.getElementById('onboard-next-2')?.addEventListener('click', () => {
      const goal = this.goalInput?.value.trim();
      if (goal) {
        this.goToStep(3);
      } else {
        this.shakeInput(this.goalInput);
      }
    });

    document.getElementById('onboard-finish')?.addEventListener('click', () => {
      this.completeOnboarding();
    });

    // Skip option
    document.querySelectorAll('.onboard-skip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.completeOnboarding(true);
      });
    });

    // Enter key shortcuts
    this.nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('onboard-next-1')?.click();
    });
    this.goalInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('onboard-next-2')?.click();
    });
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    this.goToStep(1);
    setTimeout(() => {
      this.nameInput?.focus();
    }, 350);
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
  }

  goToStep(stepNum) {
    this.currentStep = stepNum;
    document.querySelectorAll('.onboard-step-card').forEach(card => {
      card.style.display = 'none';
    });

    const activeCard = document.getElementById(`onboard-step-${stepNum}`);
    if (activeCard) {
      activeCard.style.display = 'block';
    }

    if (stepNum === 2) {
      setTimeout(() => this.goalInput?.focus(), 250);
    } else if (stepNum === 3) {
      setTimeout(() => this.whyInput?.focus(), 250);
    }
  }

  shakeInput(inputEl) {
    if (!inputEl) return;
    inputEl.style.transform = 'translateX(-6px)';
    setTimeout(() => inputEl.style.transform = 'translateX(6px)', 80);
    setTimeout(() => inputEl.style.transform = 'translateX(-4px)', 160);
    setTimeout(() => inputEl.style.transform = 'translateX(0)', 240);
    inputEl.focus();
  }

  completeOnboarding(isSkipped = false) {
    const defaultProfile = window.LumenState.getProfile();
    const name = this.nameInput?.value.trim() || defaultProfile.name || 'Gentle Soul';
    const goal = this.goalInput?.value.trim() || defaultProfile.goal || 'Quietly nurture my personal dreams';
    const why = this.whyInput?.value.trim() || defaultProfile.why || 'Because steady, peaceful growth is enough';

    window.LumenState.setProfile(name, goal, why);
    window.LumenAudio.playSuccessChime();
    this.close();

    // Trigger update in UI
    window.dispatchEvent(new CustomEvent('lumen:profile-updated', { detail: { name, goal, why } }));
  }
}

window.LumenOnboarding = new LumenOnboarding();
