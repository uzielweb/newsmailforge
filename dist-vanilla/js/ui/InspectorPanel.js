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

export class InspectorPanel {
  /**
   * @param {Object} store - Instância reativa do Store
   */
  constructor(store) {
    this.store = store;
    this.element = null;
    this.headerEl = null;
    this.bodyEl = null;

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
      this.render();
    });

    I18n.onLocaleChange(() => {
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
    const selectedNode = this.store.getSelectedNode();

    // Determina o nível ativo
    if (!selectedNode || state.selectedType === 'main') {
      this._renderMainLevel();
    } else if (selectedNode.type === 'block') {
      this._renderBlockLevel(selectedNode);
    } else if (selectedNode.type === 'row') {
      this._renderRowLevel(selectedNode);
    } else if (selectedNode.type === 'cell') {
      this._renderCellLevel(selectedNode);
    } else if (selectedNode.type === 'atom') {
      this._renderAtomLevel(selectedNode);
    } else {
      this._renderMainLevel();
    }
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
      this.store.updateGeneralSettings({
        bodyBackground: { ...(gen.bodyBackground || {}), color: val }
      });
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

  // ==========================================================================
  // NÍVEL 2: BLOCK
  // ==========================================================================
  _renderBlockLevel(block) {
    this.tagEl.textContent = 'BLOCK';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">BLOCK</span> <span>${I18n.t('inspector.block', 'Propriedades do Bloco')}</span>`;

    const s = block.settings || {};

    const secGeneral = this._createSection(I18n.t('type.block', 'Bloco'));
    secGeneral.appendChild(this._createInputRow(I18n.t('type.block', 'Rótulo'), block.label || '', (val) => {
      this.store.updateNode(block.id, { label: val });
    }));

    this.bodyEl.appendChild(secGeneral);

    // Fundo e Aparência
    const secBg = this._createSection(I18n.t('prop.background_color', 'Aparência'));

    secBg.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Cor de Fundo'), s.backgroundColor || '#ffffff', (val) => {
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

    // Padding 4 lados
    const secPad = this._createSection(I18n.t('prop.padding', 'Espaçamento Interno (Padding)'));
    const padding = (s.spacing && s.spacing.padding) || [20, 24, 20, 24];

    secPad.appendChild(this._createBoxGrid(padding, (newPad) => {
      this.store.updateNodeSettings(block.id, {
        spacing: { ...(s.spacing || {}), padding: newPad }
      });
    }));

    this.bodyEl.appendChild(secPad);
  }

  // ==========================================================================
  // NÍVEL 3: ROW
  // ==========================================================================
  _renderRowLevel(row) {
    this.tagEl.textContent = 'ROW';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">ROW</span> <span>${I18n.t('inspector.row', 'Propriedades da Linha')}</span>`;

    const s = row.settings || {};

    const secGeneral = this._createSection(I18n.t('type.row', 'Linha'));
    secGeneral.appendChild(this._createInputRow(I18n.t('type.row', 'Rótulo'), row.label || '', (val) => {
      this.store.updateNode(row.id, { label: val });
    }));

    // Modo de Largura
    const widthModes = [
      { label: I18n.t('prop.fill', 'Preencher (100%)'), value: 'fill' },
      { label: I18n.t('prop.hug', 'Ajustar ao Conteúdo'), value: 'hug' }
    ];
    secGeneral.appendChild(this._createSelectRow(I18n.t('prop.width_mode', 'Modo de Largura'), widthModes, s.widthMode || 'fill', (val) => {
      this.store.updateNodeSettings(row.id, { widthMode: val });
    }));

    // Gap entre colunas
    secGeneral.appendChild(this._createScrubRow(I18n.t('prop.gap', 'Espaço entre Colunas (Gap)'), s.gap !== undefined ? s.gap : 16, 0, 60, 2, 'px', (val) => {
      this.store.updateNodeSettings(row.id, { gap: val });
    }));

    // Toggles Mobile
    secGeneral.appendChild(this._createToggleRow(I18n.t('prop.collapse_on_mobile', 'Empilhar no Mobile'), s.collapseOnMobile !== false, (val) => {
      this.store.updateNodeSettings(row.id, { collapseOnMobile: val });
    }));

    secGeneral.appendChild(this._createToggleRow(I18n.t('prop.hidden_on_mobile', 'Ocultar no Mobile'), s.hiddenOnMobile === true, (val) => {
      this.store.updateNodeSettings(row.id, { hiddenOnMobile: val });
    }));

    this.bodyEl.appendChild(secGeneral);

    // Padding & Fundo
    const secStyle = this._createSection(I18n.t('prop.background_color', 'Aparência'));
    secStyle.appendChild(this._createColorRow(I18n.t('prop.background_color', 'Cor de Fundo'), s.backgroundColor || 'transparent', (val) => {
      this.store.updateNodeSettings(row.id, { backgroundColor: val });
    }));

    const padding = (s.spacing && s.spacing.padding) || [0, 0, 0, 0];
    secStyle.appendChild(this._createBoxGrid(padding, (newPad) => {
      this.store.updateNodeSettings(row.id, {
        spacing: { ...(s.spacing || {}), padding: newPad }
      });
    }));

    this.bodyEl.appendChild(secStyle);

    // Ações Rápidas: Adicionar Célula
    const secActions = this._createSection(I18n.t('action.insert_element', 'Estrutura'));
    const btnAddCell = document.createElement('button');
    btnAddCell.type = 'button';
    btnAddCell.className = 'nmf-btn nmf-btn-primary';
    btnAddCell.style.width = '100%';
    btnAddCell.textContent = I18n.t('prop.add_cell', '+ Adicionar Coluna');
    btnAddCell.addEventListener('click', () => {
      this.store.addCellToRow(row.id);
    });
    secActions.appendChild(btnAddCell);
    this.bodyEl.appendChild(secActions);
  }

  // ==========================================================================
  // NÍVEL 4: CELL
  // ==========================================================================
  _renderCellLevel(cell) {
    this.tagEl.textContent = 'CELL';
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">CELL</span> <span>${I18n.t('inspector.cell', 'Propriedades da Coluna')}</span>`;

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
    addAction(I18n.t('type.row', '+ Linha'), () => BlockFactory.createRow({ cells: [BlockFactory.createCell()] }));

    secActions.appendChild(gridBtn);
    this.bodyEl.appendChild(secActions);
  }

  // ==========================================================================
  // NÍVEL 5: ATOM (TEXT, BUTTON, IMAGE, DIVIDER, MENU, SOCIAL)
  // ==========================================================================
  _renderAtomLevel(atom) {
    const atomType = atom.atomType || 'text';
    this.tagEl.textContent = atomType.toUpperCase();
    this.titleEl.innerHTML = `<span class="nmf-inspector-type-tag">${atomType.toUpperCase()}</span> <span>${I18n.t(`atom.${atomType}`, atomType)}</span>`;

    const s = atom.settings || {};

    const secGeneral = this._createSection(I18n.t('type.atom', 'Elemento'));
    secGeneral.appendChild(this._createInputRow(I18n.t('type.atom', 'Rótulo'), atom.label || '', (val) => {
      this.store.updateNode(atom.id, { label: val });
    }));

    // Campos específicos por tipo de átomo
    if (atomType === 'text') {
      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.font_size', 'Tamanho da Fonte'), s.fontSize || 16, 10, 72, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { fontSize: val });
      }));

      secGeneral.appendChild(this._createColorRow(I18n.t('prop.text_color', 'Cor do Texto'), s.color || '#334155', (val) => {
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      const aligns = [
        { label: I18n.t('prop.align_left', 'Esquerda'), value: 'left' },
        { label: I18n.t('prop.align_center', 'Centro'), value: 'center' },
        { label: I18n.t('prop.align_right', 'Direita'), value: 'right' }
      ];
      secGeneral.appendChild(this._createSelectRow(I18n.t('prop.horizontal_align', 'Alinhamento'), aligns, s.align || 'left', (val) => {
        this.store.updateNodeSettings(atom.id, { align: val });
      }));
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

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.border_radius', 'Arredondamento'), s.borderRadius || 6, 0, 50, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { borderRadius: val });
      }));
    } else if (atomType === 'image') {
      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_src', 'URL da Imagem'), atom.src || (s && s.src) || '', (val) => {
        this.store.updateNode(atom.id, { src: val });
        this.store.updateNodeSettings(atom.id, { src: val });
      }));

      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_alt', 'Texto Alt'), atom.alt || (s && s.alt) || '', (val) => {
        this.store.updateNode(atom.id, { alt: val });
        this.store.updateNodeSettings(atom.id, { alt: val });
      }));

      secGeneral.appendChild(this._createInputRow(I18n.t('prop.image_link', 'Link da Imagem'), atom.link || (s && s.link) || '', (val) => {
        this.store.updateNode(atom.id, { link: val });
        this.store.updateNodeSettings(atom.id, { link: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.image_width', 'Largura (px)'), s.width || 200, 20, 600, 5, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { width: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.border_radius', 'Arredondamento'), s.borderRadius || 0, 0, 50, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { borderRadius: val });
      }));
    } else if (atomType === 'divider') {
      secGeneral.appendChild(this._createColorRow(I18n.t('prop.divider_color', 'Cor da Linha'), s.color || '#cbd5e1', (val) => {
        this.store.updateNodeSettings(atom.id, { color: val });
      }));

      secGeneral.appendChild(this._createScrubRow(I18n.t('prop.divider_height', 'Espessura (px)'), s.height || 1, 1, 20, 1, 'px', (val) => {
        this.store.updateNodeSettings(atom.id, { height: val });
      }));
    }

    this.bodyEl.appendChild(secGeneral);

    // Padding 4 lados
    const secPad = this._createSection(I18n.t('prop.padding', 'Espaçamento (Padding)'));
    const padding = (s.spacing && s.spacing.padding) || [0, 0, 0, 0];
    secPad.appendChild(this._createBoxGrid(padding, (newPad) => {
      this.store.updateNodeSettings(atom.id, {
        spacing: { ...(s.spacing || {}), padding: newPad }
      });
    }));
    this.bodyEl.appendChild(secPad);
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

    const swatch = document.createElement('div');
    swatch.className = 'nmf-color-swatch';
    swatch.style.backgroundColor = hexValue;

    const nativeInput = document.createElement('input');
    nativeInput.type = 'color';
    nativeInput.className = 'nmf-color-native-input';
    nativeInput.value = hexValue.startsWith('#') && hexValue.length === 7 ? hexValue : '#2563eb';

    const textInp = document.createElement('input');
    textInp.type = 'text';
    textInp.className = 'nmf-color-hex-text';
    textInp.value = hexValue;

    nativeInput.addEventListener('input', () => {
      swatch.style.backgroundColor = nativeInput.value;
      textInp.value = nativeInput.value;
      onChange(nativeInput.value);
    });

    textInp.addEventListener('change', () => {
      swatch.style.backgroundColor = textInp.value;
      nativeInput.value = textInp.value;
      onChange(textInp.value);
    });

    swatch.appendChild(nativeInput);
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

