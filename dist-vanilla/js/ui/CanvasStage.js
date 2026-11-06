/**
 * NewsMailForge - CanvasStage
 * Palco central do Studio com alternância Desktop (600px) / Mobile (375px),
 * isolamento do e-mail, moldura de seleção/hover interativa (Overlay) com badge,
 * atalhos contextuais e ativação de edição inline rich-text via duplo-clique.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { EmailCompiler } from '../core/EmailCompiler.js';
import { BLOCKS } from '../catalog/BlockCatalog.js';
import { InlineRichText } from './InlineRichText.js';
import { BlockFactory } from '../core/BlockFactory.js';

export class CanvasStage {
  /**
   * @param {Object} store - Instância reativa do Store
   */
  constructor(store) {
    this.store = store;
    this.element = null;
    this.viewportEl = null;
    this.frameEl = null;
    this.mountEl = null;
    this.overlayEl = null;
    this.overlayBadge = null;
    this.overlayDragHandle = null;
    this.btnAddRowAbove = null;
    this.btnAddRowBelow = null;
    this.activeQuickInsertPopover = null;
    this.dropIndicatorEl = null;
    this.dropBadgeEl = null;
    this._activeDragPayload = null;
    this._currentDropTarget = null;
    this.richText = new InlineRichText();
    this._lastRenderedDocJson = '';

    this._init();
  }

  /**
   * Inicialização do componente
   * @private
   */
  _init() {
    this.element = document.createElement('main');
    this.element.className = 'nmf-stage';

    this._buildStageDom();
    this._attachEventListeners();

    // Re-renderiza o canvas quando o documento ou viewport mudar no Store
    this.store.subscribe((state) => {
      const studioEl = document.querySelector('.nmf-studio');
      if (studioEl) {
        studioEl.classList.toggle('is-preview-mode', state.mode === 'preview');
      }
      this._updatePreviewBar(state.document, state.mode);
      this._updateFrameViewport(state.viewport);

      // Não re-renderiza o DOM do palco se a edição inline estiver ativa
      if (!this.richText || !this.richText.isActive) {
        const docJson = JSON.stringify(state.document);
        if (docJson !== this._lastRenderedDocJson || !this.mountEl.innerHTML) {
          this._lastRenderedDocJson = docJson;
          this._renderEmailContent();
        }
      }
      this._updateOverlay();
    });

    I18n.onLocaleChange(() => {
      const state = this.store.getState();
      this._updatePreviewBar(state.document, state.mode);
      this._lastRenderedDocJson = '';
      this._renderEmailContent();
      this._updateOverlay();
    });
  }

  /**
   * Constrói a estrutura DOM do palco
   * @private
   */
  _buildStageDom() {
    this.element.innerHTML = '';

    // Barra de Preview / Inbox simulation no topo do palco
    const previewInboxBar = document.createElement('div');
    previewInboxBar.className = 'nmf-preview-inbox-bar';
    previewInboxBar.style.display = 'none';
    this.previewInboxBar = previewInboxBar;
    this.element.appendChild(previewInboxBar);

    const viewport = document.createElement('div');
    viewport.className = 'nmf-canvas-viewport';

    const frame = document.createElement('div');
    frame.className = 'nmf-canvas-frame';

    const mount = document.createElement('div');
    mount.className = 'nmf-email-mount';

    // Cria o Overlay de Seleção / Hover
    const overlay = document.createElement('div');
    overlay.className = 'nmf-overlay';

    const badge = document.createElement('div');
    badge.className = 'nmf-overlay-badge';
    badge.textContent = I18n.t('type.row', 'Linha');

    const actions = document.createElement('div');
    actions.className = 'nmf-overlay-actions';

    // Handle de arraste
    const btnDrag = document.createElement('button');
    btnDrag.type = 'button';
    btnDrag.className = 'nmf-overlay-action-btn nmf-overlay-drag-handle';
    btnDrag.draggable = true;
    btnDrag.title = I18n.t('ui.drag_handle', 'Arraste para mover ou reordenar');
    btnDrag.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="8.5" cy="5" r="2"></circle><circle cx="15.5" cy="5" r="2"></circle><circle cx="8.5" cy="12" r="2"></circle><circle cx="15.5" cy="12" r="2"></circle><circle cx="8.5" cy="19" r="2"></circle><circle cx="15.5" cy="19" r="2"></circle></svg>';

    // Botão Inserir Linha Acima
    const btnAddRowAbove = document.createElement('button');
    btnAddRowAbove.type = 'button';
    btnAddRowAbove.className = 'nmf-overlay-action-btn';
    btnAddRowAbove.title = I18n.t('prop.add_row_above', '+ Linha Acima');
    btnAddRowAbove.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="18" x2="20" y2="18"></line><line x1="12" y1="6" x2="12" y2="14"></line><line x1="8" y1="10" x2="16" y2="10"></line></svg>';
    btnAddRowAbove.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      const hit = selId ? this.store.findNodeById(selId) : null;
      if (hit && hit.node && hit.node.type === 'atom') {
        this._openQuickInsertAtomPopover(btnAddRowAbove, hit.node.id, 'before');
      } else {
        this._insertRowRelativeToSelection('before');
      }
    });

    // Botão Inserir Linha Abaixo
    const btnAddRowBelow = document.createElement('button');
    btnAddRowBelow.type = 'button';
    btnAddRowBelow.className = 'nmf-overlay-action-btn';
    btnAddRowBelow.title = I18n.t('action.add_row_below_short', '+ Linha Abaixo');
    btnAddRowBelow.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="12" y1="10" x2="12" y2="18"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>';
    btnAddRowBelow.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      const hit = selId ? this.store.findNodeById(selId) : null;
      if (hit && hit.node && hit.node.type === 'atom') {
        this._openQuickInsertAtomPopover(btnAddRowBelow, hit.node.id, 'after');
      } else {
        this._insertRowRelativeToSelection('after');
      }
    });

    // Botão Selecionar Pai
    const btnParent = document.createElement('button');
    btnParent.type = 'button';
    btnParent.className = 'nmf-overlay-action-btn';
    btnParent.title = I18n.t('ui.select_parent', 'Selecionar Pai');
    btnParent.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>';
    btnParent.addEventListener('click', (e) => {
      e.stopPropagation();
      this._selectParentNode();
    });

    // Botão Mover para Cima
    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.className = 'nmf-overlay-action-btn';
    btnUp.title = I18n.t('action.move_up', 'Mover para Cima');
    btnUp.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    btnUp.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      if (selId) this.store.moveNode(selId, 'up');
    });

    // Botão Mover para Baixo
    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.className = 'nmf-overlay-action-btn';
    btnDown.title = I18n.t('action.move_down', 'Mover para Baixo');
    btnDown.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    btnDown.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      if (selId) this.store.moveNode(selId, 'down');
    });

    // Botão Duplicar
    const btnDup = document.createElement('button');
    btnDup.type = 'button';
    btnDup.className = 'nmf-overlay-action-btn';
    btnDup.title = I18n.t('action.duplicate', 'Duplicar');
    btnDup.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    btnDup.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      if (selId) this.store.duplicateNode(selId);
    });

    // Botão Excluir
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'nmf-overlay-action-btn is-delete';
    btnDel.title = I18n.t('action.delete', 'Excluir');
    btnDel.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      if (selId && window.confirm(I18n.t('ui.confirm_delete', 'Deseja excluir este item?'))) {
        this.store.removeNode(selId);
      }
    });

    actions.appendChild(btnDrag);
    actions.appendChild(btnAddRowAbove);
    actions.appendChild(btnAddRowBelow);
    actions.appendChild(btnParent);
    actions.appendChild(btnUp);
    actions.appendChild(btnDown);
    actions.appendChild(btnDup);
    actions.appendChild(btnDel);

    // Botão Circular Compacto Borda Superior (+ Linha Acima)
    const edgeBtnTop = document.createElement('button');
    edgeBtnTop.type = 'button';
    edgeBtnTop.className = 'nmf-overlay-edge-btn is-top';
    edgeBtnTop.title = I18n.t('prop.add_row_above', '+ Linha Acima');
    edgeBtnTop.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    edgeBtnTop.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      const hit = selId ? this.store.findNodeById(selId) : null;
      if (hit && hit.node && hit.node.type === 'atom') {
        this._openQuickInsertAtomPopover(edgeBtnTop, hit.node.id, 'before');
      } else {
        this._insertRowRelativeToSelection('before');
      }
    });

    // Botão Circular Compacto Borda Inferior (+ Linha Abaixo)
    const edgeBtnBottom = document.createElement('button');
    edgeBtnBottom.type = 'button';
    edgeBtnBottom.className = 'nmf-overlay-edge-btn is-bottom';
    edgeBtnBottom.title = I18n.t('action.add_row_below_short', '+ Linha Abaixo');
    edgeBtnBottom.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    edgeBtnBottom.addEventListener('click', (e) => {
      e.stopPropagation();
      const selId = this.store.getState().selectedId;
      const hit = selId ? this.store.findNodeById(selId) : null;
      if (hit && hit.node && hit.node.type === 'atom') {
        this._openQuickInsertAtomPopover(edgeBtnBottom, hit.node.id, 'after');
      } else {
        this._insertRowRelativeToSelection('after');
      }
    });

    overlay.appendChild(badge);
    overlay.appendChild(actions);
    overlay.appendChild(edgeBtnTop);
    overlay.appendChild(edgeBtnBottom);

    // Indicador de Drop no frame
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'nmf-drop-indicator';
    dropIndicator.style.display = 'none';

    const dropBadge = document.createElement('span');
    dropBadge.className = 'nmf-drop-badge';
    dropIndicator.appendChild(dropBadge);

    const resizersContainer = document.createElement('div');
    resizersContainer.className = 'nmf-col-resizers-layer';
    this.colResizersContainer = resizersContainer;

    frame.appendChild(mount);
    frame.appendChild(overlay);
    frame.appendChild(resizersContainer);
    frame.appendChild(dropIndicator);
    viewport.appendChild(frame);
    this.element.appendChild(viewport);

    this.viewportEl = viewport;
    this.frameEl = frame;
    this.mountEl = mount;
    this.overlayEl = overlay;
    this.overlayBadge = badge;
    this.overlayDragHandle = btnDrag;
    this.btnAddRowAbove = btnAddRowAbove;
    this.btnAddRowBelow = btnAddRowBelow;
    this.edgeBtnTop = edgeBtnTop;
    this.edgeBtnBottom = edgeBtnBottom;
    this.dropIndicatorEl = dropIndicator;
    this.dropBadgeEl = dropBadge;
  }

  /**
   * Conecta ouvintes de clique, hover, duplo clique e drag-and-drop
   * @private
   */
  _attachEventListeners() {
    // Clique para seleção e ativação imediata se já selecionado
    this.mountEl.addEventListener('click', (e) => {
      if (this.store.getState().mode === 'preview') return;

      if (e.target.closest('a')) {
        e.preventDefault();
      }

      // Ignora clique se for durante edição inline
      if (this.richText.isActive && this.richText.activeEl && this.richText.activeEl.contains(e.target)) {
        return;
      }

      // Se clicou no placeholder de coluna vazia
      const emptyPlaceholder = e.target.closest ? e.target.closest('.nmf-empty-cell-placeholder, [data-nmf-empty-cell]') : null;
      if (emptyPlaceholder) {
        e.stopPropagation();
        const cellId = emptyPlaceholder.getAttribute('data-nmf-empty-cell') || emptyPlaceholder.closest('[data-nmf-type="cell"]')?.getAttribute('data-nmf-id');
        if (cellId) {
          this.store.selectNode(cellId);
          this._openQuickInsertAtomPopover(emptyPlaceholder, cellId, 'inside');
          return;
        }
      }

      let target = e.target.closest('[data-nmf-id]');
      if (target) {
        e.stopPropagation();

        // Se o target clicado for [data-nmf-type='row'], redireciona automaticamente para o [data-nmf-type='block'] pai
        if (target.getAttribute('data-nmf-type') === 'row') {
          const parentBlock = target.closest('[data-nmf-type="block"]');
          if (parentBlock) {
            target = parentBlock;
          }
        }

        const id = target.getAttribute('data-nmf-id');
        const prevSelectedId = this.store.getState().selectedId;

        // Se clicou em um átomo text ou button que JÁ estava selecionado, ativa edição inline imediatamente
        const atomTarget = e.target.closest('[data-nmf-type="atom"]');
        if (atomTarget && prevSelectedId === id) {
          const hit = this.store.findNodeById(id);
          const atomNode = hit ? (hit.node || hit) : null;
          if (atomNode) {
            const atomType = atomNode.atomType || atomTarget.getAttribute('data-nmf-atom-type');
            if (atomType === 'text' || atomType === 'button') {
              this._activateInlineEdit(atomTarget, atomNode);
              return;
            }
          }
        }

        this.store.selectNode(id);
      } else {
        // Clicar fora de nós seleciona o nível 'main' (Geral)
        this.store.selectNode(null);
      }
    });

    // Duplo clique para ativar edição Inline RichText
    this.mountEl.addEventListener('dblclick', (e) => {
      if (this.store.getState().mode === 'preview') return;

      const atomTarget = e.target.closest('[data-nmf-type="atom"]');
      if (atomTarget) {
        e.stopPropagation();
        const atomId = atomTarget.getAttribute('data-nmf-id');
        const hit = this.store.findNodeById(atomId);
        const atomNode = hit ? (hit.node || hit) : null;
        if (atomNode) {
          const atomType = atomNode.atomType || atomTarget.getAttribute('data-nmf-atom-type');
          if (atomType === 'text' || atomType === 'button') {
            this._activateInlineEdit(atomTarget, atomNode);
          }
        }
      }
    });

    // Rastreamento de Hover
    this.mountEl.addEventListener('mousemove', (e) => {
      if (this.store.getState().mode === 'preview') return;
      if (this.richText && this.richText.isActive) return;

      let target = e.target.closest('[data-nmf-id]');
      if (target) {
        // Se o target sob hover for [data-nmf-type='row'], redireciona automaticamente para o [data-nmf-type='block'] pai
        if (target.getAttribute('data-nmf-type') === 'row') {
          const parentBlock = target.closest('[data-nmf-type="block"]');
          if (parentBlock) {
            target = parentBlock;
          }
        }

        const id = target.getAttribute('data-nmf-id');
        this.store.hoverNode(id);
      }
    });

    this.mountEl.addEventListener('mouseleave', () => {
      if (this.store.getState().mode === 'preview') return;
      this.store.hoverNode(null);
    });

    // Dragstart no Drag Handle do Overlay (arraste de nós existentes no canvas)
    if (this.overlayDragHandle) {
      this.overlayDragHandle.addEventListener('dragstart', (e) => {
        if (this.richText.isActive) {
          e.preventDefault();
          return;
        }

        const selectedId = this.store.getState().selectedId;
        if (!selectedId) {
          e.preventDefault();
          return;
        }

        const targetEl = this.mountEl.querySelector(`[data-nmf-id="${selectedId}"]`);
        const nodeType = targetEl ? (targetEl.getAttribute('data-nmf-type') || 'block') : 'block';

        const payload = { kind: 'move-node', nodeId: selectedId, nodeType };
        this._activeDragPayload = payload;

        e.dataTransfer.setData('application/x-nmf', JSON.stringify(payload));
        e.dataTransfer.setData('text/plain', `move:${selectedId}`);
        e.dataTransfer.effectAllowed = 'copyMove';
      });
    }

    // Limpeza em dragend global
    window.addEventListener('dragend', () => {
      this._activeDragPayload = null;
      window.__nmfActiveDragPayload = null;
      this._currentDropTarget = null;
      this._clearDropIndicator();
    });

    // Dragenter e Dragover no Stage inteiro e no Viewport (evita cursor de proibido em qualquer ponto do palco)
    const onStageDragOver = (e) => {
      if (this.store.getState().mode === 'preview') return;
      e.preventDefault();
      const activePayload = this._activeDragPayload || (typeof window !== 'undefined' ? window.__nmfActiveDragPayload : null);
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = (activePayload && activePayload.kind === 'move-node') ? 'move' : 'copy';
      }

      const dropTarget = this._computeDropTarget(e);
      this._currentDropTarget = dropTarget;
      this._updateDropIndicator(dropTarget);
    };

    this.element.addEventListener('dragenter', (e) => {
      if (this.store.getState().mode === 'preview') return;
      e.preventDefault();
    });
    this.element.addEventListener('dragover', onStageDragOver);
    this.viewportEl.addEventListener('dragenter', (e) => {
      if (this.store.getState().mode === 'preview') return;
      e.preventDefault();
    });
    this.viewportEl.addEventListener('dragover', onStageDragOver);

    // Dragleave no Viewport
    this.viewportEl.addEventListener('dragleave', (e) => {
      if (this.store.getState().mode === 'preview') return;
      if (!this.viewportEl.contains(e.relatedTarget)) {
        this._clearDropIndicator();
        this._currentDropTarget = null;
      }
    });

    // Drop no Viewport e no Stage inteiro
    const onStageDrop = (e) => {
      if (this.store.getState().mode === 'preview') return;
      e.preventDefault();
      e.stopPropagation();
      const dropTarget = this._currentDropTarget || this._computeDropTarget(e);
      this._clearDropIndicator();
      this._currentDropTarget = null;

      let payload = null;
      const rawNmf = e.dataTransfer.getData('application/x-nmf');
      if (rawNmf) {
        try {
          payload = JSON.parse(rawNmf);
        } catch {}
      }

      const textPlain = e.dataTransfer.getData('text/plain') || '';

      if (!payload && this._activeDragPayload) {
        payload = this._activeDragPayload;
      }

      if (!payload && window.__nmfActiveDragPayload) {
        payload = window.__nmfActiveDragPayload;
      }

      if (!payload && textPlain) {
        if (textPlain.startsWith('{') && textPlain.endsWith('}')) {
          try {
            payload = JSON.parse(textPlain);
          } catch {}
        } else if (textPlain.startsWith('move:')) {
          payload = { kind: 'move-node', nodeId: textPlain.replace('move:', '') };
        } else if (textPlain.startsWith('structure:')) {
          payload = { kind: 'structure', structure: textPlain.replace('structure:', '') };
        } else if (textPlain.startsWith('atom:')) {
          payload = { kind: 'atom', atomType: textPlain.replace('atom:', '') };
        } else {
          payload = { kind: 'catalog-block', blockId: textPlain };
        }
      }

      if (!payload) return;

      this._handleDropPayload(payload, dropTarget);
      this._activeDragPayload = null;
      window.__nmfActiveDragPayload = null;
    };

    this.viewportEl.addEventListener('drop', onStageDrop);
    this.element.addEventListener('drop', onStageDrop);

    // Redimensionamento de janela recalcula posição do overlay
    window.addEventListener('resize', () => {
      this._updateOverlay();
    });
  }

  /**
   * Atualiza a largura do frame para simular Desktop ou Mobile
   * @private
   */
  _updateFrameViewport(viewport) {
    if (this.frameEl) {
      if (viewport === 'mobile') {
        this.frameEl.classList.add('is-mobile');
      } else {
        this.frameEl.classList.remove('is-mobile');
      }
    }
  }

  /**
   * Renderiza o palco do canvas
   */
  render() {
    this._renderEmailContent();
    this._updateOverlay();
  }

  /**
   * Renderiza o HTML compilado do e-mail dentro do palco
   * @private
   */
  _renderEmailContent() {
    const doc = this.store.getDocument();
    const gs = (doc && doc.generalSettings) || {};
    const bodyBg = (gs.background && gs.background.color) ? gs.background.color : '#f1f5f9';
    const emailBg = (gs.bodyBackground && gs.bodyBackground.color) ? gs.bodyBackground.color : '#ffffff';

    if (this.viewportEl) {
      this.viewportEl.style.backgroundColor = bodyBg;
    }
    if (this.frameEl) {
      this.frameEl.style.backgroundColor = emailBg;
    }

    // Se o documento estiver vazio
    if (!doc || !Array.isArray(doc.blocks) || doc.blocks.length === 0) {
      this.mountEl.innerHTML = `
        <div class="nmf-canvas-empty">
          <svg class="nmf-canvas-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <div class="nmf-canvas-empty-title">${I18n.t('ui.canvas_empty_title', 'Seu e-mail está vazio')}</div>
          <div class="nmf-canvas-empty-desc">${I18n.t('ui.canvas_empty_desc', 'Arraste uma estrutura, elemento ou linha da biblioteca à esquerda para começar a criar.')}</div>
        </div>
      `;
      this.overlayEl.classList.remove('is-active');
      return;
    }

    // Compila em modo preview (com atributos data-nmf-* inclusos)
    const compiledHtml = EmailCompiler.compile(doc, { previewMode: true });
    this.mountEl.innerHTML = compiledHtml;
  }

  /**
   * Posiciona e atualiza o Selection/Hover Overlay
   * @private
   */
  _updateOverlay() {
    if (!this.overlayEl) return;

    const state = this.store.getState();

    // No modo preview, oculta overlay, col resizers e desativa rich text
    if (state.mode === 'preview') {
      this.overlayEl.classList.remove('is-active', 'is-selected', 'is-hover');
      if (this.colResizersContainer) this.colResizersContainer.innerHTML = '';
      if (this.richText && this.richText.isActive) this.richText.deactivate();
      return;
    }

    // Durante edição inline rich-text, oculta o overlay para não atrapalhar digitação
    if (this.richText && this.richText.isActive) {
      this.overlayEl.classList.remove('is-active', 'is-selected', 'is-hover');
      this._updateColumnResizers();
      return;
    }

    const targetId = state.selectedId || state.hoveredId;

    // Atualiza visibilidade e títulos contextuais dos botões de borda e ações (+ Linha Acima / Abaixo ou + Novo Acima / Abaixo)
    const selectedHit = state.selectedId ? this.store.findNodeById(state.selectedId) : null;
    const isAtomSelected = Boolean(selectedHit && selectedHit.node && selectedHit.node.type === 'atom');
    if (this.edgeBtnTop && this.edgeBtnBottom) {
      this.edgeBtnTop.style.display = '';
      this.edgeBtnBottom.style.display = '';
      if (isAtomSelected) {
        this.edgeBtnTop.title = I18n.t('action.insert_atom_above', '+ Novo Acima');
        this.edgeBtnBottom.title = I18n.t('action.insert_atom_below', '+ Novo Abaixo');
        if (this.btnAddRowAbove) this.btnAddRowAbove.title = I18n.t('action.insert_atom_above', '+ Novo Acima');
        if (this.btnAddRowBelow) this.btnAddRowBelow.title = I18n.t('action.insert_atom_below', '+ Novo Abaixo');
      } else {
        this.edgeBtnTop.title = I18n.t('prop.add_row_above', '+ Linha Acima');
        this.edgeBtnBottom.title = I18n.t('action.add_row_below_short', '+ Linha Abaixo');
        if (this.btnAddRowAbove) this.btnAddRowAbove.title = I18n.t('prop.add_row_above', '+ Linha Acima');
        if (this.btnAddRowBelow) this.btnAddRowBelow.title = I18n.t('action.add_row_below_short', '+ Linha Abaixo');
      }
    }

    if (!targetId) {
      this.overlayEl.classList.remove('is-active', 'is-selected', 'is-hover');
      this._updateColumnResizers();
      return;
    }

    const targetEl = this.mountEl.querySelector(`[data-nmf-id="${targetId}"]`);
    if (!targetEl) {
      this.overlayEl.classList.remove('is-active', 'is-selected', 'is-hover');
      this._updateColumnResizers();
      return;
    }

    if (!this.frameEl) {
      return;
    }

    // Calcula coordenadas relativas ao frame container
    const frameRect = this.frameEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const top = targetRect.top - frameRect.top;
    const left = targetRect.left - frameRect.left;
    const width = targetRect.width;
    const height = targetRect.height;

    this.overlayEl.style.top = `${top}px`;
    this.overlayEl.style.left = `${left}px`;
    this.overlayEl.style.width = `${width}px`;
    this.overlayEl.style.height = `${height}px`;

    // Atualiza rótulo do badge ou trilha de navegação (breadcrumbs)
    const nodeType = targetEl.getAttribute('data-nmf-type') || 'Node';
    const atomType = targetEl.getAttribute('data-nmf-atom-type');

    if (state.selectedId === targetId) {
      this.overlayEl.classList.add('is-active', 'is-selected');
      this.overlayEl.classList.remove('is-hover');

      // Constrói trilha de navegação hierárquica clicável com APENAS 3 níveis: LINHA › COLUNA (X%) › ELEMENTO: TIPO
      this.overlayBadge.innerHTML = '';
      const hit = this.store.findNodeById(targetId);
      const crumbs = [];

      if (hit && Array.isArray(hit.path)) {
        const blockNode = hit.path.find(n => n && n.type === 'block') || (hit.node && hit.node.type === 'block' ? hit.node : null);
        const cellNode = hit.path.find(n => n && n.type === 'cell') || (hit.node && hit.node.type === 'cell' ? hit.node : null);
        const currentAtom = hit.node && hit.node.type === 'atom' ? hit.node : null;

        // Nível 1: LINHA (aponta para blockNode.id)
        if (blockNode) {
          crumbs.push({
            id: blockNode.id,
            label: I18n.t('type.row', 'Linha').toUpperCase()
          });
        }

        // Nível 2: COLUNA (X%) (aponta para cellNode.id)
        if (cellNode) {
          const widthVal = cellNode.settings?.width || '';
          crumbs.push({
            id: cellNode.id,
            label: widthVal ? `${I18n.t('type.cell', 'Coluna').toUpperCase()} (${widthVal})` : I18n.t('type.cell', 'Coluna').toUpperCase()
          });
        }

        // Nível 3: ELEMENTO: TIPO (aponta para currentAtom.id)
        if (currentAtom) {
          const aType = (currentAtom.atomType || atomType || '').toUpperCase();
          crumbs.push({
            id: currentAtom.id,
            label: aType ? `${I18n.t('type.atom', 'Elemento').toUpperCase()}: ${aType}` : I18n.t('type.atom', 'Elemento').toUpperCase()
          });
        }
      }

      if (crumbs.length > 0) {
        crumbs.forEach((crumb, idx) => {
          if (idx > 0) {
            const sep = document.createElement('span');
            sep.className = 'nmf-badge-sep';
            sep.textContent = '›';
            this.overlayBadge.appendChild(sep);
          }

          const span = document.createElement('span');
          span.className = 'nmf-badge-crumb';
          span.textContent = crumb.label;

          const isCurrent = crumb.id === targetId || (hit && hit.node && hit.node.type === 'row' && hit.path?.find(n => n && n.type === 'block')?.id === crumb.id);
          if (isCurrent) {
            span.classList.add('is-current');
          } else {
            span.title = I18n.t('ui.select_parent', 'Selecionar');
            span.addEventListener('click', (e) => {
              e.stopPropagation();
              this.store.selectNode(crumb.id);
            });
          }
          this.overlayBadge.appendChild(span);
        });
      } else {
        const displayType = (nodeType === 'block' || nodeType === 'row') ? I18n.t('type.row', 'Linha') : nodeType;
        let badgeText = atomType
          ? `${I18n.t('type.atom', 'Elemento').toUpperCase()}: ${atomType.toUpperCase()}`
          : displayType.toUpperCase();
        this.overlayBadge.textContent = badgeText;
      }
    } else {
      this.overlayEl.classList.add('is-active', 'is-hover');
      this.overlayEl.classList.remove('is-selected');

      const displayType = (nodeType === 'block' || nodeType === 'row') ? I18n.t('type.row', 'Linha') : nodeType;
      let badgeText = atomType
        ? `${I18n.t('type.atom', 'Elemento').toUpperCase()}: ${atomType.toUpperCase()}`
        : displayType.toUpperCase();

      if (nodeType === 'cell') {
        const hit = this.store.findNodeById(targetId);
        const cellNode = hit ? (hit.node || hit) : null;
        const widthVal = (cellNode && cellNode.settings && cellNode.settings.width)
          ? cellNode.settings.width
          : (targetEl.getAttribute('width') ? `${targetEl.getAttribute('width')}` : '');
        if (widthVal) {
          badgeText = `${I18n.t('type.cell', 'Coluna').toUpperCase()} • ${widthVal}`;
        }
      }

      this.overlayBadge.textContent = badgeText;
    }

    this._updateColumnResizers();
  }

  /**
   * Seleciona o elemento pai na hierarquia
   * @private
   */
  _selectParentNode() {
    const selectedId = this.store.getState().selectedId;
    if (!selectedId) return;

    const hit = this.store.findNodeById(selectedId);
    if (!hit) return;

    // Se o nó selecionado for um átomo: pai é a célula (Coluna)
    if (hit.node && hit.node.type === 'atom') {
      const cellNode = hit.path && hit.path.find(n => n && n.type === 'cell');
      if (cellNode) {
        this.store.selectNode(cellNode.id);
        return;
      }
    }

    // Se for uma célula: pai direto é a Linha (blockNode)
    if (hit.node && hit.node.type === 'cell') {
      const blockNode = hit.path && hit.path.find(n => n && n.type === 'block');
      if (blockNode) {
        this.store.selectNode(blockNode.id);
        return;
      }
    }

    // Se for linha ou bloco: seleciona o nível 'main' (Documento)
    this.store.selectNode(null);
  }

  /**
   * Insere um novo Bloco (Linha principal) antes ou depois da Linha ancestral selecionada
   * @param {'before'|'after'} position
   * @private
   */
  _insertRowRelativeToSelection(position = 'after') {
    const selId = this.store.getState().selectedId;
    if (!selId) return;

    const hit = this.store.findNodeById(selId);
    if (!hit) return;

    let blockNode = null;

    if (hit.node && hit.node.type === 'block') {
      blockNode = hit.node;
    } else if (hit.path && Array.isArray(hit.path)) {
      blockNode = hit.path.find(n => n && n.type === 'block');
    }

    if (!blockNode && hit.parent && hit.parent.type === 'block') {
      blockNode = hit.parent;
    }

    // Fallback via DOM se necessário
    if (!blockNode) {
      const targetEl = this.mountEl.querySelector(`[data-nmf-id="${selId}"]`);
      if (targetEl) {
        const blkEl = targetEl.closest('[data-nmf-type="block"]');
        if (blkEl) {
          const blkHit = this.store.findNodeById(blkEl.getAttribute('data-nmf-id'));
          blockNode = blkHit ? (blkHit.node || blkHit) : null;
        }
      }
    }

    if (!blockNode) {
      const doc = this.store.getDocument();
      if (doc && Array.isArray(doc.blocks) && doc.blocks.length > 0) {
        blockNode = position === 'before' ? doc.blocks[0] : doc.blocks[doc.blocks.length - 1];
      }
    }

    if (!blockNode) return;

    this._lastRenderedDocJson = '';
    const newBlock = BlockFactory.createBlock({
      rows: [BlockFactory.createRow({ cells: [BlockFactory.createCell({ children: [] })] })]
    });
    this.store.insertNodeAt(blockNode.id, position, newBlock);
    this.store.selectNode(newBlock.id);
  }

  /**
   * Abre popover flutuante para inserção rápida de elementos (+ Texto, + Imagem, + Botão, etc.)
   * @param {HTMLElement} anchorEl
   * @param {string} targetId (cellId se position='inside', ou atomId se position='before'/'after')
   * @param {'inside'|'before'|'after'} [position='inside']
   * @private
   */
  _openQuickInsertAtomPopover(anchorEl, targetId, position = 'inside') {
    if (this.activeQuickInsertPopover) {
      this.activeQuickInsertPopover.remove();
      this.activeQuickInsertPopover = null;
    }

    if (!anchorEl || !targetId || typeof document === 'undefined') return;

    const popover = document.createElement('div');
    popover.className = 'nmf-insert-popover nmf-quick-insert-atom-popover';
    popover.style.position = 'fixed';
    popover.style.zIndex = '9999';

    const rect = anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : { top: 0, bottom: 40, left: 100, right: 200, width: 100, height: 40 };
    const popoverWidth = 170;
    const popoverHeight = 260;
    const winWidth = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1200;
    const winHeight = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800;

    let top = (rect.bottom || 40) + 6;
    let left = rect.left || 0;

    if (top + popoverHeight > winHeight - 8) {
      top = Math.max(8, (rect.top || 0) - popoverHeight - 6);
    }
    if (left + popoverWidth > winWidth - 8) {
      left = Math.max(8, winWidth - popoverWidth - 12);
    }

    popover.style.top = `${Math.round(top)}px`;
    popover.style.left = `${Math.round(left)}px`;

    const atomOptions = [
      {
        type: 'text',
        label: `+ ${I18n.t('atom.text', 'Texto')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
        factory: () => BlockFactory.createTextAtom()
      },
      {
        type: 'image',
        label: `+ ${I18n.t('atom.image', 'Imagem')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
        factory: () => BlockFactory.createImageAtom()
      },
      {
        type: 'button',
        label: `+ ${I18n.t('atom.button', 'Botão')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
        factory: () => BlockFactory.createButtonAtom()
      },
      {
        type: 'divider',
        label: `+ ${I18n.t('atom.divider', 'Divisor')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        factory: () => BlockFactory.createDividerAtom()
      },
      {
        type: 'spacer',
        label: `+ ${I18n.t('atom.spacer', 'Espaçador')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 8 12 3 17 8"></polyline><polyline points="7 16 12 21 17 16"></polyline><line x1="12" y1="3" x2="12" y2="21"></line></svg>',
        factory: () => BlockFactory.createSpacerAtom()
      },
      {
        type: 'menu',
        label: `+ ${I18n.t('atom.menu', 'Menu')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
        factory: () => BlockFactory.createMenuAtom()
      },
      {
        type: 'social',
        label: `+ ${I18n.t('atom.social', 'Social')}`,
        icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
        factory: () => BlockFactory.createSocialAtom()
      }
    ];

    atomOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nmf-popover-item';
      btn.innerHTML = `${opt.icon} <span>${opt.label}</span>`;
      btn.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const newAtom = opt.factory();
        this._lastRenderedDocJson = '';

        if (position === 'inside') {
          const hit = this.store.findNodeById(targetId);
          const cellNode = hit ? (hit.node || hit) : null;
          if (cellNode) {
            if (!Array.isArray(cellNode.children)) {
              cellNode.children = [];
            }
            cellNode.children.push(newAtom);
            this.store.setDocument(this.store.getDocument(), true);
            this.store.selectNode(newAtom.id);
          }
        } else {
          this.store.insertNodeAt(targetId, position, newAtom);
          this.store.selectNode(newAtom.id);
        }

        if (popover && popover.remove) {
          popover.remove();
        }
        this.activeQuickInsertPopover = null;
      });
      popover.appendChild(btn);
    });

    document.body.appendChild(popover);
    this.activeQuickInsertPopover = popover;

    const closeHandler = (e) => {
      if (!popover.contains(e.target) && e.target !== anchorEl && (!anchorEl || !anchorEl.contains(e.target))) {
        if (popover && popover.remove) popover.remove();
        this.activeQuickInsertPopover = null;
        if (typeof window !== 'undefined' && window.removeEventListener) {
          window.removeEventListener('pointerdown', closeHandler);
        }
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      setTimeout(() => window.addEventListener('pointerdown', closeHandler), 10);
    }
  }

  /**
   * Determina dinamicamente o alvo e posição de drop com base no cursor
   * @param {DragEvent} e
   * @returns {Object}
   * @private
   */
  _computeDropTarget(e) {
    const activePayload = this._activeDragPayload || (typeof window !== 'undefined' ? window.__nmfActiveDragPayload : null);
    const hasStructureMime = e.dataTransfer && (
      (Array.isArray(e.dataTransfer.types) && e.dataTransfer.types.includes('application/x-nmf-structure')) ||
      (e.dataTransfer.types && typeof e.dataTransfer.types.contains === 'function' && e.dataTransfer.types.contains('application/x-nmf-structure'))
    );
    const isDraggingStructure = Boolean(
      hasStructureMime ||
      (activePayload && (
        activePayload.kind === 'structure' ||
        activePayload.kind === 'catalog-block' ||
        (activePayload.kind === 'move-node' && (activePayload.nodeType === 'block' || activePayload.nodeType === 'row'))
      ))
    );
    const hasAtomMime = e.dataTransfer && (
      (Array.isArray(e.dataTransfer.types) && e.dataTransfer.types.includes('application/x-nmf-atom')) ||
      (e.dataTransfer.types && typeof e.dataTransfer.types.contains === 'function' && e.dataTransfer.types.contains('application/x-nmf-atom'))
    );
    const isDraggingAtom = Boolean(
      !isDraggingStructure && (
        hasAtomMime ||
        (activePayload && (activePayload.kind === 'atom' || activePayload.nodeType === 'atom'))
      )
    );

    const atomTarget = e.target.closest ? e.target.closest('[data-nmf-type="atom"]') : null;
    const cellTarget = e.target.closest ? e.target.closest('[data-nmf-type="cell"]') : null;
    let blockTarget = e.target.closest ? e.target.closest('[data-nmf-type="block"]') : null;

    // 1. QUANDO ARRASTANDO UM ELEMENTO (ÁTOMO):
    // O alvo SEMPRE deve ser uma Coluna (célula) ou Elemento irmão. NUNCA uma Linha externa!
    if (isDraggingAtom) {
      if (atomTarget) {
        const rect = atomTarget.getBoundingClientRect();
        const isTopHalf = e.clientY < rect.top + rect.height / 2;
        const position = isTopHalf ? 'before' : 'after';
        return {
          type: 'atom',
          element: atomTarget,
          id: atomTarget.getAttribute('data-nmf-id'),
          position
        };
      }

      if (cellTarget) {
        return {
          type: 'cell',
          element: cellTarget,
          id: cellTarget.getAttribute('data-nmf-id'),
          position: 'inside'
        };
      }

      // Se o cursor estiver no padding da Linha ou no gap entre colunas (td.e-col-gap), acha a coluna mais próxima
      let cellCandidates = [];
      if (blockTarget) {
        cellCandidates = Array.from(blockTarget.querySelectorAll('[data-nmf-type="cell"]'));
      }
      if (cellCandidates.length === 0 && this.mountEl) {
        cellCandidates = Array.from(this.mountEl.querySelectorAll('[data-nmf-type="cell"]'));
      }

      if (cellCandidates.length > 0) {
        let closestCell = cellCandidates[0];
        let minDistance = Infinity;
        for (const cell of cellCandidates) {
          const rect = cell.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          if (dist < minDistance) {
            minDistance = dist;
            closestCell = cell;
          }
        }
        return {
          type: 'cell',
          element: closestCell,
          id: closestCell.getAttribute('data-nmf-id'),
          position: 'inside'
        };
      }

      return {
        type: 'empty',
        element: null,
        id: null,
        position: 'after'
      };
    }

    // 2. QUANDO ARRASTANDO ESTRUTURA, MODELO OU LINHA:
    // O alvo SEMPRE é a Linha externa (bloco) antes ou depois
    if (!blockTarget && this.mountEl) {
      const blocks = Array.from(this.mountEl.querySelectorAll('[data-nmf-type="block"]'));
      if (blocks.length > 0) {
        let minDistance = Infinity;
        let closestBlock = blocks[0];
        for (const blk of blocks) {
          const rect = blk.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const dist = Math.abs(e.clientY - centerY);
          if (dist < minDistance) {
            minDistance = dist;
            closestBlock = blk;
          }
        }
        blockTarget = closestBlock;
      }
    }

    if (blockTarget) {
      const rect = blockTarget.getBoundingClientRect();
      const isTopHalf = e.clientY < rect.top + rect.height / 2;
      const position = isTopHalf ? 'before' : 'after';
      return {
        type: 'block',
        element: blockTarget,
        id: blockTarget.getAttribute('data-nmf-id'),
        position
      };
    }

    return {
      type: 'empty',
      element: null,
      id: null,
      position: 'after'
    };
  }

  /**
   * Posiciona o elemento visual de drop indicator
   * @param {Object} dropTarget
   * @private
   */
  _updateDropIndicator(dropTarget) {
    if (!dropTarget || !dropTarget.element) {
      this._clearDropIndicator();
      return;
    }

    // Limpa destaque de células caso o alvo não seja uma célula
    if (dropTarget.type !== 'cell') {
      const cellTargets = this.mountEl.querySelectorAll('.nmf-cell-drop-target');
      cellTargets.forEach((c) => c.classList.remove('nmf-cell-drop-target'));
    }

    const frameRect = this.frameEl.getBoundingClientRect();
    const targetRect = dropTarget.element.getBoundingClientRect();
    let top = 0;
    let left = targetRect.left - frameRect.left;
    let width = targetRect.width;
    let badgeText = '';

    if (dropTarget.type === 'atom') {
      if (dropTarget.position === 'before') {
        top = targetRect.top - frameRect.top;
        badgeText = I18n.t('ui.drop_before_atom', 'Soltar antes deste elemento');
      } else {
        top = targetRect.bottom - frameRect.top;
        badgeText = I18n.t('ui.drop_after_atom', 'Soltar após este elemento');
      }
    } else if (dropTarget.type === 'cell') {
      dropTarget.element.classList.add('nmf-cell-drop-target');
      top = targetRect.top - frameRect.top + targetRect.height / 2;
      badgeText = I18n.t('ui.drop_inside_cell', 'Soltar dentro da coluna');
    } else if (dropTarget.type === 'block') {
      if (dropTarget.position === 'before') {
        top = targetRect.top - frameRect.top;
        badgeText = I18n.t('ui.drop_before_block', 'Soltar acima desta linha');
      } else {
        top = targetRect.bottom - frameRect.top;
        badgeText = I18n.t('ui.drop_after_block', 'Soltar abaixo desta linha');
      }
    }

    this.dropIndicatorEl.style.top = `${top}px`;
    this.dropIndicatorEl.style.left = `${left}px`;
    this.dropIndicatorEl.style.width = `${width}px`;
    this.dropIndicatorEl.style.display = 'flex';
    this.dropBadgeEl.textContent = badgeText;
  }

  /**
   * Oculta o indicador de drop
   * @private
   */
  _clearDropIndicator() {
    if (this.dropIndicatorEl) {
      this.dropIndicatorEl.style.display = 'none';
    }
    if (this.mountEl) {
      const cellTargets = this.mountEl.querySelectorAll('.nmf-cell-drop-target');
      cellTargets.forEach((c) => c.classList.remove('nmf-cell-drop-target'));
    }
  }

  /**
   * Processa o payload do drop e aplica a mutação correspondente no Store
   * @param {Object} payload
   * @param {Object} dropTarget
   * @private
   */
  _handleDropPayload(payload, dropTarget) {
    const kind = payload.kind;

    // Caso 1: Movimentação de nó existente
    if (kind === 'move-node' || (payload.nodeId && !kind)) {
      const sourceId = payload.nodeId;
      if (!sourceId || !dropTarget || !dropTarget.id) return;
      if (sourceId === dropTarget.id) return;

      this.store.moveNodeTo(sourceId, dropTarget.id, dropTarget.position);
      return;
    }

    // Caso 2: Criação de Bloco do Catálogo
    if (kind === 'catalog-block' || payload.blockId) {
      const blockId = payload.blockId || payload.id;
      const catalogBlock = BLOCKS.find((b) => b.id === blockId);
      if (catalogBlock && typeof catalogBlock.create === 'function') {
        const newBlock = catalogBlock.create();
        if (dropTarget && dropTarget.type === 'block' && dropTarget.id) {
          this.store.insertNodeAt(dropTarget.id, dropTarget.position, newBlock);
        } else {
          this.store.addBlock(newBlock);
        }
      }
      return;
    }

    // Caso 3: Criação de Estrutura
    if (kind === 'structure') {
      const layout = payload.layout || payload.structure || '100';
      const newBlock = this._createStructureBlock(layout);
      if (dropTarget && dropTarget.id) {
        let targetBlockId = dropTarget.id;
        if (dropTarget.type !== 'block') {
          const hit = this.store.findNodeById(dropTarget.id);
          const parentBlk = hit?.path?.find(n => n && n.type === 'block') || (hit?.parent?.type === 'block' ? hit.parent : null);
          if (parentBlk) {
            targetBlockId = parentBlk.id;
          }
        }
        this.store.insertNodeAt(targetBlockId, dropTarget.position || 'after', newBlock);
      } else {
        this.store.addBlock(newBlock);
      }
      this.store.selectNode(newBlock.id);
      return;
    }

    // Caso 4: Criação de Átomo
    if (kind === 'atom') {
      const newAtom = this._createAtom(payload.atomType || 'text');

      if (!dropTarget || dropTarget.type === 'empty' || !dropTarget.id) {
        // Documento vazio: envolve em um bloco de 1 coluna
        const wrappedBlock = this._wrapAtomInBlock(newAtom);
        this.store.addBlock(wrappedBlock);
        this.store.selectNode(newAtom.id);
      } else if (dropTarget.type === 'block') {
        // Se solto sobre um bloco, localiza a primeira célula desse bloco e insere dentro dela
        const blkHit = this.store.findNodeById(dropTarget.id);
        const blkNode = blkHit ? (blkHit.node || blkHit) : null;
        let targetCell = null;
        if (blkNode && Array.isArray(blkNode.rows) && blkNode.rows.length > 0) {
          const firstRow = blkNode.rows[0];
          if (Array.isArray(firstRow.cells) && firstRow.cells.length > 0) {
            targetCell = firstRow.cells[0];
          }
        }
        if (targetCell) {
          this.store.insertNodeAt(targetCell.id, 'inside', newAtom);
        } else {
          const wrappedBlock = this._wrapAtomInBlock(newAtom);
          this.store.insertNodeAt(dropTarget.id, dropTarget.position, wrappedBlock);
        }
        this.store.selectNode(newAtom.id);
      } else if (dropTarget.type === 'cell') {
        // Solto dentro de uma célula
        this.store.insertNodeAt(dropTarget.id, 'inside', newAtom);
        this.store.selectNode(newAtom.id);
      } else if (dropTarget.type === 'atom') {
        // Solto antes ou após outro átomo
        this.store.insertNodeAt(dropTarget.id, dropTarget.position, newAtom);
        this.store.selectNode(newAtom.id);
      }
      return;
    }
  }

  /**
   * Converte identificador ou padrão numérico para array de larguras percentuais
   * @private
   * @param {string|Array} layout
   * @returns {string[]}
   */
  _parseLayoutWidths(layout) {
    if (Array.isArray(layout)) {
      return layout.map(w => typeof w === 'number' ? `${w}%` : String(w));
    }
    const layoutMap = {
      '100': ['100%'],
      '1col': ['100%'],
      '50-50': ['50%', '50%'],
      '2col': ['50%', '50%'],
      '33-33-33': ['33.33%', '33.33%', '33.33%'],
      '3col': ['33.33%', '33.33%', '33.33%'],
      '30-70': ['30%', '70%'],
      '70-30': ['70%', '30%'],
      '25-25-25-25': ['25%', '25%', '25%', '25%'],
      '4col': ['25%', '25%', '25%', '25%']
    };
    if (layoutMap[layout]) {
      return layoutMap[layout];
    }
    if (typeof layout === 'string') {
      const parts = layout.split(/[,-]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (parts.length > 0) {
        const sum = parts.reduce((a, b) => a + b, 0);
        return parts.map(n => `${((n / sum) * 100).toFixed(2)}%`);
      }
    }
    return ['100%'];
  }

  /**
   * Cria um bloco de estrutura baseado em colunas
   * @param {string|Array} layout
   * @returns {Object}
   * @private
   */
  _createStructureBlock(layout = '100') {
    const cellWidths = this._parseLayoutWidths(layout);
    return BlockFactory.createBlock({
      rows: [
        BlockFactory.createRow({
          cells: cellWidths.map((w) =>
            BlockFactory.createCell({
              settings: { width: w },
              children: []
            })
          )
        })
      ]
    });
  }

  /**
   * Atualiza a barra de pré-visualização (inbox bar)
   * @private
   * @param {Object} doc
   * @param {string} mode
   */
  _updatePreviewBar(doc, mode) {
    if (!this.previewInboxBar) return;
    if (mode !== 'preview') {
      this.previewInboxBar.style.display = 'none';
      return;
    }
    const title = doc?.title || I18n.t('ui.untitled_template', 'Sem Título');
    const preheader = doc?.generalSettings?.previewText || '';

    this.previewInboxBar.innerHTML = `
      <div class="nmf-preview-inbox-meta">
        <div class="nmf-preview-inbox-row">
          <span class="nmf-preview-inbox-label">${I18n.t('ui.preview_inbox_subject', 'Assunto')}:</span>
          <strong class="nmf-preview-inbox-val">${title}</strong>
        </div>
        ${preheader ? `
        <div class="nmf-preview-inbox-row">
          <span class="nmf-preview-inbox-label">${I18n.t('ui.preview_inbox_preheader', 'Pré-cabeçalho')}:</span>
          <span class="nmf-preview-inbox-val">${preheader}</span>
        </div>` : ''}
      </div>
      <button type="button" class="nmf-btn nmf-btn-secondary nmf-exit-preview-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>${I18n.t('ui.exit_preview', 'Voltar ao Editor')}</span>
      </button>
    `;

    const exitBtn = this.previewInboxBar.querySelector('.nmf-exit-preview-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (typeof this.store.setMode === 'function') {
          this.store.setMode('editor');
        }
      });
    }

    this.previewInboxBar.style.display = 'flex';
  }

  /**
   * Renderiza os handles de redimensionamento dinâmico de colunas no Canvas
   * @private
   */
  _updateColumnResizers() {
    if (!this.colResizersContainer || !this.frameEl) return;
    this.colResizersContainer.innerHTML = '';

    if (typeof document !== 'undefined' && document.body && !document.body.contains(this.frameEl)) {
      return;
    }

    const state = this.store.getState();
    if (state.mode === 'preview') {
      return;
    }

    const rowElements = this.mountEl.querySelectorAll('[data-nmf-type="row"]');
    if (!rowElements.length) return;

    const frameRect = this.frameEl.getBoundingClientRect();

    rowElements.forEach((rowEl) => {
      const rowId = rowEl.getAttribute('data-nmf-id');
      const cells = Array.from(rowEl.querySelectorAll(':scope > td > table > tbody > tr > [data-nmf-type="cell"], :scope > td > table > tr > [data-nmf-type="cell"]'));
      const cellNodes = cells.length >= 2 ? cells : Array.from(rowEl.querySelectorAll('[data-nmf-type="cell"]'));
      if (cellNodes.length < 2) return;

      const rowRect = rowEl.getBoundingClientRect();

      for (let i = 0; i < cellNodes.length - 1; i++) {
        const cellLeft = cellNodes[i];
        const cellRight = cellNodes[i + 1];

        const rectLeft = cellLeft.getBoundingClientRect();
        const rectRight = cellRight.getBoundingClientRect();

        const boundaryX = (rectLeft.right + rectRight.left) / 2;
        const left = boundaryX - frameRect.left;
        const top = rowRect.top - frameRect.top;
        const height = rowRect.height;

        const handle = document.createElement('div');
        handle.className = 'nmf-col-resizer-handle';
        handle.style.left = `${left}px`;
        handle.style.top = `${top}px`;
        handle.style.height = `${height}px`;

        const tooltip = document.createElement('div');
        tooltip.className = 'nmf-col-resize-tooltip';
        tooltip.style.display = 'none';
        handle.appendChild(tooltip);

        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const startX = e.clientX;
          const leftWStart = rectLeft.width;
          const rightWStart = rectRight.width;

          const hit = this.store.findNodeById(rowId);
          const rowNode = hit ? (hit.node || hit) : null;
          const currentCellNodes = (rowNode && Array.isArray(rowNode.cells)) ? rowNode.cells : [];

          const getInitialPct = (idx, fallbackPx) => {
            if (currentCellNodes[idx] && currentCellNodes[idx].settings && currentCellNodes[idx].settings.width) {
              const val = parseFloat(currentCellNodes[idx].settings.width);
              if (!isNaN(val)) return val;
            }
            return (fallbackPx / rowRect.width) * 100;
          };

          const initialPctLeft = getInitialPct(i, leftWStart);
          const initialPctRight = getInitialPct(i + 1, rightWStart);
          const combinedPct = initialPctLeft + initialPctRight;

          tooltip.style.display = 'block';
          handle.classList.add('is-resizing');

          let lastNewLeftPct = initialPctLeft;
          let lastNewRightPct = initialPctRight;

          const onMouseMove = (moveEv) => {
            const deltaX = moveEv.clientX - startX;
            const deltaPct = (deltaX / rowRect.width) * 100;

            let newLeftPct = Math.max(10, Math.min(combinedPct - 10, initialPctLeft + deltaPct));
            let newRightPct = combinedPct - newLeftPct;

            newLeftPct = Math.round(newLeftPct * 10) / 10;
            newRightPct = Math.round((combinedPct - newLeftPct) * 10) / 10;

            lastNewLeftPct = newLeftPct;
            lastNewRightPct = newRightPct;

            cellLeft.style.width = `${newLeftPct}%`;
            cellRight.style.width = `${newRightPct}%`;

            tooltip.textContent = `${newLeftPct}% | ${newRightPct}%`;
          };

          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            tooltip.style.display = 'none';
            handle.classList.remove('is-resizing');

            const allWidths = currentCellNodes.map((c, idx) => {
              if (idx === i) return `${lastNewLeftPct}%`;
              if (idx === i + 1) return `${lastNewRightPct}%`;
              return c.settings?.width || `${Math.round(100 / currentCellNodes.length)}%`;
            });

            if (typeof this.store.resizeRowCells === 'function') {
              this.store.resizeRowCells(rowId, allWidths, true);
            } else if (typeof this.store.setRowColumnsLayout === 'function') {
              this.store.setRowColumnsLayout(rowId, allWidths);
            }
          };

          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });

        this.colResizersContainer.appendChild(handle);
      }
    });
  }

  /**
   * Cria uma nova instância de átomo
   * @param {string} atomType
   * @returns {Object}
   * @private
   */
  _createAtom(atomType = 'text') {
    switch (atomType) {
      case 'button':
        return BlockFactory.createButtonAtom();
      case 'image':
        return BlockFactory.createImageAtom();
      case 'divider':
        return BlockFactory.createDividerAtom();
      case 'spacer':
        return BlockFactory.createSpacerAtom();
      case 'menu':
        return BlockFactory.createMenuAtom();
      case 'social':
        return BlockFactory.createSocialAtom();
      case 'text':
      default:
        return BlockFactory.createTextAtom();
    }
  }

  /**
   * Ativa a edição inline para um átomo de texto ou botão
   * @private
   * @param {HTMLElement} atomTarget
   * @param {Object} atomNode
   */
  _activateInlineEdit(atomTarget, atomNode) {
    if (!atomTarget || !atomNode) return;
    const atomId = atomNode.id;
    this.richText.activate(atomTarget, atomNode, (newVal, opts) => {
      if (opts && opts.silent) {
        if (this.store.updateNodeSilent) {
          this.store.updateNodeSilent(atomId, { value: newVal });
        } else {
          const hit = this.store.findNodeById(atomId);
          if (hit && hit.node) {
            hit.node.value = newVal;
          }
        }
      } else {
        this._lastRenderedDocJson = '';
        this.store.updateNode(atomId, { value: newVal });
      }
    });
  }

  /**
   * Ativa a edição inline para o nó atualmente selecionado se for texto ou botão
   * @private
   */
  _activateInlineEditForSelected() {
    const selId = this.store.getState().selectedId;
    if (!selId) return;

    const atomTarget = this.mountEl.querySelector(`[data-nmf-id="${selId}"][data-nmf-type="atom"]`);
    if (!atomTarget) return;

    const hit = this.store.findNodeById(selId);
    const atomNode = hit ? (hit.node || hit) : null;
    if (!atomNode) return;

    const atomType = atomNode.atomType || atomTarget.getAttribute('data-nmf-atom-type');
    if (atomType === 'text' || atomType === 'button') {
      this._activateInlineEdit(atomTarget, atomNode);
    }
  }

  /**
   * Envolve um átomo em um bloco padrão de 1 coluna
   * @param {Object} atom
   * @returns {Object}
   * @private
   */
  _wrapAtomInBlock(atom) {
    return BlockFactory.createBlock({
      rows: [
        BlockFactory.createRow({
          cells: [
            BlockFactory.createCell({
              children: [atom]
            })
          ]
        })
      ]
    });
  }

  /**
   * Monta o elemento no container hospedeiro
   * @param {HTMLElement} parent
   */
  mount(parent) {
    if (parent && parent.appendChild) {
      parent.appendChild(this.element);
      this._renderEmailContent();
      this._updateOverlay();
    }
    return this;
  }
}

export default CanvasStage;

