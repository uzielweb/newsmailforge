/**
 * NewsMailForge - HeaderBar
 * Barra superior do Studio: Identidade, Seletor de Presets, Histórico Undo/Redo,
 * Viewport Desktop/Mobile, Seletor de Idioma, Modal Preview Code, Import/Export e Salvar.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { BuiltinPresets, PRESETS } from '../catalog/BuiltinPresets.js';
import { EmailCompiler } from '../core/EmailCompiler.js';
import { BlockFactory } from '../core/BlockFactory.js';

export class HeaderBar {
  /**
   * @param {Object} store - Instância reativa do Store
   * @param {Object} [config] - Configurações opcionais da aplicação
   */
  constructor(store, config = {}) {
    this.store = store;
    this.config = config || {};
    this.element = null;
    this.modalEl = null;
    this.activeCodeTab = 'html'; // 'html' | 'json'

    this._init();
  }

  /**
   * Inicializa e monta a barra
   * @private
   */
  _init() {
    this.element = document.createElement('header');
    this.element.className = 'nmf-header';

    this._render();
    this._attachGlobalShortcuts();

    // Re-renderiza quando o estado do histórico ou viewport mudar
    this.store.subscribe((state) => {
      this._updateButtonsState(state);
    });

    // Re-renderiza textos se o idioma alternar
    I18n.onLocaleChange(() => {
      this._render();
    });
  }

  /**
   * Renderiza os blocos da Topbar
   * @private
   */
  _render() {
    this.element.innerHTML = '';

    // Lado Esquerdo: Identidade + Seletor de Presets
    const left = document.createElement('div');
    left.className = 'nmf-header-left';

    const brand = document.createElement('div');
    brand.className = 'nmf-brand';
    brand.innerHTML = `
      <div class="nmf-brand-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </div>
      <span>${I18n.t('ui.app_name', 'NewsMailForge')}</span>
      <span class="nmf-brand-badge">v1.0</span>
    `;

    // Seletor de Presets
    const presetSelect = document.createElement('select');
    presetSelect.className = 'nmf-select';
    presetSelect.title = I18n.t('ui.presets', 'Modelos Prontos');

    const optPlaceholder = document.createElement('option');
    optPlaceholder.value = '';
    optPlaceholder.textContent = `-- ${I18n.t('ui.presets', 'Modelos Prontos')} --`;
    presetSelect.appendChild(optPlaceholder);

    BuiltinPresets.getAll().forEach((preset) => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name || preset.id;
      presetSelect.appendChild(opt);
    });

    const optNew = document.createElement('option');
    optNew.value = '__new__';
    optNew.textContent = `+ ${I18n.t('ui.new_template', 'Novo Modelo')}`;
    presetSelect.appendChild(optNew);

    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      if (!val) return;

      if (val === '__new__') {
        const confirmMsg = I18n.t('ui.confirm_new_template', 'Deseja iniciar um novo modelo? Alterações não salvas serão perdidas.');
        if (window.confirm(confirmMsg)) {
          const newDoc = BlockFactory.createDocument();
          this.store.setDocument(newDoc, true);
        }
      } else {
        const confirmMsg = I18n.t('ui.confirm_new_template', 'Deseja carregar este modelo? Alterações não salvas serão perdidas.');
        if (window.confirm(confirmMsg)) {
          const newDoc = BuiltinPresets.createPreset(val);
          if (newDoc) {
            this.store.setDocument(newDoc, true);
          }
        }
      }
      presetSelect.value = '';
    });

    left.appendChild(brand);
    left.appendChild(presetSelect);

    // Centro: Histórico (Undo/Redo) + Viewport Toggle (Desktop/Mobile)
    const center = document.createElement('div');
    center.className = 'nmf-header-center';

    // Botões Undo / Redo
    const btnUndo = document.createElement('button');
    btnUndo.type = 'button';
    btnUndo.className = 'nmf-btn nmf-btn-icon';
    btnUndo.title = I18n.t('ui.undo', 'Desfazer (Ctrl+Z)');
    btnUndo.disabled = !this.store.getState().canUndo;
    btnUndo.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
      </svg>
    `;
    btnUndo.addEventListener('click', () => this.store.undo());

    const btnRedo = document.createElement('button');
    btnRedo.type = 'button';
    btnRedo.className = 'nmf-btn nmf-btn-icon';
    btnRedo.title = I18n.t('ui.redo', 'Refazer (Ctrl+Y)');
    btnRedo.disabled = !this.store.getState().canRedo;
    btnRedo.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
    `;
    btnRedo.addEventListener('click', () => this.store.redo());

    this.btnUndo = btnUndo;
    this.btnRedo = btnRedo;

    center.appendChild(btnUndo);
    center.appendChild(btnRedo);

    const div1 = document.createElement('div');
    div1.className = 'nmf-divider-v';
    center.appendChild(div1);

    // Segmented Viewport Switcher
    const viewportGroup = document.createElement('div');
    viewportGroup.className = 'nmf-btn-group';

    const currentVp = this.store.getState().viewport;

    const btnDesktop = document.createElement('button');
    btnDesktop.type = 'button';
    btnDesktop.className = `nmf-btn-segment ${currentVp === 'desktop' ? 'is-active' : ''}`;
    btnDesktop.title = I18n.t('ui.desktop', 'Desktop (600px)');
    btnDesktop.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
      <span>600px</span>
    `;
    btnDesktop.addEventListener('click', () => {
      this.store.setViewport('desktop');
    });

    const btnMobile = document.createElement('button');
    btnMobile.type = 'button';
    btnMobile.className = `nmf-btn-segment ${currentVp === 'mobile' ? 'is-active' : ''}`;
    btnMobile.title = I18n.t('ui.mobile', 'Mobile (375px)');
    btnMobile.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
      <span>375px</span>
    `;
    btnMobile.addEventListener('click', () => {
      this.store.setViewport('mobile');
    });

    this.btnDesktop = btnDesktop;
    this.btnMobile = btnMobile;

    viewportGroup.appendChild(btnDesktop);
    viewportGroup.appendChild(btnMobile);
    center.appendChild(viewportGroup);

    // Lado Direito: Idioma + Preview Code + Export/Import + Salvar
    const right = document.createElement('div');
    right.className = 'nmf-header-right';

    // Seletor de Idioma
    const langSelect = document.createElement('select');
    langSelect.className = 'nmf-select';
    langSelect.style.paddingRight = '24px';
    langSelect.title = I18n.t('ui.language', 'Idioma');
    langSelect.innerHTML = `
      <option value="pt-BR" ${I18n.getLocale() === 'pt-BR' ? 'selected' : ''}>PT-BR</option>
      <option value="en-GB" ${I18n.getLocale() === 'en-GB' ? 'selected' : ''}>EN-GB</option>
    `;
    langSelect.addEventListener('change', () => {
      I18n.setLocale(langSelect.value);
    });
    right.appendChild(langSelect);

    // Botão Preview Code (Abre modal)
    const btnPreview = document.createElement('button');
    btnPreview.type = 'button';
    btnPreview.className = 'nmf-btn';
    btnPreview.title = I18n.t('ui.preview_code', 'Ver Código');
    btnPreview.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      <span>${I18n.t('ui.preview_code', 'Ver Código')}</span>
    `;
    btnPreview.addEventListener('click', () => {
      this._openCodeModal();
    });
    right.appendChild(btnPreview);

    // Menu Mais Opções (Download HTML, Download JSON, Importar JSON)
    const btnMore = document.createElement('button');
    btnMore.type = 'button';
    btnMore.className = 'nmf-btn nmf-btn-icon';
    btnMore.title = I18n.t('ui.export_html', 'Exportar / Importar');
    btnMore.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="12" cy="5" r="1"></circle>
        <circle cx="12" cy="19" r="1"></circle>
      </svg>
    `;

    // Dropdown flutuante para Mais Opções
    btnMore.addEventListener('click', (e) => {
      e.stopPropagation();
      this._openExportMenu(btnMore);
    });
    right.appendChild(btnMore);

    // Botão Salvar Primário
    const btnSave = document.createElement('button');
    btnSave.type = 'button';
    btnSave.className = 'nmf-btn nmf-btn-primary';
    btnSave.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      <span>${I18n.t('ui.save', 'Salvar')}</span>
    `;
    btnSave.addEventListener('click', () => {
      this.triggerSave();
    });
    right.appendChild(btnSave);

    this.element.appendChild(left);
    this.element.appendChild(center);
    this.element.appendChild(right);
  }

  /**
   * Atualiza os estados ativos dos botões
   * @private
   */
  _updateButtonsState(state) {
    if (this.btnUndo) this.btnUndo.disabled = !state.canUndo;
    if (this.btnRedo) this.btnRedo.disabled = !state.canRedo;

    if (this.btnDesktop && this.btnMobile) {
      if (state.viewport === 'desktop') {
        this.btnDesktop.classList.add('is-active');
        this.btnMobile.classList.remove('is-active');
      } else {
        this.btnDesktop.classList.remove('is-active');
        this.btnMobile.classList.add('is-active');
      }
    }
  }

  /**
   * Registra atalhos globais de teclado (Ctrl+Z, Ctrl+Y, Ctrl+S)
   * @private
   */
  _attachGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z (sem shift)
      if (key === 'z' && !e.shiftKey) {
        // Evita interferir com inputs de texto nativos se eles estiverem focados
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          this.store.undo();
        }
      }
      // Redo: Ctrl+Y ou Ctrl+Shift+Z
      else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          this.store.redo();
        }
      }
      // Save: Ctrl+S
      else if (key === 's') {
        e.preventDefault();
        this.triggerSave();
      }
    });
  }

  /**
   * Abre menu flutuante de Exportação e Importação
   * @private
   */
  _openExportMenu(anchorEl) {
    const existing = document.querySelector('.nmf-export-menu');
    if (existing) {
      existing.remove();
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'nmf-insert-popover nmf-export-menu';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    // Item: Baixar HTML
    const itemHtml = document.createElement('button');
    itemHtml.type = 'button';
    itemHtml.className = 'nmf-popover-item';
    itemHtml.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>${I18n.t('ui.download_html', 'Baixar HTML (.html)')}</span>
    `;
    itemHtml.addEventListener('click', () => {
      this._downloadHtml();
      menu.remove();
    });

    // Item: Baixar JSON
    const itemJson = document.createElement('button');
    itemJson.type = 'button';
    itemJson.className = 'nmf-popover-item';
    itemJson.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>${I18n.t('ui.download_json', 'Baixar JSON (.json)')}</span>
    `;
    itemJson.addEventListener('click', () => {
      this._downloadJson();
      menu.remove();
    });

    // Item: Importar JSON
    const itemImport = document.createElement('button');
    itemImport.type = 'button';
    itemImport.className = 'nmf-popover-item';
    itemImport.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
      <span>${I18n.t('ui.import_json', 'Importar JSON (.json)')}</span>
    `;
    itemImport.addEventListener('click', () => {
      this._importJsonPrompt();
      menu.remove();
    });

    menu.appendChild(itemHtml);
    menu.appendChild(itemJson);
    menu.appendChild(itemImport);

    document.body.appendChild(menu);

    const closeHandler = (e) => {
      if (!menu.contains(e.target) && e.target !== anchorEl) {
        menu.remove();
        window.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => window.addEventListener('click', closeHandler), 10);
  }

  /**
   * Dispara o download do arquivo HTML compilado
   * @private
   */
  _downloadHtml() {
    const doc = this.store.getDocument();
    const html = EmailCompiler.compile(doc, { previewMode: false });
    const filename = `${(doc.title || 'email-template').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Dispara o download da árvore JSON
   * @private
   */
  _downloadJson() {
    const doc = this.store.getDocument();
    const jsonStr = JSON.stringify(doc, null, 2);
    const filename = `${(doc.title || 'email-template').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Abre o file picker para carregar um JSON
   * @private
   */
  _importJsonPrompt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error(I18n.t('bridge.error.invalid_json', 'JSON inválido'));
          }

          const mode = window.confirm(
            I18n.t('ui.import_prompt', 'Como deseja importar o JSON selecionado?') + '\n\n' +
            '[OK] = ' + I18n.t('ui.import_replace', 'Substituir modelo atual') + '\n' +
            '[Cancelar] = ' + I18n.t('ui.import_append', 'Anexar blocos ao final')
          );

          if (mode) {
            this.store.setDocument(parsed, true);
          } else {
            this.store.appendDocument(parsed);
          }
          this._showToast(I18n.t('bridge.success.load', 'Documento carregado com sucesso.'), 'success');
        } catch (err) {
          window.alert(I18n.t('bridge.error.invalid_json', 'Erro ao ler arquivo JSON: ') + err.message);
        }
      };
      reader.readAsText(file);
    });

    input.click();
  }

  /**
   * Modal de visualização de código compilado e schema
   * @private
   */
  _openCodeModal() {
    if (this.modalEl) {
      this.modalEl.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'nmf-modal-backdrop is-open';

    const modal = document.createElement('div');
    modal.className = 'nmf-modal';

    const header = document.createElement('div');
    header.className = 'nmf-modal-header';
    header.innerHTML = `
      <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${I18n.t('ui.code_modal_title', 'Código do E-mail')}</div>
      <div class="nmf-btn-group">
        <button type="button" class="nmf-btn-segment ${this.activeCodeTab === 'html' ? 'is-active' : ''}" data-tab="html">${I18n.t('ui.tab_html', 'HTML Compilado')}</button>
        <button type="button" class="nmf-btn-segment ${this.activeCodeTab === 'json' ? 'is-active' : ''}" data-tab="json">${I18n.t('ui.tab_json', 'JSON Schema')}</button>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'nmf-modal-body';

    const codeViewer = document.createElement('pre');
    codeViewer.className = 'nmf-code-viewer';

    const doc = this.store.getDocument();
    const compiledHtml = EmailCompiler.compile(doc, { previewMode: false });
    const schemaJson = JSON.stringify(doc, null, 2);

    const updateViewer = () => {
      codeViewer.textContent = this.activeCodeTab === 'html' ? compiledHtml : schemaJson;
    };
    updateViewer();

    body.appendChild(codeViewer);

    // Tab buttons event
    const tabBtns = header.querySelectorAll('.nmf-btn-segment');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.activeCodeTab = btn.getAttribute('data-tab');
        updateViewer();
      });
    });

    const footer = document.createElement('div');
    footer.className = 'nmf-modal-footer';

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'nmf-btn nmf-btn-primary';
    btnCopy.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>${I18n.t('ui.copy', 'Copiar Código')}</span>
    `;
    btnCopy.addEventListener('click', () => {
      const textToCopy = this.activeCodeTab === 'html' ? compiledHtml : schemaJson;
      navigator.clipboard.writeText(textToCopy).then(() => {
        btnCopy.innerHTML = `<span>${I18n.t('ui.copied', 'Copiado com sucesso!')}</span>`;
        setTimeout(() => {
          btnCopy.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>${I18n.t('ui.copy', 'Copiar Código')}</span>
          `;
        }, 2000);
      });
    });

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'nmf-btn';
    btnClose.textContent = I18n.t('ui.close', 'Fechar');
    btnClose.addEventListener('click', () => backdrop.remove());

    footer.appendChild(btnCopy);
    footer.appendChild(btnClose);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    backdrop.appendChild(modal);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  /**
   * Aciona salvamento do documento
   * Sincroniza inputs vinculados, chama endpoint PHP Bridge se configurado
   * ou persiste em LocalStorage como fallback.
   */
  async triggerSave() {
    const doc = this.store.getDocument();
    const compiledHtml = EmailCompiler.compile(doc, { previewMode: false });
    const schemaJson = JSON.stringify(doc);

    // 1. Sincroniza campos do formulário hospedeiro se declarados
    if (this.config.bindHtmlInput) {
      const el = typeof this.config.bindHtmlInput === 'string'
        ? document.querySelector(this.config.bindHtmlInput)
        : this.config.bindHtmlInput;
      if (el) el.value = compiledHtml;
    }

    if (this.config.bindJsonInput) {
      const el = typeof this.config.bindJsonInput === 'string'
        ? document.querySelector(this.config.bindJsonInput)
        : this.config.bindJsonInput;
      if (el) el.value = schemaJson;
    }

    // 2. Callback customizado do usuário
    if (typeof this.config.onSave === 'function') {
      try {
        await this.config.onSave({ doc, compiledHtml, schemaJson });
        this._showToast(I18n.t('bridge.success.save', 'Documento salvo com sucesso.'), 'success');
        return;
      } catch (err) {
        this._showToast(I18n.t('bridge.error.storage_failure', 'Erro ao salvar: ') + err.message, 'error');
        return;
      }
    }

    // 3. Endpoint PHP Bridge via AJAX/Fetch
    if (this.config.saveEndpoint) {
      try {
        const res = await fetch(this.config.saveEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save',
            id: doc.id,
            title: doc.title,
            compiledHtml,
            schemaJson: doc
          })
        });
        const data = await res.json();
        if (data && data.success) {
          this._showToast(data.message || I18n.t('bridge.success.save', 'Documento salvo com sucesso.'), 'success');
        } else {
          throw new Error((data && data.error) || 'Erro desconhecido');
        }
      } catch (err) {
        this._showToast(I18n.t('bridge.error.storage_failure', 'Falha ao salvar no servidor: ') + err.message, 'error');
      }
      return;
    }

    // 4. Fallback LocalStorage seguro
    try {
      localStorage.setItem('newsmailforge_saved_doc', schemaJson);
      localStorage.setItem('newsmailforge_saved_html', compiledHtml);
      this._showToast(I18n.t('bridge.success.save', 'Documento salvo com sucesso.') + ' (Local)', 'success');
    } catch (e) {
      this._showToast(I18n.t('bridge.error.storage_failure', 'Erro ao salvar localmente.'), 'error');
    }
  }

  /**
   * Exibe toast temporário de notificação
   * @private
   */
  _showToast(msg, type = 'success') {
    const existing = document.querySelector('.nmf-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `nmf-toast is-open is-${type}`;
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${msg}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('is-open');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Monta o elemento dentro do container
   * @param {HTMLElement} parent
   */
  mount(parent) {
    if (parent && parent.appendChild) {
      parent.appendChild(this.element);
    }
    return this;
  }
}

export default HeaderBar;
