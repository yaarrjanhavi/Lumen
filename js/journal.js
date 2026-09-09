/**
 * Lumen: Journal Component matching the user's template
 * Minimal dashed handwritten lines with opt-in prompt
 */

const PROMPT_ROTATION = [
  "✿ what are you grateful for today?",
  "✿ what is one doubt you're letting go of?",
  "✿ what felt quiet and slow in a good way?",
  "✿ how did you honor your one goal today?",
  "✿ tap to write a new reflection"
];

class LumenJournal {
  constructor() {
    this.linesContainer = null;
    this.promptEl = null;
    this.promptIndex = 0;
  }

  init() {
    this.linesContainer = document.getElementById('journal-lines-list');
    this.promptEl = document.getElementById('journal-prompt-btn');

    this.render();
    this.bindEvents();

    window.addEventListener('lumen:state-changed', () => this.render());
  }

  bindEvents() {
    this.promptEl?.addEventListener('click', () => {
      this.promptIndex = (this.promptIndex + 1) % PROMPT_ROTATION.length;
      if (this.promptEl) this.promptEl.textContent = PROMPT_ROTATION[this.promptIndex];
      window.LumenAudio?.playPop();

      const inputDrawer = document.getElementById('journal-input-drawer');
      if (inputDrawer) {
        inputDrawer.style.display = inputDrawer.style.display === 'none' ? 'flex' : 'none';
        if (inputDrawer.style.display === 'flex') {
          document.getElementById('journal-quick-input')?.focus();
        }
      }
    });

    document.getElementById('journal-quick-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('journal-quick-input');
      const text = input?.value.trim();
      if (text) {
        window.LumenState.addJournalEntry(text, PROMPT_ROTATION[this.promptIndex]);
        input.value = '';
        window.LumenAudio?.playSuccessChime();
        document.getElementById('journal-input-drawer').style.display = 'none';
      }
    });
  }

  render() {
    if (!this.linesContainer) return;
    const entries = window.LumenState.getJournalEntries();
    this.linesContainer.innerHTML = '';

    if (entries.length === 0) {
      this.linesContainer.innerHTML = `
        <p style="opacity: 0.45; font-style: italic; border-bottom: 1px dashed rgba(74, 66, 55, 0.15);">a clean page... tap below to write your first reflection</p>
      `;
      return;
    }

    entries.slice(0, 3).forEach(entry => {
      const p = document.createElement('p');
      p.textContent = entry.text;
      p.title = entry.date;
      this.linesContainer.appendChild(p);
    });
  }
}

window.LumenJournal = new LumenJournal();
