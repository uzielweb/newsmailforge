/**
 * NewsMailForge - SidebarPanel
 * Painel lateral esquerdo com abas duplas:
 * 1. Block Library (8 categorias + Flyout Drawer lateral deslizante com cards SVG)
 * 2. Component Tree (Árvore hierárquica sincronizada)
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
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

    // Container Library (Categorias)
    const libContainer = document.createElement('div');
    libContainer.className = 'nmf-category-list';
    libContainer.style.display = currentTab === 'library' ? 'flex' : 'none';

    CATEGORIES.forEach((cat) => {
      const catBlocks = BLOCKS.filter((b) => b.category === cat.id);
      const item = document.createElement('div');
      item.className = 'nmf-category-item';
      item.setAttribute('data-category-id', cat.id);

      const catName = I18n.t(`cat.${cat.id}`, I18n.t(cat.nameKey, cat.id));

      item.innerHTML = `
        <div class="nmf-category-left">
          <div class="nmf-category-icon">${this._getCategoryIconSvg(cat.icon)}</div>
          <span>${catName}</span>
        </div>
        <span class="nmf-category-badge">${catBlocks.length}</span>
      `;

      item.addEventListener('mouseenter', () => {
        this.openDrawer(cat.id);
      });

      item.addEventListener('click', () => {
        this.openDrawer(cat.id);
      });

      libContainer.appendChild(item);
    });

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

    // Cria e anexa o Flyout Drawer lateral deslizante
    this._createFlyoutDrawer();
  }

  /**
   * Cria o elemento do Flyout Drawer
   * @private
   */
  _createFlyoutDrawer() {
    if (this.drawerEl) {
      this.drawerEl.remove();
    }

    const drawer = document.createElement('div');
    drawer.className = 'nmf-flyout-drawer';

    const header = document.createElement('div');
    header.className = 'nmf-drawer-header';

    const title = document.createElement('span');
    title.className = 'nmf-drawer-title';
    title.textContent = I18n.t('ui.tabs.library', 'Biblioteca de Blocos');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'nmf-drawer-close';
    closeBtn.title = I18n.t('ui.drawer_close', 'Fechar Gaveta');
    closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.closeDrawer());

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'nmf-drawer-body';

    drawer.appendChild(header);
    drawer.appendChild(body);

    this.drawerEl = drawer;
    this.drawerTitle = title;
    this.drawerBody = body;

    // Fecha a gaveta se o usuário mover o cursor para fora da sidebar/drawer
    drawer.addEventListener('mouseleave', (e) => {
      // Se não estiver indo para a sidebar
      const toEl = e.relatedTarget;
      if (!this.element.contains(toEl)) {
        this.closeDrawer();
      }
    });
  }

  /**
   * Abre a gaveta exibindo os blocos de uma categoria
   * @param {string} categoryId
   */
  openDrawer(categoryId) {
    if (!this.drawerEl) return;

    this.store.setActiveCategory(categoryId);

    // Atualiza classe ativa nas categorias
    const items = this.element.querySelectorAll('.nmf-category-item');
    items.forEach((it) => {
      if (it.getAttribute('data-category-id') === categoryId) {
        it.classList.add('is-active');
      } else {
        it.classList.remove('is-active');
      }
    });

    const cat = CATEGORIES.find((c) => c.id === categoryId);
    const catName = cat ? I18n.t(`cat.${cat.id}`, I18n.t(cat.nameKey, cat.id)) : categoryId;

    this.drawerTitle.textContent = catName;
    this.drawerBody.innerHTML = '';

    const blocks = BLOCKS.filter((b) => b.category === categoryId);

    blocks.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'nmf-block-card';
      card.draggable = true;

      const blockName = I18n.t(b.nameKey, b.id);

      card.innerHTML = `
        <div class="nmf-block-preview">${b.thumbnailSvg || ''}</div>
        <div class="nmf-block-meta">
          <span class="nmf-block-name">${blockName}</span>
          <button type="button" class="nmf-block-add-btn">${I18n.t('ui.insert_block', '+ Inserir')}</button>
        </div>
      `;

      // Clique no card ou botão insere o bloco
      card.addEventListener('click', () => {
        try {
          const newBlock = b.create();
          this.store.addBlock(newBlock);
          this.store.selectNode(newBlock.id);
        } catch (err) {
          console.error('[NewsMailForge] Erro ao criar bloco:', err);
        }
      });

      // Suporte a Drag & Drop
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', b.id);
        e.dataTransfer.effectAllowed = 'copy';
      });

      this.drawerBody.appendChild(card);
    });

    this.drawerEl.classList.add('is-open');
    this.isDrawerOpen = true;
  }

  /**
   * Fecha a gaveta lateral
   */
  closeDrawer() {
    if (!this.drawerEl) return;
    this.drawerEl.classList.remove('is-open');
    this.isDrawerOpen = false;

    const items = this.element.querySelectorAll('.nmf-category-item');
    items.forEach((it) => it.classList.remove('is-active'));
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
   * Monta o elemento e o drawer no body
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

