/**
 * Lumen: Calendar Component matching the user's template
 * Mon-Sun grid with organic flower marker "✿" on active days
 */

class LumenCalendar {
  constructor() {
    this.currentDate = new Date();
    this.grid = null;
    this.monthTitle = null;
  }

  init() {
    this.grid = document.getElementById('cal-grid');
    this.monthTitle = document.getElementById('cal-month-title');

    this.bindEvents();
    this.render();

    window.addEventListener('lumen:state-changed', () => this.render());
  }

  bindEvents() {
    document.getElementById('cal-prev')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
      window.LumenAudio?.playPop();
    });

    document.getElementById('cal-next')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
      window.LumenAudio?.playPop();
    });
  }

  render() {
    if (!this.grid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    if (this.monthTitle) {
      this.monthTitle.textContent = `${monthNames[month]} ${year}`;
    }

    this.grid.innerHTML = '';

    // Day initials (Monday to Sunday)
    const daysHeader = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    daysHeader.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-day-label';
      el.textContent = d;
      this.grid.appendChild(el);
    });

    // Compute dates
    let firstDayIndex = new Date(year, month, 1).getDay();
    // Adjust for Monday start (0=Sun -> 6, 1=Mon -> 0, etc.)
    firstDayIndex = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      this.grid.appendChild(empty);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = day;

      const activities = window.LumenState.getActivityForDate(dayStr);
      // Mark day only if user has actual activity logged
      if (activities.length > 0) {
        cell.classList.add('marked');
      }

      cell.addEventListener('click', () => {
        window.LumenAudio?.playPop();
        this.showDayNote(dayStr, day, monthNames[month]);
      });

      this.grid.appendChild(cell);
    }
  }

  showDayNote(dateStr, day, monthName) {
    const modal = document.getElementById('calendar-day-modal');
    if (!modal) return;

    document.getElementById('cal-summary-date').textContent = `${monthName} ${day}`;
    const entries = window.LumenState.getJournalEntries().filter(e => e.date === dateStr);
    const content = document.getElementById('cal-summary-content');

    if (entries.length > 0) {
      content.innerHTML = `<p style="font-family: var(--font-display); font-size: 1.3rem; color: var(--ink-soft);">“${entries[0].text}”</p>`;
    } else {
      content.innerHTML = `<p style="font-size: 0.9rem; color: var(--ink-soft);">A quiet day held gently on your path ✿</p>`;
    }

    modal.classList.add('active');
  }
}

window.LumenCalendar = new LumenCalendar();
