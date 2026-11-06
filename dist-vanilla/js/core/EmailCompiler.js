/**
 * News Mail Forge - EmailCompiler
 * Compilador de Árvore JSON -> HTML Tabelado XHTML 1.0 Transitional
 * Implementa 100% das regras de anti-quebra do Outlook (Word Engine),
 * Ghost Tables MSO, subpixel bleeding fix, Gap Spacer Columns e botões VML.
 * UTF-8 sem BOM (No BOM)
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';

/**
 * Escapa caracteres HTML perigosos (OWASP)
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapa URLs para hrefs de e-mail (converte & para &amp; e bloqueia javascript:)
 * @param {string} url
 * @returns {string}
 */
export function escapeHref(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  // Bloqueio rigoroso de esquemas maliciosos
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return '#';
  }
  // Escapa & para &amp; sem duplicar se já estiver escapado
  return trimmed
    .replace(/&amp;/g, '&')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
}

/**
 * Converte array [t, r, b, l] em string CSS de padding/margin
 * @param {number[]} arr
 * @returns {string}
 */
function toBoxSpacing(arr, defaultValue = [0, 0, 0, 0]) {
  const box = Array.isArray(arr) && arr.length === 4 ? arr : defaultValue;
  return `${box[0]}px ${box[1]}px ${box[2]}px ${box[3]}px`;
}

/**
 * Mapeia ícones SVG inline ultraleves para redes sociais
 */
const SOCIAL_ICONS = {
  facebook: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/></svg>',
  twitter: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  instagram: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  linkedin: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/></svg>',
  youtube: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  github: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>',
  whatsapp: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.57c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z"/></svg>',
  website: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
};

