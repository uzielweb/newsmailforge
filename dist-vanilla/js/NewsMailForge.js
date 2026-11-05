/**
 * NewsMailForge - Fachada Pública e Inicializador de Studio (Vanilla JS)
 * API pública universal (ES Module + window.NewsMailForge).
 * Suporta integração com bindHtmlInput, bindJsonInput, saveEndpoint e LocalStorage.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from './i18n/I18n.js';
import { Store } from './core/Store.js';
import { BlockFactory } from './core/BlockFactory.js';
import { EmailCompiler } from './core/EmailCompiler.js';
import { BlockCatalog, BLOCKS, CATEGORIES } from './catalog/BlockCatalog.js';
import { BuiltinPresets, PRESETS } from './catalog/BuiltinPresets.js';

import { HeaderBar } from './ui/HeaderBar.js';
import { SidebarPanel } from './ui/SidebarPanel.js';
import { TreeNavigator } from './ui/TreeNavigator.js';
import { CanvasStage } from './ui/CanvasStage.js';
import { InspectorPanel } from './ui/InspectorPanel.js';

let _activeInstance = null;

/**
 * Inicializa e monta o NewsMailForge Studio em um container do DOM
 * @param {string|HTMLElement} target - Seletor CSS ou elemento HTML hospedeiro
 * @param {Object} [config={}] - Opções de configuração
 * @returns {Object} Instância de controle do editor
 */
export function mount(target, config = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    throw new Error(`[NewsMailForge] Elemento alvo não encontrado para o seletor: ${target}`);
  }

  // Inicializa idioma se fornecido
  if (config.locale) {
    I18n.setLocale(config.locale);
  }

  // Schema inicial: config.initialSchema, ou preset escolhido, ou fallback para Editorial Digest
  let initialDoc = null;
  if (config.initialSchema) {
    initialDoc = typeof config.initialSchema === 'string'
      ? JSON.parse(config.initialSchema)
      : config.initialSchema;
  } else if (config.preset) {
    initialDoc = BuiltinPresets.createPreset(config.preset);
  }

  if (!initialDoc) {
    initialDoc = BuiltinPresets.createPreset('editorial_digest') || BlockFactory.createDocument();
  }

  // Cria a Store Reativa
  const store = new Store(initialDoc, { maxHistory: config.maxHistory || 50 });

  // Cria os Componentes da UI
  const treeNavigator = new TreeNavigator(store);
  const sidebarPanel = new SidebarPanel(store, treeNavigator);
  const canvasStage = new CanvasStage(store);
  const inspectorPanel = new InspectorPanel(store);
  const headerBar = new HeaderBar(store, config);

  // Constrói o DOM do Studio
  const studioRoot = document.createElement('div');
  studioRoot.className = 'nmf-studio';

  // Anexa Topbar
  headerBar.mount(studioRoot);

  // Anexa Corpo em 3 Colunas
  const bodyEl = document.createElement('div');
  bodyEl.className = 'nmf-body';

  sidebarPanel.mount(bodyEl);
  canvasStage.mount(bodyEl);
  inspectorPanel.mount(bodyEl);

  studioRoot.appendChild(bodyEl);

  // Limpa o container e anexa o Studio
  container.innerHTML = '';
  container.appendChild(studioRoot);

  // Sincronização automática com inputs do formulário hospedeiro
  const syncInputs = (doc) => {
    if (config.bindHtmlInput) {
      const el = typeof config.bindHtmlInput === 'string'
        ? document.querySelector(config.bindHtmlInput)
        : config.bindHtmlInput;
      if (el) {
        el.value = EmailCompiler.compile(doc, { previewMode: false });
      }
    }

    if (config.bindJsonInput) {
      const el = typeof config.bindJsonInput === 'string'
        ? document.querySelector(config.bindJsonInput)
        : config.bindJsonInput;
      if (el) {
        el.value = JSON.stringify(doc);
      }
    }
  };

  // Executa sincronização inicial e se inscreve nas alterações
  syncInputs(store.getDocument());
  store.subscribe((state) => {
    syncInputs(state.document);
  });

  const instance = {
    store,
    getHtml: (previewMode = false) => EmailCompiler.compile(store.getDocument(), { previewMode }),
    getSchema: () => store.getDocument(),
    setSchema: (schema) => store.setDocument(schema, true),
    appendSchema: (schema) => store.appendDocument(schema),
    save: () => headerBar.triggerSave(),
    undo: () => store.undo(),
    redo: () => store.redo(),
    setViewport: (vp) => store.setViewport(vp),
    setLocale: (loc) => I18n.setLocale(loc),
    destroy: () => {
      container.innerHTML = '';
      _activeInstance = null;
    }
  };

  _activeInstance = instance;
  return instance;
}

/**
 * Retorna o HTML compilado da instância ativa
 * @param {boolean} [previewMode=false]
 * @returns {string}
 */
export function getHtml(previewMode = false) {
  if (!_activeInstance) return '';
  return _activeInstance.getHtml(previewMode);
}

/**
 * Retorna o schema JSON da instância ativa
 * @returns {Object|null}
 */
export function getSchema() {
  if (!_activeInstance) return null;
  return _activeInstance.getSchema();
}

/**
 * Define o schema da instância ativa
 * @param {Object} schema
 */
export function setSchema(schema) {
  if (_activeInstance) {
    _activeInstance.setSchema(schema);
  }
}

/**
 * Registra um novo bloco customizado no catálogo em tempo de execução
 * @param {string} category
 * @param {Object} blockDef
 */
export function registerBlock(category, blockDef) {
  if (!category || !blockDef || typeof blockDef.create !== 'function') {
    throw new Error('[NewsMailForge] Bloco inválido para registro.');
  }
  BLOCKS.push({
    id: blockDef.id || `custom_${Date.now()}`,
    category,
    nameKey: blockDef.nameKey || blockDef.id,
    descriptionKey: blockDef.descriptionKey || '',
    thumbnailSvg: blockDef.thumbnailSvg || '',
    create: blockDef.create
  });
}

// Objeto Global NewsMailForge
export const NewsMailForge = {
  mount,
  getHtml,
  getSchema,
  setSchema,
  registerBlock,
  Store,
  BlockFactory,
  EmailCompiler,
  BlockCatalog,
  BuiltinPresets,
  I18n
};

if (typeof window !== 'undefined') {
  window.NewsMailForge = NewsMailForge;
}

export default NewsMailForge;
