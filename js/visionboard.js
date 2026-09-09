/**
 * Lumen: Vision Board with Drag & Drop Images & Pastel Text Cards
 * Allows dropping images directly from desktop/files or pinning custom pastel text cards.
 */

class LumenVisionBoard {
  constructor() {
    this.container = null;
    this.fileInput = null;
    this.selectedColor = '#F5D9E6';
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

    this.fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFiles(e.target.files);
        e.target.value = '';
      }
    });

    // Top action buttons
    document.getElementById('vb-upload-img-btn')?.addEventListener('click', () => {
      this.fileInput?.click();
    });

    const modal = document.getElementById('vision-add-modal');
    const noteInput = document.getElementById('vision-note-text');
    const preview = document.getElementById('vision-text-preview');
    const previewText = document.getElementById('vision-preview-text');

    const openModal = () => {
      if (modal) {
        modal.classList.add('active');
        if (noteInput) {
          noteInput.value = '';
          noteInput.focus();
        }
        if (previewText) {
          previewText.textContent = 'your intention here ✿';
        }
        if (preview) {
          preview.style.background = this.selectedColor;
        }
      }
    };

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
    };

    document.getElementById('vb-add-note-btn')?.addEventListener('click', openModal);
    document.getElementById('vision-modal-close')?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Pastel swatches selection
    const swatchBtns = document.querySelectorAll('#pastel-palette .swatch-btn');
    swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        swatchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedColor = btn.dataset.color || '#F5D9E6';
        if (preview) {
          preview.style.background = this.selectedColor;
        }
        window.LumenAudio?.playPop();
      });
    });

    // Live typing preview
    noteInput?.addEventListener('input', (e) => {
      if (previewText) {
        previewText.textContent = e.target.value.trim() || 'your intention here ✿';
      }
    });

    // Save note
    document.getElementById('vision-save-btn')?.addEventListener('click', () => {
      const text = noteInput?.value.trim();
      if (text) {
        window.LumenState.addVisionItem({
          type: 'note',
          text: text,
          bg: this.selectedColor || '#F5D9E6'
        });
        if (noteInput) noteInput.value = '';
        if (previewText) previewText.textContent = 'your intention here ✿';
        closeModal();
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

    // 1. Add Image Card ("drop image")
    const addImageCard = document.createElement('div');
    addImageCard.className = 'vb-item vb-add-card';
    addImageCard.title = 'Drag & drop image here, or click to upload';
    addImageCard.innerHTML = `
      <span style="font-size: 1.6rem; color: var(--sage); line-height: 1;">+</span>
      <span style="font-size: 0.82rem; color: var(--ink-soft); font-weight: 600;">drop image</span>
    `;
    addImageCard.addEventListener('click', () => {
      this.fileInput?.click();
    });
    this.container.appendChild(addImageCard);

    // 2. Add Text Card ("add text")
    const addTextCard = document.createElement('div');
    addTextCard.className = 'vb-item vb-add-card vb-add-text-card';
    addTextCard.title = 'Pin a pastel text card or intention';
    addTextCard.innerHTML = `
      <span style="font-size: 1.5rem; color: #E28CA5; line-height: 1;">✍</span>
      <span style="font-size: 0.82rem; color: var(--ink-soft); font-weight: 600;">add text</span>
    `;
    addTextCard.addEventListener('click', () => {
      const modal = document.getElementById('vision-add-modal');
      const noteInput = document.getElementById('vision-note-text');
      const previewText = document.getElementById('vision-preview-text');
      const preview = document.getElementById('vision-text-preview');
      if (modal) {
        modal.classList.add('active');
        if (noteInput) {
          noteInput.value = '';
          noteInput.focus();
        }
        if (previewText) previewText.textContent = 'your intention here ✿';
        if (preview) preview.style.background = this.selectedColor;
      }
    });
    this.container.appendChild(addTextCard);
  }
}

window.LumenVisionBoard = new LumenVisionBoard();
