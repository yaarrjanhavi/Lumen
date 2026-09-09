/**
 * Lumen — State Management
 * Persistent storage for user profile, goal, to-dos, journal, calendar, garden, and vision board.
 */

const STORAGE_KEY = 'lumen_sanctuary_data_v2';

const DEFAULT_STATE = {
  profile: {
    name: 'love',
    goal: 'finishing what I started',
    why: 'because quiet, steady steps honor my peace',
    onboarded: true
  },
  todos: [
    { id: '1', text: 'morning pages', completed: true, date: new Date().toISOString().slice(0, 10) },
    { id: '2', text: 'water the garden', completed: true, date: new Date().toISOString().slice(0, 10) },
    { id: '3', text: 'one focused hour', completed: false, date: new Date().toISOString().slice(0, 10) },
    { id: '4', text: 'evening gratitude', completed: false, date: new Date().toISOString().slice(0, 10) }
  ],
  journal: [
    {
      id: 'j1',
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now() - 3600000 * 4,
      text: 'today felt slow, in a good way.'
    },
    {
      id: 'j2',
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now() - 3600000 * 24,
      text: 'grateful for the quiet mornings.'
    },
    {
      id: 'j3',
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now() - 3600000 * 48,
      text: 'still focused on the one thing.'
    }
  ],
  calendarActivity: {
    [new Date().toISOString().slice(0, 10)]: ['flower']
  },
  garden: [
    { id: 0, plantType: 'flower', stage: 2, lastWatered: Date.now() }
  ],
  visionBoard: [
    { id: 'v1', type: 'note', text: 'soft mornings', bg: 'var(--sky)' },
    { id: 'v2', type: 'note', text: '✿', bg: 'var(--blush)' },
    { id: 'v3', type: 'note', text: 'finish the thing', bg: 'var(--sage)' },
    { id: 'v4', type: 'note', text: 'quiet roots', bg: 'var(--butter)' },
    { id: 'v5', type: 'note', text: 'stay rooted', bg: 'var(--cream)' },
    { id: 'v6', type: 'note', text: 'stillness', bg: 'var(--sky)' }
  ],
  settings: {
    soundEnabled: true,
    ambientSound: 'off',
    ambientVolume: 0.25
  }
};

class LumenState {
  constructor() {
    this.data = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('lumen:state-changed', { detail: this.data }));
    } catch (e) {
      console.warn('Failed saving state to localStorage', e);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  setProfile(name, goal, why) {
    if (name) this.data.profile.name = name.trim();
    if (goal) this.data.profile.goal = goal.trim();
    if (why !== undefined) this.data.profile.why = why.trim();
    this.save();
  }

  getTodos() {
    return this.data.todos;
  }

  addTodo(text) {
    if (!text || !text.trim()) return;
    const item = {
      id: 't_' + Date.now(),
      text: text.trim(),
      completed: false,
      date: new Date().toISOString().slice(0, 10)
    };
    this.data.todos.push(item);
    this.recordActivity('flower');
    this.save();
    return item;
  }

  toggleTodo(id) {
    const item = this.data.todos.find(t => t.id === id);
    if (item) {
      item.completed = !item.completed;
      if (item.completed) this.recordActivity('flower');
      this.save();
    }
    return item;
  }

  deleteTodo(id) {
    this.data.todos = this.data.todos.filter(t => t.id !== id);
    this.save();
  }

  getJournalEntries() {
    return this.data.journal.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  addJournalEntry(text, prompt = '') {
    if (!text || !text.trim()) return;
    const entry = {
      id: 'j_' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      prompt: prompt,
      text: text.trim()
    };
    this.data.journal.unshift(entry);
    this.recordActivity('flower');
    this.save();
    return entry;
  }

  recordActivity(type = 'flower') {
    const today = new Date().toISOString().slice(0, 10);
    if (!this.data.calendarActivity[today]) {
      this.data.calendarActivity[today] = [];
    }
    if (!this.data.calendarActivity[today].includes(type)) {
      this.data.calendarActivity[today].push(type);
    }
    this.save();
  }

  getActivityForDate(dateStr) {
    return this.data.calendarActivity[dateStr] || [];
  }

  getGarden() {
    return this.data.garden;
  }

  waterPlot(id = 0) {
    if (this.data.garden[id]) {
      this.data.garden[id].stage = ((this.data.garden[id].stage || 1) % 4) + 1;
      this.data.garden[id].lastWatered = Date.now();
      this.recordActivity('flower');
      this.save();
    }
  }

  getVisionBoard() {
    return this.data.visionBoard;
  }

  addVisionItem(item) {
    this.data.visionBoard.push({
      id: 'vb_' + Date.now(),
      ...item
    });
    this.save();
  }

  deleteVisionItem(id) {
    this.data.visionBoard = this.data.visionBoard.filter(v => v.id !== id);
    this.save();
  }

  getSettings() {
    return this.data.settings;
  }

  setSetting(key, val) {
    this.data.settings[key] = val;
    this.save();
  }
}

window.LumenState = new LumenState();
