/**
 * News Mail Forge - BlockFactory
 * Construtores de nós da árvore Document -> Block -> Row -> Cell -> Atom
 * Suporta aninhamento recursivo (RowNode dentro de CellNode).
 * UTF-8 sem BOM (No BOM)
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';

let _counter = 0;

/**
 * Gera um ID único com prefixo identificador
 * @param {string} prefix
 * @returns {string}
 */
export function uid(prefix = 'node') {
  _counter = (_counter + 1) % 1000000;
  const rnd = Math.random().toString(36).substring(2, 8);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rnd}_${_counter}`;
}

/**
 * Cria configurações globais do e-mail
 * @param {Object} overrides
 * @returns {Object}
 */
export function createGeneralSettings(overrides = {}) {
  const o = overrides || {};
  return {
    previewText: o.previewText !== undefined ? o.previewText : '',
    fontFamily: o.fontFamily || "'Segoe UI', Arial, sans-serif",
    fontSize: o.fontSize !== undefined ? o.fontSize : 16,
    lineHeight: o.lineHeight !== undefined ? o.lineHeight : 1.5,
    textColor: o.textColor || '#334155',
    canvasWidth: o.canvasWidth !== undefined ? o.canvasWidth : 600,
    background: {
      color: '#f8fafc',
      image: '',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center top',
      ...(o.background || {})
    },
    bodyBackground: {
      color: '#ffffff',
      ...(o.bodyBackground || {})
    },
    padding: Array.isArray(o.padding) ? [...o.padding] : [24, 16, 24, 16],
    ...o
  };
}

/**
 * Cria um nó de Documento completo
 * @param {Object} overrides
 * @returns {Object}
 */
export function createDocument(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('doc'),
    type: 'document',
    title: o.title || I18n.t('UI_UNTITLED_TEMPLATE', 'Modelo de E-mail Sem Título'),
    generalSettings: createGeneralSettings(o.generalSettings),
    blocks: Array.isArray(o.blocks) ? o.blocks : [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      ...(o.metadata || {})
    }
  };
}

/**
 * Cria um nó de Bloco
 * @param {Object} overrides
 * @returns {Object}
 */
export function createBlock(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('blk'),
    type: 'block',
    label: o.label || I18n.t('type.block', 'Linha'),
    settings: {
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: 0,
      border: { width: 0, style: 'solid', color: 'transparent' },
      opacity: 1,
      spacing: {
        padding: [20, 24, 20, 24],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    },
    rows: Array.isArray(o.rows) ? o.rows : []
  };
}

/**
 * Cria um nó de Linha (Row)
 * @param {Object} overrides
 * @returns {Object}
 */
export function createRow(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('row'),
    type: 'row',
    label: o.label || I18n.t('UI_ROW_LABEL', 'Linha'),
    settings: {
      widthMode: 'fill', // 'fill' (100%) | 'hug' (conteúdo)
      gap: 16, // Espaçamento horizontal entre colunas (px)
      height: 'auto',
      collapseOnMobile: true, // Empilhamento vertical em telas pequenas
      hiddenOnMobile: false,
      backgroundColor: 'transparent',
      borderRadius: 0,
      border: { width: 0, style: 'solid', color: 'transparent' },
      opacity: 1,
      spacing: {
        padding: [0, 0, 0, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    },
    cells: Array.isArray(o.cells) ? o.cells : []
  };
}

/**
 * Cria um nó de Célula/Coluna (Cell)
 * @param {Object} overrides
 * @returns {Object}
 */
export function createCell(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('cell'),
    type: 'cell',
    label: o.label || I18n.t('UI_CELL_LABEL', 'Coluna'),
    settings: {
      width: '100%', // '%' ou 'auto'
      height: 'auto',
      verticalAlign: 'top', // 'top' | 'middle' | 'bottom'
      horizontalAlign: 'left', // 'left' | 'center' | 'right'
      link: '',
      hiddenOnMobile: false,
      backgroundColor: 'transparent',
      borderRadius: 0,
      border: { width: 0, style: 'solid', color: 'transparent' },
      spacing: {
        padding: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    },
    children: Array.isArray(o.children) ? o.children : []
  };
}

/**
 * Cria um Átomo de Texto
 * @param {Object} overrides
 * @returns {Object}
 */
export function createTextAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'text',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    value: o.value !== undefined ? o.value : `<p style="margin: 0;">${I18n.t('UI_DEFAULT_PARAGRAPH', 'Clique para editar este texto...')}</p>`,
    settings: {
      widthMode: 'fill',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 1.5,
      color: '#334155',
      align: 'left',
      paragraphSpacing: 12,
      spacing: {
        padding: [0, 0, 0, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      borderRadius: 0,
      border: { width: 0, style: 'solid', color: 'transparent' },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Botão Bulletproof (VML + CSS)
 * @param {Object} overrides
 * @returns {Object}
 */
export function createButtonAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'button',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    value: o.value !== undefined ? o.value : I18n.t('UI_DEFAULT_BUTTON_TEXT', 'Clique Aqui'),
    link: o.link || 'https://example.com',
    settings: {
      widthMode: 'hug', // 'hug' | 'fill'
      align: 'center', // 'left' | 'center' | 'right'
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 1.2,
      borderRadius: 6,
      border: { width: 0, style: 'solid', color: 'transparent' },
      opacity: 1,
      spacing: {
        padding: [14, 28, 14, 28],
        margin: [8, 0, 8, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Imagem
 * @param {Object} overrides
 * @returns {Object}
 */
export function createImageAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'image',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    src: o.src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    alt: o.alt || 'Imagem',
    link: o.link || '',
    settings: {
      width: o.settings && o.settings.width !== undefined ? o.settings.width : 600,
      height: o.settings && o.settings.height !== undefined ? o.settings.height : 'auto',
      maxWidth: '100%',
      align: 'center',
      borderRadius: 0,
      border: { width: 0, style: 'solid', color: 'transparent' },
      spacing: {
        padding: [0, 0, 0, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Divisor Horizontal
 * @param {Object} overrides
 * @returns {Object}
 */
export function createDividerAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'divider',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    settings: {
      height: 1,
      color: '#e2e8f0',
      style: 'solid',
      width: '100%',
      align: 'center',
      opacity: 1,
      spacing: {
        padding: [0, 0, 0, 0],
        margin: [16, 0, 16, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Espaçador Vertical
 * @param {Object} overrides
 * @returns {Object}
 */
export function createSpacerAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'spacer',
    label: o.label || I18n.t('atom.spacer', 'Espaçador'),
    settings: {
      height: o.settings && o.settings.height !== undefined ? o.settings.height : 32,
      spacing: {
        padding: [0, 0, 0, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Menu de Navegação Horizontal
 * @param {Object} overrides
 * @returns {Object}
 */
export function createMenuAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'menu',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    items: Array.isArray(o.items) ? o.items.map(it => ({ ...it })) : [
      { label: 'Início', url: 'https://example.com' },
      { label: 'Recursos', url: 'https://example.com/recursos' },
      { label: 'Planos', url: 'https://example.com/planos' },
      { label: 'Contato', url: 'https://example.com/contato' }
    ],
    settings: {
      align: 'center',
      itemGap: 20,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 14,
      fontWeight: '600',
      color: '#475569',
      spacing: {
        padding: [8, 0, 8, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Cria um Átomo de Redes Sociais
 * @param {Object} overrides
 * @returns {Object}
 */
export function createSocialAtom(overrides = {}) {
  const o = overrides || {};
  return {
    id: o.id || uid('atom'),
    type: 'atom',
    atomType: 'social',
    label: o.label || I18n.t('UI_ATOM_LABEL', 'Elemento'),
    networks: Array.isArray(o.networks) ? o.networks.map(n => ({ ...n })) : [
      { name: 'facebook', url: 'https://facebook.com', icon: 'facebook' },
      { name: 'twitter', url: 'https://x.com', icon: 'twitter' },
      { name: 'instagram', url: 'https://instagram.com', icon: 'instagram' },
      { name: 'linkedin', url: 'https://linkedin.com', icon: 'linkedin' }
    ],
    settings: {
      align: 'center',
      iconSize: 28,
      iconGap: 16,
      iconTheme: 'dark', // 'dark' | 'light' | 'color'
      spacing: {
        padding: [8, 0, 8, 0],
        margin: [0, 0, 0, 0],
        ...((o.settings && o.settings.spacing) || {})
      },
      ...(o.settings || {})
    }
  };
}

/**
 * Clona profundamente qualquer nó da árvore regenerando todos os IDs
 * Suporta recursão em CellNode.children (Atom ou RowNode aninhada).
 * @param {Object} node
 * @returns {Object}
 */
export function cloneNodeWithNewIds(node) {
  if (!node || typeof node !== 'object') {
    return node;
  }

  const copy = JSON.parse(JSON.stringify(node));

  function regenerate(target) {
    if (!target || typeof target !== 'object') return;

    if (target.type === 'document') {
      target.id = uid('doc');
      if (Array.isArray(target.blocks)) {
        target.blocks.forEach(regenerate);
      }
    } else if (target.type === 'block') {
      target.id = uid('blk');
      if (Array.isArray(target.rows)) {
        target.rows.forEach(regenerate);
      }
    } else if (target.type === 'row') {
      target.id = uid('row');
      if (Array.isArray(target.cells)) {
        target.cells.forEach(regenerate);
      }
    } else if (target.type === 'cell') {
      target.id = uid('cell');
      if (Array.isArray(target.children)) {
        target.children.forEach(regenerate);
      }
    } else if (target.type === 'atom') {
      target.id = uid('atom');
    }
  }

  regenerate(copy);
  return copy;
}

export const BlockFactory = {
  uid,
  createGeneralSettings,
  createDocument,
  createBlock,
  createRow,
  createCell,
  createTextAtom,
  createButtonAtom,
  createImageAtom,
  createDividerAtom,
  createSpacerAtom,
  createMenuAtom,
  createSocialAtom,
  cloneNodeWithNewIds
};

export default BlockFactory;