export class EmailCompiler {
  /**
   * Compila o documento para HTML completo ou parcial
   * @param {Object} document
   * @param {Object} [options]
   * @param {boolean} [options.previewMode=false] Adiciona atributos data-nmf-* para manipulação visual no editor
   * @param {boolean} [options.fullDocument=true] Se falso, retorna apenas a tabela de conteúdo
   * @returns {string} HTML final tabelado
   */
  static compile(document, options = {}) {
    if (!document || typeof document !== 'object') {
      return '';
    }

    const previewMode = options.previewMode === true;
    const fullDocument = options.fullDocument !== false;

    const gs = document.generalSettings || {};
    const canvasWidth = parseInt(gs.canvasWidth || 600, 10);
    const bodyBg = gs.background && gs.background.color ? gs.background.color : '#f1f5f9';
    const emailBg = gs.bodyBackground && gs.bodyBackground.color ? gs.bodyBackground.color : '#ffffff';
    const previewText = gs.previewText || '';
    const genPad = Array.isArray(gs.padding) ? gs.padding : [24, 16, 24, 16];
    const defaultFont = gs.fontFamily || "'Segoe UI', Arial, sans-serif";

    // Compila os blocos
    const blocksHtml = (document.blocks || [])
      .map(block => this.compileBlock(block, options, { canvasWidth, emailBg, defaultFont }))
      .join('\n');

    if (!fullDocument) {
      return blocksHtml;
    }

    // Pré-header oculto anti-corte
    const preheaderHtml = previewText ? `
<!-- Preheader text (inbox snippet) -->
<div style="display: none; font-size: 1px; color: ${bodyBg}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
  ${escapeHtml(previewText)}
  ${'&#847;&zwnj;&nbsp;'.repeat(30)}
</div>` : '';

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(document.title || 'Email')}</title>
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <style type="text/css">
    /* Reset Geral para Todos os Clientes */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: ${bodyBg}; }

    /* Responsividade Móvel (Telas até 600px) */
    @media only screen and (max-width: 600px) {
      .e-container { width: 100% !important; max-width: 100% !important; }
      .e-col-mobile-collapse { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
      .e-col-gap-mobile-collapse { display: block !important; width: 100% !important; height: var(--e-gap, 16px) !important; font-size: 0 !important; line-height: 0 !important; }
      .e-hide-mobile { display: none !important; mso-hide: all !important; max-height: 0 !important; overflow: hidden !important; }
      .e-stack-full { width: 100% !important; }
      .e-mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body bgcolor="${bodyBg}" style="margin: 0; padding: 0; background-color: ${bodyBg}; font-family: ${defaultFont};">
${preheaderHtml}
  <!-- Wrapper 100% Externo -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bodyBg}" style="background-color: ${bodyBg}; margin: 0; padding: ${genPad[0]}px ${genPad[1]}px ${genPad[2]}px ${genPad[3]}px; width: 100%;">
    <tr bgcolor="${bodyBg}" style="background-color: ${bodyBg};">
      <td align="center" valign="top" bgcolor="${bodyBg}" style="background-color: ${bodyBg};">
        ${blocksHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Compila um Bloco com Ghost Table MSO e alinhamento de subpixel
   * @param {Object} block
   * @param {Object} options
   * @param {Object} context
   * @returns {string}
   */
  static compileBlock(block, options = {}, context = {}) {
    if (!block) return '';
    const previewMode = options.previewMode === true;
    const canvasWidth = context.canvasWidth || 600;
    const settings = block.settings || {};
    const bgColor = settings.backgroundColor || 'transparent';
    const effectiveBg = bgColor === 'transparent' ? (context.emailBg || '#ffffff') : bgColor;
    const padding = settings.spacing && settings.spacing.padding ? settings.spacing.padding : [20, 24, 20, 24];
    const borderRadius = settings.borderRadius ? parseInt(settings.borderRadius, 10) : 0;
    const borderStyle = settings.border && settings.border.width > 0 
      ? `border: ${settings.border.width}px ${settings.border.style || 'solid'} ${settings.border.color || '#cbd5e1'};` 
      : '';

    const blockAttrs = previewMode
      ? ` data-nmf-id="${block.id}" data-nmf-type="block"`
      : '';

    // Compila as linhas do bloco
    const rowsHtml = (block.rows || [])
      .map(row => this.compileRow(row, options, { ...context, blockBg: effectiveBg }))
      .join('\n');

    // Ghost table do Outlook com o MESMO bgcolor para blindar contra subpixel horizontal bleeding
    return `
<!--[if (gte mso 9)|(IE)]>
<table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="${canvasWidth}" bgcolor="${effectiveBg}" style="width: ${canvasWidth}px; background-color: ${effectiveBg};">
<tr bgcolor="${effectiveBg}" style="background-color: ${effectiveBg};">
<td align="center" valign="top" width="${canvasWidth}" bgcolor="${effectiveBg}" style="width: ${canvasWidth}px; background-color: ${effectiveBg};">
<![endif]-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="e-container" bgcolor="${effectiveBg}" style="max-width: ${canvasWidth}px; width: 100%; margin: 0 auto; background-color: ${effectiveBg}; border-radius: ${borderRadius}px; ${borderStyle}"${blockAttrs}>
  <tr bgcolor="${effectiveBg}" style="background-color: ${effectiveBg};">
    <td align="center" valign="top" bgcolor="${effectiveBg}" style="background-color: ${effectiveBg}; padding: ${toBoxSpacing(padding)};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[if (gte mso 9)|(IE)]>
</td>
</tr>
</table>
<![endif]-->`;
  }

  /**
   * Compila uma Linha (Row) com suporte a Gap Spacer Columns
   * @param {Object} row
   * @param {Object} options
   * @param {Object} context
   * @returns {string}
   */
  static compileRow(row, options = {}, context = {}) {
    if (!row) return '';
    const previewMode = options.previewMode === true;
    const settings = row.settings || {};
    const gap = parseInt(settings.gap !== undefined ? settings.gap : 16, 10);
    const collapseOnMobile = settings.collapseOnMobile !== false;
    const hiddenOnMobile = settings.hiddenOnMobile === true;
    const rowBg = settings.backgroundColor || 'transparent';
    const padding = settings.spacing && settings.spacing.padding ? settings.spacing.padding : [0, 0, 0, 0];
    const cells = Array.isArray(row.cells) ? row.cells : [];
    const totalCells = cells.length;

    const rowAttrs = previewMode
      ? ` data-nmf-id="${row.id}" data-nmf-type="row"`
      : '';

    const rowClasses = [
      'e-row',
      hiddenOnMobile ? 'e-hide-mobile' : ''
    ].filter(Boolean).join(' ');

    // Constrói células intercaladas com Gap Spacers se gap > 0 e houver mais de 1 célula
    const compiledCells = [];
    cells.forEach((cell, idx) => {
      // Compila a célula
      compiledCells.push(this.compileCell(cell, options, {
        ...context,
        totalCells,
        gap,
        collapseOnMobile,
        rowBg
      }));

      // Insere coluna espaçadora automática entre células
      if (gap > 0 && idx < totalCells - 1) {
        const spacerAttrs = previewMode ? ' data-nmf-spacer="gap"' : '';
        compiledCells.push(
          `<td class="e-col-gap e-col-gap-mobile-collapse" width="${gap}" style="width: ${gap}px; min-width: ${gap}px; max-width: ${gap}px; font-size: 0; line-height: 0; padding: 0; mso-line-height-rule: exactly; --e-gap: ${gap}px;" bgcolor="${rowBg}"${spacerAttrs}>&nbsp;</td>`
        );
      }
    });

    return `
<tr class="${rowClasses}" bgcolor="${rowBg}" style="background-color: ${rowBg};"${rowAttrs}>
  <td bgcolor="${rowBg}" style="background-color: ${rowBg}; padding: ${toBoxSpacing(padding)};">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${rowBg}" style="background-color: ${rowBg};">
      <tr bgcolor="${rowBg}" style="background-color: ${rowBg};">
        ${compiledCells.join('\n        ')}
      </tr>
    </table>
  </td>
</tr>`;
  }

  /**
   * Compila uma Coluna/Célula (Cell) com alinhamento vertical duplo e filhos recursivos
   * @param {Object} cell
   * @param {Object} options
   * @param {Object} context
   * @returns {string}
   */
  static compileCell(cell, options = {}, context = {}) {
    if (!cell) return '';
    const previewMode = options.previewMode === true;
    const settings = cell.settings || {};
    const totalCells = context.totalCells || 1;
    const gap = context.gap || 0;
    const canvasWidth = context.canvasWidth || 600;
    const collapseOnMobile = context.collapseOnMobile !== false;
    const hiddenOnMobile = settings.hiddenOnMobile === true;
    const vAlign = settings.verticalAlign || 'top';
    const hAlign = settings.horizontalAlign || 'left';
    const cellBg = settings.backgroundColor || 'transparent';
    const padding = settings.spacing && settings.spacing.padding ? settings.spacing.padding : [0, 0, 0, 0];

    // Cálculo proporcional de largura
    let widthStyle = '100%';
    let widthAttr = '';

    if (totalCells === 1) {
      widthStyle = '100%';
      widthAttr = '100%';
    } else {
      if (settings.width && typeof settings.width === 'string' && settings.width.includes('%')) {
        widthStyle = settings.width;
        const pct = parseFloat(settings.width) / 100;
        const availablePixels = canvasWidth - ((totalCells - 1) * gap);
        const approxPx = Math.floor(availablePixels * pct);
        widthAttr = String(approxPx);
      } else {
        const pct = 100 / totalCells;
        widthStyle = `${pct.toFixed(2)}%`;
        const availablePixels = canvasWidth - ((totalCells - 1) * gap);
        widthAttr = String(Math.floor(availablePixels / totalCells));
      }
    }

    const classes = [
      'e-col',
      collapseOnMobile ? 'e-col-mobile-collapse' : '',
      hiddenOnMobile ? 'e-hide-mobile' : ''
    ].filter(Boolean).join(' ');

    const cellAttrs = previewMode
      ? ` data-nmf-id="${cell.id}" data-nmf-type="cell"`
      : '';

    // Compila os filhos recursivamente (podem ser Atoms ou RowNode aninhada)
    const rawChildren = Array.isArray(cell.children) ? cell.children : [];
    const childrenHtml = (previewMode && rawChildren.length === 0)
      ? `<div class="nmf-empty-cell-placeholder" data-nmf-empty-cell="${cell.id}" style="min-height: 54px; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(37, 99, 235, 0.35); border-radius: 6px; padding: 10px 8px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; background-color: rgba(37, 99, 235, 0.03); text-align: center;">+ ${escapeHtml(I18n.t('action.insert_element', 'Inserir Conteúdo'))}</div>`
      : rawChildren.map(child => {
        if (child.type === 'row') {
          // Recursão elegante: RowNode dentro de CellNode
          return this.compileRow(child, options, context);
        }
        return this.compileAtom(child, options, context);
      }).join('\n');

    return `<td class="${classes}" width="${widthAttr}" valign="${vAlign}" align="${hAlign}" bgcolor="${cellBg}" style="width: ${widthStyle}; vertical-align: ${vAlign}; text-align: ${hAlign}; background-color: ${cellBg}; padding: ${toBoxSpacing(padding)};"${cellAttrs}>
  ${childrenHtml}
</td>`;
  }

  /**
   * Compila um Átomo individual (text, button, image, divider, menu, social)
   * @param {Object} atom
   * @param {Object} options
   * @param {Object} context
   * @returns {string}
   */
  static compileAtom(atom, options = {}, context = {}) {
    if (!atom) return '';
    const previewMode = options.previewMode === true;
    const atomType = atom.atomType || 'text';

    const atomAttrs = previewMode
      ? ` data-nmf-id="${atom.id}" data-nmf-type="atom" data-nmf-atom-type="${atomType}"`
      : '';

    switch (atomType) {
      case 'text':
        return this._compileTextAtom(atom, atomAttrs, context);
      case 'button':
        return this._compileButtonAtom(atom, atomAttrs, context);
      case 'image':
        return this._compileImageAtom(atom, atomAttrs, context);
      case 'divider':
        return this._compileDividerAtom(atom, atomAttrs, context);
      case 'spacer':
        return this._compileSpacerAtom(atom, atomAttrs, context);
      case 'menu':
        return this._compileMenuAtom(atom, atomAttrs, context);
      case 'social':
        return this._compileSocialAtom(atom, atomAttrs, context);
      default:
        return `<div${atomAttrs}>${escapeHtml(atom.value || '')}</div>`;
    }
  }

  /**
   * Compila Átomo de Espaçador Vertical
   * @private
   */
  static _compileSpacerAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const height = parseInt(s.height !== undefined ? s.height : 32, 10);
    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"${atomAttrs}><tr><td height="${height}" style="height: ${height}px; line-height: ${height}px; font-size: 0; mso-line-height-rule: exactly;">&nbsp;</td></tr></table>`;
  }

  /**
   * Compila Átomo de Texto
   * @private
   */
  static _compileTextAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const fontFamily = s.fontFamily || context.defaultFont || "'Segoe UI', Arial, sans-serif";
    const fontSize = s.fontSize || 16;
    const fontWeight = s.fontWeight || 'normal';
    const lineHeight = s.lineHeight || 1.5;
    const color = s.color || '#334155';
    const align = s.align || 'left';
    const padding = s.spacing && s.spacing.padding ? s.spacing.padding : [0, 0, 0, 0];
    const margin = s.spacing && s.spacing.margin ? s.spacing.margin : [0, 0, 0, 0];
    const bgStyle = (s.backgroundColor && s.backgroundColor !== 'transparent') ? ` background-color: ${s.backgroundColor};` : '';
    const radiusStyle = s.borderRadius ? ` border-radius: ${parseInt(s.borderRadius, 10)}px;` : '';

    const style = `font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: ${lineHeight}; color: ${color}; text-align: ${align}; padding: ${toBoxSpacing(padding)}; margin: ${toBoxSpacing(margin)};${bgStyle}${radiusStyle}`;

    return `<div class="e-atom-text"${atomAttrs} style="${style}">${String(atom.value || '').trim()}</div>`;
  }

  /**
   * Compila Átomo de Botão Bulletproof com suporte a VML para Outlook
   * @private
   */
  static _compileButtonAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const link = escapeHref(atom.link || '#');
    const text = escapeHtml(atom.value || 'Botão');
    const align = s.align || 'center';
    const bg = s.backgroundColor || '#2563eb';
    const color = s.color || '#ffffff';
    const fontFamily = s.fontFamily || context.defaultFont || "'Segoe UI', Arial, sans-serif";
    const fontSize = s.fontSize || 16;
    const fontWeight = s.fontWeight || 'bold';
    const radius = s.borderRadius !== undefined ? parseInt(s.borderRadius, 10) : 6;
    const padding = s.spacing && s.spacing.padding ? s.spacing.padding : [14, 28, 14, 28];
    const margin = s.spacing && s.spacing.margin ? s.spacing.margin : [8, 0, 8, 0];
    const isFullWidth = s.fullWidth === true;

    // Borda opcional
    let borderCss = '';
    let hasBorder = false;
    let borderWidth = 1;
    let borderColor = bg;
    if (s.border) {
      if (typeof s.border === 'string' && s.border !== 'none' && s.border !== '0') {
        borderCss = ` border: ${s.border};`;
        hasBorder = true;
      } else if (typeof s.border === 'object' && s.border.width > 0 && s.border.color && s.border.color !== 'transparent') {
        borderWidth = parseInt(s.border.width, 10);
        borderColor = s.border.color;
        const bStyle = s.border.style || 'solid';
        borderCss = ` border: ${borderWidth}px ${bStyle} ${borderColor};`;
        hasBorder = true;
      }
    }

    // Cálculos para o roundrect VML do Outlook
    const vmlHeight = (fontSize * 1.2) + padding[0] + padding[2];
    const approxCharWidth = fontSize * 0.65;
    const vmlWidth = isFullWidth
      ? (context.canvasWidth || 600)
      : Math.max(120, Math.floor((text.length * approxCharWidth) + padding[1] + padding[3]));
    const arcPercent = Math.min(100, Math.floor((radius / (vmlHeight / 2)) * 100));
    const strokeAttr = hasBorder ? `stroke="t" strokecolor="${borderColor}" strokeweight="${borderWidth}px"` : 'stroke="f"';

    const tableWidthAttr = isFullWidth ? ' width="100%"' : '';
    const tableStyle = isFullWidth
      ? `margin: ${toBoxSpacing(margin)}; width: 100%;`
      : `margin: ${toBoxSpacing(margin)}; display: inline-table;`;
    const aDisplay = isFullWidth
      ? 'display: block; width: 100%; box-sizing: border-box;'
      : 'display: inline-block;';

    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0"${tableWidthAttr} align="${align}" style="${tableStyle}"${atomAttrs}>
  <tr>
    <td align="${align}" style="border-radius: ${radius}px;${borderCss}" bgcolor="${bg}">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:${vmlHeight}px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="${arcPercent}%" ${strokeAttr} fillcolor="${bg}">
        <w:anchorlock/>
        <center style="color:${color};font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};">
          ${text}
        </center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${link}" target="_blank" style="background-color: ${bg}; border-radius: ${radius}px; color: ${color}; ${aDisplay} font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: 1.2; text-align: center; text-decoration: none; padding: ${toBoxSpacing(padding)}; -webkit-text-size-adjust: none; mso-hide: all;${borderCss}">
        ${text}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
  }

  /**
   * Compila Átomo de Imagem eliminando frestas no Outlook
   * @private
   */
  static _compileImageAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const src = escapeHref(atom.src || '');
    const alt = escapeHtml(atom.alt || '');
    const link = atom.link ? escapeHref(atom.link) : '';
    const align = s.align || 'center';
    const width = s.width !== undefined && s.width !== 'auto' ? parseInt(s.width, 10) : 600;
    const radius = s.borderRadius ? parseInt(s.borderRadius, 10) : 0;
    const padding = s.spacing && s.spacing.padding ? s.spacing.padding : [0, 0, 0, 0];
    const margin = s.spacing && s.spacing.margin ? s.spacing.margin : [0, 0, 0, 0];

    let imgTag = `<img src="${src}" alt="${alt}" width="${width}" border="0" style="display: block; width: 100%; max-width: ${width}px; height: auto; margin: 0 auto; border: 0; outline: none; border-radius: ${radius}px;" />`;

    if (link && link !== '#') {
      imgTag = `<a href="${link}" target="_blank" style="display: block; text-decoration: none; border: 0;">${imgTag}</a>`;
    }

    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="${align}" style="margin: ${toBoxSpacing(margin)};"${atomAttrs}>
  <tr>
    <td align="${align}" style="padding: ${toBoxSpacing(padding)}; font-size: 0; line-height: 0;">
      ${imgTag}
    </td>
  </tr>
