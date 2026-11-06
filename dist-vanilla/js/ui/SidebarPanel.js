/**
 * NewsMailForge - SidebarPanel
 * Painel lateral esquerdo com abas duplas:
 * 1. Block Library (Estruturas, Elementos Básicos & Catálogo Modular com busca em tempo real)
 * 2. Component Tree (Árvore hierárquica sincronizada)
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { BlockFactory } from '../core/BlockFactory.js';
import { CATEGORIES, BLOCKS } from '../catalog/BlockCatalog.js';

export class SidebarPanel {
  /**
   * @param {Object} store - Instância reativa do Store
   * @param {Object} treeNavigator - Instância do TreeNavigator para a aba de estrutura
   */
  constructor(store, treeNavigator) {
    this.store = store;
    this.treeNavigator = treeNavigator;
    this.element = null;
    this.drawerEl = null;
    this.isDrawerOpen = false;
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.customColWidths = [30, 70];

    this._init();
  }

  /**
   * Inicialização do componente
   * @private
   */
  _init() {
    this.element = document.createElement('aside');
    this.element.className = 'nmf-sidebar';

    this._render();

    this.store.subscribe((state) => {
      this._updateActiveTab(state.activeTab);
    });

    I18n.onLocaleChange(() => {
      this._render();
    });
  }

  /**
   * Renderiza as abas e o container de conteúdo
   * @private
   */
  _render() {
    this.element.innerHTML = '';

    // Abas no topo
    const tabs = document.createElement('div');
    tabs.className = 'nmf-sidebar-tabs';

    const currentTab = this.store.getState().activeTab || 'library';

    const tabLib = document.createElement('button');
    tabLib.type = 'button';
    tabLib.className = `nmf-sidebar-tab ${currentTab === 'library' ? 'is-active' : ''}`;
    tabLib.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      <span>${I18n.t('ui.tabs.library', 'Biblioteca')}</span>
    `;
    tabLib.addEventListener('click', () => {
      this.store.setActiveTab('library');
    });

    const tabTree = document.createElement('button');
    tabTree.type = 'button';
    tabTree.className = `nmf-sidebar-tab ${currentTab === 'tree' ? 'is-active' : ''}`;
    tabTree.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="6" y1="3" x2="6" y2="15"></line>
        <circle cx="18" cy="6" r="3"></circle>
        <circle cx="6" cy="18" r="3"></circle>
        <path d="M18 9a9 9 0 0 1-9 9"></path>
      </svg>
      <span>${I18n.t('ui.tabs.tree', 'Estrutura')}</span>
    `;
    tabTree.addEventListener('click', () => {
      this.closeDrawer();
      this.store.setActiveTab('tree');
    });

    this.tabLib = tabLib;
    this.tabTree = tabTree;

    tabs.appendChild(tabLib);
    tabs.appendChild(tabTree);

    // Conteúdo da aba
    const content = document.createElement('div');
    content.className = 'nmf-sidebar-content';

    // Container Library (Construtor visual direto sempre visível)
    const libContainer = document.createElement('div');
    libContainer.className = 'nmf-library-wrap';
    libContainer.style.display = currentTab === 'library' ? 'flex' : 'none';

    this._buildLibrarySections(libContainer);

    // Container Tree (Monta o TreeNavigator)
    const treeContainer = document.createElement('div');
    treeContainer.style.display = currentTab === 'tree' ? 'block' : 'none';
    if (this.treeNavigator) {
      this.treeNavigator.mount(treeContainer);
    }

    this.libContainer = libContainer;
    this.treeContainer = treeContainer;

    content.appendChild(libContainer);
    content.appendChild(treeContainer);

    this.element.appendChild(tabs);
    this.element.appendChild(content);

    // Impede cursor de proibido (not-allowed) enquanto o usuário inicia o arraste sobre a própria sidebar rumo ao palco
    this.element.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    this.element.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
  }

  /**
   * Constrói as seções da Biblioteca na sidebar
   * @private
   * @param {HTMLElement} container
   */
  _buildLibrarySections(container) {
    // 0. Campo de busca em tempo real no topo
    const searchWrap = document.createElement('div');
    searchWrap.className = 'nmf-library-search-wrap';
    searchWrap.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'nmf-library-search';
    searchInput.placeholder = I18n.t('ui.search_blocks', 'Buscar linhas prontas ou elementos...');
    searchInput.value = this.searchQuery;
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this._renderCatalogList();
      this._filterQuickItems();
    });
    searchWrap.appendChild(searchInput);
    container.appendChild(searchWrap);

    // 1. Seção 1: Estruturas & Colunas
    const secStructures = document.createElement('div');
    secStructures.className = 'nmf-library-section';
    secStructures.innerHTML = `
      <div class="nmf-library-section-title">${I18n.t('ui.sec_structures', 'Linhas & Colunas (Estruturas)')}</div>
    `;

    const gridStructures = document.createElement('div');
    gridStructures.className = 'nmf-quick-grid';

    const STRUCTURE_ITEMS = [
      {
        id: '100',
        labelKey: 'ui.layout_1col',
        defaultLabel: '1 Coluna',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="27" height="15" rx="2" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      },
      {
        id: '50-50',
        labelKey: 'ui.layout_2col',
        defaultLabel: '2 Colunas',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="12.5" height="15" rx="2" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="15" y="0.5" width="12.5" height="15" rx="2" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      },
      {
        id: '33-33-33',
        labelKey: 'ui.layout_3col',
        defaultLabel: '3 Colunas',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="7.6" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="10.2" y="0.5" width="7.6" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="19.9" y="0.5" width="7.6" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      },
      {
        id: '30-70',
        labelKey: 'ui.layout_2col_30_70',
        defaultLabel: 'Barra 30/70',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="7.5" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="10" y="0.5" width="17.5" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      },
      {
        id: '70-30',
        labelKey: 'ui.layout_2col_70_30',
        defaultLabel: 'Barra 70/30',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="17.5" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="20" y="0.5" width="7.5" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      },
      {
        id: '25-25-25-25',
        labelKey: 'ui.layout_4col',
        defaultLabel: '4 Colunas',
        svg: '<svg width="28" height="16" viewBox="0 0 28 16" fill="none"><rect x="0.5" y="0.5" width="5.5" height="15" rx="1" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="7.6" y="0.5" width="5.5" height="15" rx="1" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="14.8" y="0.5" width="5.5" height="15" rx="1" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/><rect x="22" y="0.5" width="5.5" height="15" rx="1" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/></svg>'
      }
    ];

    STRUCTURE_ITEMS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'nmf-quick-card';
      card.draggable = true;
      card.setAttribute('data-structure-id', item.id);
      const label = I18n.t(item.labelKey, item.defaultLabel);
      card.title = label;
      card.innerHTML = `
        <div class="nmf-quick-card-icon">${item.svg}</div>
        <span class="nmf-quick-card-label">${label}</span>
      `;

      card.addEventListener('dragstart', (e) => {
        const payload = { kind: 'structure', layout: item.id };
        window.__nmfActiveDragPayload = payload;
        e.dataTransfer.setData('application/x-nmf', JSON.stringify(payload));
        e.dataTransfer.setData('application/x-nmf-structure', item.id);
        e.dataTransfer.setData('text/plain', 'structure:' + item.id);
        e.dataTransfer.effectAllowed = 'copyMove';
      });

      card.addEventListener('dragend', () => {
        window.__nmfActiveDragPayload = null;
      });

      card.addEventListener('click', () => {
        this._handleStructureClick(item.id);
      });

      gridStructures.appendChild(card);
    });

    secStructures.appendChild(gridStructures);
    this._buildCustomColBuilder(secStructures);
    container.appendChild(secStructures);

    // 2. Seção 2: Elementos Básicos
    const secElements = document.createElement('div');
    secElements.className = 'nmf-library-section';
    secElements.innerHTML = `
      <div class="nmf-library-section-title">${I18n.t('ui.sec_elements', 'Elementos Básicos')}</div>
    `;

    const gridElements = document.createElement('div');
    gridElements.className = 'nmf-quick-grid';

    const ATOM_ITEMS = [
      {
        type: 'text',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>'
      },
      {
        type: 'button',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="4"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
      },
      {
        type: 'image',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
      },
      {
        type: 'divider',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12" stroke-dasharray="3 3"></line></svg>'
      },
      {
        type: 'spacer',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 8 12 3 17 8"></polyline><polyline points="7 16 12 21 17 16"></polyline><line x1="12" y1="3" x2="12" y2="21" stroke-dasharray="2 2"></line></svg>'
      },
      {
        type: 'menu',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>'
      },
      {
        type: 'social',
        svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'
      }
    ];

    ATOM_ITEMS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'nmf-quick-card';
      card.draggable = true;
      card.setAttribute('data-atom-type', item.type);
      const label = I18n.t(`atom.${item.type}`, item.type);
      card.title = label;
      card.innerHTML = `
        <div class="nmf-quick-card-icon">${item.svg}</div>
        <span class="nmf-quick-card-label">${label}</span>
      `;

      card.addEventListener('dragstart', (e) => {
        const payload = { kind: 'atom', atomType: item.type };
        window.__nmfActiveDragPayload = payload;
        e.dataTransfer.setData('application/x-nmf', JSON.stringify(payload));
        e.dataTransfer.setData('application/x-nmf-atom', item.type);
        e.dataTransfer.setData('text/plain', 'atom:' + item.type);
        e.dataTransfer.effectAllowed = 'copyMove';
      });

      card.addEventListener('dragend', () => {
        window.__nmfActiveDragPayload = null;
      });

      card.addEventListener('click', () => {
        this._handleAtomClick(item.type);
      });

      gridElements.appendChild(card);
    });

    secElements.appendChild(gridElements);
    container.appendChild(secElements);

    // 3. Seção 3: Blocos Prontos Modulares
    const secBlocks = document.createElement('div');
    secBlocks.className = 'nmf-library-section';
    secBlocks.innerHTML = `
      <div class="nmf-library-section-title">${I18n.t('ui.sec_ready_blocks', 'Linhas Prontas (Modelos)')}</div>
    `;

    // Barra de pílulas de filtro
    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'nmf-category-pills';

    const btnAll = document.createElement('button');
    btnAll.type = 'button';
    btnAll.className = `nmf-category-pill ${this.selectedCategory === 'all' ? 'is-active' : ''}`;
    btnAll.textContent = I18n.t('ui.cat_all', 'Todos');
    btnAll.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this._updatePillStates(pillsContainer);
      this._renderCatalogList();
    });
    pillsContainer.appendChild(btnAll);

    CATEGORIES.forEach((cat) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `nmf-category-pill ${this.selectedCategory === cat.id ? 'is-active' : ''}`;
      pill.setAttribute('data-category-id', cat.id);
      pill.textContent = I18n.t(`cat.${cat.id}`, I18n.t(cat.nameKey, cat.id));
      pill.addEventListener('click', () => {
        this.selectedCategory = cat.id;
        this._updatePillStates(pillsContainer);
        this._renderCatalogList();
      });
      pillsContainer.appendChild(pill);
    });

    secBlocks.appendChild(pillsContainer);

    // Lista de cartões de blocos
    const catalogList = document.createElement('div');
    catalogList.className = 'nmf-catalog-list';
    secBlocks.appendChild(catalogList);

    container.appendChild(secBlocks);

    this.pillsContainer = pillsContainer;
    this.catalogList = catalogList;
    this.gridStructures = gridStructures;
    this.gridElements = gridElements;

    this._renderCatalogList();
  }

  /**
   * Atualiza as classes ativas das pílulas de categoria
   * @private
   * @param {HTMLElement} container
   */
  _updatePillStates(container) {
    if (!container) return;
    const pills = container.querySelectorAll('.nmf-category-pill');
    pills.forEach((p) => {
      const cat = p.getAttribute('data-category-id') || 'all';
      if (cat === this.selectedCategory) {
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });
  }

  /**
   * Renderiza a lista de blocos do catálogo com base nos filtros
   * @private
   */
  _renderCatalogList() {
    if (!this.catalogList) return;
    this.catalogList.innerHTML = '';

    const q = this.searchQuery;
    const cat = this.selectedCategory;

    const filtered = BLOCKS.filter((b) => {
      if (cat !== 'all' && b.category !== cat) {
        return false;
      }
      if (q) {
        const name = (I18n.t(b.nameKey, b.id) || '').toLowerCase();
        const desc = (I18n.t(b.descriptionKey, '') || '').toLowerCase();
        const id = (b.id || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !id.includes(q)) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'nmf-catalog-empty';
      empty.style.padding = '16px 8px';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--nmf-text-tertiary)';
      empty.style.fontSize = '11px';
      empty.textContent = I18n.t('ui.no_blocks_found', 'Nenhuma linha encontrada');
      this.catalogList.appendChild(empty);
      return;
    }

    filtered.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'nmf-block-card';
      card.draggable = true;
      card.setAttribute('data-block-id', b.id);

      const title = I18n.t(b.nameKey, b.id);
      const desc = I18n.t(b.descriptionKey, '');

      card.innerHTML = `
        <div class="nmf-block-preview">
          ${b.thumbnailSvg || ''}
          <span class="nmf-block-drag-handle" title="${I18n.t('ui.drag_to_canvas', 'Arraste para o canvas')}">⋮⋮</span>
        </div>
        <div class="nmf-block-meta">
          <div class="nmf-block-info">
            <span class="nmf-block-name">${title}</span>
            ${desc ? `<p class="nmf-block-desc">${desc}</p>` : ''}
          </div>
          <button type="button" class="nmf-block-add-btn">${I18n.t('ui.insert', '+ Inserir')}</button>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        const payload = { kind: 'catalog-block', blockId: b.id };
        window.__nmfActiveDragPayload = payload;
        e.dataTransfer.setData('application/x-nmf', JSON.stringify(payload));
        e.dataTransfer.setData('text/plain', b.id);
        e.dataTransfer.effectAllowed = 'copyMove';
      });

      card.addEventListener('dragend', () => {
        window.__nmfActiveDragPayload = null;
      });

      card.addEventListener('click', () => {
        this._handleCatalogBlockClick(b);
      });

      this.catalogList.appendChild(card);
    });
  }

  /**
   * Filtra itens das grades rápidas ao digitar na busca
   * @private
   */
  _filterQuickItems() {
    const q = this.searchQuery;
    if (this.gridStructures) {
      const cards = this.gridStructures.querySelectorAll('.nmf-quick-card');
      cards.forEach((c) => {
        const text = (c.textContent || '').toLowerCase();
        c.style.display = !q || text.includes(q) ? 'flex' : 'none';
      });
    }
    if (this.gridElements) {
      const cards = this.gridElements.querySelectorAll('.nmf-quick-card');
      cards.forEach((c) => {
        const text = (c.textContent || '').toLowerCase();
        c.style.display = !q || text.includes(q) ? 'flex' : 'none';
      });
    }
  }

  /**
   * Constrói o Construtor Interativo de Colunas Personalizadas
   * @private
   * @param {HTMLElement} parentContainer
   */
  _buildCustomColBuilder(parentContainer) {
    const builder = document.createElement('div');
    builder.className = 'nmf-custom-col-builder';

    // 1. Título
    const title = document.createElement('div');
    title.className = 'nmf-custom-col-title';
    title.textContent = I18n.t('ui.custom_cols_title', 'Linha com Colunas Personalizadas');
    builder.appendChild(title);

    // 2. Seletor rápido de quantidade de colunas (1 a 6 pills)
    const pillsWrap = document.createElement('div');
    pillsWrap.className = 'nmf-custom-col-pills';

    const countOptions = [1, 2, 3, 4, 5, 6];
    const pillButtons = [];

    const getEquallyDivided = (count) => {
      const base = Math.floor(100 / count);
      const arr = Array(count).fill(base);
      const remainder = 100 - base * count;
      for (let i = 0; i < remainder; i++) {
        arr[i] += 1;
      }
      return arr;
    };

    let updateVisualBar = null;

    countOptions.forEach((cnt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `nmf-custom-col-pill ${this.customColWidths.length === cnt ? 'is-active' : ''}`;
      btn.textContent = `${cnt} Col${cnt > 1 ? 's' : ''}`;
      btn.addEventListener('click', () => {
        if (cnt === 2 && this.customColWidths.length !== 2) {
          this.customColWidths = [30, 70];
        } else if (this.customColWidths.length !== cnt) {
          this.customColWidths = getEquallyDivided(cnt);
        }
        pillButtons.forEach(b => b.classList.toggle('is-active', b === btn));
        if (updateVisualBar) updateVisualBar();
      });
      pillButtons.push(btn);
      pillsWrap.appendChild(btn);
    });
    builder.appendChild(pillsWrap);

    // 3. Barra visual proporcional interativa com splitters arrastáveis
    const visualBar = document.createElement('div');
    visualBar.className = 'nmf-visual-col-bar';
    builder.appendChild(visualBar);

    // 4. Input numérico manual das proporções
    const inputWrap = document.createElement('div');
    inputWrap.className = 'nmf-custom-col-input-wrap';

    const inputLabel = document.createElement('span');
    inputLabel.className = 'nmf-custom-col-input-label';
    inputLabel.textContent = '%:';
    inputWrap.appendChild(inputLabel);

    const inputProportions = document.createElement('input');
    inputProportions.type = 'text';
    inputProportions.className = 'nmf-custom-col-input';
    inputProportions.value = this.customColWidths.join(', ');
    inputWrap.appendChild(inputProportions);
    builder.appendChild(inputWrap);

    // Função de re-renderização da barra visual e sincronização do input
    updateVisualBar = (syncInput = true) => {
      visualBar.innerHTML = '';
      const totalSegs = this.customColWidths.length;

      this.customColWidths.forEach((w, idx) => {
        const seg = document.createElement('div');
        seg.className = 'nmf-visual-col-seg';
        seg.style.width = `${w}%`;
        seg.textContent = `${w}%`;
        seg.title = `Coluna ${idx + 1}: ${w}%`;
        visualBar.appendChild(seg);

        // Splitter interativo entre segmentos adjacentes
        if (idx < totalSegs - 1) {
          const splitter = document.createElement('div');
          splitter.className = 'nmf-visual-col-splitter';
          splitter.title = I18n.t('ui.drag_handle', 'Arraste para mover ou reordenar');

          splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const barRect = visualBar.getBoundingClientRect();
            const startX = e.clientX;
            const initialWLeft = this.customColWidths[idx];
            const initialWRight = this.customColWidths[idx + 1];
            const combinedWidth = initialWLeft + initialWRight;

            const onMouseMove = (moveEv) => {
              const deltaPx = moveEv.clientX - startX;
              const deltaPct = Math.round((deltaPx / barRect.width) * 100);

              let newWLeft = Math.max(10, Math.min(combinedWidth - 10, initialWLeft + deltaPct));
              let newWRight = combinedWidth - newWLeft;

              this.customColWidths[idx] = newWLeft;
              this.customColWidths[idx + 1] = newWRight;

              updateVisualBar(true);
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          });

          visualBar.appendChild(splitter);
        }
      });

      if (syncInput) {
        inputProportions.value = this.customColWidths.join(', ');
      }

      pillButtons.forEach((b, idx) => {
        b.classList.toggle('is-active', idx + 1 === totalSegs);
      });
    };

    // Input manual de proporções com normalização para 100%
    inputProportions.addEventListener('input', () => {
      const raw = inputProportions.value;
      const parsed = raw.split(/[,-]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (parsed.length >= 1) {
        const sum = parsed.reduce((a, b) => a + b, 0);
        const normalized = parsed.map(n => Math.round((n / sum) * 100));
        const diff = 100 - normalized.reduce((a, b) => a + b, 0);
        normalized[normalized.length - 1] += diff;
        this.customColWidths = normalized;
        updateVisualBar(false);
      }
    });

    inputProportions.addEventListener('blur', () => {
      inputProportions.value = this.customColWidths.join(', ');
    });

    updateVisualBar(true);

    // 5. Botão primário arrastável e clicável
    const btnInsert = document.createElement('button');
    btnInsert.type = 'button';
    btnInsert.className = 'nmf-btn nmf-btn-primary nmf-custom-col-insert-btn';
    btnInsert.draggable = true;
    btnInsert.title = I18n.t('ui.custom_cols_insert', '+ Inserir Linha');
    btnInsert.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>${I18n.t('ui.custom_cols_insert', '+ Inserir Linha')}</span>
    `;

    btnInsert.addEventListener('click', () => {
      this._handleStructureClick(this.customColWidths.join('-'));
    });

    btnInsert.addEventListener('dragstart', (e) => {
      const layoutStr = this.customColWidths.join('-');
      const payload = { kind: 'structure', layout: layoutStr };
      window.__nmfActiveDragPayload = payload;
      e.dataTransfer.setData('application/x-nmf', JSON.stringify(payload));
      e.dataTransfer.setData('text/plain', 'structure:' + layoutStr);
      e.dataTransfer.effectAllowed = 'copyMove';
    });

    btnInsert.addEventListener('dragend', () => {
      window.__nmfActiveDragPayload = null;
    });

    builder.appendChild(btnInsert);
    parentContainer.appendChild(builder);
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
   * Cria um bloco estrutural com o número e larguras de células informados
   * @private
   * @param {string} layoutId
   * @returns {Object}
   */
  _createStructureBlock(layoutId) {
    const widths = this._parseLayoutWidths(layoutId);
    const cells = widths.map((w) =>
      BlockFactory.createCell({
        settings: { width: w },
        children: []
      })
    );
    const row = BlockFactory.createRow({ cells });
    return BlockFactory.createBlock({ rows: [row] });
  }

  /**
   * Trata o clique em um cartão de estrutura
   * @private
   * @param {string} layoutId
   */
  _handleStructureClick(layoutId) {
    try {
      const widths = this._parseLayoutWidths(layoutId);
      const sel = this.store.getSelectedNode();

      // Se uma 'row' estiver selecionada (ou se o nó selecionado estiver dentro de uma row):
      let selRowId = null;
      if (sel && sel.node) {
        if (sel.node.type === 'row') {
          selRowId = sel.node.id;
        } else if (sel.path && Array.isArray(sel.path)) {
          const r = sel.path.find((n) => n && n.type === 'row');
          if (r) selRowId = r.id;
        }
      }

      if (selRowId && typeof this.store.setRowColumnsLayout === 'function') {
        this.store.setRowColumnsLayout(selRowId, widths);
        return;
      }

      // Caso contrário, insere um novo bloco
      let selBlockId = null;
      if (sel && sel.node) {
        if (sel.node.type === 'block') {
          selBlockId = sel.node.id;
        } else if (sel.path && Array.isArray(sel.path)) {
          const blk = sel.path.find((n) => n && n.type === 'block');
          if (blk) selBlockId = blk.id;
        }
      }

      const newBlock = this._createStructureBlock(layoutId);
      if (selBlockId) {
        this.store.insertNodeAt(selBlockId, 'after', newBlock);
      } else {
        this.store.addBlock(newBlock);
      }
    } catch (err) {
      console.error('[NewsMailForge] Erro ao criar estrutura:', err);
    }
  }

  /**
   * Cria um átomo de acordo com o tipo solicitado
   * @private
   * @param {string} type
   * @returns {Object}
   */
  _createAtomByType(type) {
    switch (type) {
      case 'text':
        return BlockFactory.createTextAtom();
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
      default:
        return BlockFactory.createTextAtom();
    }
  }

  /**
   * Trata o clique em um elemento básico
   * @private
   * @param {string} type
   */
  _handleAtomClick(type) {
    try {
      const atom = this._createAtomByType(type);
      const sel = this.store.getSelectedNode();

      if (sel && sel.node) {
        if (sel.node.type === 'cell') {
          this.store.insertNodeAt(sel.node.id, 'inside', atom);
          return;
        }
        if (sel.node.type === 'atom') {
          this.store.insertNodeAt(sel.node.id, 'after', atom);
          return;
        }
        if (sel.node.type === 'row') {
          const firstCell = Array.isArray(sel.node.cells) && sel.node.cells[0];
          if (firstCell) {
            this.store.insertNodeAt(firstCell.id, 'inside', atom);
            return;
          }
        }
        if (sel.node.type === 'block') {
          const firstRow = Array.isArray(sel.node.rows) && sel.node.rows[0];
          const firstCell = firstRow && Array.isArray(firstRow.cells) && firstRow.cells[0];
          if (firstCell) {
            this.store.insertNodeAt(firstCell.id, 'inside', atom);
            return;
          }
        }
      }

      // Caso contrário, cria um novo bloco contendo esse átomo
      const newBlock = BlockFactory.createBlock({
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
      this.store.addBlock(newBlock);
    } catch (err) {
      console.error('[NewsMailForge] Erro ao inserir átomo:', err);
    }
  }

  /**
   * Trata o clique em um bloco do catálogo
   * @private
   * @param {Object} b
   */
  _handleCatalogBlockClick(b) {
    try {
      const sel = this.store.getSelectedNode();
      let selBlockId = null;
      if (sel && sel.node) {
        if (sel.node.type === 'block') {
          selBlockId = sel.node.id;
        } else if (sel.path && Array.isArray(sel.path)) {
          const blk = sel.path.find((n) => n && n.type === 'block');
          if (blk) selBlockId = blk.id;
        }
      }

      const newBlock = b.create();
      if (selBlockId) {
        this.store.insertNodeAt(selBlockId, 'after', newBlock);
      } else {
        this.store.addBlock(newBlock);
      }
    } catch (err) {
      console.error('[NewsMailForge] Erro ao criar bloco:', err);
    }
  }

  /**
   * Abre a categoria informada selecionando a pílula correspondente
   * @param {string} categoryId
   */
  openDrawer(categoryId) {
    if (categoryId) {
      this.selectedCategory = categoryId;
      if (this.pillsContainer) {
        this._updatePillStates(this.pillsContainer);
      }
      this._renderCatalogList();
    }
  }

  /**
   * Fecha qualquer estado transitório da gaveta
   */
  closeDrawer() {
    this.isDrawerOpen = false;
  }

  /**
   * Atualiza a aba visível
   * @private
   */
  _updateActiveTab(tab) {
    if (this.tabLib && this.tabTree && this.libContainer && this.treeContainer) {
      if (tab === 'tree') {
        this.tabLib.classList.remove('is-active');
        this.tabTree.classList.add('is-active');
        this.libContainer.style.display = 'none';
        this.treeContainer.style.display = 'block';
        this.closeDrawer();
      } else {
        this.tabLib.classList.add('is-active');
        this.tabTree.classList.remove('is-active');
        this.libContainer.style.display = 'flex';
        this.treeContainer.style.display = 'none';
      }
    }
  }

  /**
   * Retorna SVGs otimizados para as categorias
   * @private
   */
  _getCategoryIconSvg(iconName) {
    switch (iconName) {
      case 'menu':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      case 'layout':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>';
      case 'file-text':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
      case 'grid':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
      case 'mouse-pointer':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path></svg>';
      case 'shopping-bag':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
      case 'check-circle':
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      case 'align-left':
      default:
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>';
    }
  }

  /**
   * Monta o elemento na raiz do DOM
   * @param {HTMLElement} parent
   */
  mount(parent) {
    if (parent && parent.appendChild) {
      parent.appendChild(this.element);
      if (this.drawerEl && parent.parentNode) {
        parent.parentNode.appendChild(this.drawerEl);
      }
    }
    return this;
  }
}

export default SidebarPanel;

