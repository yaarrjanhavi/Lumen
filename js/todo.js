/**
 * Lumen: To-Do List matching user's template
 * Minimal circular checkboxes with "✓" checkmark and strikethrough.
 */

class LumenTodo {
  constructor() {
    this.container = null;
    this.input = null;
  }

  init() {
    this.container = document.getElementById('todo-list');
    this.input = document.getElementById('todo-input');

    this.render();
    this.bindEvents();

    window.addEventListener('lumen:state-changed', () => this.render());
  }

  bindEvents() {
    document.getElementById('todo-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input?.value.trim();
      if (text) {
        window.LumenState.addTodo(text);
        this.input.value = '';
        window.LumenAudio?.playPop();
      }
    });
  }

  render() {
    if (!this.container) return;
    const todos = window.LumenState.getTodos();
    this.container.innerHTML = '';

    if (todos.length === 0) {
      this.container.innerHTML = `
        <div style="font-size: 0.88rem; color: var(--ink-soft); opacity: 0.6; padding: 12px 0; font-style: italic;">
          no intentions yet. add one below ✿
        </div>
      `;
      return;
    }

    todos.forEach(todo => {
      const item = document.createElement('div');
      item.className = `todo-item ${todo.completed ? 'done-text' : ''}`;

      item.innerHTML = `
        <div class="todo-check ${todo.completed ? 'done' : ''}">${todo.completed ? '✓' : ''}</div>
        <span>${this.escape(todo.text)}</span>
        <button class="todo-delete" data-id="${todo.id}" title="Remove">✕</button>
      `;

      item.querySelector('.todo-check')?.addEventListener('click', () => {
        window.LumenState.toggleTodo(todo.id);
        if (!todo.completed) {
          window.LumenAudio?.playSuccessChime();
        } else {
          window.LumenAudio?.playPop();
        }
      });

      item.querySelector('.todo-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.LumenState.deleteTodo(todo.id);
        window.LumenAudio?.playPop();
      });

      this.container.appendChild(item);
    });
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.LumenTodo = new LumenTodo();
