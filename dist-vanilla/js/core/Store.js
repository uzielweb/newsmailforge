/**
 * News Mail Forge - Reactive Store & History Manager
 * Gerencia estado global, histórico (Undo/Redo até 50 estados), seleção de 5 níveis
 * e operações na árvore de nós (Document -> Block -> Row -> Cell -> Atom).
 * UTF-8 sem BOM (No BOM)
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { BlockFactory, cloneNodeWithNewIds } from './BlockFactory.js';

export class Store {
  /**
   * @param {Object} [initialDocument]
   * @param {Object} [options]
   */
  constructor(initialDocument = null, options = {}) {
    this.maxHistory = options.maxHistory || 50;
    this.listeners = new Set();

    const doc = initialDocument ? cloneNodeWithNewIds(initialDocument) : BlockFactory.createDocument();

    this.state = {
      document: doc,
      selectedId: null, // null representa o nível 'main' (Global / GeneralSettings)
      selectedType: 'main', // 'main' | 'block' | 'row' | 'cell' | 'atom'
      hoveredId: null,
      mode: 'editor', // 'editor' | 'preview'
      viewport: 'desktop', // 'desktop' (600px) | 'mobile' (375px)
      activeTab: 'library', // 'library' | 'tree'
      activeCategory: 'header',
      canUndo: false,
      canRedo: false
    };

    this.historyStack = [];
    this.historyIndex = -1;

    // Registra o estado inicial no histórico
    this._pushHistorySnapshot();
  }

  /**
   * Retorna cópia do estado atual
   * @returns {Object}
   */
  getState() {
    return {
      ...this.state,
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.historyStack.length - 1
    };
  }

  /**
   * Inscreve um ouvinte de mutação de estado
   * @param {Function} fn
   * @returns {Function} Função para cancelar a inscrição
   */
  subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /**
   * Notifica todos os ouvintes registrados
   * @private
   */
  _notify() {
    this.state.canUndo = this.historyIndex > 0;
    this.state.canRedo = this.historyIndex < this.historyStack.length - 1;
    const currentState = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.error('[NewsMailForge Store] Listener error:', err);
      }
    }
  }

  /**
   * Grava um snapshot imutável do documento no histórico
   * @private
   */
  _pushHistorySnapshot() {
    // Trunca qualquer ramo de redo existente
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }

    const snapshot = JSON.stringify(this.state.document);
    this.historyStack.push(snapshot);

    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    } else {
      this.historyIndex++;
    }

    this.state.canUndo = this.historyIndex > 0;
    this.state.canRedo = this.historyIndex < this.historyStack.length - 1;
  }

  /**
   * Desfaz a última ação (Undo)
   * @returns {boolean}
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const snapshot = this.historyStack[this.historyIndex];
      this.state.document = JSON.parse(snapshot);
      // Se o nó selecionado não existir mais no documento restaurado, reseta para 'main'
      if (this.state.selectedId && !this.findNodeById(this.state.selectedId)) {
        this.state.selectedId = null;
        this.state.selectedType = 'main';
      }
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Refaz a última ação desfeita (Redo)
   * @returns {boolean}
   */
  redo() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      const snapshot = this.historyStack[this.historyIndex];
      this.state.document = JSON.parse(snapshot);
      if (this.state.selectedId && !this.findNodeById(this.state.selectedId)) {
        this.state.selectedId = null;
        this.state.selectedType = 'main';
      }
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Retorna o documento atual
   * @returns {Object}
   */
  getDocument() {
    return this.state.document;
  }

  /**
   * Substitui o documento atual
   * @param {Object} doc
   * @param {boolean} [recordHistory=true]
   */
  setDocument(doc, recordHistory = true) {
    if (!doc || typeof doc !== 'object') return;
    this.state.document = cloneNodeWithNewIds(doc);
    this.state.selectedId = null;
    this.state.selectedType = 'main';
    this.state.hoveredId = null;
    if (recordHistory) {
      this._pushHistorySnapshot();
    }
    this._notify();
  }

  /**
   * Anexa os blocos de outro documento ao final do documento atual
   * @param {Object} doc
   */
  appendDocument(doc) {
    if (!doc || !Array.isArray(doc.blocks)) return;
    const incoming = cloneNodeWithNewIds(doc);
    if (!Array.isArray(this.state.document.blocks)) {
      this.state.document.blocks = [];
    }
    this.state.document.blocks.push(...incoming.blocks);
    this._pushHistorySnapshot();
    this._notify();
  }

  /**
   * Atualiza configurações globais (generalSettings)
   * @param {Object} patch
   */
  updateGeneralSettings(patch) {
    if (!patch || typeof patch !== 'object') return;
    this.state.document.generalSettings = {
      ...this.state.document.generalSettings,
      ...patch
    };
    this._pushHistorySnapshot();
    this._notify();
  }

  /**
   * Define o viewport de visualização ('desktop' | 'mobile')
   * @param {'desktop'|'mobile'} viewport
   */
  setViewport(viewport) {
    if (viewport === 'desktop' || viewport === 'mobile') {
      this.state.viewport = viewport;
      this._notify();
    }
  }

  /**
   * Alterna o modo de exibição entre edição e pré-visualização limpa
   * @param {'editor'|'preview'} mode
   */
  setMode(mode) {
    if (mode === 'editor' || mode === 'preview') {
      this.state.mode = mode;
      if (mode === 'preview') {
        this.state.selectedId = null;
        this.state.selectedType = 'main';
        this.state.hoveredId = null;
      }
      this._notify();
    }
  }

  /**
   * Alterna a aba ativa na barra lateral ('library' | 'tree')
   * @param {'library'|'tree'} tab
   */
  setActiveTab(tab) {
    if (tab === 'library' || tab === 'tree') {
      this.state.activeTab = tab;
      this._notify();
    }
  }

  /**
   * Define a categoria ativa no catálogo de blocos
   * @param {string} category
   */
  setActiveCategory(category) {
    if (typeof category === 'string') {
      this.state.activeCategory = category;
      this._notify();
    }
  }

  /**
   * Seleciona um nó pelo ID (ou null / 'main' para configurações globais)
   * @param {string|null} id
   */
  selectNode(id) {
    if (!id || id === 'main' || id === this.state.document.id) {
      this.state.selectedId = null;
      this.state.selectedType = 'main';
      this._notify();
      return;
    }

    const hit = this.findNodeById(id);
    if (hit && hit.node) {
      this.state.selectedId = id;
      this.state.selectedType = hit.node.type || 'atom';
    } else {
      this.state.selectedId = null;
      this.state.selectedType = 'main';
    }
    this._notify();
  }

  /**
   * Define o nó em hover
   * @param {string|null} id
   */
  hoverNode(id) {
    const next = id || null;
    if (this.state.hoveredId !== next) {
      this.state.hoveredId = next;
      this._notify();
    }
  }

  /**
   * Retorna os detalhes do nó atualmente selecionado
   * @returns {Object|null}
   */
  getSelectedNode() {
    if (!this.state.selectedId) {
      return {
        type: 'main',
        node: this.state.document,
        parent: null,
        index: -1,
        path: [this.state.document]
      };
    }
    return this.findNodeById(this.state.selectedId);
  }

  /**
   * Busca um nó recursivamente na árvore por ID
   * Suporta aninhamento recursivo (RowNode dentro de CellNode).
   * @param {string} id
   * @param {Object} [root]
   * @returns {{node: Object, parent: Object|null, index: number, path: Object[]}|null}
   */
  findNodeById(id, root = this.state.document) {
    if (!id || !root) return null;
    if (root.id === id) {
      return { type: root.type || 'document', node: root, parent: null, index: -1, path: [root] };
    }

    const blocks = Array.isArray(root.blocks) ? root.blocks : [];
    for (let b = 0; b < blocks.length; b++) {
      const block = blocks[b];
      if (block.id === id) {
        return { type: block.type || 'block', node: block, parent: root, index: b, path: [root, block] };
      }

      const rows = Array.isArray(block.rows) ? block.rows : [];
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (row.id === id) {
          return { type: row.type || 'row', node: row, parent: block, index: r, path: [root, block, row] };
        }

        const matchInRow = this._searchInCells(row, id, [root, block, row]);
        if (matchInRow) return matchInRow;
      }
    }

    return null;
  }

  /**
   * Busca recursiva em células e seus filhos (Atoms ou Rows aninhadas)
   * @private
   */
  _searchInCells(row, id, currentPath) {
    const cells = Array.isArray(row.cells) ? row.cells : [];
    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      if (cell.id === id) {
        return { type: cell.type || 'cell', node: cell, parent: row, index: c, path: [...currentPath, cell] };
      }

      const children = Array.isArray(cell.children) ? cell.children : [];
      for (let ch = 0; ch < children.length; ch++) {
        const child = children[ch];
        if (child.id === id) {
          return { type: child.type || 'atom', node: child, parent: cell, index: ch, path: [...currentPath, cell, child] };
        }

        // Se o filho for uma RowNode aninhada recursivamente
        if (child.type === 'row') {
          const nestedMatch = this._searchInCells(child, id, [...currentPath, cell, child]);
          if (nestedMatch) return nestedMatch;
        }
      }
    }
    return null;
  }

  /**
   * Atualiza propriedades superficiais de um nó
   * @param {string} id
   * @param {Object} patch
   */
  updateNode(id, patch) {
    if (!id || !patch) return;
    const hit = this.findNodeById(id);
    if (!hit || !hit.node) return;

    Object.assign(hit.node, patch);
    this._pushHistorySnapshot();
    this._notify();
  }

  /**
   * Atualiza propriedades de um nó sem disparar notificações aos ouvintes
   * Atualiza o snapshot do histórico atual para manter integridade sem recriar o DOM.
   * @param {string} id
   * @param {Object} patch
   */
  updateNodeSilent(id, patch) {
    if (!id || !patch) return;
    const hit = this.findNodeById(id);
    if (!hit || !hit.node) return;

    Object.assign(hit.node, patch);
    if (this.historyIndex >= 0 && this.historyIndex < this.historyStack.length) {
      this.historyStack[this.historyIndex] = JSON.stringify(this.state.document);
    }
  }

  /**
   * Atualiza as configurações (settings) de um nó com mesclagem profunda em spacing
   * @param {string} id
   * @param {Object} settingsPatch
   */
  updateNodeSettings(id, settingsPatch) {
    if (!id || !settingsPatch) return;
    const hit = this.findNodeById(id);
    if (!hit || !hit.node) return;

    if (!hit.node.settings) {
      hit.node.settings = {};
    }

    const currentSettings = hit.node.settings;
    const nextSettings = { ...currentSettings, ...settingsPatch };

    if (settingsPatch.spacing && currentSettings.spacing) {
      nextSettings.spacing = {
        ...currentSettings.spacing,
        ...settingsPatch.spacing
      };
    }

    hit.node.settings = nextSettings;
    this._pushHistorySnapshot();
    this._notify();
  }

  /**
   * Adiciona um bloco ao documento
   * @param {Object} [block]
   * @param {number} [index=-1]
   * @returns {Object} O bloco adicionado
   */
  addBlock(block = null, index = -1) {
    const newBlock = block ? cloneNodeWithNewIds(block) : BlockFactory.createBlock();
    if (!Array.isArray(this.state.document.blocks)) {
      this.state.document.blocks = [];
    }

    if (index >= 0 && index < this.state.document.blocks.length) {
      this.state.document.blocks.splice(index, 0, newBlock);
    } else {
      this.state.document.blocks.push(newBlock);
    }

    this.selectNode(newBlock.id);
    this._pushHistorySnapshot();
    this._notify();
    return newBlock;
  }

  /**
   * Adiciona uma nova linha com uma coluna e texto dentro de um bloco
   * @param {string} blockId
   * @returns {Object|null}
   */
  addRowToBlock(blockId) {
    const hit = this.findNodeById(blockId);
    if (!hit || !hit.node || hit.node.type !== 'block') return null;

    const newRow = BlockFactory.createRow({
      cells: [
        BlockFactory.createCell({
          children: [BlockFactory.createTextAtom()]
        })
      ]
    });

    if (!Array.isArray(hit.node.rows)) {
      hit.node.rows = [];
    }
    hit.node.rows.push(newRow);

    this.selectNode(newRow.id);
    this._pushHistorySnapshot();
    this._notify();
    return newRow;
  }

  /**
   * Adiciona uma nova coluna (célula) a uma linha
   * @param {string} rowId
   * @returns {Object|null}
   */
  addCellToRow(rowId) {
    const hit = this.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row') return null;

    const newCell = BlockFactory.createCell({
      children: [BlockFactory.createTextAtom()]
    });

    if (!Array.isArray(hit.node.cells)) {
      hit.node.cells = [];
    }
    hit.node.cells.push(newCell);

    // Rebalanceia larguras das células caso sejam percentuais simples
    const totalCells = hit.node.cells.length;
    if (totalCells > 1) {
      const balancedWidth = `${(100 / totalCells).toFixed(2)}%`;
      hit.node.cells.forEach(c => {
        if (!c.settings) c.settings = {};
        c.settings.width = balancedWidth;
      });
    }

    this.selectNode(newCell.id);
    this._pushHistorySnapshot();
    this._notify();
    return newCell;
  }

  /**
   * Adiciona uma nova Row dentro de um bloco, opcionalmente antes ou depois de uma refRow
   * @param {string} blockId
   * @param {string|null} [refRowId=null]
   * @param {'before'|'after'} [position='after']
   * @returns {Object|null}
   */
  addRowAt(blockId, refRowId = null, position = 'after') {
    const hit = this.findNodeById(blockId);
    if (!hit || !hit.node || hit.node.type !== 'block') return null;

    const newRow = BlockFactory.createRow({
      cells: [
        BlockFactory.createCell({
          children: [BlockFactory.createTextAtom()]
        })
      ]
    });

    if (!Array.isArray(hit.node.rows)) {
      hit.node.rows = [];
    }

    if (!refRowId) {
      hit.node.rows.push(newRow);
    } else {
      const refIndex = hit.node.rows.findIndex(r => r.id === refRowId);
      if (refIndex === -1) {
        hit.node.rows.push(newRow);
      } else {
        const insertIndex = position === 'before' ? refIndex : refIndex + 1;
        hit.node.rows.splice(insertIndex, 0, newRow);
      }
    }

    this.selectNode(newRow.id);
    this._pushHistorySnapshot();
    this._notify();
    return newRow;
  }

  /**
   * Remove uma célula de uma linha e rebalanceia as larguras percentuais
   * @param {string} rowId
   * @param {string|null} [cellId=null]
   * @returns {boolean}
   */
  removeCellFromRow(rowId, cellId = null) {
    const hit = this.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row') return false;

    const row = hit.node;
    if (!Array.isArray(row.cells) || row.cells.length <= 1) return false;

    let removeIndex = -1;
    if (!cellId) {
      removeIndex = row.cells.length - 1;
    } else {
      removeIndex = row.cells.findIndex(c => c.id === cellId);
    }

    if (removeIndex === -1) return false;

    const [removedCell] = row.cells.splice(removeIndex, 1);

    const totalCells = row.cells.length;
    const balancedWidth = `${(100 / totalCells).toFixed(2)}%`;
    row.cells.forEach(c => {
      if (!c.settings) c.settings = {};
      c.settings.width = balancedWidth;
    });

    if (this.state.selectedId === removedCell.id) {
      this.selectNode(row.id);
    }

    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Ajusta contagem e larguras percentuais das colunas de uma linha (de 1 a 6 colunas)
   * Normaliza números ou strings para '%' somando 100%.
   * @param {string} rowId
   * @param {(string|number)[]} widthsArray
   * @returns {boolean}
   */
  setRowColumnsLayout(rowId, widthsArray) {
    if (!rowId || !Array.isArray(widthsArray) || widthsArray.length === 0) return false;
    const hit = this.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row') return false;

    const row = hit.node;
    if (!Array.isArray(row.cells)) {
      row.cells = [];
    }

    // Aceita de 1 até 6 colunas
    const clampedWidths = widthsArray.slice(0, 6);
    const targetCount = clampedWidths.length;

    // Normaliza valores numéricos para somar 100%
    const numericValues = clampedWidths.map(w => {
      const parsed = parseFloat(String(w).replace('%', ''));
      return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    });
    const total = numericValues.reduce((acc, v) => acc + v, 0) || 1;

    let accumulated = 0;
    const normalizedWidths = [];
    for (let i = 0; i < targetCount; i++) {
      if (i === targetCount - 1) {
        const lastVal = Math.max(0, 100 - accumulated);
        normalizedWidths.push(`${lastVal.toFixed(2)}%`);
      } else {
        const val = parseFloat(((numericValues[i] / total) * 100).toFixed(2));
        accumulated += val;
        normalizedWidths.push(`${val.toFixed(2)}%`);
      }
    }

    // Preserva células existentes até o limite ou trunca excedentes
    if (row.cells.length > targetCount) {
      row.cells = row.cells.slice(0, targetCount);
    }

    // Se faltarem células para preencher as larguras, cria novas
    while (row.cells.length < targetCount) {
      row.cells.push(BlockFactory.createCell({
        children: [BlockFactory.createTextAtom()]
      }));
    }

    // Aplica larguras percentuais normalizadas
    row.cells.forEach((cell, idx) => {
      if (!cell.settings) cell.settings = {};
      cell.settings.width = normalizedWidths[idx];
    });

    if (this.state.selectedId && !this.findNodeById(this.state.selectedId)) {
      this.selectNode(row.id);
    }

    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Redimensiona as larguras das células de uma linha
   * @param {string} rowId
   * @param {(string|number)[]} widthsArray
   * @param {boolean} [pushHistory=true]
   * @returns {boolean}
   */
  resizeRowCells(rowId, widthsArray, pushHistory = true) {
    if (!rowId || !Array.isArray(widthsArray)) return false;
    const hit = this.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row' || !Array.isArray(hit.node.cells)) return false;

    const row = hit.node;
    widthsArray.forEach((w, idx) => {
      if (idx < row.cells.length) {
        const cell = row.cells[idx];
        if (!cell.settings) cell.settings = {};
        const strVal = String(w).trim();
        cell.settings.width = strVal.endsWith('%') ? strVal : `${strVal}%`;
      }
    });

    if (pushHistory) {
      this._pushHistorySnapshot();
    }
    this._notify();
    return true;
  }

  /**
   * Move uma célula para a esquerda ou direita dentro de sua linha
   * @param {string} rowId
   * @param {string} cellId
   * @param {'left'|'right'} direction
   * @returns {boolean}
   */
  moveCellInRow(rowId, cellId, direction) {
    if (!rowId || !cellId) return false;
    const hit = this.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row' || !Array.isArray(hit.node.cells)) return false;

    const row = hit.node;
    const index = row.cells.findIndex(c => c.id === cellId);
    if (index === -1) return false;

    const delta = direction === 'left' ? -1 : 1;
    const targetIndex = index + delta;

    if (targetIndex < 0 || targetIndex >= row.cells.length) {
      return false;
    }

    const [cell] = row.cells.splice(index, 1);
    row.cells.splice(targetIndex, 0, cell);

    this.selectNode(cell.id);
    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Insere um nó antes, depois ou dentro de outro nó de forma contextual
   * @param {string} targetId
   * @param {'before'|'after'|'inside'} position
   * @param {Object} newNode
   * @returns {boolean}
   */
  insertNodeAt(targetId, position, newNode) {
    if (!newNode) return false;

    const hasCollision = newNode.id && !!this.findNodeById(newNode.id);
    const preparedNode = hasCollision ? cloneNodeWithNewIds(newNode) : newNode;

    if (position === 'first') {
      if (!Array.isArray(this.state.document.blocks)) {
        this.state.document.blocks = [];
      }
      this.state.document.blocks.unshift(preparedNode);
      this.selectNode(preparedNode.id);
      this._pushHistorySnapshot();
      this._notify();
      return true;
    }

    if (!targetId) return false;

    if (position === 'inside') {
      const targetHit = this.findNodeById(targetId);
      if (!targetHit || !targetHit.node) return false;
      const target = targetHit.node;

      if (target.type === 'document' && preparedNode.type === 'block') {
        target.blocks.push(preparedNode);
      } else if (target.type === 'block' && preparedNode.type === 'row') {
        if (!Array.isArray(target.rows)) target.rows = [];
        target.rows.push(preparedNode);
      } else if (target.type === 'row' && preparedNode.type === 'cell') {
        if (!Array.isArray(target.cells)) target.cells = [];
        target.cells.push(preparedNode);
      } else if (target.type === 'cell') {
        if (!Array.isArray(target.children)) target.children = [];
        target.children.push(preparedNode);
      } else {
        return false;
      }

      this.selectNode(preparedNode.id);
      this._pushHistorySnapshot();
      this._notify();
      return true;
    }

    // Posição 'before' ou 'after'
    const hit = this.findNodeById(targetId);
    if (!hit || !hit.parent || hit.index < 0) return false;

    const list = this._getParentList(hit.parent, hit.node);
    if (!list) return false;

    const insertIndex = position === 'before' ? hit.index : hit.index + 1;
    list.splice(insertIndex, 0, preparedNode);

    this.selectNode(preparedNode.id);
    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Move um nó existente para outra posição ou container
   * @param {string} sourceId
   * @param {string} targetId
   * @param {'before'|'after'|'inside'} [position='after']
   * @returns {boolean}
   */
  moveNodeTo(sourceId, targetId, position = 'after') {
    if (!sourceId || !targetId || sourceId === targetId) return false;
    const sourceHit = this.findNodeById(sourceId);
    if (!sourceHit || !sourceHit.node || !sourceHit.parent) return false;

    const targetHit = this.findNodeById(targetId);
    if (!targetHit || !targetHit.node) return false;

    // Impede mover um nó para dentro de si mesmo ou de um de seus descendentes
    if (targetHit.path && targetHit.path.some(p => p.id === sourceId || p === sourceHit.node)) {
      return false;
    }

    const source = sourceHit.node;
    const target = targetHit.node;

    if (position === 'inside') {
      let targetList = null;
      if (target.type === 'document' && source.type === 'block') {
        if (!Array.isArray(target.blocks)) target.blocks = [];
        targetList = target.blocks;
      } else if (target.type === 'block' && source.type === 'row') {
        if (!Array.isArray(target.rows)) target.rows = [];
        targetList = target.rows;
      } else if (target.type === 'row' && source.type === 'cell') {
        if (!Array.isArray(target.cells)) target.cells = [];
        targetList = target.cells;
      } else if (target.type === 'cell' && (source.type === 'atom' || source.type === 'row')) {
        if (!Array.isArray(target.children)) target.children = [];
        targetList = target.children;
      } else {
        return false;
      }

      const sourceList = this._getParentList(sourceHit.parent, source);
      if (!sourceList || sourceHit.index < 0) return false;

      sourceList.splice(sourceHit.index, 1);
      targetList.push(source);

      this.selectNode(source.id);
      this._pushHistorySnapshot();
      this._notify();
      return true;
    }

    if (position === 'before' || position === 'after') {
      if (!targetHit.parent) return false;

      const isCellChildSource = (source.type === 'atom' || source.type === 'row');
      const isCellChildTarget = (target.type === 'atom' || target.type === 'row');
      const areBothCellChildren = isCellChildSource && isCellChildTarget && targetHit.parent.type === 'cell';
      const isSameType = source.type === target.type;

      if (!isSameType && !areBothCellChildren) {
        return false;
      }

      const sourceList = this._getParentList(sourceHit.parent, source);
      if (!sourceList || sourceHit.index < 0) return false;

      sourceList.splice(sourceHit.index, 1);

      const refreshedTarget = this.findNodeById(targetId);
      if (!refreshedTarget || !refreshedTarget.parent || refreshedTarget.index < 0) return false;

      const targetList = this._getParentList(refreshedTarget.parent, refreshedTarget.node);
      if (!targetList) return false;

      const insertIndex = position === 'before' ? refreshedTarget.index : refreshedTarget.index + 1;
      targetList.splice(insertIndex, 0, source);

      this.selectNode(source.id);
      this._pushHistorySnapshot();
      this._notify();
      return true;
    }

    return false;
  }

  /**
   * Move um nó para cima ou para baixo entre seus irmãos
   * @param {string} id
   * @param {'up'|'down'} direction
   * @returns {boolean}
   */
  moveNode(id, direction) {
    const hit = this.findNodeById(id);
    if (!hit || !hit.parent || hit.index < 0) return false;

    const list = this._getParentList(hit.parent, hit.node);
    if (!list || list.length <= 1) return false;

    const delta = direction === 'up' ? -1 : 1;
    const targetIndex = hit.index + delta;

    if (targetIndex < 0 || targetIndex >= list.length) {
      return false; // Já está no limite superior ou inferior
    }

    const [moved] = list.splice(hit.index, 1);
    list.splice(targetIndex, 0, moved);

    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Duplica um nó imediatamente após o original com novos IDs
   * @param {string} id
   * @returns {Object|null}
   */
  duplicateNode(id) {
    const hit = this.findNodeById(id);
    if (!hit || !hit.parent || hit.index < 0) return null;

    const list = this._getParentList(hit.parent, hit.node);
    if (!list) return null;

    const clone = cloneNodeWithNewIds(hit.node);
    list.splice(hit.index + 1, 0, clone);

    this.selectNode(clone.id);
    this._pushHistorySnapshot();
    this._notify();
    return clone;
  }

  /**
   * Remove um nó da árvore
   * @param {string} id
   * @returns {boolean}
   */
  removeNode(id) {
    const hit = this.findNodeById(id);
    if (!hit || !hit.parent || hit.index < 0) return false;

    const list = this._getParentList(hit.parent, hit.node);
    if (!list) return false;

    list.splice(hit.index, 1);

    if (this.state.selectedId === id) {
      this.state.selectedId = hit.parent.id === this.state.document.id ? null : hit.parent.id;
      this.state.selectedType = hit.parent.type === 'document' ? 'main' : (hit.parent.type || 'main');
    }

    if (this.state.hoveredId === id) {
      this.state.hoveredId = null;
    }

    this._pushHistorySnapshot();
    this._notify();
    return true;
  }

  /**
   * Obtém a lista array do nó pai correspondente ao tipo do filho
   * @private
   */
  _getParentList(parent, child) {
    if (!parent || !child) return null;
    if (parent.type === 'document') return parent.blocks;
    if (parent.type === 'block') return parent.rows;
    if (parent.type === 'row') return parent.cells;
    if (parent.type === 'cell') return parent.children;
    return null;
  }
}

export default Store;
