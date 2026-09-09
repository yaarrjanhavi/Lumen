/**
 * Lumen — Vision Board with Drag & Drop Images & Aesthetic Notes
 * Allows dropping images directly from desktop/files or typing notes.
 */

class LumenVisionBoard {
  constructor() {
    this.container = null;
    this.fileInput = null;
  }

  init() {
    this.container = document.getElementById('vision-board-grid');
    this.fileInput = document.getElementById('vb-file-input');

    this.bindEvents();
    this.render();

    window.addEventListener('lumen:state-changed', () => this.render());
  }

  bindEvents() {
    if (!this.container) return;

    // Drag & Drop events on the vision board container
    ['dragenter', 'dragover'].forEach(eventName => {
      this.container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.remove('drag-over');
      }, false);
    });

    this.container.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.handleFiles(files);
      }
    });

    // File input fallback click
    this.fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFiles(e.target.files);
        e.target.value = '';
      }
    });

    // Add note modal trigger
    document.getElementById('vb-add-note-btn')?.addEventListener('click', () => {
      document.getElementById('vision-add-modal')?.classList.add('active');
    });

    document.getElementById('vision-modal-close')?.addEventListener('click', () => {
      document.getElementById('vision-add-modal')?.classList.remove('active');
    });

    document.getElementById('vision-save-btn')?.addEventListener('click', () => {
      const text = document.getElementById('vision-note-text')?.value.trim();
      const color = document.getElementById('vision-note-color')?.value || 'var(--cream)';
      if (text) {
        window.LumenState.addVisionItem({
          type: 'note',
          text: text,
          bg: color
        });
        document.getElementById('vision-note-text').value = '';
        document.getElementById('vision-add-modal')?.classList.remove('active');
        window.LumenAudio?.playPop();
      }
    });
  }

  handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          window.LumenState.addVisionItem({
            type: 'image',
            imageUrl: base64,
            name: file.name
          });
          window.LumenAudio?.playBubblePop();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  render() {
    if (!this.container) return;
    const items = window.LumenState.getVisionBoard();
    this.container.innerHTML = '';

    items.forEach((item, index) => {
      const el = document.createElement('div');
      const classPreset = `vb${(index % 6) + 1}`;
      el.className = `vb-item ${classPreset}`;

      if (item.type === 'image' && item.imageUrl) {
        el.style.backgroundImage = `url(${item.imageUrl})`;
        el.innerHTML = `
          <button class="vb-delete-btn" data-id="${item.id}" title="Remove image">✕</button>
        `;
      } else {
        if (item.bg) el.style.background = item.bg;
        el.innerHTML = `
          <span>${item.text || '✿'}</span>
          <button class="vb-delete-btn" data-id="${item.id}" title="Remove note">✕</button>
        `;
      }

      el.querySelector('.vb-delete-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.LumenState.deleteVisionItem(item.id);
        window.LumenAudio?.playPop();
      });

      this.container.appendChild(el);
    });

    // Add Dropzone / Upload Placeholder Card
    const addCard = document.createElement('div');
    addCard.className = 'vb-item vb-add-card';
    addCard.title = 'Drag & drop image here, or click to upload';
    addCard.innerHTML = `
      <span style="font-size: 1.5rem; color: var(--sage); line-height: 1;">+</span>
      <span style="font-size: 0.8rem; color: var(--ink-soft);">drop image here</span>
    `;
    addCard.addEventListener('click', () => {
      this.fileInput?.click();
    });
    this.container.appendChild(addCard);
  }
}

window.LumenVisionBoard = new LumenVisionBoard();
