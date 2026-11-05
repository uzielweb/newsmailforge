/**
 * NewsMailForge - TreeNavigator
 * Navegador em árvore recursiva (Document -> Block -> Row -> Cell -> Atom | RowNode)
 * com TreeInsertLine (+), popover de inserção contextual, atalhos de subida/descida,
 * duplicação, exclusão e sincronização de rolagem com a seleção ativa.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { BlockFactory } from '../core/BlockFactory.js';

export class TreeNavigator {
  /**
   * @param {Object} store - Instância reativa do Store
   */
  constructor(store) {
    this.store = store;
    this.element = null;
    this.collapsedNodes = new Set();
    this.activePopover = null;

    this._init();
  }

  /**
   * Inicialização do componente
   * @private
   */
  _init() {
    this.element = document.createElement('div');
    this.element.className = 'nmf-tree-container';

    this.store.subscribe((state) => {
      this.render();
      this._syncScrollWithSelection(state.selectedId);
    });

    I18n.onLocaleChange(() => {
      this.render();
    });
  }

  /**
   * Renderiza a árvore completa
   */
  render() {
    this.element.innerHTML = '';

    // Botão "+ Add Block" no topo
    const topBar = document.createElement('div');
    topBar.className = 'nmf-tree-top-action';

    const btnAddBlock = document.createElement('button');
    btnAddBlock.type = 'button';
    btnAddBlock.className = 'nmf-btn nmf-btn-primary';
    btnAddBlock.style.width = '100%';
    btnAddBlock.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>${I18n.t('ui.add_block', '+ Adicionar Bloco')}</span>
    `;
    btnAddBlock.addEventListener('click', () => {
      const newBlock = BlockFactory.createBlock({
        rows: [
          BlockFactory.createRow({
            cells: [
              BlockFactory.createCell({
                children: [BlockFactory.createTextAtom()]
              })
            ]
          })
        ]
      });
      this.store.addBlock(newBlock);
      this.store.selectNode(newBlock.id);
    });

    topBar.appendChild(btnAddBlock);
    this.element.appendChild(topBar);

    // Document Root Node
    const doc = this.store.getDocument();
    if (!doc || !Array.isArray(doc.blocks) || doc.blocks.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.padding = '20px 12px';
      emptyMsg.style.color = 'var(--nmf-text-tertiary)';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.fontSize = '12px';
      emptyMsg.textContent = I18n.t('ui.tree_empty', 'Nenhum bloco no documento.');
      this.element.appendChild(emptyMsg);
      return;
    }

    const state = this.store.getState();

    // Renderiza blocos recursivamente
    doc.blocks.forEach((block, bIdx) => {
      // Linha de inserção antes do primeiro bloco
      if (bIdx === 0) {
        this.element.appendChild(this._createInsertLine(null, 'before_first_block'));
      }

      this._renderBlockNode(this.element, block, state, 0);

      // Linha de inserção após cada bloco
      this.element.appendChild(this._createInsertLine(block.id, 'after_block'));
    });
  }

  /**
   * Renderiza um nó de Bloco
   * @private
   */
  _renderBlockNode(parentEl, block, state, level) {
    const isSelected = state.selectedId === block.id;
    const isCollapsed = this.collapsedNodes.has(block.id);

    const nodeEl = document.createElement('div');
    nodeEl.className = 'nmf-tree-node';
    nodeEl.setAttribute('data-tree-id', block.id);

    const rowEl = document.createElement('div');
    rowEl.className = `nmf-tree-row ${isSelected ? 'is-selected' : ''}`;
    rowEl.style.paddingLeft = `${level * 12 + 6}px`;

    const left = document.createElement('div');
    left.className = 'nmf-tree-row-left';

    // Toggle de expansão
    const toggle = document.createElement('span');
    toggle.className = 'nmf-tree-toggle';
    const hasChildren = Array.isArray(block.rows) && block.rows.length > 0;
    toggle.innerHTML = hasChildren
      ? (isCollapsed ? '&#9654;' : '&#9660;')
      : '&bull;';
    toggle.style.fontSize = '8px';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCollapsed) {
        this.collapsedNodes.delete(block.id);
      } else {
        this.collapsedNodes.add(block.id);
      }
      this.render();
    });

    const icon = document.createElement('span');
    icon.className = 'nmf-tree-icon';
    icon.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>';

    const label = document.createElement('span');
    label.className = 'nmf-tree-label';
    label.textContent = block.label || I18n.t('type.block', 'Bloco');

    left.appendChild(toggle);
    left.appendChild(icon);
    left.appendChild(label);

    const actions = this._createRowActions(block.id, 'block');

    rowEl.appendChild(left);
    rowEl.appendChild(actions);

    rowEl.addEventListener('click', () => {
      this.store.selectNode(block.id);
    });

    rowEl.addEventListener('mouseenter', () => {
      this.store.hoverNode(block.id);
    });

    rowEl.addEventListener('mouseleave', () => {
      this.store.hoverNode(null);
    });

    nodeEl.appendChild(rowEl);

    // Filhos (Linhas)
    if (!isCollapsed && Array.isArray(block.rows)) {
      const childrenWrap = document.createElement('div');
      block.rows.forEach((row) => {
        this._renderRowNode(childrenWrap, row, block.id, state, level + 1);
      });
      nodeEl.appendChild(childrenWrap);
    }

    parentEl.appendChild(nodeEl);
  }

  /**
   * Renderiza um nó de Linha (Row)
   * @private
   */
  _renderRowNode(parentEl, row, blockId, state, level) {
    const isSelected = state.selectedId === row.id;
    const isCollapsed = this.collapsedNodes.has(row.id);

    const nodeEl = document.createElement('div');
    nodeEl.className = 'nmf-tree-node';
    nodeEl.setAttribute('data-tree-id', row.id);

    const rowEl = document.createElement('div');
    rowEl.className = `nmf-tree-row ${isSelected ? 'is-selected' : ''}`;
    rowEl.style.paddingLeft = `${level * 12 + 6}px`;

    const left = document.createElement('div');
    left.className = 'nmf-tree-row-left';

    const toggle = document.createElement('span');
    toggle.className = 'nmf-tree-toggle';
    const hasChildren = Array.isArray(row.cells) && row.cells.length > 0;
    toggle.innerHTML = hasChildren
      ? (isCollapsed ? '&#9654;' : '&#9660;')
      : '&bull;';
    toggle.style.fontSize = '8px';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCollapsed) {
        this.collapsedNodes.delete(row.id);
      } else {
        this.collapsedNodes.add(row.id);
      }
      this.render();
    });

    const icon = document.createElement('span');
    icon.className = 'nmf-tree-icon';
    icon.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';

    const label = document.createElement('span');
    label.className = 'nmf-tree-label';
    label.textContent = row.label || I18n.t('type.row', 'Linha');

    left.appendChild(toggle);
    left.appendChild(icon);
    left.appendChild(label);

    const actions = this._createRowActions(row.id, 'row');

    rowEl.appendChild(left);
    rowEl.appendChild(actions);

    rowEl.addEventListener('click', () => {
      this.store.selectNode(row.id);
    });

    rowEl.addEventListener('mouseenter', () => {
      this.store.hoverNode(row.id);
    });

    rowEl.addEventListener('mouseleave', () => {
      this.store.hoverNode(null);
    });

    nodeEl.appendChild(rowEl);

    // Células da linha
    if (!isCollapsed && Array.isArray(row.cells)) {
      const childrenWrap = document.createElement('div');
      row.cells.forEach((cell) => {
        this._renderCellNode(childrenWrap, cell, row.id, state, level + 1);
      });
      nodeEl.appendChild(childrenWrap);
    }

    parentEl.appendChild(nodeEl);
  }

  /**
   * Renderiza um nó de Célula/Coluna (Cell)
   * @private
   */
  _renderCellNode(parentEl, cell, rowId, state, level) {
    const isSelected = state.selectedId === cell.id;
    const isCollapsed = this.collapsedNodes.has(cell.id);

    const nodeEl = document.createElement('div');
    nodeEl.className = 'nmf-tree-node';
    nodeEl.setAttribute('data-tree-id', cell.id);

    const rowEl = document.createElement('div');
    rowEl.className = `nmf-tree-row ${isSelected ? 'is-selected' : ''}`;
    rowEl.style.paddingLeft = `${level * 12 + 6}px`;

    const left = document.createElement('div');
    left.className = 'nmf-tree-row-left';

    const toggle = document.createElement('span');
    toggle.className = 'nmf-tree-toggle';
    const hasChildren = Array.isArray(cell.children) && cell.children.length > 0;
    toggle.innerHTML = hasChildren
      ? (isCollapsed ? '&#9654;' : '&#9660;')
      : '&bull;';
    toggle.style.fontSize = '8px';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCollapsed) {
        this.collapsedNodes.delete(cell.id);
      } else {
        this.collapsedNodes.add(cell.id);
      }
      this.render();
    });

    const icon = document.createElement('span');
    icon.className = 'nmf-tree-icon';
    icon.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>';

    const label = document.createElement('span');
    label.className = 'nmf-tree-label';
    label.textContent = cell.label || I18n.t('type.cell', 'Coluna');

    left.appendChild(toggle);
    left.appendChild(icon);
    left.appendChild(label);

    const actions = this._createRowActions(cell.id, 'cell');

    rowEl.appendChild(left);
    rowEl.appendChild(actions);

    rowEl.addEventListener('click', () => {
      this.store.selectNode(cell.id);
    });

    rowEl.addEventListener('mouseenter', () => {
      this.store.hoverNode(cell.id);
    });

    rowEl.addEventListener('mouseleave', () => {
      this.store.hoverNode(null);
    });

    nodeEl.appendChild(rowEl);

    // Filhos da célula (Átomos ou RowNodes aninhadas)
    if (!isCollapsed && Array.isArray(cell.children)) {
      const childrenWrap = document.createElement('div');
      cell.children.forEach((child) => {
        if (child.type === 'row') {
          this._renderRowNode(childrenWrap, child, cell.id, state, level + 1);
        } else {
          this._renderAtomNode(childrenWrap, child, cell.id, state, level + 1);
        }
      });
      nodeEl.appendChild(childrenWrap);
    }

    parentEl.appendChild(nodeEl);
  }

  /**
   * Renderiza um nó de Átomo (text, button, image, divider, menu, social)
   * @private
   */
  _renderAtomNode(parentEl, atom, cellId, state, level) {
    const isSelected = state.selectedId === atom.id;

    const nodeEl = document.createElement('div');
    nodeEl.className = 'nmf-tree-node';
    nodeEl.setAttribute('data-tree-id', atom.id);

    const rowEl = document.createElement('div');
    rowEl.className = `nmf-tree-row ${isSelected ? 'is-selected' : ''}`;
    rowEl.style.paddingLeft = `${level * 12 + 6}px`;

    const left = document.createElement('div');
    left.className = 'nmf-tree-row-left';

    const bullet = document.createElement('span');
    bullet.className = 'nmf-tree-toggle';
    bullet.innerHTML = '&bull;';
    bullet.style.fontSize = '8px';

    const icon = document.createElement('span');
    icon.className = 'nmf-tree-icon';
    icon.innerHTML = this._getAtomIconSvg(atom.atomType);

    const label = document.createElement('span');
    label.className = 'nmf-tree-label';
    label.textContent = atom.label || I18n.t(`atom.${atom.atomType}`, atom.atomType || 'Elemento');

    left.appendChild(bullet);
    left.appendChild(icon);
    left.appendChild(label);

    const actions = this._createRowActions(atom.id, 'atom');

    rowEl.appendChild(left);
    rowEl.appendChild(actions);

    rowEl.addEventListener('click', () => {
      this.store.selectNode(atom.id);
    });

    rowEl.addEventListener('mouseenter', () => {
      this.store.hoverNode(atom.id);
    });

    rowEl.addEventListener('mouseleave', () => {
      this.store.hoverNode(null);
    });

    nodeEl.appendChild(rowEl);
    parentEl.appendChild(nodeEl);
  }

  /**
   * Cria ações rápidas da linha da árvore (subir, descer, duplicar, excluir)
   * @private
   */
  _createRowActions(nodeId, type) {
    const wrap = document.createElement('div');
    wrap.className = 'nmf-tree-row-actions';

    // Subir
    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.className = 'nmf-tree-action-btn';
    btnUp.title = I18n.t('action.move_up', 'Mover para Cima');
    btnUp.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    btnUp.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.moveNode(nodeId, 'up');
    });

    // Descer
    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.className = 'nmf-tree-action-btn';
    btnDown.title = I18n.t('action.move_down', 'Mover para Baixo');
    btnDown.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    btnDown.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.moveNode(nodeId, 'down');
    });

    // Duplicar
    const btnDup = document.createElement('button');
    btnDup.type = 'button';
    btnDup.className = 'nmf-tree-action-btn';
    btnDup.title = I18n.t('action.duplicate', 'Duplicar');
    btnDup.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    btnDup.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.duplicateNode(nodeId);
    });

    // Excluir
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'nmf-tree-action-btn is-delete';
    btnDel.title = I18n.t('action.delete', 'Excluir');
    btnDel.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      const confirmMsg = I18n.t('ui.confirm_delete', 'Deseja excluir este item?');
      if (window.confirm(confirmMsg)) {
        this.store.removeNode(nodeId);
      }
    });

    wrap.appendChild(btnUp);
    wrap.appendChild(btnDown);
    wrap.appendChild(btnDup);
    wrap.appendChild(btnDel);

    return wrap;
  }

  /**
   * Cria linha com botão '+' entre nós para inserção contextual
   * @private
   */
  _createInsertLine(targetId, context) {
    const line = document.createElement('div');
    line.className = 'nmf-tree-insert-line';
    line.title = I18n.t('action.insert_element', 'Inserir Elemento');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nmf-tree-insert-btn';
    btn.textContent = '+';

    line.appendChild(btn);

    line.addEventListener('click', (e) => {
      e.stopPropagation();
      this._openInsertPopover(btn, targetId, context);
    });

    return line;
  }

  /**
   * Abre popover contextual de inserção
   * @private
   */
  _openInsertPopover(anchorEl, targetId, context) {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }

    const rect = anchorEl.getBoundingClientRect();
    const popover = document.createElement('div');
    popover.className = 'nmf-insert-popover';
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${Math.min(window.innerWidth - 180, Math.max(10, rect.left - 60))}px`;

    // Opções baseadas no contexto
    if (context === 'before_first_block' || context === 'after_block') {
      const itemBlock = document.createElement('button');
      itemBlock.type = 'button';
      itemBlock.className = 'nmf-popover-item';
      itemBlock.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        <span>${I18n.t('ui.add_block', 'Adicionar Bloco')}</span>
      `;
      itemBlock.addEventListener('click', () => {
        const newBlock = BlockFactory.createBlock({
          rows: [
            BlockFactory.createRow({
              cells: [
                BlockFactory.createCell({
                  children: [BlockFactory.createTextAtom()]
                })
              ]
            })
          ]
        });
        if (context === 'before_first_block') {
          this.store.insertNodeAt(null, 'first', newBlock);
        } else {
          this.store.insertNodeAt(targetId, 'after', newBlock);
        }
        popover.remove();
      });
      popover.appendChild(itemBlock);
    }

    document.body.appendChild(popover);
    this.activePopover = popover;

    const closeHandler = (e) => {
      if (!popover.contains(e.target) && e.target !== anchorEl) {
        popover.remove();
        this.activePopover = null;
        window.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => window.addEventListener('click', closeHandler), 10);
  }

  /**
   * Sincroniza a rolagem da árvore com o nó selecionado
   * @private
   */
  _syncScrollWithSelection(selectedId) {
    if (!selectedId || !this.element) return;
    const targetNode = this.element.querySelector(`[data-tree-id="${selectedId}"]`);
    if (targetNode) {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Retorna ícones SVG para átomos
   * @private
   */
  _getAtomIconSvg(atomType) {
    switch (atomType) {
      case 'text':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>';
      case 'button':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
      case 'image':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
      case 'divider':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      case 'menu':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      case 'social':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
      default:
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';
    }
  }

  /**
   * Monta o elemento no container
   * @param {HTMLElement} parent
   */
  mount(parent) {
    if (parent && parent.appendChild) {
      parent.appendChild(this.element);
      this.render();
    }
    return this;
  }
}

export default TreeNavigator;

