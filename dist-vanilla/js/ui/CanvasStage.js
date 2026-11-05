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
    this.richText = new InlineRichText();

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
      this._updateFrameViewport(state.viewport);
      this._renderEmailContent();
      this._updateOverlay();
    });

    I18n.onLocaleChange(() => {
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
    badge.textContent = 'Block';

    const actions = document.createElement('div');
    actions.className = 'nmf-overlay-actions';

    // Botão Selecionar Pai
    const btnParent = document.createElement('button');
    btnParent.type = 'button';
    btnParent.className = 'nmf-overlay-action-btn';
    btnParent.title = I18n.t('ui.select_parent', 'Selecionar Pai');
    btnParent.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>';
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

    actions.appendChild(btnParent);
    actions.appendChild(btnUp);
    actions.appendChild(btnDown);
    actions.appendChild(btnDup);
    actions.appendChild(btnDel);

    overlay.appendChild(badge);
    overlay.appendChild(actions);

    frame.appendChild(mount);
    frame.appendChild(overlay);
    viewport.appendChild(frame);
    this.element.appendChild(viewport);

    this.viewportEl = viewport;
    this.frameEl = frame;
    this.mountEl = mount;
    this.overlayEl = overlay;
    this.overlayBadge = badge;
  }

  /**
   * Conecta ouvintes de clique, hover, duplo clique e drag-and-drop
   * @private
   */
  _attachEventListeners() {
    // Clique para seleção
    this.mountEl.addEventListener('click', (e) => {
      // Ignora clique se for durante edição inline
      if (this.richText.isActive && this.richText.activeEl && this.richText.activeEl.contains(e.target)) {
        return;
      }

      const target = e.target.closest('[data-nmf-id]');
      if (target) {
        e.stopPropagation();
        const id = target.getAttribute('data-nmf-id');
        this.store.selectNode(id);
      } else {
        // Clicar fora de nós seleciona o nível 'main' (Geral)
        this.store.selectNode(null);
      }
    });

    // Duplo clique para ativar edição Inline RichText
    this.mountEl.addEventListener('dblclick', (e) => {
      const atomTarget = e.target.closest('[data-nmf-type="atom"]');
      if (atomTarget) {
        e.stopPropagation();
        const atomId = atomTarget.getAttribute('data-nmf-id');
        const atomType = atomTarget.getAttribute('data-nmf-atom-type');

        if (atomType === 'text' || atomType === 'button') {
          const atomNode = this.store.findNodeById(atomId);
          if (atomNode) {
            this.richText.activate(atomTarget, atomNode, (newHtml) => {
              this.store.updateNode(atomId, { value: newHtml });
            });
          }
        }
      }
    });

    // Rastreamento de Hover
    this.mountEl.addEventListener('mousemove', (e) => {
      const target = e.target.closest('[data-nmf-id]');
      if (target) {
        const id = target.getAttribute('data-nmf-id');
        this.store.hoverNode(id);
      }
    });

    this.mountEl.addEventListener('mouseleave', () => {
      this.store.hoverNode(null);
    });

    // Suporte a Drag & Drop a partir da Biblioteca de Blocos
    this.viewportEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.frameEl.style.outline = '2px dashed var(--nmf-accent)';
    });

    this.viewportEl.addEventListener('dragleave', () => {
      this.frameEl.style.outline = '';
    });

    this.viewportEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.frameEl.style.outline = '';

      const blockId = e.dataTransfer.getData('text/plain');
      if (blockId) {
        const catalogBlock = BLOCKS.find((b) => b.id === blockId);
        if (catalogBlock && typeof catalogBlock.create === 'function') {
          const newBlock = catalogBlock.create();
          this.store.addBlock(newBlock);
          this.store.selectNode(newBlock.id);
        }
      }
    });

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
   * Renderiza o HTML compilado do e-mail dentro do palco
   * @private
   */
  _renderEmailContent() {
    const doc = this.store.getDocument();

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
          <div class="nmf-canvas-empty-desc">${I18n.t('ui.canvas_empty_desc', 'Selecione um bloco da biblioteca à esquerda para começar a editar.')}</div>
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
    const targetId = state.selectedId || state.hoveredId;

    if (!targetId) {
      this.overlayEl.classList.remove('is-active');
      return;
    }

    const targetEl = this.mountEl.querySelector(`[data-nmf-id="${targetId}"]`);
    if (!targetEl) {
      this.overlayEl.classList.remove('is-active');
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

    // Atualiza rótulo do badge
    const nodeType = targetEl.getAttribute('data-nmf-type') || 'Node';
    const atomType = targetEl.getAttribute('data-nmf-atom-type');
    const badgeText = atomType
      ? `${nodeType.toUpperCase()}: ${atomType.toUpperCase()}`
      : nodeType.toUpperCase();

    this.overlayBadge.textContent = badgeText;

    if (state.selectedId === targetId) {
      this.overlayEl.classList.add('is-active', 'is-selected');
      this.overlayEl.classList.remove('is-hover');
    } else {
      this.overlayEl.classList.add('is-active', 'is-hover');
      this.overlayEl.classList.remove('is-selected');
    }
  }

  /**
   * Seleciona o elemento pai na hierarquia
   * @private
   */
  _selectParentNode() {
    const selectedId = this.store.getState().selectedId;
    if (!selectedId) return;

    const targetEl = this.mountEl.querySelector(`[data-nmf-id="${selectedId}"]`);
    if (!targetEl) return;

    // Busca o elemento ancestral com data-nmf-id mais próximo
    const parentWithId = targetEl.parentElement ? targetEl.parentElement.closest('[data-nmf-id]') : null;
    if (parentWithId) {
      const parentId = parentWithId.getAttribute('data-nmf-id');
      this.store.selectNode(parentId);
    } else {
      // Se não há pai no canvas, seleciona o nível 'main' (Documento)
      this.store.selectNode(null);
    }
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

