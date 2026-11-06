/**
 * NewsMailForge - InspectorPanel
 * Inspetor contextual de 5 níveis:
 * (1) Main / Document (Preheader, Cores de fundo, Largura, Padding 4 lados, Tipografia global)
 * (2) Block (Label, Padding 4 lados, Fundo, Borda, Radius, Opacidade)
 * (3) Row (Width Mode Fill/Hug, Gap em px com ScrubNumberInput, Collapse/Hide mobile, Padding, Fundo, + Cell)
 * (4) Cell (Width auto/%, Alinhamentos V/H, Link, Hide mobile, Padding, Fundo, + Átomos/+ Row aninhada)
 * (5) Atom (Campos específicos para text, button, image, divider, menu, social + Padding/Margin + Cores)
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { ScrubNumberInput } from './ScrubNumberInput.js';
import { BlockFactory } from '../core/BlockFactory.js';
import { ColorPickerPopover } from './ColorPickerPopover.js';

export class InspectorPanel {
  /**
   * @param {Object} store - Instância reativa do Store
   */
  constructor(store) {
    this.store = store;
    this.element = null;
    this.headerEl = null;
    this.bodyEl = null;
    this._lastRenderSignature = '';
    this._lastSelectedId = null;

    this._init();
  }

  /**
   * Inicialização do componente
   * @private
   */
  _init() {
    this.element = document.createElement('aside');
    this.element.className = 'nmf-inspector';

    this._buildHeader();
    this._buildBody();

    this.store.subscribe((state) => {
      // Se o popover de cores estiver aberto para o mesmo nó selecionado, não destrua a âncora
      const pop = document.querySelector('.nmf-color-popover, .nmf-color-picker-popover');
      if (pop && pop.style.display === 'block' && this._lastSelectedId === state.selectedId) {
        return;
      }

      const sig = JSON.stringify({
        selectedId: state.selectedId,
        selectedType: state.selectedType,
        mode: state.mode,
        historyIndex: this.store.historyIndex,
        doc: state.document
      });

      if (sig === this._lastRenderSignature) {
        return;
      }

      if (
        document.activeElement &&
        this.element &&
        this.element.contains(document.activeElement) &&
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
      ) {
        let lastSelectedId = null;
        try {
          const lastSigObj = this._lastRenderSignature ? JSON.parse(this._lastRenderSignature) : null;
          lastSelectedId = lastSigObj ? lastSigObj.selectedId : null;
        } catch (e) {}

        if (lastSelectedId === state.selectedId) {
          this._lastRenderSignature = sig;
          this._lastSelectedId = state.selectedId;
          return;
        }
      }

      this._lastRenderSignature = sig;
      this._lastSelectedId = state.selectedId;
      this.render();
    });

    I18n.onLocaleChange(() => {
      this._lastRenderSignature = '';
      this.render();
    });
  }

  /**
   * Constrói o cabeçalho fixo do inspetor
   * @private
   */
  _buildHeader() {
    const header = document.createElement('div');
    header.className = 'nmf-inspector-header';

    const title = document.createElement('div');
    title.className = 'nmf-inspector-title';

    const tag = document.createElement('span');
    tag.className = 'nmf-inspector-type-tag';
    tag.textContent = 'MAIN';

    title.appendChild(tag);
    header.appendChild(title);

    this.headerEl = header;
    this.titleEl = title;
    this.tagEl = tag;
    this.element.appendChild(header);
  }

  /**
   * Constrói a área de rolagem dos campos
   * @private
   */
  _buildBody() {
    const body = document.createElement('div');
    body.className = 'nmf-inspector-body';
    body.style.flex = '1';
    body.style.overflowY = 'auto';

    this.bodyEl = body;
    this.element.appendChild(body);
  }

  /**
   * Renderiza os controles contextuais baseados no nível selecionado
   */
  render() {
    this.bodyEl.innerHTML = '';

    const state = this.store.getState();
    const hit = this.store.getSelectedNode();
    const node = hit && hit.node ? hit.node : hit;
    const nodeType = (node && node.type) || state.selectedType || 'main';

    // Barra de Breadcrumb Interativa no topo de this.bodyEl
    if (hit && Array.isArray(hit.path) && hit.path.length > 1) {
      this._renderBreadcrumb(hit);
    }

    // Determina o nível ativo
    if (!node || nodeType === 'main' || nodeType === 'document') {
      this._renderMainLevel(node, hit);
    } else if (nodeType === 'block') {
      this._renderBlockLevel(node, hit);
    } else if (nodeType === 'row') {
      this._renderRowLevel(node, hit);
    } else if (nodeType === 'cell') {
      this._renderCellLevel(node, hit);
    } else if (nodeType === 'atom') {
      this._renderAtomLevel(node, hit);
    } else {
      this._renderMainLevel(node, hit);
    }
  }

  /**
   * Barra de Breadcrumb Interativa no topo do painel
   * @private
   */
  _renderBreadcrumb(hit) {
    const nav = document.createElement('nav');
    nav.className = 'nmf-breadcrumb';
    nav.style.display = 'flex';
    nav.style.alignItems = 'center';
    nav.style.flexWrap = 'wrap';
    nav.style.gap = '4px';
    nav.style.padding = '8px 16px';
    nav.style.fontSize = '11px';
    nav.style.borderBottom = '1px solid var(--nmf-border-subtle, #334155)';
    nav.style.backgroundColor = 'var(--nmf-bg-surface, #1e293b)';
    nav.style.lineHeight = '1.3';

    const rawPath = hit.path || [];
    const path = rawPath.filter((item) => item && item.type !== 'row');

    path.forEach((item, index) => {
      const isLast = index === path.length - 1;

      if (index > 0) {
        const sep = document.createElement('span');
        sep.className = 'nmf-breadcrumb-sep';
        sep.textContent = '›';
        sep.style.color = 'var(--nmf-text-tertiary, #64748b)';
        sep.style.userSelect = 'none';
        nav.appendChild(sep);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nmf-breadcrumb-item';
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.padding = '2px 4px';
      btn.style.borderRadius = '3px';
      btn.style.fontSize = '11px';
      btn.style.cursor = isLast ? 'default' : 'pointer';
      btn.style.fontFamily = 'inherit';

      let labelText = '';
      if (item.type === 'document') {
        labelText = I18n.t('type.document', 'Doc');
      } else if (item.type === 'block') {
        labelText = item.label || I18n.t('type.row', 'Linha');
      } else if (item.type === 'cell') {
        labelText = item.label || I18n.t('type.cell', 'Coluna');
      } else if (item.type === 'atom') {
        const atomType = item.atomType || 'text';
        labelText = item.label || I18n.t(`atom.${atomType}`, atomType);
      } else {
        labelText = item.label || item.type || '';
      }

      btn.textContent = labelText;

      if (isLast) {
        btn.style.fontWeight = '600';
        btn.style.color = 'var(--nmf-accent, #3b82f6)';
      } else {
        btn.style.color = 'var(--nmf-text-secondary, #94a3b8)';
        btn.addEventListener('mouseenter', () => {
          btn.style.color = '#ffffff';
          btn.style.backgroundColor = 'var(--nmf-bg-panel, #0f172a)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.color = 'var(--nmf-text-secondary, #94a3b8)';
          btn.style.backgroundColor = 'transparent';
        });
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (item.type === 'document') {
            this.store.selectNode(null);
          } else {
            this.store.selectNode(item.id);
          }
        });
      }

      nav.appendChild(btn);
    });

    this.bodyEl.appendChild(nav);
  }

  // ==========================================================================
  // NÍVEL 1: MAIN / DOCUMENT
  // ==========================================================================
  _renderMainLevel() {
    this.tagEl.textContent = 'DOCUMENT';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">DOC</span> <span>${I18n.t('inspector.main', 'Configurações do E-mail')}</span>`;

    const doc = this.store.getDocument();
    const gen = doc.generalSettings || {};

    // Seção Geral
    const secGeneral = this._createSection(I18n.t('type.document', 'Documento'));

    // Título do E-mail
    secGeneral.appendChild(this._createInputRow(I18n.t('type.document', 'Título'), doc.title || '', (val) => {
      doc.title = val;
      this.store.setDocument(doc, false);
    }));

    // Preheader / Preview Text
    secGeneral.appendChild(this._createInputRow(I18n.t('prop.preview_text', 'Pré-header'), gen.previewText || '', (val) => {
      this.store.updateGeneralSettings({ previewText: val });
    }));

    // Largura Máxima
    secGeneral.appendChild(this._createScrubRow(I18n.t('prop.canvas_width', 'Largura Máxima'), gen.canvasWidth || 600, 320, 900, 10, 'px', (val) => {
      this.store.updateGeneralSettings({ canvasWidth: val });
    }));

    this.bodyEl.appendChild(secGeneral);

    // Seção Cores e Fundo
    const secColors = this._createSection(I18n.t('prop.general_bg', 'Cores e Fundos'));

    secColors.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Fundo Externo'), (gen.background && gen.background.color) || '#f8fafc', (val) => {
      this.store.updateGeneralSettings({
        background: { ...(gen.background || {}), color: val }
      });
    }));

    secColors.appendChild(this._createColorRow(I18n.t('prop.content_background', 'Fundo do Conteúdo'), (gen.bodyBackground && gen.bodyBackground.color) || '#ffffff', (val) => {
      this._updateContentBackgroundColor(val);
    }));

    this.bodyEl.appendChild(secColors);

    // Seção Tipografia Global
    const secTypo = this._createSection(I18n.t('prop.font_family', 'Tipografia Padrão'));

    const fonts = [
      { label: 'Segoe UI / Arial', value: "'Segoe UI', Arial, sans-serif" },
      { label: 'Helvetica, Arial', value: "Helvetica, Arial, sans-serif" },
      { label: 'Georgia, serif', value: "Georgia, serif" },
      { label: 'Verdana, Geneva', value: "Verdana, Geneva, sans-serif" },
      { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" }
    ];

    secTypo.appendChild(this._createSelectRow(I18n.t('prop.font_family', 'Fonte'), fonts, gen.fontFamily || "'Segoe UI', Arial, sans-serif", (val) => {
      this.store.updateGeneralSettings({ fontFamily: val });
    }));

    secTypo.appendChild(this._createColorRow(I18n.t('prop.text_color', 'Cor do Texto'), gen.textColor || '#334155', (val) => {
      this.store.updateGeneralSettings({ textColor: val });
    }));

    this.bodyEl.appendChild(secTypo);

    // Seção Padding do Canvas (4 lados)
    const secPadding = this._createSection(I18n.t('prop.padding', 'Espaçamento Externo'));
    const padArr = Array.isArray(gen.padding) && gen.padding.length === 4 ? gen.padding : [24, 16, 24, 16];

    secPadding.appendChild(this._createBoxGrid(padArr, (newPad) => {
      this.store.updateGeneralSettings({ padding: newPad });
    }));

    this.bodyEl.appendChild(secPadding);
  }

  /**
   * Atualiza o Fundo do Conteúdo do documento e sincroniza blocos com cor padrão/antiga
   * @param {string} val
   * @private
   */
  _updateContentBackgroundColor(val) {
    const doc = this.store.getDocument();
    const gen = doc.generalSettings || {};
    const oldEmailBg = ((gen.bodyBackground && gen.bodyBackground.color) || '#ffffff').toLowerCase();

    (doc.blocks || []).forEach((blk) => {
      const blkBg = ((blk.settings && blk.settings.backgroundColor) || '').toLowerCase();
      if (blkBg === oldEmailBg || blkBg === '#ffffff' || blkBg === '') {
        if (!blk.settings) blk.settings = {};
        blk.settings.backgroundColor = val;
      }
    });

    this.store.updateGeneralSettings({
      bodyBackground: { ...(gen.bodyBackground || {}), color: val }
    });
  }

  /**
   * Seção contextual de Cores e Fundos Hierárquicos (Coluna, Linha, Bloco, Documento)
   * @param {Object} hit
   * @returns {HTMLElement}
   * @private
   */
  _createHierarchyBackgroundsSection(hit) {
    const sec = this._createSection(I18n.t('prop.general_bg', 'Cores e Fundos'));

    const path = (hit && Array.isArray(hit.path)) ? hit.path : [];
    const currentNode = (hit && hit.node) ? hit.node : hit;

    let cellNode = null;
    let rowNode = null;
    let blockNode = null;

    if (currentNode) {
      if (currentNode.type === 'cell') cellNode = currentNode;
      else if (currentNode.type === 'row') rowNode = currentNode;
      else if (currentNode.type === 'block') blockNode = currentNode;
    }

    path.forEach((item) => {
      if (!item) return;
      if (item.type === 'cell') cellNode = item;
      else if (item.type === 'row') rowNode = item;
      else if (item.type === 'block') blockNode = item;
    });

    if (hit && hit.parent) {
      if (hit.parent.type === 'cell') cellNode = cellNode || hit.parent;
      else if (hit.parent.type === 'row') rowNode = rowNode || hit.parent;
      else if (hit.parent.type === 'block') blockNode = blockNode || hit.parent;
    }

    // (1) Se houver Coluna (cell)
    if (cellNode) {
      const cellBg = (cellNode.settings && cellNode.settings.backgroundColor) || 'transparent';
      const cellLabel = `${I18n.t('type.cell', 'Coluna')} — ${I18n.t('prop.background_color', 'Cor de Fundo')}`;
      sec.appendChild(this._createColorRow(cellLabel, cellBg, (val) => {
        this.store.updateNodeSettings(cellNode.id, { backgroundColor: val });
      }));
    }

    // (2) Linha (Row/Block) — Cor de Fundo (unificada: exibe apenas UMA Linha para o usuário)
    const primaryLineNode = blockNode || rowNode;
    if (primaryLineNode) {
      const lineBg = (primaryLineNode.settings && primaryLineNode.settings.backgroundColor) || (blockNode ? '#ffffff' : 'transparent');
      const lineLabel = `${I18n.t('type.row', 'Linha')} — ${I18n.t('prop.background_color', 'Cor de Fundo')}`;
      sec.appendChild(this._createColorRow(lineLabel, lineBg, (val) => {
        this.store.updateNodeSettings(primaryLineNode.id, { backgroundColor: val });
      }));
    }

    // (4) Documento: Fundo do Conteúdo e Fundo Externo
    const doc = this.store.getDocument();
    const gen = doc.generalSettings || {};

    const contentBgLabel = `${I18n.t('type.document', 'Documento')} — ${I18n.t('prop.content_background', 'Fundo do Conteúdo')}`;
    const contentBg = (gen.bodyBackground && gen.bodyBackground.color) || '#ffffff';
    sec.appendChild(this._createColorRow(contentBgLabel, contentBg, (val) => {
      this._updateContentBackgroundColor(val);
    }));

    const outerBgLabel = `${I18n.t('type.document', 'Documento')} — ${I18n.t('prop.background_color', 'Fundo Externo')}`;
    const outerBg = (gen.background && gen.background.color) || '#f8fafc';
    sec.appendChild(this._createColorRow(outerBgLabel, outerBg, (val) => {
      this.store.updateGeneralSettings({
        background: { ...(gen.background || {}), color: val }
      });
    }));

    return sec;
  }

  // ==========================================================================
  // NÍVEL 2: BLOCK
  // ==========================================================================
  _renderBlockLevel(block, hit) {
    this.tagEl.textContent = 'ROW';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">ROW</span> <span>${I18n.t('inspector.row', 'Propriedades da Linha')}</span>`;

    const s = block.settings || {};
    const primaryRow = Array.isArray(block.rows) && block.rows.length > 0 ? block.rows[0] : null;

    const secGeneral = this._createSection(I18n.t('type.row', 'Linha'));
    secGeneral.appendChild(this._createInputRow(I18n.t('type.row', 'Rótulo'), block.label || '', (val) => {
      this.store.updateNode(block.id, { label: val });
    }));

    if (primaryRow) {
      const rs = primaryRow.settings || {};

      // Gap entre colunas
      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.gap', 'Espaço entre Colunas (Gap)'), rs.gap !== undefined ? rs.gap : 16, 0, 60, 2, 'px', (val) => {
        this.store.updateNodeSettings(primaryRow.id, { gap: val });
      }));

      // Toggles Mobile
      secGeneral.appendChild(this._createToggleRow(I18n.t('prop.collapse_on_mobile', 'Empilhar no Mobile'), rs.collapseOnMobile !== false, (val) => {
        this.store.updateNodeSettings(primaryRow.id, { collapseOnMobile: val });
      }));

      secGeneral.appendChild(this._createToggleRow(I18n.t('prop.hidden_on_mobile', 'Ocultar no Mobile'), rs.hiddenOnMobile === true, (val) => {
        this.store.updateNodeSettings(primaryRow.id, { hiddenOnMobile: val });
      }));
    }

    this.bodyEl.appendChild(secGeneral);
    this.bodyEl.appendChild(this._createContextualStructureManager(hit || { node: block, path: [block] }));

    // Fundo e Aparência
    const secBg = this._createSection(I18n.t('prop.background_color', 'Aparência'));

    secBg.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Cor de Fundo'), s.backgroundColor || '#ffffff', (val) => {
      if (primaryRow && primaryRow.settings && primaryRow.settings.backgroundColor && primaryRow.settings.backgroundColor !== 'transparent') {
        this.store.updateNodeSettings(primaryRow.id, { backgroundColor: 'transparent' });
      }
      this.store.updateNodeSettings(block.id, { backgroundColor: val });
    }));

    secBg.appendChild(this._createInputRow(I18n.t('prop.background_image', 'URL Imagem Fundo'), s.backgroundImage || '', (val) => {
      this.store.updateNodeSettings(block.id, { backgroundImage: val });
    }));

    secBg.appendChild(this._createScrubRow(I18n.t('prop.border_radius', 'Arredondamento'), s.borderRadius || 0, 0, 50, 1, 'px', (val) => {
      this.store.updateNodeSettings(block.id, { borderRadius: val });
    }));

    secBg.appendChild(this._createScrubRow(I18n.t('prop.opacity', 'Opacidade'), s.opacity !== undefined ? s.opacity : 1, 0, 1, 0.05, '', (val) => {
      this.store.updateNodeSettings(block.id, { opacity: val });
    }));

    this.bodyEl.appendChild(secBg);

    // Borda da Linha
    const secBorder = this._createSection(I18n.t('prop.border', 'Borda'));
    const borderObj = (s.border && typeof s.border === 'object') ? s.border : { width: 0, style: 'solid', color: 'transparent' };

    secBorder.appendChild(this._createScrubRow(I18n.t('prop.border_width', 'Espessura da Borda'), borderObj.width || 0, 0, 20, 1, 'px', (val) => {
      this.store.updateNodeSettings(block.id, {
        border: { ...borderObj, width: val, style: borderObj.style || 'solid' }
      });
    }));

    secBorder.appendChild(this._createColorRow(I18n.t('prop.border_color', 'Cor da Borda'), borderObj.color || 'transparent', (val) => {
      this.store.updateNodeSettings(block.id, {
        border: { ...borderObj, color: val, style: borderObj.style || 'solid' }
      });
    }));

    const borderStyles = [
      { label: I18n.t('prop.border_solid', 'Sólida'), value: 'solid' },
      { label: I18n.t('prop.border_dashed', 'Tracejada'), value: 'dashed' },
      { label: I18n.t('prop.border_dotted', 'Pontilhada'), value: 'dotted' }
    ];
    secBorder.appendChild(this._createSelectRow(I18n.t('prop.border_style', 'Estilo da Borda'), borderStyles, borderObj.style || 'solid', (val) => {
      this.store.updateNodeSettings(block.id, {
        border: { ...borderObj, style: val }
      });
    }));

    this.bodyEl.appendChild(secBorder);

    // Padding 4 lados
    const secPad = this._createSection(I18n.t('prop.padding', 'Espaçamento Interno (Padding)'));
    const padding = (s.spacing && s.spacing.padding) || [20, 24, 20, 24];

    secPad.appendChild(this._createBoxGrid(padding, (newPad) => {
      this.store.updateNodeSettings(block.id, {
        spacing: { ...(s.spacing || {}), padding: newPad }
      });
    }));

    this.bodyEl.appendChild(secPad);

    // Ações de Excluir Linha
    const secRowDel = this._createSection(I18n.t('action.delete_row', 'Excluir Linha'));
    const btnDelRow = document.createElement('button');
    btnDelRow.type = 'button';
    btnDelRow.className = 'nmf-btn nmf-btn-danger';
    btnDelRow.style.width = '100%';
    btnDelRow.textContent = I18n.t('action.delete_row', 'Excluir Linha');
    btnDelRow.addEventListener('click', () => {
      this.store.removeNode(block.id);
    });
    secRowDel.appendChild(btnDelRow);
    this.bodyEl.appendChild(secRowDel);
  }

  // ==========================================================================
  // NÍVEL 3: ROW (SEMPRE REDIRECIONA PARA BLOCK LEVEL)
  // ==========================================================================
  _renderRowLevel(row, hit) {
    let parentBlock = hit && hit.parent && hit.parent.type === 'block' ? hit.parent : null;
    if (!parentBlock && Array.isArray(hit && hit.path)) {
      for (let i = hit.path.length - 1; i >= 0; i--) {
        if (hit.path[i] && hit.path[i].type === 'block') {
          parentBlock = hit.path[i];
          break;
        }
      }
    }
    if (!parentBlock) {
      const rowHit = this.store.findNodeById(row.id);
      if (rowHit && rowHit.parent && rowHit.parent.type === 'block') {
        parentBlock = rowHit.parent;
      }
    }

    if (parentBlock) {
      const blockHit = this.store.findNodeById(parentBlock.id);
      return this._renderBlockLevel(parentBlock, blockHit || { node: parentBlock, path: [parentBlock] });
    }

    this.bodyEl.appendChild(this._createContextualStructureManager(hit || { node: row, path: [row] }));
  }

  /**
   * Aplica larguras nas células de uma linha de forma segura
   * @param {string} rowId
   * @param {string[]} widths
   * @private
   */
  _applyRowWidths(rowId, widths) {
    const hit = this.store.findNodeById(rowId);
    const row = hit && hit.node ? hit.node : null;
    const currentCount = row && Array.isArray(row.cells) ? row.cells.length : 0;

    if (widths.length !== currentCount) {
      if (typeof this.store.setRowColumnsLayout === 'function') {
        this.store.setRowColumnsLayout(rowId, widths);
      } else {
        this._setRowColumnsLayoutFallback(rowId, widths);
      }
    } else {
      if (typeof this.store.resizeRowCells === 'function') {
        this.store.resizeRowCells(rowId, widths, true);
      } else if (typeof this.store.setRowColumnsLayout === 'function') {
        this.store.setRowColumnsLayout(rowId, widths);
      } else {
        this._setRowColumnsLayoutFallback(rowId, widths);
      }
    }
  }

  /**
   * Move uma célula dentro de sua linha
   * @param {string} rowId
   * @param {string} cellId
   * @param {'left'|'right'} direction
   * @private
   */
  _moveCellInRow(rowId, cellId, direction) {
    if (typeof this.store.moveCellInRow === 'function') {
      return this.store.moveCellInRow(rowId, cellId, direction);
    }
    const dir = direction === 'left' ? 'up' : 'down';
    return this.store.moveNode(cellId, dir);
  }

  /**
   * Fallback para definir layout de colunas da linha
   * @param {string} rowId
   * @param {string[]} widths
   * @private
   */
  _setRowColumnsLayoutFallback(rowId, widths) {
    const hit = this.store.findNodeById(rowId);
    if (!hit || !hit.node || hit.node.type !== 'row') return;
    const row = hit.node;
    if (!Array.isArray(row.cells)) row.cells = [];

    while (row.cells.length < widths.length) {
      row.cells.push(BlockFactory.createCell({
        children: [BlockFactory.createTextAtom()]
      }));
    }
    if (row.cells.length > widths.length) {
      row.cells = row.cells.slice(0, widths.length);
    }

    row.cells.forEach((cell, idx) => {
      if (!cell.settings) cell.settings = {};
      cell.settings.width = widths[idx];
    });

    this.store.setDocument(this.store.getDocument(), true);
  }

  /**
   * Gerenciador contextual unificado de estrutura (Linhas, Colunas e Blocos)
   * Exibe o editor visual de colunas e botões de adicionar linha/bloco
   * @param {Object} hit
   * @returns {HTMLElement}
   * @private
   */
  _createContextualStructureManager(hit) {
    const container = document.createElement('div');
    container.className = 'nmf-contextual-structure-wrap';

    if (!hit) return container;

    let cellNode = null;
    let rowNode = null;
    let blockNode = null;

    const path = Array.isArray(hit.path) ? hit.path : [];
    path.forEach((p) => {
      if (!p) return;
      if (p.type === 'cell') cellNode = p;
      if (p.type === 'row') rowNode = p;
      if (p.type === 'block') blockNode = p;
    });

    const currentNode = hit.node || hit;
    if (currentNode) {
      if (currentNode.type === 'cell') cellNode = currentNode;
      if (currentNode.type === 'row') rowNode = currentNode;
      if (currentNode.type === 'block') blockNode = currentNode;
    }

    if (!rowNode && hit.parent && hit.parent.type === 'row') {
      rowNode = hit.parent;
    }
    if (!blockNode && hit.parent && hit.parent.type === 'block') {
      blockNode = hit.parent;
    }
    if (rowNode && !blockNode) {
      const rowHit = this.store.findNodeById(rowNode.id);
      if (rowHit && rowHit.parent && rowHit.parent.type === 'block') {
        blockNode = rowHit.parent;
      }
    }

    // 1. Editor Visual de Colunas: APENAS quando o nó inspecionado for 'block' ou 'row'
    const currentType = (currentNode && currentNode.type) || '';
    if (currentType === 'row' && rowNode) {
      container.appendChild(this._createVisualColumnEditor(rowNode, null));
    } else if (currentType === 'block' && blockNode && Array.isArray(blockNode.rows) && blockNode.rows.length > 0) {
      blockNode.rows.forEach((r, idx) => {
        if (blockNode.rows.length > 1) {
          const rowTitle = document.createElement('div');
          rowTitle.className = 'nmf-field-label';
          rowTitle.style.marginTop = idx > 0 ? '12px' : '0';
          rowTitle.style.marginBottom = '4px';
          rowTitle.style.fontWeight = 'bold';
          rowTitle.textContent = `${I18n.t('type.row', 'Linha')} ${idx + 1} (${(r.cells || []).length} ${I18n.t('prop.columns', 'colunas')})`;
          container.appendChild(rowTitle);
        }
        container.appendChild(this._createVisualColumnEditor(r, null));
      });
    }

    // 2. Ações de Linhas (operando sempre sobre blockNode como Linha externa)
    const secActions = this._createSection(I18n.t('action.structure_actions', 'Gerenciar Linhas'));
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '6px';
    grid.style.marginBottom = '8px';

    if (blockNode) {
      // + Linha Acima (cria nova Linha completa antes)
      const btnAddRowAbove = document.createElement('button');
      btnAddRowAbove.type = 'button';
      btnAddRowAbove.className = 'nmf-btn';
      btnAddRowAbove.style.fontSize = '11px';
      btnAddRowAbove.textContent = I18n.t('prop.add_row_above', '+ Linha Acima');
      btnAddRowAbove.addEventListener('click', () => {
        const newBlk = BlockFactory.createBlock({
          rows: [BlockFactory.createRow({ cells: [BlockFactory.createCell({ children: [] })] })]
        });
        this.store.insertNodeAt(blockNode.id, 'before', newBlk);
        this.store.selectNode(newBlk.id);
      });
      grid.appendChild(btnAddRowAbove);

      // + Linha Abaixo (cria nova Linha completa depois)
      const btnAddRowBelow = document.createElement('button');
      btnAddRowBelow.type = 'button';
      btnAddRowBelow.className = 'nmf-btn nmf-btn-primary';
      btnAddRowBelow.style.fontSize = '11px';
      btnAddRowBelow.textContent = I18n.t('action.add_row_below_short', '+ Linha Abaixo');
      btnAddRowBelow.addEventListener('click', () => {
        const newBlk = BlockFactory.createBlock({
          rows: [BlockFactory.createRow({ cells: [BlockFactory.createCell({ children: [] })] })]
        });
        this.store.insertNodeAt(blockNode.id, 'after', newBlk);
        this.store.selectNode(newBlk.id);
      });
      grid.appendChild(btnAddRowBelow);

      // Duplicar Linha
      const btnDupRow = document.createElement('button');
      btnDupRow.type = 'button';
      btnDupRow.className = 'nmf-btn';
      btnDupRow.style.fontSize = '11px';
      btnDupRow.style.gridColumn = '1 / -1';
      btnDupRow.textContent = I18n.t('action.duplicate_row', 'Duplicar Linha');
      btnDupRow.addEventListener('click', () => {
        this.store.duplicateNode(blockNode.id);
      });
      grid.appendChild(btnDupRow);
    }

    secActions.appendChild(grid);
    container.appendChild(secActions);

    return container;
  }

  /**
   * Editor Visual de Colunas Completo e Dinâmico
   * @param {Object} row
   * @param {string|null} [activeCellId=null]
   * @returns {HTMLElement}
   * @private
   */
  _createVisualColumnEditor(row, activeCellId = null) {
    const sec = this._createSection(I18n.t('prop.visual_col_editor', 'Editor Visual de Colunas'));

    const cells = Array.isArray(row.cells) ? row.cells : [];
    const count = cells.length;

    if (count === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'nmf-field-label';
      emptyMsg.textContent = I18n.t('msg.no_columns_in_row', 'Nenhuma coluna nesta linha.');
      sec.appendChild(emptyMsg);

      const btnAddInitial = document.createElement('button');
      btnAddInitial.type = 'button';
      btnAddInitial.className = 'nmf-btn nmf-btn-primary';
      btnAddInitial.style.width = '100%';
      btnAddInitial.style.marginTop = '6px';
      btnAddInitial.textContent = I18n.t('prop.add_cell', '+ Adicionar Coluna');
      btnAddInitial.addEventListener('click', () => {
        this.store.addCellToRow(row.id);
      });
      sec.appendChild(btnAddInitial);
      return sec;
    }

    // Calcula percentuais normalizados das células
    const rawPcts = cells.map((c) => {
      const w = c.settings && c.settings.width;
      if (typeof w === 'number' && w > 0) return w;
      if (typeof w === 'string') {
        const parsed = parseFloat(w);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 100 / count;
    });

    const sumRaw = rawPcts.reduce((a, b) => a + b, 0);
    const pcts = sumRaw > 0
      ? rawPcts.map((v) => (v / sumRaw) * 100)
      : rawPcts.map(() => 100 / count);

    // ========================================================================
    // (a) Barra Proporcional Interativa com Splitters Arrastáveis
    // ========================================================================
    const barWrap = document.createElement('div');
    barWrap.className = 'nmf-visual-col-bar-wrap';
    barWrap.style.marginBottom = '10px';

    const bar = document.createElement('div');
    bar.className = 'nmf-visual-col-bar';
    bar.style.display = 'flex';
    bar.style.height = '34px';
    bar.style.backgroundColor = 'var(--nmf-bg-surface, #1e293b)';
    bar.style.border = '1px solid var(--nmf-border-base, #334155)';
    bar.style.borderRadius = 'var(--nmf-radius-sm, 4px)';
    bar.style.overflow = 'hidden';
    bar.style.position = 'relative';
    bar.style.userSelect = 'none';

    cells.forEach((cell, idx) => {
      const pct = pcts[idx];
      const isActive = cell.id === activeCellId;

      const seg = document.createElement('div');
      seg.className = 'nmf-visual-col-segment' + (isActive ? ' is-active' : '');
      seg.style.flex = `0 0 ${pct}%`;
      seg.style.width = `${pct}%`;
      seg.style.display = 'flex';
      seg.style.alignItems = 'center';
      seg.style.justifyContent = 'center';
      seg.style.cursor = 'pointer';
      seg.style.fontSize = '10px';
      seg.style.fontWeight = isActive ? '700' : '500';
      seg.style.color = isActive ? '#ffffff' : 'var(--nmf-text-secondary, #94a3b8)';
      seg.style.backgroundColor = isActive
        ? 'var(--nmf-accent, #2563eb)'
        : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)');
      seg.style.transition = 'background-color 0.15s ease';
      seg.style.overflow = 'hidden';
      seg.style.whiteSpace = 'nowrap';
      seg.style.textOverflow = 'ellipsis';
      seg.style.padding = '0 2px';
      seg.title = `${I18n.t('type.cell', 'Coluna')} ${idx + 1}: ${pct.toFixed(1)}%`;
      seg.textContent = `C${idx + 1} (${Math.round(pct)}%)`;

      seg.addEventListener('click', (e) => {
        e.preventDefault();
        this.store.selectNode(cell.id);
      });

      bar.appendChild(seg);

      // Splitter arrastável entre coluna idx e idx + 1
      if (idx < count - 1) {
        const splitter = document.createElement('div');
        splitter.className = 'nmf-visual-col-splitter';
        splitter.style.width = '8px';
        splitter.style.marginLeft = '-4px';
        splitter.style.marginRight = '-4px';
        splitter.style.zIndex = '5';
        splitter.style.cursor = 'col-resize';
        splitter.style.backgroundColor = 'var(--nmf-border-hover, #64748b)';
        splitter.style.position = 'relative';
        splitter.style.flexShrink = '0';
        splitter.title = I18n.t('prop.resize_splitter', 'Arraste para redimensionar colunas');

        splitter.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const startX = e.clientX;
          const barRect = bar.getBoundingClientRect();
          const barWidth = barRect.width;
          if (barWidth <= 0) return;

          const startPcts = [...pcts];
          const leftIdx = idx;
          const rightIdx = idx + 1;
          const combinedPct = startPcts[leftIdx] + startPcts[rightIdx];

          const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            const deltaX = moveEvent.clientX - startX;
            const deltaPct = (deltaX / barWidth) * 100;

            let newLeftPct = startPcts[leftIdx] + deltaPct;
            let newRightPct = startPcts[rightIdx] - deltaPct;

            const minPct = 10;
            if (newLeftPct < minPct) {
              newLeftPct = minPct;
              newRightPct = combinedPct - minPct;
            } else if (newRightPct < minPct) {
              newRightPct = minPct;
              newLeftPct = combinedPct - minPct;
            }

            const nextPcts = [...startPcts];
            nextPcts[leftIdx] = Math.round(newLeftPct * 10) / 10;
            nextPcts[rightIdx] = Math.round((combinedPct - nextPcts[leftIdx]) * 10) / 10;

            const formattedWidths = nextPcts.map((p) => `${p.toFixed(1)}%`);
            this._applyRowWidths(row.id, formattedWidths);
          };

          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };

          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });

        bar.appendChild(splitter);
      }
    });

    barWrap.appendChild(bar);
    sec.appendChild(barWrap);

    // ========================================================================
    // (b) Sliders e Inputs Numéricos Individuais por Coluna
    // ========================================================================
    const slidersWrap = document.createElement('div');
    slidersWrap.className = 'nmf-visual-col-sliders';
    slidersWrap.style.display = 'flex';
    slidersWrap.style.flexDirection = 'column';
    slidersWrap.style.gap = '6px';
    slidersWrap.style.marginBottom = '12px';

    cells.forEach((cell, idx) => {
      const pct = pcts[idx];
      const isActive = cell.id === activeCellId;

      const rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.alignItems = 'center';
      rowEl.style.gap = '8px';
      rowEl.style.fontSize = '11px';

      const label = document.createElement('span');
      label.style.width = '38px';
      label.style.fontWeight = isActive ? '700' : '500';
      label.style.color = isActive ? 'var(--nmf-accent, #2563eb)' : 'var(--nmf-text-secondary, #94a3b8)';
      label.textContent = `C${idx + 1}:`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '10';
      slider.max = '100';
      slider.step = '1';
      slider.value = String(Math.round(pct));
      slider.style.flex = '1';
      slider.style.cursor = 'pointer';

      const numInput = document.createElement('input');
      numInput.type = 'number';
      numInput.min = '10';
      numInput.max = '100';
      numInput.step = '1';
      numInput.value = String(Math.round(pct));
      numInput.className = 'nmf-input';
      numInput.style.width = '48px';
      numInput.style.height = '24px';
      numInput.style.padding = '0 4px';
      numInput.style.textAlign = 'right';
      numInput.style.fontSize = '11px';

      const pctUnit = document.createElement('span');
      pctUnit.style.color = 'var(--nmf-text-tertiary, #64748b)';
      pctUnit.textContent = '%';

      const onColValChange = (newVal) => {
        let val = parseFloat(newVal);
        if (isNaN(val)) return;

        const minVal = 10;
        const maxVal = count > 1 ? 100 - (count - 1) * minVal : 100;
        val = Math.max(minVal, Math.min(maxVal, val));

        slider.value = String(Math.round(val));
        numInput.value = String(Math.round(val));

        if (count === 1) {
          this._applyRowWidths(row.id, ['100%']);
          return;
        }

        const otherIndices = cells.map((_, i) => i).filter((i) => i !== idx);
        const otherSum = otherIndices.reduce((acc, i) => acc + pcts[i], 0);
        const remaining = 100 - val;

        const nextPcts = [...pcts];
        nextPcts[idx] = val;

        otherIndices.forEach((i) => {
          if (otherSum > 0) {
            nextPcts[i] = (pcts[i] / otherSum) * remaining;
          } else {
            nextPcts[i] = remaining / otherIndices.length;
          }
          nextPcts[i] = Math.max(minVal, nextPcts[i]);
        });

        // Ajusta arredondamento para fechar 100%
        const curSum = nextPcts.reduce((a, b) => a + b, 0);
        if (curSum !== 100 && otherIndices.length > 0) {
          const lastOther = otherIndices[otherIndices.length - 1];
          nextPcts[lastOther] += (100 - curSum);
        }

        const formattedWidths = nextPcts.map((p) => `${p.toFixed(1)}%`);
        this._applyRowWidths(row.id, formattedWidths);
      };

      slider.addEventListener('input', () => onColValChange(slider.value));
      numInput.addEventListener('change', () => onColValChange(numInput.value));

      rowEl.appendChild(label);
      rowEl.appendChild(slider);
      rowEl.appendChild(numInput);
      rowEl.appendChild(pctUnit);
      slidersWrap.appendChild(rowEl);
    });

    sec.appendChild(slidersWrap);

    // ========================================================================
    // (c) Campo de Inserção Rápida de Proporções (ex: 30, 70 ou 20, 50, 30)
    // ========================================================================
    const customPropRow = document.createElement('div');
    customPropRow.className = 'nmf-field-col';
    customPropRow.style.gap = '6px';
    customPropRow.style.marginBottom = '12px';

    const customPropLabel = document.createElement('label');
    customPropLabel.className = 'nmf-field-label';
    customPropLabel.textContent = I18n.t('prop.custom_proportions', 'Proporções Livres (ex: 30, 70 ou 1, 2, 1)');
    customPropRow.appendChild(customPropLabel);

    const customInputWrap = document.createElement('div');
    customInputWrap.style.display = 'flex';
    customInputWrap.style.gap = '6px';

    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.className = 'nmf-input';
    customInput.style.flex = '1';
    customInput.style.fontSize = '11px';
    customInput.value = pcts.map((p) => Math.round(p)).join(', ');
    customInputWrap.appendChild(customInput);

    const btnApply = document.createElement('button');
    btnApply.type = 'button';
    btnApply.className = 'nmf-btn nmf-btn-primary';
    btnApply.style.fontSize = '11px';
    btnApply.style.padding = '0 10px';
    btnApply.textContent = I18n.t('action.apply_proportions', 'Aplicar');
    btnApply.addEventListener('click', () => {
      const text = customInput.value.trim();
      const parts = text.split(/[\s,\-]+/).map((p) => parseFloat(p)).filter((n) => !isNaN(n) && n > 0);
      if (parts.length >= 1) {
        const partsSum = parts.reduce((a, b) => a + b, 0);
        const normalized = parts.map((n) => `${((n / partsSum) * 100).toFixed(2)}%`);
        this._applyRowWidths(row.id, normalized);
      }
    });
    customInputWrap.appendChild(btnApply);

    const btnEqualize = document.createElement('button');
    btnEqualize.type = 'button';
    btnEqualize.className = 'nmf-btn';
    btnEqualize.style.fontSize = '11px';
    btnEqualize.style.padding = '0 8px';
    btnEqualize.title = I18n.t('ui.equalize_cols', 'Igualar (=)');
    btnEqualize.textContent = '=';
    btnEqualize.addEventListener('click', () => {
      if (count >= 1) {
        const eqPct = `${(100 / count).toFixed(2)}%`;
        const normalized = Array(count).fill(eqPct);
        this._applyRowWidths(row.id, normalized);
      }
    });
    customInputWrap.appendChild(btnEqualize);

    customPropRow.appendChild(customInputWrap);
    sec.appendChild(customPropRow);

    // ========================================================================
    // (d) 8 Presets Rápidos + Ações de Coluna
    // ========================================================================
    const presetsLabel = document.createElement('div');
    presetsLabel.className = 'nmf-field-label';
    presetsLabel.style.marginBottom = '6px';
    presetsLabel.textContent = I18n.t('prop.column_presets', 'Modelos Rápidos de Colunas');
    sec.appendChild(presetsLabel);

    const presetsGrid = document.createElement('div');
    presetsGrid.style.display = 'grid';
    presetsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    presetsGrid.style.gap = '4px';
    presetsGrid.style.marginBottom = '12px';

    const presets = [
      { label: '100%', widths: ['100%'] },
      { label: '50/50', widths: ['50%', '50%'] },
      { label: '33/33/33', widths: ['33.33%', '33.33%', '33.33%'] },
      { label: '25x4', widths: ['25%', '25%', '25%', '25%'] },
      { label: '30 / 70', widths: ['30%', '70%'] },
      { label: '70 / 30', widths: ['70%', '30%'] },
      { label: '20/60/20', widths: ['20%', '60%', '20%'] },
      { label: '25/50/25', widths: ['25%', '50%', '25%'] }
    ];

    presets.forEach((preset) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nmf-btn';
      b.style.fontSize = '10px';
      b.style.padding = '4px 2px';
      b.textContent = preset.label;
      b.title = preset.label;
      b.addEventListener('click', () => {
        this._applyRowWidths(row.id, preset.widths);
      });
      presetsGrid.appendChild(b);
    });
    sec.appendChild(presetsGrid);

    // Ações de Adicionar / Remover Coluna
    const colActionsGrid = document.createElement('div');
    colActionsGrid.style.display = 'grid';
    colActionsGrid.style.gridTemplateColumns = '1fr 1fr';
    colActionsGrid.style.gap = '6px';
    colActionsGrid.style.marginBottom = '8px';

    const btnAddCol = document.createElement('button');
    btnAddCol.type = 'button';
    btnAddCol.className = 'nmf-btn nmf-btn-primary';
    btnAddCol.style.fontSize = '11px';
    btnAddCol.textContent = I18n.t('prop.add_cell', '+ Adicionar Coluna');
    btnAddCol.addEventListener('click', () => {
      this.store.addCellToRow(row.id);
    });
    colActionsGrid.appendChild(btnAddCol);

    const btnRemoveCol = document.createElement('button');
    btnRemoveCol.type = 'button';
    btnRemoveCol.className = 'nmf-btn';
    btnRemoveCol.style.fontSize = '11px';
    btnRemoveCol.textContent = I18n.t('action.remove_col', '- Remover Coluna');
    if (count <= 1) {
      btnRemoveCol.disabled = true;
    }
    btnRemoveCol.addEventListener('click', () => {
      if (typeof this.store.removeCellFromRow === 'function') {
        this.store.removeCellFromRow(row.id);
      } else if (count > 1) {
        const lastCell = cells[count - 1];
        this.store.removeNode(lastCell.id);
      }
    });
    colActionsGrid.appendChild(btnRemoveCol);
    sec.appendChild(colActionsGrid);

    // Ações na Coluna Ativa (ou selecionada)
    const targetCell = activeCellId ? cells.find((c) => c.id === activeCellId) : (count > 0 ? cells[0] : null);
    if (targetCell) {
      const targetCellId = targetCell.id;
      const targetIdx = cells.findIndex((c) => c.id === targetCellId);

      const navActionsGrid = document.createElement('div');
      navActionsGrid.style.display = 'grid';
      navActionsGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
      navActionsGrid.style.gap = '4px';

      const btnMoveLeft = document.createElement('button');
      btnMoveLeft.type = 'button';
      btnMoveLeft.className = 'nmf-btn';
      btnMoveLeft.style.fontSize = '10px';
      btnMoveLeft.textContent = I18n.t('action.move_left', '← Mover Esq.');
      if (targetIdx <= 0) {
        btnMoveLeft.disabled = true;
      }
      btnMoveLeft.addEventListener('click', () => {
        this._moveCellInRow(row.id, targetCellId, 'left');
      });
      navActionsGrid.appendChild(btnMoveLeft);

      const btnMoveRight = document.createElement('button');
      btnMoveRight.type = 'button';
      btnMoveRight.className = 'nmf-btn';
      btnMoveRight.style.fontSize = '10px';
      btnMoveRight.textContent = I18n.t('action.move_right', 'Mover Dir. →');
      if (targetIdx >= count - 1) {
        btnMoveRight.disabled = true;
      }
      btnMoveRight.addEventListener('click', () => {
        this._moveCellInRow(row.id, targetCellId, 'right');
      });
      navActionsGrid.appendChild(btnMoveRight);

      const btnDupCol = document.createElement('button');
      btnDupCol.type = 'button';
      btnDupCol.className = 'nmf-btn';
      btnDupCol.style.fontSize = '10px';
      btnDupCol.textContent = I18n.t('action.duplicate_col', 'Duplicar Coluna');
      btnDupCol.addEventListener('click', () => {
        this.store.duplicateNode(targetCellId);
      });
      navActionsGrid.appendChild(btnDupCol);

      sec.appendChild(navActionsGrid);
    }

    return sec;
  }

  // ==========================================================================
  // NÍVEL 4: CELL
  // ==========================================================================
  _renderCellLevel(cell, hit) {
    this.tagEl.textContent = 'CELL';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">CELL</span> <span>${I18n.t('inspector.cell', 'Propriedades da Coluna')}</span>`;

    // Botão compacto no topo para voltar ao Bloco Pai / Editar Colunas
    let parentBlock = null;
    if (hit && hit.parent && hit.parent.type === 'block') {
      parentBlock = hit.parent;
    } else if (hit && Array.isArray(hit.path)) {
      for (let i = hit.path.length - 1; i >= 0; i--) {
        if (hit.path[i] && hit.path[i].type === 'block') {
          parentBlock = hit.path[i];
          break;
        }
      }
    }
    if (!parentBlock && hit && hit.parent && hit.parent.type === 'row') {
      const rowHit = this.store.findNodeById(hit.parent.id);
      if (rowHit && rowHit.parent && rowHit.parent.type === 'block') {
        parentBlock = rowHit.parent;
      }
    }

    if (parentBlock) {
      const btnEditParent = document.createElement('button');
      btnEditParent.type = 'button';
      btnEditParent.className = 'nmf-btn nmf-btn-secondary';
      btnEditParent.style.width = '100%';
      btnEditParent.style.marginBottom = '8px';
      btnEditParent.style.fontSize = '11px';
      btnEditParent.style.display = 'flex';
      btnEditParent.style.alignItems = 'center';
      btnEditParent.style.justifyContent = 'center';
      btnEditParent.style.gap = '6px';
      btnEditParent.textContent = I18n.t('action.edit_parent_block_cols', '📐 Editar Colunas / Linha Pai');
      btnEditParent.addEventListener('click', () => {
        this.store.selectNode(parentBlock.id);
      });
      this.bodyEl.appendChild(btnEditParent);
    }

    const s = cell.settings || {};

    const secGeneral = this._createSection(I18n.t('type.cell', 'Coluna'));
    secGeneral.appendChild(this._createInputRow(I18n.t('type.cell', 'Rótulo'), cell.label || '', (val) => {
      this.store.updateNode(cell.id, { label: val });
    }));

    // Largura da Coluna
    secGeneral.appendChild(this._createInputRow(I18n.t('prop.cell_width', 'Largura (% ou auto)'), s.width || '100%', (val) => {
      this.store.updateNodeSettings(cell.id, { width: val });
    }));

    // Alinhamento Vertical
    const vAligns = [
      { label: I18n.t('prop.valign_top', 'Topo'), value: 'top' },
      { label: I18n.t('prop.valign_middle', 'Meio'), value: 'middle' },
      { label: I18n.t('prop.valign_bottom', 'Base'), value: 'bottom' }
    ];
    secGeneral.appendChild(this._createSelectRow(I18n.t('prop.vertical_align', 'Alinhamento Vertical'), vAligns, s.verticalAlign || 'top', (val) => {
      this.store.updateNodeSettings(cell.id, { verticalAlign: val });
    }));

    // Alinhamento Horizontal
    const hAligns = [
      { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
      { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
      { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
    ];
    secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento Horizontal'), hAligns, s.horizontalAlign || 'left', (val) => {
      this.store.updateNodeSettings(cell.id, { horizontalAlign: val });
    }));

    // Link da Célula
    secGeneral.appendChild(this._createInputRow(I18n.t('prop.cell_link', 'Link da Célula'), s.link || '', (val) => {
      this.store.updateNodeSettings(cell.id, { link: val });
    }));

    // Hide on mobile
    secGeneral.appendChild(this._createToggleRow(I18n.t('prop.hidden_on_mobile', 'Ocultar no Mobile'), s.hiddenOnMobile === true, (val) => {
      this.store.updateNodeSettings(cell.id, { hiddenOnMobile: val });
    }));

    this.bodyEl.appendChild(secGeneral);

    // Padding & Fundo
    const secStyle = this._createSection(I18n.t('prop.background_color', 'Aparência'));
    secStyle.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Cor de Fundo'), s.backgroundColor || 'transparent', (val) => {
      this.store.updateNodeSettings(cell.id, { backgroundColor: val });
    }));

    const padding = (s.spacing && s.spacing.padding) || [0, 0, 0, 0];
    secStyle.appendChild(this._createBoxGrid(padding, (newPad) => {
      this.store.updateNodeSettings(cell.id, {
        spacing: { ...(s.spacing || {}), padding: newPad }
      });
    }));

    this.bodyEl.appendChild(secStyle);

    // Ações Rápidas de Inserção de Elementos dentro da Célula
    const secActions = this._createSection(I18n.t('action.insert_element', 'Inserir Conteúdo'));

    const gridBtn = document.createElement('div');
    gridBtn.style.display = 'grid';
    gridBtn.style.gridTemplateColumns = '1fr 1fr';
    gridBtn.style.gap = '6px';

    const addAction = (label, createFn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nmf-btn';
      b.style.fontSize = '11px';
      b.textContent = label;
      b.addEventListener('click', () => {
        const item = createFn();
        if (!Array.isArray(cell.children)) cell.children = [];
        cell.children.push(item);
        this.store.setDocument(this.store.getDocument(), true);
        this.store.selectNode(item.id);
      });
      gridBtn.appendChild(b);
    };

    addAction(I18n.t('atom.text', '+ Texto'), () => BlockFactory.createTextAtom());
    addAction(I18n.t('atom.button', '+ Botão'), () => BlockFactory.createButtonAtom());
    addAction(I18n.t('atom.image', '+ Imagem'), () => BlockFactory.createImageAtom());
    addAction(I18n.t('atom.divider', '+ Divisor'), () => BlockFactory.createDividerAtom());
    addAction(I18n.t('atom.spacer', '+ Espaçador'), () => {
      if (typeof BlockFactory.createSpacerAtom === 'function') {
        return BlockFactory.createSpacerAtom();
      }
      return {
        id: BlockFactory.uid('atom'),
        type: 'atom',
        atomType: 'spacer',
        label: I18n.t('atom.spacer', 'Espaçador'),
        settings: {
          height: 24,
          spacing: { padding: [0, 0, 0, 0], margin: [0, 0, 0, 0] }
        }
      };
    });
    addAction(I18n.t('atom.menu', '+ Menu'), () => BlockFactory.createMenuAtom());
    addAction(I18n.t('atom.social', '+ Social'), () => BlockFactory.createSocialAtom());

    secActions.appendChild(gridBtn);
    this.bodyEl.appendChild(secActions);

    // Ações da Coluna: Mover Esq., Mover Dir., Duplicar Coluna, Excluir Coluna
    const secColActions = this._createSection(I18n.t('prop.column_actions', 'Ações da Coluna'));

    const parentRow = (hit && hit.parent && hit.parent.type === 'row')
      ? hit.parent
      : (Array.isArray(hit && hit.path) ? hit.path.slice().reverse().find(p => p && p.type === 'row') : null);
    const parentCells = parentRow && Array.isArray(parentRow.cells) ? parentRow.cells : [];
    const cellIdx = parentCells.findIndex((c) => c.id === cell.id);
    const count = parentCells.length;

    const colNavGrid = document.createElement('div');
    colNavGrid.style.display = 'grid';
    colNavGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
    colNavGrid.style.gap = '4px';
    colNavGrid.style.marginBottom = '6px';

    const btnMoveLeft = document.createElement('button');
    btnMoveLeft.type = 'button';
    btnMoveLeft.className = 'nmf-btn';
    btnMoveLeft.style.fontSize = '10px';
    btnMoveLeft.textContent = I18n.t('action.move_left', '← Mover Esq.');
    if (cellIdx <= 0 || !parentRow) {
      btnMoveLeft.disabled = true;
      btnMoveLeft.style.opacity = '0.5';
    } else {
      btnMoveLeft.addEventListener('click', () => {
        this._moveCellInRow(parentRow.id, cell.id, 'left');
      });
    }
    colNavGrid.appendChild(btnMoveLeft);

    const btnMoveRight = document.createElement('button');
    btnMoveRight.type = 'button';
    btnMoveRight.className = 'nmf-btn';
    btnMoveRight.style.fontSize = '10px';
    btnMoveRight.textContent = I18n.t('action.move_right', 'Mover Dir. →');
    if (cellIdx < 0 || cellIdx >= count - 1 || !parentRow) {
      btnMoveRight.disabled = true;
      btnMoveRight.style.opacity = '0.5';
    } else {
      btnMoveRight.addEventListener('click', () => {
        this._moveCellInRow(parentRow.id, cell.id, 'right');
      });
    }
    colNavGrid.appendChild(btnMoveRight);

    const btnDupCol = document.createElement('button');
    btnDupCol.type = 'button';
    btnDupCol.className = 'nmf-btn';
    btnDupCol.style.fontSize = '10px';
    btnDupCol.textContent = I18n.t('action.duplicate_col', 'Duplicar');
    btnDupCol.addEventListener('click', () => {
      this.store.duplicateNode(cell.id);
    });
    colNavGrid.appendChild(btnDupCol);

    secColActions.appendChild(colNavGrid);

    const btnDelCol = document.createElement('button');
    btnDelCol.type = 'button';
    btnDelCol.className = 'nmf-btn nmf-btn-danger';
    btnDelCol.style.width = '100%';
    btnDelCol.textContent = I18n.t('action.delete_col', '- Excluir Esta Coluna');

    if (count <= 1) {
      btnDelCol.disabled = true;
      btnDelCol.style.opacity = '0.5';
      btnDelCol.style.cursor = 'not-allowed';
      btnDelCol.title = I18n.t('msg.cannot_delete_only_col', 'A linha deve ter ao menos 1 coluna');
    } else {
      btnDelCol.addEventListener('click', () => {
        this.store.removeNode(cell.id);
      });
    }
    secColActions.appendChild(btnDelCol);
    this.bodyEl.appendChild(secColActions);
  }

  // ==========================================================================
  // NÍVEL 5: ATOM (TEXT, BUTTON, IMAGE, DIVIDER, SPACER, MENU, SOCIAL)
  // ==========================================================================
  _renderAtomLevel(atom, hit) {
    const atomType = atom.atomType || 'text';
    this.tagEl.textContent = atomType.toUpperCase();
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">${atomType.toUpperCase()}</span> <span>${I18n.t(`atom.${atomType}`, atomType)}</span>`;

    const s = atom.settings || {};

    let secInlineImg = null;

    const secGeneral = this._createSection(I18n.t('type.atom', 'Elemento'));
    secGeneral.appendChild(this._createInputRow(I18n.t('prop.label', 'Rótulo'), atom.label || '', (val) => {
      this.store.updateNode(atom.id, { label: val });
    }));

    // Campos específicos por tipo de átomo
    if (atomType === 'text') {
      const textRow = document.createElement('div');
      textRow.className = 'nmf-field-col';

      const textLabel = document.createElement('label');
      textLabel.className = 'nmf-field-label';
      textLabel.textContent = I18n.t('prop.content_html', 'Conteúdo (Texto / HTML)');

      const textarea = document.createElement('textarea');
      textarea.className = 'nmf-input';
      textarea.rows = 4;
      textarea.style.height = 'auto';
      textarea.style.fontFamily = 'var(--nmf-font-mono, monospace)';
      textarea.style.fontSize = '11px';
      textarea.style.resize = 'vertical';
      textarea.value = (atom.value || '').trim();
      textarea.addEventListener('input', () => {
        atom.value = textarea.value;
        this.store.updateNode(atom.id, { value: textarea.value });
      });

      textRow.appendChild(textLabel);
      textRow.appendChild(textarea);
      secGeneral.appendChild(textRow);

      // Merge Tags / Variáveis Dinâmicas
      const varRow = document.createElement('div');
      varRow.className = 'nmf-field-row';

      const varLabel = document.createElement('label');
      varLabel.className = 'nmf-field-label';
      varLabel.textContent = I18n.t('prop.dynamic_vars', 'Variáveis');

      const varSelect = document.createElement('select');
      varSelect.className = 'nmf-select';
      varSelect.style.width = '140px';

      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = I18n.t('prop.select_variable', 'Inserir Tag...');
      varSelect.appendChild(defaultOpt);

      const vars = [
        { label: '{{nome}}', value: '{{nome}}' },
        { label: '{{email}}', value: '{{email}}' },
        { label: '{{empresa}}', value: '{{empresa}}' },
        { label: '{{link_descadastro}}', value: '{{link_descadastro}}' }
      ];
      vars.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v.value;
        opt.textContent = v.label;
        varSelect.appendChild(opt);
      });

      varSelect.addEventListener('change', () => {
        if (!varSelect.value) return;
        const tag = varSelect.value;
        const start = textarea.selectionStart !== undefined ? textarea.selectionStart : textarea.value.length;
        const end = textarea.selectionEnd !== undefined ? textarea.selectionEnd : textarea.value.length;
        const oldVal = textarea.value || '';
        const nextVal = oldVal.substring(0, start) + tag + oldVal.substring(end);
        textarea.value = nextVal;
        atom.value = nextVal;
        this.store.updateNode(atom.id, { value: nextVal });
        varSelect.value = '';
      });

      varRow.appendChild(varLabel);
      varRow.appendChild(varSelect);
      secGeneral.appendChild(varRow);

      // Tipografia
      const fonts = [
        { label: I18n.t('prop.font_default', 'Padrão (Herdar)'), value: '' },
        { label: 'Segoe UI / Arial', value: "'Segoe UI', Arial, sans-serif" },
        { label: 'Helvetica, Arial', value: "Helvetica, Arial, sans-serif" },
        { label: 'Georgia, serif', value: "Georgia, serif" },
        { label: 'Verdana, Geneva', value: "Verdana, Geneva, sans-serif" },
        { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
        { label: 'Courier New, monospace', value: "'Courier New', monospace" }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.font_family', 'Fonte'), fonts, s.fontFamily || '', (val) => {
        this.store.updateNodeSettings(atom.id, { fontFamily: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.font_size', 'Tamanho da Fonte'), s.fontSize || 16, 10, 72, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { fontSize: val });
      }));

      const weights = [
        { label: I18n.t('prop.font_normal', 'Normal (400)'), value: 'normal' },
        { label: I18n.t('prop.font_medium', 'Médio (500)'), value: '500' },
        { label: I18n.t('prop.font_semibold', 'Seminegrito (600)'), value: '600' },
        { label: I18n.t('prop.font_bold', 'Negrito (700)'), value: 'bold' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.font_weight', 'Peso da Fonte'), weights, s.fontWeight || 'normal', (val) => {
        this.store.updateNodeSettings(atom.id, { fontWeight: val });
      }));

      const lineHeights = [
        { label: '1.2', value: '1.2' },
        { label: '1.4', value: '1.4' },
        { label: '1.5', value: '1.5' },
        { label: '1.6', value: '1.6' },
        { label: '1.8', value: '1.8' },
        { label: '2.0', value: '2.0' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.line_height', 'Altura da Linha'), lineHeights, String(s.lineHeight || 1.5), (val) => {
        this.store.updateNodeSettings(atom.id, { lineHeight: parseFloat(val) });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.text_color', 'Cor do Texto'), s.color || '#334155', (val) => {
        let updatedVal = atom.value || '';
        if (updatedVal && /color\s*:\s*[^;"]+/i.test(updatedVal)) {
          updatedVal = updatedVal.replace(/color\s*:\s*[^;"]+/gi, `color: ${val}`);
          atom.value = updatedVal;
          textarea.value = updatedVal;
          this.store.updateNode(atom.id, { value: updatedVal });
        }
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Cor de Fundo'), s.backgroundColor || 'transparent', (val) => {
        this.store.updateNodeSettings(atom.id, { backgroundColor: val });
      }));

      const aligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' },
        { label: I18n.t('prop.align_justify', 'Justificado'), value: 'justify' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), aligns, s.align || 'left', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));

      // Seção Especial: Imagem no Texto (Enquadramento & Link)
      secInlineImg = this._createSection(I18n.t('prop.inline_img_title', 'Imagem no Texto (Enquadramento & Link)'));

      const imgRegex = /(?:<a\b[^>]*href=["']([^"']*)["'][^>]*>\s*)?<img\b([^>]*)>(?:\s*<\/a>)?/i;
      const match = (atom.value || '').match(imgRegex);

      let existingSrc = 'https://placehold.co/240x160/e2e8f0/475569?text=Imagem';
      let existingLink = '';
      let existingAlt = '';
      let existingWidth = 180;
      let existingAlign = 'float-left';

      if (match) {
        existingLink = match[1] || '';
        const imgAttrs = match[2] || '';
        const srcM = imgAttrs.match(/src=["']([^"']*)["']/i);
        if (srcM) existingSrc = srcM[1];
        const altM = imgAttrs.match(/alt=["']([^"']*)["']/i);
        if (altM) existingAlt = altM[1];
        const widthM = imgAttrs.match(/width=["']?(\d+)px?["']?/i) || imgAttrs.match(/width:\s*(\d+)px/i);
        if (widthM) existingWidth = parseInt(widthM[1], 10);

        if (/float:\s*left/i.test(imgAttrs)) {
          existingAlign = 'float-left';
        } else if (/float:\s*right/i.test(imgAttrs)) {
          existingAlign = 'float-right';
        } else if (/margin:\s*(?:12px\s+)?auto/i.test(imgAttrs) || /text-align:\s*center/i.test(imgAttrs)) {
          existingAlign = 'center';
        } else if (/margin:\s*12px\s+0\s+12px\s+auto/i.test(imgAttrs)) {
          existingAlign = 'block-right';
        } else if (/display:\s*block/i.test(imgAttrs)) {
          existingAlign = 'block-left';
        } else if (/display:\s*inline/i.test(imgAttrs)) {
          existingAlign = 'inline';
        }
      }

      let currentImgSrc = existingSrc;
      let currentImgLink = existingLink;
      let currentImgAlt = existingAlt;
      let currentImgWidth = existingWidth;
      let currentImgAlign = existingAlign;

      secInlineImg.appendChild(this._createInputRow(I18n.t('prop.image_src', 'URL da Imagem'), currentImgSrc, (val) => {
        currentImgSrc = val;
      }));

      secInlineImg.appendChild(this._createInputRow(I18n.t('prop.inline_img_link', 'Link na Imagem (URL)'), currentImgLink, (val) => {
        currentImgLink = val;
      }));

      const alignOptions = [
        { label: I18n.t('prop.inline_img_float_left', 'Flutuar à Esquerda (Texto ao redor)'), value: 'float-left' },
        { label: I18n.t('prop.inline_img_float_right', 'Flutuar à Direita (Texto ao redor)'), value: 'float-right' },
        { label: I18n.t('prop.inline_img_center', 'Centralizada (Bloco)'), value: 'center' },
        { label: I18n.t('prop.inline_img_block_left', 'Alinhada à Esquerda (Bloco)'), value: 'block-left' },
        { label: I18n.t('prop.inline_img_block_right', 'Alinhada à Direita (Bloco)'), value: 'block-right' },
        { label: I18n.t('prop.inline_img_inline', 'Em Linha (Inline)'), value: 'inline' }
      ];
      secInlineImg.appendChild(this._createSelectRow(I18n.t('prop.inline_img_align', 'Enquadramento'), alignOptions, currentImgAlign, (val) => {
        currentImgAlign = val;
      }));

      secInlineImg.appendChild(this._createScrubRow(I18n.t('prop.width', 'Largura (px)'), currentImgWidth, 20, 600, 5, 'px', (val) => {
        currentImgWidth = val;
      }));

      secInlineImg.appendChild(this._createInputRow(I18n.t('prop.image_alt', 'Texto Alternativo'), currentImgAlt, (val) => {
        currentImgAlt = val;
      }));

      const imgBtnGrid = document.createElement('div');
      imgBtnGrid.style.display = 'grid';
      imgBtnGrid.style.gridTemplateColumns = '1fr 1fr';
      imgBtnGrid.style.gap = '6px';
      imgBtnGrid.style.marginTop = '8px';

      const btnApplyImg = document.createElement('button');
      btnApplyImg.type = 'button';
      btnApplyImg.className = 'nmf-btn nmf-btn-primary';
      btnApplyImg.style.fontSize = '11px';
      btnApplyImg.textContent = I18n.t('action.insert_update_inline_img', 'Inserir / Atualizar Imagem');
      btnApplyImg.addEventListener('click', () => {
        let styleStr = 'max-width: 100%; height: auto;';
        if (currentImgAlign === 'float-left') {
          styleStr += ' float: left; margin: 0 16px 12px 0; display: block;';
        } else if (currentImgAlign === 'float-right') {
          styleStr += ' float: right; margin: 0 0 12px 16px; display: block;';
        } else if (currentImgAlign === 'center') {
          styleStr += ' display: block; margin: 12px auto; text-align: center;';
        } else if (currentImgAlign === 'block-left') {
          styleStr += ' display: block; margin: 12px 0;';
        } else if (currentImgAlign === 'block-right') {
          styleStr += ' display: block; margin: 12px 0 12px auto;';
        } else if (currentImgAlign === 'inline') {
          styleStr += ' display: inline-block; vertical-align: middle; margin: 0 8px;';
        }

        const imgTag = `<img src="${currentImgSrc}" alt="${currentImgAlt}" width="${currentImgWidth}" style="${styleStr}" />`;
        const fullImgHtml = currentImgLink
          ? `<a href="${currentImgLink}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">${imgTag}</a>`
          : imgTag;

        let content = atom.value || '';
        if (imgRegex.test(content)) {
          content = content.replace(imgRegex, fullImgHtml);
        } else {
          content = `${fullImgHtml}\n${content}`;
        }
        atom.value = content;
        this.store.updateNode(atom.id, { value: content });
        if (textarea) textarea.value = content;
      });
      imgBtnGrid.appendChild(btnApplyImg);

      const btnRemoveImg = document.createElement('button');
      btnRemoveImg.type = 'button';
      btnRemoveImg.className = 'nmf-btn';
      btnRemoveImg.style.fontSize = '11px';
      btnRemoveImg.textContent = I18n.t('action.remove_inline_img', 'Remover Imagem');
      btnRemoveImg.addEventListener('click', () => {
        let content = atom.value || '';
        if (imgRegex.test(content)) {
          content = content.replace(imgRegex, '').trim();
          atom.value = content;
          this.store.updateNode(atom.id, { value: content });
          if (textarea) textarea.value = content;
        }
      });
      imgBtnGrid.appendChild(btnRemoveImg);

      secInlineImg.appendChild(imgBtnGrid);
    } else if (atomType === 'button') {
      secGeneral.appendChild(this._createInputRow(I18n.t('prop.button_text', 'Texto do Botão'), atom.value || '', (val) => {
        this.store.updateNode(atom.id, { value: val });
      }));

      secGeneral.appendChild(this._createInputRow(I18n.t('prop.button_link', 'URL do Link'), atom.link || '', (val) => {
        this.store.updateNode(atom.id, { link: val });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.button_bg', 'Cor do Botão'), s.backgroundColor || '#2563eb', (val) => {
        this.store.updateNodeSettings(atom.id, { backgroundColor: val });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.text_color', 'Cor do Texto'), s.color || '#ffffff', (val) => {
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      const isFullWidth = s.fullWidth === true || s.widthMode === 'fill';
      secGeneral.appendChild(this._createToggleRow(I18n.t('prop.full_width', 'Largura Total (100%)'), isFullWidth, (val) => {
        this.store.updateNodeSettings(atom.id, { fullWidth: val, widthMode: val ? 'fill' : 'hug' });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.font_size', 'Tamanho da Fonte'), s.fontSize || 16, 10, 48, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { fontSize: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.border_radius', 'Arredondamento'), s.borderRadius !== undefined ? s.borderRadius : 6, 0, 50, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { borderRadius: val });
      }));

      const btnAligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), btnAligns, s.align || 'center', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));
    } else if (atomType === 'image') {
      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_src', 'URL da Imagem'), atom.src || (s && s.src) || '', (val) => {
        this.store.updateNode(atom.id, { src: val });
        this.store.updateNodeSettings(atom.id, { src: val });
      }));

      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_alt', 'Texto Alternativo'), atom.alt || (s && s.alt) || '', (val) => {
        this.store.updateNode(atom.id, { alt: val });
        this.store.updateNodeSettings(atom.id, { alt: val });
      }));

      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_link', 'Link da Imagem'), atom.link || (s && s.link) || '', (val) => {
        this.store.updateNode(atom.id, { link: val });
        this.store.updateNodeSettings(atom.id, { link: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.image_width', 'Largura (px)'), s.width !== undefined && s.width !== 'auto' ? parseInt(s.width, 10) : 600, 20, 800, 5, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { width: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.border_radius', 'Arredondamento'), s.borderRadius || 0, 0, 50, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { borderRadius: val });
      }));

      const imgAligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), imgAligns, s.align || 'center', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));
    } else if (atomType === 'divider') {
      secGeneral.appendChild(this._createColorRow(I18n.t('prop.divider_color', 'Cor da Linha'), s.color || '#cbd5e1', (val) => {
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.divider_height', 'Espessura (px)'), s.height || 1, 1, 20, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { height: val });
      }));

      const dividerStyles = [
        { label: I18n.t('prop.border_solid', 'Sólida'), value: 'solid' },
        { label: I18n.t('prop.border_dashed', 'Tracejada'), value: 'dashed' },
        { label: I18n.t('prop.border_dotted', 'Pontilhada'), value: 'dotted' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.border_style', 'Estilo'), dividerStyles, s.style || 'solid', (val) => {
        this.store.updateNodeSettings(atom.id, { style: val });
      }));

      const dividerWidths = [
        { label: '100%', value: '100%' },
        { label: '80%', value: '80%' },
        { label: '50%', value: '50%' },
        { label: '30%', value: '30%' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.divider_width', 'Largura'), dividerWidths, s.width || '100%', (val) => {
        this.store.updateNodeSettings(atom.id, { width: val });
      }));
    } else if (atomType === 'spacer') {
      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.spacer_height', 'Altura do Espaçador'), s.height !== undefined ? s.height : 24, 8, 120, 2, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { height: val });
      }));
    } else if (atomType === 'menu') {
      const secMenuItems = this._createSection(I18n.t('prop.menu_links', 'Links do Menu'));
      const items = Array.isArray(atom.items) ? atom.items : [];

      const renderMenuList = () => {
        secMenuItems.innerHTML = '';
        const titleEl = document.createElement('div');
        titleEl.className = 'nmf-section-title';
        titleEl.textContent = I18n.t('prop.menu_links', 'Links do Menu');
        secMenuItems.appendChild(titleEl);

        const listWrap = document.createElement('div');
        listWrap.style.display = 'flex';
        listWrap.style.flexDirection = 'column';
        listWrap.style.gap = '8px';

        items.forEach((item, idx) => {
          const itemBox = document.createElement('div');
          itemBox.style.display = 'flex';
          itemBox.style.gap = '4px';
          itemBox.style.alignItems = 'center';
          itemBox.style.padding = '4px';
          itemBox.style.backgroundColor = 'var(--nmf-bg-surface, #1e293b)';
          itemBox.style.borderRadius = '4px';

          const labelInp = document.createElement('input');
          labelInp.type = 'text';
          labelInp.className = 'nmf-input';
          labelInp.placeholder = I18n.t('prop.menu_link_text', 'Texto');
          labelInp.value = item.label || '';
          labelInp.style.flex = '1';
          labelInp.addEventListener('input', () => {
            item.label = labelInp.value;
            this.store.updateNode(atom.id, { items: [...items] });
          });

          const urlInp = document.createElement('input');
          urlInp.type = 'text';
          urlInp.className = 'nmf-input';
          urlInp.placeholder = I18n.t('prop.menu_link_url', 'URL');
          urlInp.value = item.url || '';
          urlInp.style.flex = '1.4';
          urlInp.addEventListener('input', () => {
            item.url = urlInp.value;
            this.store.updateNode(atom.id, { items: [...items] });
          });

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'nmf-btn nmf-btn-danger';
          delBtn.textContent = '×';
          delBtn.style.padding = '0 6px';
          delBtn.style.fontSize = '14px';
          delBtn.title = I18n.t('action.remove_item', 'Remover item');
          delBtn.addEventListener('click', () => {
            items.splice(idx, 1);
            this.store.updateNode(atom.id, { items: [...items] });
            renderMenuList();
          });

          itemBox.appendChild(labelInp);
          itemBox.appendChild(urlInp);
          itemBox.appendChild(delBtn);
          listWrap.appendChild(itemBox);
        });

        secMenuItems.appendChild(listWrap);

        const btnAddLink = document.createElement('button');
        btnAddLink.type = 'button';
        btnAddLink.className = 'nmf-btn nmf-btn-primary';
        btnAddLink.style.width = '100%';
        btnAddLink.style.marginTop = '8px';
        btnAddLink.style.fontSize = '11px';
        btnAddLink.textContent = I18n.t('action.add_menu_link', '+ Adicionar Link ao Menu');
        btnAddLink.addEventListener('click', () => {
          items.push({ label: I18n.t('atom.menu_item', 'Novo Link'), url: 'https://example.com' });
          this.store.updateNode(atom.id, { items: [...items] });
          renderMenuList();
        });
        secMenuItems.appendChild(btnAddLink);
      };

      renderMenuList();
      this.bodyEl.appendChild(secMenuItems);

      // Estilo do Menu
      secGeneral.appendChild(this._createColorRow(I18n.t('prop.text_color', 'Cor dos Links'), s.color || '#475569', (val) => {
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.font_size', 'Tamanho da Fonte'), s.fontSize || 14, 10, 24, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { fontSize: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.item_gap', 'Espaço entre Links'), s.itemGap || 20, 4, 60, 2, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { itemGap: val });
      }));

      const menuAligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), menuAligns, s.align || 'center', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));
    } else if (atomType === 'social') {
      const secSocialItems = this._createSection(I18n.t('prop.social_networks', 'Redes Sociais'));
      const networks = Array.isArray(atom.networks) ? atom.networks : [];

      const availableIcons = [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Twitter / X', value: 'twitter' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'GitHub', value: 'github' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Website', value: 'website' }
      ];

      const renderSocialList = () => {
        secSocialItems.innerHTML = '';
        const titleEl = document.createElement('div');
        titleEl.className = 'nmf-section-title';
        titleEl.textContent = I18n.t('prop.social_networks', 'Redes Sociais');
        secSocialItems.appendChild(titleEl);

        const listWrap = document.createElement('div');
        listWrap.style.display = 'flex';
        listWrap.style.flexDirection = 'column';
        listWrap.style.gap = '8px';

        networks.forEach((net, idx) => {
          const itemBox = document.createElement('div');
          itemBox.style.display = 'flex';
          itemBox.style.flexDirection = 'column';
          itemBox.style.gap = '6px';
          itemBox.style.padding = '6px';
          itemBox.style.backgroundColor = 'var(--nmf-bg-surface, #1e293b)';
          itemBox.style.border = '1px solid var(--nmf-border, #334155)';
          itemBox.style.borderRadius = '6px';

          const topRow = document.createElement('div');
          topRow.style.display = 'flex';
          topRow.style.gap = '4px';
          topRow.style.alignItems = 'center';

          const iconSel = document.createElement('select');
          iconSel.className = 'nmf-select';
          iconSel.style.flex = '1';
          availableIcons.forEach((ai) => {
            const opt = document.createElement('option');
            opt.value = ai.value;
            opt.textContent = ai.label;
            if (ai.value === (net.icon || net.name)) opt.selected = true;
            iconSel.appendChild(opt);
          });
          iconSel.addEventListener('change', () => {
            net.icon = iconSel.value;
            net.name = iconSel.value;
            this.store.updateNode(atom.id, { networks: [...networks] });
          });

          const urlInp = document.createElement('input');
          urlInp.type = 'text';
          urlInp.className = 'nmf-input';
          urlInp.placeholder = 'https://...';
          urlInp.value = net.url || '';
          urlInp.style.flex = '1.3';
          urlInp.addEventListener('input', () => {
            net.url = urlInp.value;
            this.store.updateNode(atom.id, { networks: [...networks] });
          });

          const colorBtn = document.createElement('button');
          colorBtn.type = 'button';
          colorBtn.className = 'nmf-color-swatch';
          colorBtn.title = I18n.t('prop.icon_color', 'Cor do Ícone');
          colorBtn.style.width = '24px';
          colorBtn.style.height = '24px';
          colorBtn.style.flexShrink = '0';
          colorBtn.style.borderRadius = '4px';
          colorBtn.style.border = '1px solid rgba(255,255,255,0.25)';
          colorBtn.style.cursor = 'pointer';
          colorBtn.style.backgroundColor = net.color || s.iconColor || '#475569';
          colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ColorPickerPopover.open(colorBtn, net.color || s.iconColor || '#475569', (hex) => {
              net.color = (hex === 'transparent') ? '' : hex;
              colorBtn.style.backgroundColor = net.color || s.iconColor || '#475569';
              this.store.updateNode(atom.id, { networks: [...networks] });
            });
          });

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'nmf-btn nmf-btn-danger';
          delBtn.textContent = '×';
          delBtn.style.padding = '0 6px';
          delBtn.style.fontSize = '14px';
          delBtn.title = I18n.t('action.remove_item', 'Remover item');
          delBtn.addEventListener('click', () => {
            networks.splice(idx, 1);
            this.store.updateNode(atom.id, { networks: [...networks] });
            renderSocialList();
          });

          topRow.appendChild(iconSel);
          topRow.appendChild(urlInp);
          topRow.appendChild(colorBtn);
          topRow.appendChild(delBtn);

          const customIconRow = document.createElement('div');
          customIconRow.style.display = 'flex';
          customIconRow.style.gap = '4px';
          customIconRow.style.alignItems = 'center';

          const customIconInp = document.createElement('input');
          customIconInp.type = 'text';
          customIconInp.className = 'nmf-input';
          customIconInp.style.width = '100%';
          customIconInp.style.fontSize = '11px';
          customIconInp.placeholder = I18n.t('prop.custom_icon_url', 'URL da imagem do ícone personalizado (opcional)');
          customIconInp.value = net.customIconUrl || '';
          customIconInp.addEventListener('input', () => {
            net.customIconUrl = customIconInp.value.trim();
            this.store.updateNode(atom.id, { networks: [...networks] });
          });

          customIconRow.appendChild(customIconInp);
          itemBox.appendChild(topRow);
          itemBox.appendChild(customIconRow);
          listWrap.appendChild(itemBox);
        });

        secSocialItems.appendChild(listWrap);

        const btnAddSocial = document.createElement('button');
        btnAddSocial.type = 'button';
        btnAddSocial.className = 'nmf-btn nmf-btn-primary';
        btnAddSocial.style.width = '100%';
        btnAddSocial.style.marginTop = '8px';
        btnAddSocial.style.fontSize = '11px';
        btnAddSocial.textContent = I18n.t('action.add_social_network', '+ Adicionar Rede Social');
        btnAddSocial.addEventListener('click', () => {
          networks.push({ name: 'facebook', icon: 'facebook', url: 'https://facebook.com' });
          this.store.updateNode(atom.id, { networks: [...networks] });
          renderSocialList();
        });
        secSocialItems.appendChild(btnAddSocial);
      };

      renderSocialList();
      this.bodyEl.appendChild(secSocialItems);

      // Configurações do Social
      const iconThemes = [
        { label: I18n.t('prop.theme_dark', 'Escuro'), value: 'dark' },
        { label: I18n.t('prop.theme_light', 'Claro'), value: 'light' },
        { label: I18n.t('prop.theme_color', 'Colorido (Marcas)'), value: 'color' },
        { label: I18n.t('prop.theme_custom', 'Cor Personalizada'), value: 'custom' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.icon_theme', 'Tema dos Ícones'), iconThemes, s.iconTheme || 'dark', (val) => {
        this.store.updateNodeSettings(atom.id, { iconTheme: val });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.icon_color', 'Cor dos Ícones'), s.iconColor || '#475569', (val) => {
        this.store.updateNodeSettings(atom.id, {
          iconColor: val === 'transparent' ? '' : val,
          iconTheme: val === 'transparent' ? 'dark' : 'custom'
        });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.icon_size', 'Tamanho dos Ícones'), s.iconSize || 28, 16, 48, 2, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { iconSize: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.icon_gap', 'Espaço entre Ícones'), s.iconGap || 16, 4, 32, 2, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { iconGap: val });
      }));

      const socialAligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), socialAligns, s.align || 'center', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));
    }

    this.bodyEl.appendChild(secGeneral);
    if (secInlineImg) {
      this.bodyEl.appendChild(secInlineImg);
    }

    // Padding ou Margem 4 lados
    const isDivider = atomType === 'divider';
    const boxTitle = isDivider ? I18n.t('prop.margin', 'Margem (Espaçamento Externo)') : I18n.t('prop.padding', 'Espaçamento Interno (Padding)');
    const secBox = this._createSection(boxTitle);
    const boxSpacing = isDivider
      ? ((s.spacing && s.spacing.margin) || [16, 0, 16, 0])
      : ((s.spacing && s.spacing.padding) || [0, 0, 0, 0]);

    secBox.appendChild(this._createBoxGrid(boxSpacing, (newBox) => {
      if (isDivider) {
        this.store.updateNodeSettings(atom.id, {
          spacing: { ...(s.spacing || {}), margin: newBox }
        });
      } else {
        this.store.updateNodeSettings(atom.id, {
          spacing: { ...(s.spacing || {}), padding: newBox }
        });
      }
    }));
    this.bodyEl.appendChild(secBox);

    // Ações do Átomo: Mover Acima / Mover Abaixo / Inserir Acima / Inserir Abaixo / Duplicar / Excluir
    const secAtomActions = this._createSection(I18n.t('prop.atom_actions', 'Ações do Elemento'));

    // Localizar a célula pai e o índice deste átomo
    let cellNode = (hit && hit.parent && hit.parent.type === 'cell') ? hit.parent : null;
    if (!cellNode && hit && Array.isArray(hit.path)) {
      cellNode = hit.path.slice().reverse().find(n => n.type === 'cell');
    }
    const children = (cellNode && Array.isArray(cellNode.children)) ? cellNode.children : [];
    const idx = children.findIndex(c => c.id === atom.id);
    const total = children.length;

    const atomGrid = document.createElement('div');
    atomGrid.style.display = 'grid';
    atomGrid.style.gridTemplateColumns = '1fr 1fr';
    atomGrid.style.gap = '6px';
    atomGrid.style.marginBottom = '6px';

    // Linha 1: Mover Acima e Mover Abaixo
    const btnMoveUp = document.createElement('button');
    btnMoveUp.type = 'button';
    btnMoveUp.className = 'nmf-btn';
    btnMoveUp.style.fontSize = '11px';
    btnMoveUp.textContent = `↑ ${I18n.t('action.move_up', 'Mover para Cima')}`;
    btnMoveUp.disabled = (idx <= 0);
    if (idx <= 0) btnMoveUp.style.opacity = '0.5';
    btnMoveUp.addEventListener('click', () => {
      this.store.moveNode(atom.id, 'up');
    });
    atomGrid.appendChild(btnMoveUp);

    const btnMoveDown = document.createElement('button');
    btnMoveDown.type = 'button';
    btnMoveDown.className = 'nmf-btn';
    btnMoveDown.style.fontSize = '11px';
    btnMoveDown.textContent = `↓ ${I18n.t('action.move_down', 'Mover para Baixo')}`;
    btnMoveDown.disabled = (idx < 0 || idx >= total - 1);
    if (idx < 0 || idx >= total - 1) btnMoveDown.style.opacity = '0.5';
    btnMoveDown.addEventListener('click', () => {
      this.store.moveNode(atom.id, 'down');
    });
    atomGrid.appendChild(btnMoveDown);

    // Linha 2: + Inserir Acima e + Inserir Abaixo
    const btnInsertAbove = document.createElement('button');
    btnInsertAbove.type = 'button';
    btnInsertAbove.className = 'nmf-btn';
    btnInsertAbove.style.fontSize = '11px';
    btnInsertAbove.textContent = I18n.t('action.insert_atom_above', '+ Inserir Acima');

    const btnInsertBelow = document.createElement('button');
    btnInsertBelow.type = 'button';
    btnInsertBelow.className = 'nmf-btn';
    btnInsertBelow.style.fontSize = '11px';
    btnInsertBelow.textContent = I18n.t('action.insert_atom_below', '+ Inserir Abaixo');

    atomGrid.appendChild(btnInsertAbove);
    atomGrid.appendChild(btnInsertBelow);

    // Linha 3: Duplicar e Excluir
    const btnDupAtom = document.createElement('button');
    btnDupAtom.type = 'button';
    btnDupAtom.className = 'nmf-btn';
    btnDupAtom.style.fontSize = '11px';
    btnDupAtom.textContent = I18n.t('action.duplicate', 'Duplicar');
    btnDupAtom.addEventListener('click', () => {
      this.store.duplicateNode(atom.id);
    });
    atomGrid.appendChild(btnDupAtom);

    const btnDelAtom = document.createElement('button');
    btnDelAtom.type = 'button';
    btnDelAtom.className = 'nmf-btn nmf-btn-danger';
    btnDelAtom.style.fontSize = '11px';
    btnDelAtom.textContent = I18n.t('action.delete', 'Excluir');
    btnDelAtom.addEventListener('click', () => {
      this.store.removeNode(atom.id);
    });
    atomGrid.appendChild(btnDelAtom);

    secAtomActions.appendChild(atomGrid);

    // Container do submenu retrátil para escolha do tipo de elemento
    const quickInsertWrap = document.createElement('div');
    quickInsertWrap.style.display = 'none';
    quickInsertWrap.style.marginTop = '6px';
    quickInsertWrap.style.padding = '8px';
    quickInsertWrap.style.backgroundColor = 'var(--nmf-bg-canvas, #1e293b)';
    quickInsertWrap.style.border = '1px solid var(--nmf-border, #334155)';
    quickInsertWrap.style.borderRadius = '4px';

    const insertTitle = document.createElement('div');
    insertTitle.style.fontSize = '10px';
    insertTitle.style.fontWeight = '600';
    insertTitle.style.textTransform = 'uppercase';
    insertTitle.style.color = 'var(--nmf-text-muted, #94a3b8)';
    insertTitle.style.marginBottom = '6px';
    quickInsertWrap.appendChild(insertTitle);

    const atomsPalette = document.createElement('div');
    atomsPalette.style.display = 'grid';
    atomsPalette.style.gridTemplateColumns = 'repeat(2, 1fr)';
    atomsPalette.style.gap = '4px';

    const atomTypes = [
      { type: 'text', label: I18n.t('atom.text', 'Texto'), factory: () => BlockFactory.createTextAtom() },
      { type: 'button', label: I18n.t('atom.button', 'Botão'), factory: () => BlockFactory.createButtonAtom() },
      { type: 'image', label: I18n.t('atom.image', 'Imagem'), factory: () => BlockFactory.createImageAtom() },
      { type: 'divider', label: I18n.t('atom.divider', 'Divisor'), factory: () => BlockFactory.createDividerAtom() },
      { type: 'spacer', label: I18n.t('atom.spacer', 'Espaçador'), factory: () => BlockFactory.createSpacerAtom() },
      { type: 'menu', label: I18n.t('atom.menu', 'Menu'), factory: () => BlockFactory.createMenuAtom() },
      { type: 'social', label: I18n.t('atom.social', 'Social'), factory: () => BlockFactory.createSocialAtom() }
    ];

    let currentInsertPosition = null;

    atomTypes.forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nmf-btn';
      b.style.fontSize = '11px';
      b.style.padding = '4px 6px';
      b.style.textAlign = 'left';
      b.textContent = `+ ${item.label}`;
      b.addEventListener('click', () => {
        if (!currentInsertPosition) return;
        const newAtom = item.factory();
        this.store.insertNodeAt(atom.id, currentInsertPosition, newAtom);
        this.store.selectNode(newAtom.id);
      });
      atomsPalette.appendChild(b);
    });
    quickInsertWrap.appendChild(atomsPalette);

    const toggleInsertMenu = (position) => {
      if (quickInsertWrap.style.display !== 'none' && currentInsertPosition === position) {
        quickInsertWrap.style.display = 'none';
        currentInsertPosition = null;
        btnInsertAbove.classList.remove('nmf-btn-primary');
        btnInsertBelow.classList.remove('nmf-btn-primary');
      } else {
        currentInsertPosition = position;
        insertTitle.textContent = position === 'before'
          ? I18n.t('action.insert_atom_above', '+ Inserir Acima')
          : I18n.t('action.insert_atom_below', '+ Inserir Abaixo');
        quickInsertWrap.style.display = 'block';
        if (position === 'before') {
          btnInsertAbove.classList.add('nmf-btn-primary');
          btnInsertBelow.classList.remove('nmf-btn-primary');
        } else {
          btnInsertBelow.classList.add('nmf-btn-primary');
          btnInsertAbove.classList.remove('nmf-btn-primary');
        }
      }
    };

    btnInsertAbove.addEventListener('click', () => toggleInsertMenu('before'));
    btnInsertBelow.addEventListener('click', () => toggleInsertMenu('after'));

    secAtomActions.appendChild(quickInsertWrap);
    this.bodyEl.appendChild(secAtomActions);
  }

  // ==========================================================================
  // HELPERS DE INTERFACE (ANTI-AI-SLOP: PRECISOS, LIMPOS, FUNCIONAIS)
  // ==========================================================================

  _createSection(title) {
    const sec = document.createElement('div');
    sec.className = 'nmf-inspector-section';

    const t = document.createElement('div');
    t.className = 'nmf-section-title';
    t.textContent = title;

    sec.appendChild(t);
    return sec;
  }

  _createInputRow(label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'nmf-field-row';

    const l = document.createElement('label');
    l.className = 'nmf-field-label';
    l.textContent = label;

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'nmf-input';
    inp.value = value;
    inp.style.width = '140px';
    inp.addEventListener('input', () => onChange(inp.value));
    inp.addEventListener('change', () => onChange(inp.value));

    row.appendChild(l);
    row.appendChild(inp);
    return row;
  }

  _createScrubRow(label, value, min, max, step, unit, onChange) {
    const row = document.createElement('div');
    row.className = 'nmf-field-row';

    const l = document.createElement('label');
    l.className = 'nmf-field-label';
    l.textContent = label;

    const scrub = new ScrubNumberInput({
      label: label.substring(0, 1).toUpperCase(),
      value,
      min,
      max,
      step,
      unit,
      onChange
    });

    row.appendChild(l);
    row.appendChild(scrub.element);
    return row;
  }

  _createColorRow(label, hexValue, onChange) {
    const row = document.createElement('div');
    row.className = 'nmf-field-row';

    const l = document.createElement('label');
    l.className = 'nmf-field-label';
    l.textContent = label;

    const wrap = document.createElement('div');
    wrap.className = 'nmf-color-picker-wrap';

    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'nmf-color-swatch';
    swatch.style.cursor = 'pointer';

    const isTransparent = (c) => !c || c === 'transparent' || c === 'none';

    const updateSwatchDisplay = (c) => {
      if (isTransparent(c)) {
        swatch.style.backgroundColor = 'transparent';
        swatch.style.backgroundImage = 'linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #475569 75%), linear-gradient(-45deg, transparent 75%, #475569 75%)';
        swatch.style.backgroundSize = '8px 8px';
        swatch.style.backgroundPosition = '0 0, 0 4px, 4px -4px, -4px 0px';
      } else {
        swatch.style.backgroundImage = 'none';
        swatch.style.backgroundColor = c;
      }
    };

    updateSwatchDisplay(hexValue);

    const textInp = document.createElement('input');
    textInp.type = 'text';
    textInp.className = 'nmf-color-hex-text';
    textInp.value = hexValue || '';

    const applyColor = (c) => {
      updateSwatchDisplay(c);
      textInp.value = c;
      onChange(c);
    };

    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ColorPickerPopover.open(
        wrap,
        textInp.value || hexValue || '#ffffff',
        (c) => {
          applyColor(c);
        },
        { allowTransparent: true }
      );
    });

    textInp.addEventListener('input', () => {
      applyColor(textInp.value);
    });

    textInp.addEventListener('change', () => {
      applyColor(textInp.value);
    });

    wrap.appendChild(swatch);
    wrap.appendChild(textInp);

    row.appendChild(l);
    row.appendChild(wrap);

    return row;
  }

  _createSelectRow(label, options, currentValue, onChange) {
    const row = document.createElement('div');
    row.className = 'nmf-field-row';

    const l = document.createElement('label');
    l.className = 'nmf-field-label';
    l.textContent = label;

    const sel = document.createElement('select');
    sel.className = 'nmf-select';
    sel.style.width = '140px';

    options.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === currentValue) o.selected = true;
      sel.appendChild(o);
    });

    sel.addEventListener('change', () => onChange(sel.value));

    row.appendChild(l);
    row.appendChild(sel);
    return row;
  }

  _createToggleRow(label, isChecked, onChange) {
    const row = document.createElement('div');
    row.className = 'nmf-field-row';

    const l = document.createElement('label');
    l.className = 'nmf-field-label';
    l.textContent = label;

    const toggle = document.createElement('label');
    toggle.className = 'nmf-toggle';

    const inp = document.createElement('input');
    inp.type = 'checkbox';
    inp.checked = isChecked;
    inp.addEventListener('change', () => onChange(inp.checked));

    const slider = document.createElement('span');
    slider.className = 'nmf-toggle-slider';

    toggle.appendChild(inp);
    toggle.appendChild(slider);

    row.appendChild(l);
    row.appendChild(toggle);
    return row;
  }

  _createBoxGrid(boxArr, onChange) {
    const grid = document.createElement('div');
    grid.className = 'nmf-box-grid';

    const labels = [
      { key: 'T', idx: 0, full: I18n.t('prop.padding_t', 'Superior') },
      { key: 'R', idx: 1, full: I18n.t('prop.padding_r', 'Direita') },
      { key: 'B', idx: 2, full: I18n.t('prop.padding_b', 'Inferior') },
      { key: 'L', idx: 3, full: I18n.t('prop.padding_l', 'Esquerda') }
    ];

    const current = [...boxArr];

    labels.forEach((item) => {
      const scrub = new ScrubNumberInput({
        label: item.key,
        value: current[item.idx] || 0,
        min: 0,
        max: 120,
        step: 2,
        unit: 'px',
        onChange: (newVal) => {
          current[item.idx] = newVal;
          onChange([...current]);
        }
      });
      grid.appendChild(scrub.element);
    });

    return grid;
  }

  /**
   * Monta o painel no elemento hospedeiro
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

export default InspectorPanel;