</table>`;
  }

  /**
   * Compila Átomo de Divisor Horizontal
   * @private
   */
  static _compileDividerAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const height = parseInt(s.height || 1, 10);
    const color = s.color || '#e2e8f0';
    const style = s.style || 'solid';
    const align = s.align || 'center';
    const width = s.width || '100%';
    const margin = s.spacing && s.spacing.margin ? s.spacing.margin : [16, 0, 16, 0];

    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${width}" align="${align}" style="margin: ${toBoxSpacing(margin)}; width: ${width};"${atomAttrs}>
  <tr>
    <td height="${height}" style="height: ${height}px; line-height: ${height}px; font-size: 0; border-top: ${height}px ${style} ${color}; mso-line-height-rule: exactly;">&nbsp;</td>
  </tr>
</table>`;
  }

  /**
   * Compila Átomo de Menu Horizontal
   * @private
   */
  static _compileMenuAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const items = Array.isArray(atom.items) ? atom.items : [];
    const align = s.align || 'center';
    const gap = parseInt(s.itemGap || 20, 10);
    const fontFamily = s.fontFamily || context.defaultFont || "'Segoe UI', Arial, sans-serif";
    const fontSize = s.fontSize || 14;
    const fontWeight = s.fontWeight || '600';
    const color = s.color || '#475569';
    const padding = s.spacing && s.spacing.padding ? s.spacing.padding : [8, 0, 8, 0];

    const linksHtml = items.map((item, idx) => {
      const linkTag = `<a href="${escapeHref(item.url)}" target="_blank" style="color: ${color}; font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: ${fontWeight}; text-decoration: none; display: inline-block;">${escapeHtml(item.label)}</a>`;
      const spacer = (idx < items.length - 1)
        ? `<td width="${gap}" style="width: ${gap}px; min-width: ${gap}px; font-size: 0; line-height: 0;">&nbsp;</td>`
        : '';
      return `<td align="center" valign="middle">${linkTag}</td>${spacer}`;
    }).join('\n');

    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" align="${align}" style="padding: ${toBoxSpacing(padding)}; margin: 0 auto;"${atomAttrs}>
  <tr>
    ${linksHtml}
  </tr>
