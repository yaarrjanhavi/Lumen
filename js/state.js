/**
 * Lumen: State Management
 * Persistent storage for user profile, goal, to-dos, journal, calendar, garden, and vision board.
 * Clean slate: zero mock data.
 */

const STORAGE_KEY = 'lumen_sanctuary_data_v3';

const DEFAULT_STATE = {
  profile: {
    name: '',
    goal: '',
    why: '',
    onboarded: false
  },
  todos: [],
  journal: [],
  calendarActivity: {},
  garden: [
    { id: 0, plantType: 'flower', stage: 1, lastWatered: 0 }
  ],
  visionBoard: [
    {
      id: 'vb_mock_1',
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80',
      name: 'Lotus Blossom'
    },
    {
      id: 'vb_mock_2',
      type: 'note',
      text: 'bloom at your own quiet pace ✿',
      bg: 'var(--blush)'
    },
    {
      id: 'vb_mock_3',
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
      name: 'Peaceful Horizon'
    },
    {
      id: 'vb_mock_4',
      type: 'note',
      text: 'one thing at a time is enough',
      bg: 'var(--butter)'
    },
    {
      id: 'vb_mock_5',
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop&q=80',
      name: 'Morning Pages'
    },
    {
      id: 'vb_mock_6',
      type: 'note',
      text: 'deep quiet roots · no rush',
      bg: 'var(--sky)'
    }
  ],
  settings: {
    soundEnabled: false,
    ambientSound: 'off',
    ambientVolume: 0
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
        const visionBoard = (parsed.visionBoard && parsed.visionBoard.length > 0)
          ? parsed.visionBoard
          : DEFAULT_STATE.visionBoard;
        return {
          ...DEFAULT_STATE,
          ...parsed,
          visionBoard,
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
    if (name !== undefined) this.data.profile.name = name.trim();
    if (goal !== undefined) this.data.profile.goal = goal.trim();
    if (why !== undefined) this.data.profile.why = why.trim();
    this.data.profile.onboarded = true;
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
    return {
      ...this.data.settings,
      soundEnabled: false,
      ambientSound: 'off'
    };
  }

  setSetting(key, val) {
    this.data.settings[key] = val;
    this.save();
  }
}

window.LumenState = new LumenState();
