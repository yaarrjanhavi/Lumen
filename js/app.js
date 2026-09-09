/**
 * Lumen: App Coordinator matching user's template
 */

class LumenApp {
  init() {
    window.LumenState;
    window.LumenAudio;
    window.LumenOnboarding?.init();
    window.LumenRitual?.init();
    window.LumenCalendar?.init();
    window.LumenJournal?.init();
    window.LumenTodo?.init();
    window.LumenPomodoro?.init();
    window.LumenGarden?.init();
    window.LumenDoubtRelease?.init();
    window.LumenAffirmation?.init();
    window.LumenVisionBoard?.init();
    window.LumenAmbient?.init();
    window.LumenCompanion?.init();

    this.renderHero();
    this.bindNavLinks();
    this.initPoppableBubbles();

    window.addEventListener('lumen:profile-updated', () => this.renderHero());
    window.addEventListener('lumen:state-changed', () => this.renderHero());
  }

  renderHero() {
    const profile = window.LumenState.getProfile();
    const heroTitle = document.getElementById('hero-title');
    const heroGoal = document.getElementById('hero-goal');
    const heroWhy = document.getElementById('hero-why');

    if (heroTitle) {
      if (profile.name && profile.name.trim()) {
        heroTitle.innerHTML = `hi ${profile.name.trim()}, here's<br>what you're growing`;
      } else {
        heroTitle.innerHTML = `welcome, here's<br>what you're growing`;
      }
    }

    if (heroGoal) {
      if (profile.goal && profile.goal.trim()) {
        heroGoal.textContent = `${profile.goal.trim()} ✿`;
      } else {
        heroGoal.textContent = `tap to set your one goal ✿`;
      }
    }

    if (heroWhy) {
      if (profile.why && profile.why.trim()) {
        heroWhy.textContent = `“${profile.why.trim()}”`;
        heroWhy.style.display = 'block';
      } else {
        heroWhy.textContent = '';
        heroWhy.style.display = 'none';
      }
    }
  }

  bindNavLinks() {
    // Smooth scrolling to exact sections
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.LumenAudio?.playPop();
          }
        }
      });
    });

    // Profile edit modal trigger
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      const profile = window.LumenState.getProfile();
      const modal = document.getElementById('goal-edit-modal');
      if (modal) {
        document.getElementById('edit-profile-name').value = profile.name || '';
        document.getElementById('edit-profile-goal').value = profile.goal || '';
        document.getElementById('edit-profile-why').value = profile.why || '';
        modal.classList.add('active');
      }
    });

    document.getElementById('hero-goal-card')?.addEventListener('click', () => {
      document.getElementById('edit-profile-btn')?.click();
    });

    document.getElementById('goal-modal-close')?.addEventListener('click', () => {
      document.getElementById('goal-edit-modal')?.classList.remove('active');
    });

    document.getElementById('goal-save-modal-btn')?.addEventListener('click', () => {
      const name = document.getElementById('edit-profile-name')?.value;
      const goal = document.getElementById('edit-profile-goal')?.value;
      const why = document.getElementById('edit-profile-why')?.value;
      window.LumenState.setProfile(name, goal, why);
      document.getElementById('goal-edit-modal')?.classList.remove('active');
      window.LumenAudio?.playSuccessChime();
    });
  }

  initPoppableBubbles() {
    document.querySelectorAll('.bubble').forEach(bubble => {
      bubble.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.popBubble(bubble);
      });
    });
  }

  popBubble(bubble) {
    if (bubble.classList.contains('popping')) return;
    bubble.classList.add('popping');
    window.LumenAudio?.playBubblePop();

    const rect = bubble.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 5; i++) {
      const spark = document.createElement('div');
      spark.className = 'bubble-spark';
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      const angle = (i / 5) * Math.PI * 2;
      const dist = 18 + Math.random() * 20;
      spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 400);
    }

    setTimeout(() => {
      bubble.classList.remove('popping');
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.LumenApp = new LumenApp();
  window.LumenApp.init();
});