</table>`;
  }

  /**
   * Compila Átomo de Redes Sociais com ícones SVG inline nítidos
   * @private
   */
  static _compileSocialAtom(atom, atomAttrs, context) {
    const s = atom.settings || {};
    const networks = Array.isArray(atom.networks) ? atom.networks : [];
    const align = s.align || 'center';
    const iconSize = parseInt(s.iconSize || 28, 10);
    const iconGap = parseInt(s.iconGap || 16, 10);
    const theme = s.iconTheme || 'dark';
    const padding = s.spacing && s.spacing.padding ? s.spacing.padding : [8, 0, 8, 0];

    const brandColors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      linkedin: '#0A66C2',
      twitter: '#0F172A',
      youtube: '#FF0000',
      github: '#181717',
      whatsapp: '#25D366',
      website: '#2563EB'
    };

    const iconsHtml = networks.map((net, idx) => {
      const netKey = net.icon || net.name || 'facebook';
      let effectiveColor = '#475569';
      if (net.color && String(net.color).trim() !== '') {
        effectiveColor = String(net.color).trim();
      } else if (theme === 'custom' || (s.iconColor && String(s.iconColor).trim() !== '')) {
        effectiveColor = (s.iconColor && String(s.iconColor).trim() !== '') ? String(s.iconColor).trim() : '#475569';
      } else if (theme === 'light') {
        effectiveColor = '#ffffff';
      } else if (theme === 'color') {
        effectiveColor = brandColors[netKey] || '#2563eb';
      }

      const customImg = (net.customIconUrl || net.imageSrc || '').trim();
      let innerVisualHtml = '';
      if (customImg !== '') {
        innerVisualHtml = `<img src="${escapeHref(customImg)}" alt="${escapeHtml(netKey)}" width="${iconSize}" height="${iconSize}" border="0" style="display: block; width: ${iconSize}px; height: ${iconSize}px; object-fit: contain; border: 0; outline: none; text-decoration: none;" />`;
      } else {
        const rawSvg = SOCIAL_ICONS[netKey] || SOCIAL_ICONS.facebook;
        innerVisualHtml = rawSvg
          .replace(/width="\d+"/, `width="${iconSize}"`)
          .replace(/height="\d+"/, `height="${iconSize}"`)
          .replace(/fill="currentColor"/g, `fill="${escapeHtml(effectiveColor)}"`);
      }

      const linkTag = `<a href="${escapeHref(net.url)}" target="_blank" style="color: ${escapeHtml(effectiveColor)}; display: inline-block; text-decoration: none;">${innerVisualHtml}</a>`;
      const spacer = (idx < networks.length - 1)
        ? `<td width="${iconGap}" style="width: ${iconGap}px; min-width: ${iconGap}px; font-size: 0; line-height: 0;">&nbsp;</td>`
        : '';
      return `<td align="center" valign="middle" width="${iconSize}">${linkTag}</td>${spacer}`;
    }).join('\n');

    return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" align="${align}" style="padding: ${toBoxSpacing(padding)}; margin: 0 auto;"${atomAttrs}>
  <tr>
    ${iconsHtml}
  </tr>
</table>`;
  }
}

export default EmailCompiler;
