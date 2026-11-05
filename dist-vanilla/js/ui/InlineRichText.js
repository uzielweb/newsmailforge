/**
 * NewsMailForge - InlineRichText
 * Edição de texto e botões in-place (contenteditable) com barra de formatação flutuante
 * (Fonte, Tamanho, Negrito, Itálico, Sublinhado, Tachado, Cor, Alinhamento e Link).
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';

export class InlineRichText {
  constructor() {
    this.activeEl = null;
    this.activeNode = null;
    this.onUpdateCallback = null;
    this.toolbarEl = null;
    this.isActive = false;

    this._createToolbar();
  }

  /**
   * Cria a barra de formatação flutuante
   * @private
   */
  _createToolbar() {
    const tb = document.createElement('div');
    tb.className = 'nmf-inline-toolbar';

    // Negrito
    const btnBold = this._createBtn('bold', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
    `, I18n.t('rt.bold', 'Negrito'), () => document.execCommand('bold', false));

    // Itálico
    const btnItalic = this._createBtn('italic', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
    `, I18n.t('rt.italic', 'Itálico'), () => document.execCommand('italic', false));

    // Sublinhado
    const btnUnderline = this._createBtn('underline', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
    `, I18n.t('rt.underline', 'Sublinhado'), () => document.execCommand('underline', false));

    // Tachado
    const btnStrike = this._createBtn('strike', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 4H9a3 3 0 0 0-2.83 4"></path><path d="M14 12a4 4 0 0 1 0 8H6"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>
    `, I18n.t('rt.strike', 'Tachado'), () => document.execCommand('strikeThrough', false));

    // Alinhamentos
    const btnLeft = this._createBtn('align-left', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
    `, I18n.t('rt.align_left', 'Esquerda'), () => document.execCommand('justifyLeft', false));

    const btnCenter = this._createBtn('align-center', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
    `, I18n.t('rt.align_center', 'Centro'), () => document.execCommand('justifyCenter', false));

    const btnRight = this._createBtn('align-right', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
    `, I18n.t('rt.align_right', 'Direita'), () => document.execCommand('justifyRight', false));

    // Cor do Texto
    const colorWrap = document.createElement('div');
    colorWrap.className = 'nmf-inline-btn';
    colorWrap.style.position = 'relative';
    colorWrap.title = I18n.t('rt.color', 'Cor do Texto');
    colorWrap.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"></path></svg>
      <input type="color" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;" />
    `;
    const colorInput = colorWrap.querySelector('input');
    colorInput.addEventListener('input', () => {
      document.execCommand('foreColor', false, colorInput.value);
    });

    // Inserir Link
    const btnLink = this._createBtn('link', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
    `, I18n.t('rt.link', 'Inserir Link'), () => {
      const url = window.prompt(I18n.t('rt.link_prompt', 'Informe a URL do link:'), 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    });

    tb.appendChild(btnBold);
    tb.appendChild(btnItalic);
    tb.appendChild(btnUnderline);
    tb.appendChild(btnStrike);

    const div = document.createElement('div');
    div.className = 'nmf-divider-v';
    tb.appendChild(div);

    tb.appendChild(btnLeft);
    tb.appendChild(btnCenter);
    tb.appendChild(btnRight);
    tb.appendChild(colorWrap);
    tb.appendChild(btnLink);

    document.body.appendChild(tb);
    this.toolbarEl = tb;

    // Evita perda de foco no contenteditable ao clicar na toolbar
    tb.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Helper para criar botões de ação na toolbar
   * @private
   */
  _createBtn(action, svgHtml, title, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nmf-inline-btn';
    btn.title = title;
    btn.innerHTML = svgHtml;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  }

  /**
   * Ativa a edição inline no elemento alvo
   * @param {HTMLElement} targetEl - Elemento DOM dentro do canvas
   * @param {Object} atomNode - Nó do Store
   * @param {Function} onUpdate - Callback (newValue) => void
   */
  activate(targetEl, atomNode, onUpdate) {
    if (this.isActive) {
      this.deactivate();
    }

    if (!targetEl) return;

    this.activeEl = targetEl;
    this.activeNode = atomNode;
    this.onUpdateCallback = onUpdate;
    this.isActive = true;

    targetEl.contentEditable = 'true';
    targetEl.focus();

    // Seleciona o conteúdo inicial
    try {
      const range = document.createRange();
      range.selectNodeContents(targetEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}

    this._positionToolbar(targetEl);

    // Ouvintes de encerramento
    this._onBlur = () => {
      this.deactivate();
    };

    this._onInput = () => {
      if (typeof this.onUpdateCallback === 'function') {
        const val = this.activeEl.innerHTML;
        this.onUpdateCallback(val);
      }
    };

    targetEl.addEventListener('blur', this._onBlur);
    targetEl.addEventListener('input', this._onInput);
  }

  /**
   * Posiciona a barra flutuante logo acima do elemento
   * @private
   */
  _positionToolbar(targetEl) {
    if (!this.toolbarEl || !targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const tbHeight = 36;
    const top = Math.max(10, rect.top - tbHeight - 6);
    const left = Math.max(10, Math.min(window.innerWidth - 300, rect.left));

    this.toolbarEl.style.top = `${top}px`;
    this.toolbarEl.style.left = `${left}px`;
    this.toolbarEl.classList.add('is-open');
  }

  /**
   * Desativa a edição inline e grava alterações finais
   */
  deactivate() {
    if (!this.isActive) return;

    if (this.activeEl) {
      this.activeEl.contentEditable = 'false';
      if (this._onBlur) this.activeEl.removeEventListener('blur', this._onBlur);
      if (this._onInput) this.activeEl.removeEventListener('input', this._onInput);

      if (typeof this.onUpdateCallback === 'function') {
        this.onUpdateCallback(this.activeEl.innerHTML);
      }
    }

    if (this.toolbarEl) {
      this.toolbarEl.classList.remove('is-open');
    }

    this.activeEl = null;
    this.activeNode = null;
    this.isActive = false;
  }
}

export default InlineRichText;

