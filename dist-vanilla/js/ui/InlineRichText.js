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
import { ColorPickerPopover } from './ColorPickerPopover.js';

export class InlineRichText {
  constructor() {
    this.activeEl = null;
    this.targetEl = null;
    this.activeNode = null;
    this.onUpdateCallback = null;
    this.toolbarEl = null;
    this.imgPopoverEl = null;
    this.isActive = false;
    this._blurTimer = null;
    this._initialValue = '';
    this._isDirty = false;
    this._savedRange = null;
    this._targetImg = null;
    this._onImgClick = null;
    this._onDocMouseDown = null;
    this._onKeyDown = null;

    this._createToolbar();
    this._createImagePopover();
  }

  /**
   * Cria a barra de formatação flutuante
   * @private
   */
  _createToolbar() {
    const tb = document.createElement('div');
    tb.className = 'nmf-inline-toolbar';

    // Seletor de Formato (P, H1, H2, H3)
    const selectFormat = document.createElement('select');
    selectFormat.className = 'nmf-inline-select';
    selectFormat.style.width = '46px';
    selectFormat.title = I18n.t('rt.format', 'Formato');
    const formatOptions = [
      { tag: '<p>', label: 'P' },
      { tag: '<h1>', label: 'H1' },
      { tag: '<h2>', label: 'H2' },
      { tag: '<h3>', label: 'H3' }
    ];
    formatOptions.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.tag;
      o.textContent = opt.label;
      selectFormat.appendChild(o);
    });
    selectFormat.addEventListener('change', () => {
      if (selectFormat.value) {
        document.execCommand('formatBlock', false, selectFormat.value);
        this._triggerInput();
      }
    });

    // Negrito
    const btnBold = this._createBtn('bold', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
    `, I18n.t('rt.bold', 'Negrito'), () => {
      document.execCommand('bold', false);
      this._triggerInput();
    });

    // Itálico
    const btnItalic = this._createBtn('italic', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
    `, I18n.t('rt.italic', 'Itálico'), () => {
      document.execCommand('italic', false);
      this._triggerInput();
    });

    // Sublinhado
    const btnUnderline = this._createBtn('underline', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
    `, I18n.t('rt.underline', 'Sublinhado'), () => {
      document.execCommand('underline', false);
      this._triggerInput();
    });

    // Lista com Marcadores
    const btnBullet = this._createBtn('bullet-list', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
    `, I18n.t('rt.list_ul', 'Lista com Marcadores'), () => {
      document.execCommand('insertUnorderedList', false);
      this._triggerInput();
    });

    // Alinhamentos
    const btnLeft = this._createBtn('align-left', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
    `, I18n.t('rt.align_left', 'Esquerda'), () => {
      document.execCommand('justifyLeft', false);
      this._triggerInput();
    });

    const btnCenter = this._createBtn('align-center', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
    `, I18n.t('rt.align_center', 'Centro'), () => {
      document.execCommand('justifyCenter', false);
      this._triggerInput();
    });

    const btnRight = this._createBtn('align-right', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
    `, I18n.t('rt.align_right', 'Direita'), () => {
      document.execCommand('justifyRight', false);
      this._triggerInput();
    });

    // Cor do Texto
    const btnColor = this._createBtn('color', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"></path></svg>
    `, I18n.t('rt.color', 'Cor do Texto'), () => {
      const sel = window.getSelection();
      this._savedRange = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
      ColorPickerPopover.open(btnColor, '#2563EB', (pickedColor) => {
        if (this.activeEl) {
          this.activeEl.focus();
          if (this._savedRange) {
            const s = window.getSelection();
            s.removeAllRanges();
            s.addRange(this._savedRange);
          }
          document.execCommand('foreColor', false, pickedColor);
          this._triggerInput();
        }
      }, { allowTransparent: false });
    });

    // Inserir Link
    const btnLink = this._createBtn('link', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
    `, I18n.t('rt.link', 'Inserir Link'), () => {
      const url = window.prompt(I18n.t('rt.link_prompt', 'Informe a URL do link:'), 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        this._triggerInput();
      }
    });

    // Inserir/Editar Imagem no Texto
    const btnImage = this._createBtn('image', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
    `, I18n.t('rt.image', 'Inserir/Editar Imagem'), () => {
      const sel = window.getSelection();
      this._savedRange = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
      this._openImagePopover(btnImage);
    });

    // Seletor de Merge Tags / Variáveis
    const selectMerge = document.createElement('select');
    selectMerge.className = 'nmf-inline-select';
    selectMerge.style.width = '64px';
    selectMerge.title = I18n.t('rt.merge_tag', 'Variáveis');
    const mergeTags = [
      { val: '', label: '{...}' },
      { val: '{{nome}}', label: '{{nome}}' },
      { val: '{{email}}', label: '{{email}}' },
      { val: '{{empresa}}', label: '{{empresa}}' },
      { val: '{{link_descadastro}}', label: '{{link_descadastro}}' }
    ];
    mergeTags.forEach((t) => {
      const o = document.createElement('option');
      o.value = t.val;
      o.textContent = t.label;
      selectMerge.appendChild(o);
    });
    selectMerge.addEventListener('change', () => {
      const val = selectMerge.value;
      if (val) {
        document.execCommand('insertText', false, val);
        selectMerge.value = '';
        this._triggerInput();
      }
    });

    // Concluir (✓)
    const btnDone = this._createBtn('done', `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    `, I18n.t('rt.done', 'Concluir'), () => {
      this.deactivate();
    });

    const makeDivider = () => {
      const d = document.createElement('div');
      d.className = 'nmf-divider-v';
      return d;
    };

    tb.appendChild(selectFormat);
    tb.appendChild(makeDivider());
    tb.appendChild(btnBold);
    tb.appendChild(btnItalic);
    tb.appendChild(btnUnderline);
    tb.appendChild(btnBullet);
    tb.appendChild(makeDivider());
    tb.appendChild(btnLeft);
    tb.appendChild(btnCenter);
    tb.appendChild(btnRight);
    tb.appendChild(makeDivider());
    tb.appendChild(btnColor);
    tb.appendChild(btnLink);
    tb.appendChild(btnImage);
    tb.appendChild(makeDivider());
    tb.appendChild(selectMerge);
    tb.appendChild(makeDivider());
    tb.appendChild(btnDone);

    if (typeof document !== 'undefined') {
      if (document.body) {
        document.body.appendChild(tb);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body && !document.body.contains(tb)) {
            document.body.appendChild(tb);
          }
        });
      }
    }
    this.toolbarEl = tb;

    // Evita perda de foco no contenteditable ao clicar na toolbar (exceto controles interativos)
    tb.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'OPTION') {
        e.preventDefault();
      }
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
   * Dispara atualização silenciosa a partir de ações da barra
   * @private
   */
  _triggerInput() {
    if (this._onInput) {
      this._onInput();
    }
  }

  /**
   * Constrói o popover flutuante para inserção e edição de imagem inline
   * @private
   */
  _createImagePopover() {
    if (this.imgPopoverEl) return;

    const pop = document.createElement('div');
    pop.className = 'nmf-inline-img-popover';

    // Evita perda de foco do contenteditable ao interagir com inputs e controles do popover
    pop.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    // Header com título e fechar
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #1e293b;';

    const title = document.createElement('span');
    title.style.cssText = 'font-weight: 600; color: #38bdf8; font-size: 11px;';
    title.textContent = I18n.t('prop.inline_img_title', 'Imagem no Texto');

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.style.cssText = 'background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px;';
    btnClose.innerHTML = '&times;';
    btnClose.title = I18n.t('ui.close', 'Fechar');
    btnClose.addEventListener('click', () => this._closeImagePopover());

    header.appendChild(title);
    header.appendChild(btnClose);
    pop.appendChild(header);

    const makeField = (labelKey, fallback, inputEl) => {
      const group = document.createElement('div');
      group.style.marginBottom = '8px';
      const lbl = document.createElement('label');
      lbl.style.cssText = 'display: block; font-size: 10px; color: #94a3b8; margin-bottom: 3px; font-weight: 500;';
      lbl.textContent = I18n.t(labelKey, fallback);
      group.appendChild(lbl);
      group.appendChild(inputEl);
      return group;
    };

    const makeInput = (type, placeholder, defaultVal = '') => {
      const inp = document.createElement('input');
      inp.type = type;
      inp.placeholder = placeholder;
      inp.value = defaultVal;
      inp.style.cssText = 'width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 5px 8px; color: #f8fafc; font-size: 11px; outline: none; transition: border-color 0.15s ease;';
      inp.addEventListener('focus', () => { inp.style.borderColor = '#38bdf8'; });
      inp.addEventListener('blur', () => { inp.style.borderColor = '#334155'; });
      return inp;
    };

    // 1. Image URL
    this._imgInputSrc = makeInput('text', 'https://...', 'https://placehold.co/240x160/e2e8f0/475569?text=Imagem');
    pop.appendChild(makeField('prop.image_src', 'URL da Imagem', this._imgInputSrc));

    // 2. Link URL
    this._imgInputLink = makeInput('text', `https://... (${I18n.t('prop.optional', 'opcional')})`, '');
    pop.appendChild(makeField('prop.inline_img_link', 'Link da Imagem (URL)', this._imgInputLink));

    // 3. Alinhamento / Enquadramento
    const selAlign = document.createElement('select');
    selAlign.style.cssText = 'width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 5px 8px; color: #f8fafc; font-size: 11px; outline: none; cursor: pointer;';
    const alignOptions = [
      { val: 'float-left', label: I18n.t('prop.inline_img_float_left', 'Flutuar à Esquerda (Wrap texto)') },
      { val: 'float-right', label: I18n.t('prop.inline_img_float_right', 'Flutuar à Direita (Wrap texto)') },
      { val: 'center', label: I18n.t('prop.inline_img_center', 'Centralizada (Bloco)') },
      { val: 'block-left', label: I18n.t('prop.inline_img_block_left', 'Alinhada à Esquerda (Bloco)') },
      { val: 'block-right', label: I18n.t('prop.inline_img_block_right', 'Alinhada à Direita (Bloco)') },
      { val: 'inline', label: I18n.t('prop.inline_img_inline', 'Em Linha (Inline)') }
    ];
    alignOptions.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.val;
      o.textContent = opt.label;
      selAlign.appendChild(o);
    });
    this._imgSelectAlign = selAlign;
    pop.appendChild(makeField('prop.inline_img_align', 'Enquadramento / Alinhamento', this._imgSelectAlign));

    // Row com Largura e Alt
    const rowWidthAlt = document.createElement('div');
    rowWidthAlt.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px;';

    const widthWrap = document.createElement('div');
    widthWrap.style.flex = '1';
    const lblWidth = document.createElement('label');
    lblWidth.style.cssText = 'display: block; font-size: 10px; color: #94a3b8; margin-bottom: 3px; font-weight: 500;';
    lblWidth.textContent = I18n.t('prop.image_width', 'Largura');
    this._imgInputWidth = makeInput('text', '180px', '180px');
    widthWrap.appendChild(lblWidth);
    widthWrap.appendChild(this._imgInputWidth);

    const altWrap = document.createElement('div');
    altWrap.style.flex = '1';
    const lblAlt = document.createElement('label');
    lblAlt.style.cssText = 'display: block; font-size: 10px; color: #94a3b8; margin-bottom: 3px; font-weight: 500;';
    lblAlt.textContent = I18n.t('prop.image_alt', 'Texto Alternativo (Alt)');
    this._imgInputAlt = makeInput('text', I18n.t('prop.image_alt', 'Descrição (Alt)'), '');
    altWrap.appendChild(lblAlt);
    altWrap.appendChild(this._imgInputAlt);

    rowWidthAlt.appendChild(widthWrap);
    rowWidthAlt.appendChild(altWrap);
    pop.appendChild(rowWidthAlt);

    // Footer de Ações
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 6px; justify-content: flex-end; margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b;';

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.style.cssText = 'display: none; padding: 5px 10px; font-size: 11px; background: #dc2626; color: #ffffff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;';
    btnRemove.textContent = I18n.t('action.remove_inline_img', 'Remover');
    btnRemove.addEventListener('click', () => this._removeImage());

    const btnApply = document.createElement('button');
    btnApply.type = 'button';
    btnApply.className = 'nmf-btn-primary';
    btnApply.style.cssText = 'padding: 5px 12px; font-size: 11px; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
    btnApply.textContent = I18n.t('action.insert_update_inline_img', 'Aplicar');
    btnApply.addEventListener('click', () => this._applyImage());

    this._imgBtnRemove = btnRemove;
    actions.appendChild(btnRemove);
    actions.appendChild(btnApply);
    pop.appendChild(actions);

    if (typeof document !== 'undefined') {
      if (document.body) {
        document.body.appendChild(pop);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body && !document.body.contains(pop)) {
            document.body.appendChild(pop);
          }
        });
      }
    }

    this.imgPopoverEl = pop;
  }

  /**
   * Abre o popover de inserção ou edição de imagem
   * @param {HTMLElement} anchorEl - Elemento âncora (botão ou imagem clicada)
   * @private
   */
  _openImagePopover(anchorEl) {
    this._createImagePopover();
    if (!this.imgPopoverEl) return;

    if (anchorEl && anchorEl.tagName === 'IMG') {
      this._targetImg = anchorEl;
      this._imgInputSrc.value = anchorEl.getAttribute('src') || '';
      this._imgInputAlt.value = anchorEl.getAttribute('alt') || '';
      this._imgInputWidth.value = anchorEl.style.width || (anchorEl.getAttribute('width') ? `${anchorEl.getAttribute('width')}px` : '180px');

      const parentLink = anchorEl.closest('a');
      if (parentLink && this.activeEl && this.activeEl.contains(parentLink)) {
        this._imgInputLink.value = parentLink.getAttribute('href') || '';
      } else {
        this._imgInputLink.value = '';
      }

      const s = anchorEl.style;
      if (s.float === 'left') {
        this._imgSelectAlign.value = 'float-left';
      } else if (s.float === 'right') {
        this._imgSelectAlign.value = 'float-right';
      } else if (s.display === 'block' && (s.margin === '12px auto' || (s.marginLeft === 'auto' && s.marginRight === 'auto'))) {
        this._imgSelectAlign.value = 'center';
      } else if (s.display === 'block' && s.marginRight === 'auto') {
        this._imgSelectAlign.value = 'block-left';
      } else if (s.display === 'block' && s.marginLeft === 'auto') {
        this._imgSelectAlign.value = 'block-right';
      } else {
        this._imgSelectAlign.value = 'inline';
      }

      if (this._imgBtnRemove) this._imgBtnRemove.style.display = 'inline-block';
    } else {
      this._targetImg = null;
      this._imgInputSrc.value = 'https://placehold.co/240x160/e2e8f0/475569?text=Imagem';
      this._imgInputLink.value = '';
      this._imgSelectAlign.value = 'float-left';
      this._imgInputWidth.value = '180px';
      this._imgInputAlt.value = '';
      if (this._imgBtnRemove) this._imgBtnRemove.style.display = 'none';
    }

    const target = anchorEl || this.toolbarEl;
    if (target) {
      const rect = target.getBoundingClientRect();
      const top = Math.max(10, Math.min(window.innerHeight - 340, rect.bottom + 8));
      const left = Math.max(10, Math.min(window.innerWidth - 300, rect.left));
      this.imgPopoverEl.style.top = `${top}px`;
      this.imgPopoverEl.style.left = `${left}px`;
    }

    this.imgPopoverEl.style.display = 'block';
    this._imgInputSrc.focus();
    this._imgInputSrc.select();
  }

  /**
   * Fecha o popover de imagem
   * @private
   */
  _closeImagePopover() {
    if (this.imgPopoverEl) {
      this.imgPopoverEl.style.display = 'none';
    }
    this._targetImg = null;
  }

  /**
   * Aplica a inserção ou alteração da imagem no texto
   * @private
   */
  _applyImage() {
    const src = (this._imgInputSrc.value || '').trim();
    if (!src) {
      this._closeImagePopover();
      return;
    }

    const link = (this._imgInputLink.value || '').trim();
    const align = this._imgSelectAlign.value || 'float-left';
    const widthVal = (this._imgInputWidth.value || '180px').trim();
    const altVal = (this._imgInputAlt.value || '').trim();

    const alignStyles = {
      'float-left': { float: 'left', margin: '0 16px 12px 0', display: 'inline-block' },
      'float-right': { float: 'right', margin: '0 0 12px 16px', display: 'inline-block' },
      'center': { float: 'none', margin: '12px auto', display: 'block', textAlign: 'center' },
      'block-left': { float: 'none', margin: '12px auto 12px 0', display: 'block' },
      'block-right': { float: 'none', margin: '12px 0 12px auto', display: 'block' },
      'inline': { float: 'none', margin: '0 8px', display: 'inline-block', verticalAlign: 'middle' }
    };

    const chosen = alignStyles[align] || alignStyles['float-left'];

    const formatImg = (img) => {
      img.src = src;
      img.alt = altVal;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.width = widthVal.includes('%') || widthVal.includes('px') ? widthVal : `${widthVal}px`;
      img.style.float = chosen.float;
      img.style.margin = chosen.margin;
      img.style.display = chosen.display;
      if (chosen.verticalAlign) {
        img.style.verticalAlign = chosen.verticalAlign;
      } else {
        img.style.verticalAlign = '';
      }
      img.style.borderRadius = '4px';
      img.style.cursor = 'pointer';
    };

    if (this._targetImg) {
      formatImg(this._targetImg);
      const parentLink = this._targetImg.closest('a');

      if (link) {
        if (parentLink && this.activeEl && this.activeEl.contains(parentLink)) {
          parentLink.href = link;
          parentLink.target = '_blank';
        } else {
          const a = document.createElement('a');
          a.href = link;
          a.target = '_blank';
          a.style.textDecoration = 'none';
          this._targetImg.parentNode.insertBefore(a, this._targetImg);
          a.appendChild(this._targetImg);
        }
      } else if (parentLink && this.activeEl && this.activeEl.contains(parentLink)) {
        parentLink.parentNode.insertBefore(this._targetImg, parentLink);
        parentLink.remove();
      }
    } else {
      if (this.activeEl) {
        this.activeEl.focus();
        if (this._savedRange) {
          const s = window.getSelection();
          s.removeAllRanges();
          s.addRange(this._savedRange);
        }
      }

      const img = document.createElement('img');
      formatImg(img);

      let nodeToInsert = img;
      if (link) {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.style.textDecoration = 'none';
        a.appendChild(img);
        nodeToInsert = a;
      }

      if (this._savedRange) {
        this._savedRange.deleteContents();
        this._savedRange.insertNode(nodeToInsert);
        const newRange = document.createRange();
        newRange.setStartAfter(nodeToInsert);
        newRange.collapse(true);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(newRange);
      } else if (this.activeEl) {
        this.activeEl.appendChild(nodeToInsert);
      }
    }

    this._triggerInput();
    this._closeImagePopover();
  }

  /**
   * Remove a imagem do texto e qualquer wrapping link correspondente
   * @private
   */
  _removeImage() {
    if (this._targetImg) {
      const parentLink = this._targetImg.closest('a');
      if (parentLink && this.activeEl && this.activeEl.contains(parentLink) && parentLink.children.length === 1) {
        parentLink.remove();
      } else {
        this._targetImg.remove();
      }
      this._triggerInput();
    }
    this._closeImagePopover();
  }

  /**
   * Ativa a edição inline no elemento alvo
   * @param {HTMLElement} targetEl - Elemento DOM dentro do canvas
   * @param {Object} atomNode - Nó do Store
   * @param {Function} onUpdate - Callback (newValue, options) => void
   * @param {Object} [options={}]
   */
  activate(targetEl, atomNode, onUpdate, options = {}) {
    if (this.isActive) {
      this.deactivate();
    }

    if (!targetEl) return;

    this.activeNode = atomNode;
    this.onUpdateCallback = onUpdate;
    this.isActive = true;

    // Se o elemento for um botão, encontra o <a> interno
    let editableEl = targetEl;
    if (atomNode && atomNode.atomType === 'button') {
      editableEl = targetEl.querySelector('a') || targetEl;
    } else {
      editableEl = targetEl.classList.contains('e-atom-text')
        ? targetEl
        : (targetEl.querySelector('.e-atom-text') || targetEl);
    }

    this.activeEl = editableEl;
    this.targetEl = targetEl;

    // Guarda o valor inicial para detectar alterações reais
    this._initialValue = (atomNode && atomNode.atomType === 'button')
      ? editableEl.textContent.trim()
      : editableEl.innerHTML.trim();
    this._isDirty = false;

    editableEl.contentEditable = 'true';
    editableEl.focus();

    this._positionToolbar(editableEl);

    // Ouvinte de clique em imagem interna para abrir o popover de edição diretamente
    this._onImgClick = (e) => {
      const img = e.target.closest('img');
      if (img && this.activeEl && this.activeEl.contains(img)) {
        e.preventDefault();
        e.stopPropagation();
        this._openImagePopover(img);
      }
    };
    editableEl.addEventListener('click', this._onImgClick);

    // Ouvinte de perda de foco com checagem na barra flutuante, no popover de cor e no popover de imagem
    this._blurTimer = null;
    this._onBlur = () => {
      if (this._blurTimer) clearTimeout(this._blurTimer);
      this._blurTimer = setTimeout(() => {
        const activeElem = document.activeElement;
        const colorPopover = document.querySelector('.nmf-color-popover, .nmf-color-picker-popover');
        if (
          (this.toolbarEl && this.toolbarEl.contains(activeElem)) ||
          (colorPopover && colorPopover.contains(activeElem)) ||
          (this.imgPopoverEl && this.imgPopoverEl.contains(activeElem))
        ) {
          return;
        }
        this.deactivate();
      }, 150);
    };

    // Ouvinte de digitação: atualização silenciosa sem re-renderizar o palco
    this._onInput = () => {
      this._isDirty = true;
      if (typeof this.onUpdateCallback === 'function' && this.activeEl) {
        const val = (this.activeNode && this.activeNode.atomType === 'button')
          ? this.activeEl.textContent.trim()
          : this.activeEl.innerHTML.trim();
        this.onUpdateCallback(val, { silent: true });
      }
    };

    // Fechar ao clicar fora (ignora cliques no elemento ativo, na toolbar, no popover de cores ou de imagem)
    this._onDocMouseDown = (e) => {
      if (!this.activeEl || !this.toolbarEl) return;
      const target = e.target;
      if (
        this.activeEl.contains(target) ||
        this.toolbarEl.contains(target) ||
        (this.imgPopoverEl && (this.imgPopoverEl.contains(target) || (target.closest && target.closest('.nmf-inline-img-popover')))) ||
        (target.closest && (target.closest('.nmf-color-popover') || target.closest('.nmf-color-picker-popover')))
      ) {
        return;
      }
      this.deactivate();
    };
    document.addEventListener('mousedown', this._onDocMouseDown, true);

    // Fechar na tecla Escape
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.deactivate();
      }
    };
    editableEl.addEventListener('keydown', this._onKeyDown);

    editableEl.addEventListener('blur', this._onBlur);
    editableEl.addEventListener('input', this._onInput);
  }

  /**
   * Posiciona a barra flutuante logo acima do elemento
   * @private
   */
  _positionToolbar(targetEl) {
    if (!this.toolbarEl || !targetEl) return;

    if (typeof document !== 'undefined' && document.body && !document.body.contains(this.toolbarEl)) {
      document.body.appendChild(this.toolbarEl);
    }

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

    if (typeof ColorPickerPopover.close === 'function') {
      ColorPickerPopover.close();
    }

    this._closeImagePopover();

    if (this._blurTimer) {
      clearTimeout(this._blurTimer);
      this._blurTimer = null;
    }

    if (this._onDocMouseDown) {
      document.removeEventListener('mousedown', this._onDocMouseDown, true);
      this._onDocMouseDown = null;
    }

    if (this.activeEl) {
      this.activeEl.contentEditable = 'false';
      if (this._onBlur) this.activeEl.removeEventListener('blur', this._onBlur);
      if (this._onInput) this.activeEl.removeEventListener('input', this._onInput);
      if (this._onKeyDown) this.activeEl.removeEventListener('keydown', this._onKeyDown);
      if (this._onImgClick) this.activeEl.removeEventListener('click', this._onImgClick);
      this._onImgClick = null;

      const val = (this.activeNode && this.activeNode.atomType === 'button')
        ? this.activeEl.textContent.trim()
        : this.activeEl.innerHTML.trim();

      if (typeof this.onUpdateCallback === 'function' && (this._isDirty || val !== this._initialValue)) {
        this.onUpdateCallback(val, { silent: false });
      }
    }

    if (this.toolbarEl) {
      this.toolbarEl.classList.remove('is-open');
    }

    this.activeEl = null;
    this.targetEl = null;
    this.activeNode = null;
    this.isActive = false;
    this._isDirty = false;
    this._initialValue = '';
    this._savedRange = null;
    this._onKeyDown = null;
  }
}

export default InlineRichText;

