/**
 * NewsMailForge - ColorPickerPopover
 * Componente universal de seleção de cor flutuante (Popover)
 * Espectro 2D (Saturation/Brightness) + Hue Slider + HEX/RGB/HSL + Presets HTML Seguros + Recentes.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';

const SAFE_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#475569', '#1e293b', '#0f172a', '#0D0D18',
  '#eff6ff', '#dbeafe', '#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#0284c7', '#0369a1',
  '#f0fdf4', '#dcfce7', '#86efac', '#22c55e', '#16a34a', '#15803d', '#14b8a6', '#0d9488', '#0f766e', '#115e59',
  '#fffbeb', '#fef3c7', '#fde68a', '#fbbf24', '#f59e0b', '#d97706', '#ea580c', '#c2410c', '#9a3412', '#78350f',
  '#fef2f2', '#fee2e2', '#fca5a5', '#ef4444', '#dc2626', '#b91c1c', '#db2777', '#9333ea', '#7c3aed', '#4c1d95'
];

const RECENT_KEY = 'nmf_recent_colors';

/**
 * Converte HEX (#rgb ou #rrggbb) em { r, g, b }
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
  let c = String(hex || '').trim().replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) {
    return { r: 37, g: 99, b: 235 }; // Fallback azul #2563eb
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) {
    return { r: 37, g: 99, b: 235 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Converte { r, g, b } em #RRGGBB
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Converte qualquer formato de cor (HEX, RGB, HSL ou nome) em { r, g, b }
 * @param {string} color
 * @returns {{r: number, g: number, b: number}}
 */
function parseToRgb(color) {
  if (!color || color === 'transparent') {
    return { r: 0, g: 0, b: 0 };
  }
  const str = String(color).trim();
  if (str.startsWith('#')) {
    return hexToRgb(str);
  }
  const rgbMatch = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }
  const hslMatch = str.match(/^hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/i);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10)
    );
  }
  return hexToRgb(str);
}

/**
 * Converte { r, g, b } em { h: 0-360, s: 0-1, v: 0-1 }
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{h: number, s: number, v: number}}
 */
function rgbToHsv(r, g, b) {
  const rd = r / 255;
  const gd = g / 255;
  const bd = b / 255;
  const max = Math.max(rd, gd, bd);
  const min = Math.min(rd, gd, bd);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === rd) {
      h = ((gd - bd) / d) % 6;
    } else if (max === gd) {
      h = (bd - rd) / d + 2;
    } else {
      h = (rd - gd) / d + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

/**
 * Converte { h: 0-360, s: 0-1, v: 0-1 } em { r, g, b }
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @returns {{r: number, g: number, b: number}}
 */
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rd = 0;
  let gd = 0;
  let bd = 0;

  if (h >= 0 && h < 60) {
    rd = c; gd = x; bd = 0;
  } else if (h >= 60 && h < 120) {
    rd = x; gd = c; bd = 0;
  } else if (h >= 120 && h < 180) {
    rd = 0; gd = c; bd = x;
  } else if (h >= 180 && h < 240) {
    rd = 0; gd = x; bd = c;
  } else if (h >= 240 && h < 300) {
    rd = x; gd = 0; bd = c;
  } else {
    rd = c; gd = 0; bd = x;
  }

  return {
    r: Math.round((rd + m) * 255),
    g: Math.round((gd + m) * 255),
    b: Math.round((bd + m) * 255)
  };
}

/**
 * Converte { r, g, b } em { h: 0-360, s: 0-100, l: 0-100 }
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{h: number, s: number, l: number}}
 */
function rgbToHsl(r, g, b) {
  const rd = r / 255;
  const gd = g / 255;
  const bd = b / 255;
  const max = Math.max(rd, gd, bd);
  const min = Math.min(rd, gd, bd);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rd: h = (gd - bd) / d + (gd < bd ? 6 : 0); break;
      case gd: h = (bd - rd) / d + 2; break;
      case bd: h = (rd - gd) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converte { h: 0-360, s: 0-100, l: 0-100 } em { r, g, b }
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {{r: number, g: number, b: number}}
 */
function hslToRgb(h, s, l) {
  const sd = s / 100;
  const ld = l / 100;
  const c = (1 - Math.abs(2 * ld - 1)) * sd;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ld - c / 2;
  let rd = 0;
  let gd = 0;
  let bd = 0;

  if (h >= 0 && h < 60) {
    rd = c; gd = x; bd = 0;
  } else if (h >= 60 && h < 120) {
    rd = x; gd = c; bd = 0;
  } else if (h >= 120 && h < 180) {
    rd = 0; gd = c; bd = x;
  } else if (h >= 180 && h < 240) {
    rd = 0; gd = x; bd = c;
  } else if (h >= 240 && h < 300) {
    rd = x; gd = 0; bd = c;
  } else {
    rd = c; gd = 0; bd = x;
  }

  return {
    r: Math.round((rd + m) * 255),
    g: Math.round((gd + m) * 255),
    b: Math.round((bd + m) * 255)
  };
}

export class ColorPickerPopover {
  constructor() {
    this.isOpen = false;
    this.anchorEl = null;
    this.onChangeCallback = null;
    this.options = {};

    this.currentColor = '#2563EB';
    this.isTransparent = false;
    this.colorMode = 'HEX'; // 'HEX' | 'RGB' | 'HSL'

    // HSV representation
    this.h = 220;
    this.s = 0.84;
    this.v = 0.92;

    this.container = null;
    this.spectrumBox = null;
    this.spectrumCursor = null;
    this.hueSlider = null;
    this.hueThumb = null;
    this.previewBox = null;
    this.inputsContainer = null;
    this.recentContainer = null;

    this.recentColors = this._loadRecentColors();

    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._initDom();
  }

  /**
   * Abre o Popover de seleção de cor posicionado junto ao elemento âncora
   * @param {HTMLElement} anchorEl
   * @param {string} initialColor
   * @param {Function} onChangeCallback
   * @param {Object} [options]
   */
  static open(anchorEl, initialColor, onChangeCallback, options = {}) {
    ColorPickerPopover.getInstance().show(anchorEl, initialColor, onChangeCallback, options);
  }

  /**
   * Fecha o Popover
   */
  static close() {
    ColorPickerPopover.getInstance().hide();
  }

  static parseToRgb(color) {
    return parseToRgb(color);
  }

  static rgbToHsv(r, g, b) {
    return rgbToHsv(r, g, b);
  }

  static hsvToRgb(h, s, v) {
    return hsvToRgb(h, s, v);
  }

  static rgbToHsl(r, g, b) {
    return rgbToHsl(r, g, b);
  }

  static hslToRgb(h, s, l) {
    return hslToRgb(h, s, l);
  }

  static get SAFE_COLORS() {
    return SAFE_COLORS;
  }

  /**
   * Obtém a instância singleton
   * @returns {ColorPickerPopover}
   */
  static getInstance() {
    if (!ColorPickerPopover._instance) {
      ColorPickerPopover._instance = new ColorPickerPopover();
    }
    return ColorPickerPopover._instance;
  }

  /**
   * Inicializa o DOM do container flutuante
   * @private
   */
  _initDom() {
    const el = document.createElement('div');
    el.className = 'nmf-color-picker-popover nmf-color-popover';
    el.style.cssText = `
      position: fixed;
      z-index: 999999;
      width: 270px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      color: #f1f5f9;
      display: none;
      user-select: none;
      box-sizing: border-box;
    `;

    // 1. Header do Popover
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;';

    const title = document.createElement('span');
    title.style.cssText = 'font-weight: 600; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    title.textContent = I18n.t('color.picker_title', 'Selecionar Cor');

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.style.cssText = 'background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 2px 4px; font-size: 14px; line-height: 1; border-radius: 4px;';
    btnClose.innerHTML = '&times;';
    btnClose.addEventListener('click', () => this.hide());

    header.appendChild(title);
    header.appendChild(btnClose);
    el.appendChild(header);

    // 2. Espectro 2D (Saturation / Brightness Box)
    const spectrumBox = document.createElement('div');
    spectrumBox.style.cssText = `
      position: relative;
      width: 100%;
      height: 120px;
      border-radius: 4px;
      cursor: crosshair;
      overflow: hidden;
      margin-bottom: 10px;
      border: 1px solid rgba(255,255,255,0.08);
    `;

    const satLayer = document.createElement('div');
    satLayer.style.cssText = 'position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent);';

    const valLayer = document.createElement('div');
    valLayer.style.cssText = 'position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent);';

    const spectrumCursor = document.createElement('div');
    spectrumCursor.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 2px 1px rgba(0,0,0,0.7);
      transform: translate(-50%, -50%);
      pointer-events: none;
      top: 0px;
      left: 0px;
    `;

    spectrumBox.appendChild(satLayer);
    spectrumBox.appendChild(valLayer);
    spectrumBox.appendChild(spectrumCursor);
    el.appendChild(spectrumBox);

    this.spectrumBox = spectrumBox;
    this.spectrumCursor = spectrumCursor;

    this._bindSpectrumEvents(spectrumBox);

    // 3. Barra de Matiz (Hue Slider)
    const hueSlider = document.createElement('div');
    hueSlider.style.cssText = `
      position: relative;
      width: 100%;
      height: 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 12px;
      background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
      border: 1px solid rgba(255,255,255,0.1);
    `;

    const hueThumb = document.createElement('div');
    hueThumb.style.cssText = `
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #334155;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      transform: translate(-50%, -1px);
      pointer-events: none;
      top: 0;
      left: 0%;
    `;
    hueSlider.appendChild(hueThumb);
    el.appendChild(hueSlider);

    this.hueSlider = hueSlider;
    this.hueThumb = hueThumb;

    this._bindHueEvents(hueSlider);

    // 4. Linha de Controles: Preview Swatch + Botão Transparente + Alternador de Modo + Inputs
    const controlsRow = document.createElement('div');
    controlsRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 12px;';

    const previewWrapper = document.createElement('div');
    previewWrapper.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      background-image: linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
      overflow: hidden;
      flex-shrink: 0;
    `;

    const previewBox = document.createElement('div');
    previewBox.style.cssText = 'width: 100%; height: 100%;';
    previewWrapper.appendChild(previewBox);
    controlsRow.appendChild(previewWrapper);
    this.previewBox = previewBox;

    const inputsContainer = document.createElement('div');
    inputsContainer.style.cssText = 'flex: 1; display: flex; align-items: center; gap: 4px;';
    controlsRow.appendChild(inputsContainer);
    this.inputsContainer = inputsContainer;

    const btnTransparent = document.createElement('button');
    btnTransparent.type = 'button';
    btnTransparent.className = 'nmf-btn-transparent-choice';
    btnTransparent.style.cssText = `
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
      border-radius: 4px;
      padding: 0 6px;
      height: 30px;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    `;
    btnTransparent.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"></line><circle cx="12" cy="12" r="10"></circle></svg>
      <span>${I18n.t('prop.transparent', 'Transparente')}</span>
    `;
    btnTransparent.addEventListener('click', () => {
      this.isTransparent = true;
      this._applyColor('transparent');
    });
    controlsRow.appendChild(btnTransparent);
    this.btnTransparent = btnTransparent;

    el.appendChild(controlsRow);

    // 5. Paleta Segura de Cores (Grid de 50 cores HTML seguras essenciais)
    const safeTitle = document.createElement('div');
    safeTitle.style.cssText = 'font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;';
    safeTitle.textContent = I18n.t('color.safe_palette', 'Paleta Segura (E-mail)');
    el.appendChild(safeTitle);

    const safeGrid = document.createElement('div');
    safeGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
      margin-bottom: 12px;
    `;

    SAFE_COLORS.forEach(hex => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.title = hex;
      swatch.style.cssText = `
        width: 100%;
        padding-top: 100%;
        position: relative;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.15);
        background-color: ${hex};
        cursor: pointer;
        outline: none;
        transition: transform 0.1s ease;
      `;
      swatch.addEventListener('mouseenter', () => { swatch.style.transform = 'scale(1.2)'; swatch.style.zIndex = '5'; });
      swatch.addEventListener('mouseleave', () => { swatch.style.transform = 'scale(1)'; swatch.style.zIndex = '1'; });
      swatch.addEventListener('click', () => {
        this.isTransparent = false;
        this.setColor(hex, true);
      });
      safeGrid.appendChild(swatch);
    });
    el.appendChild(safeGrid);

    // 6. Cores Recentes
    const recentTitle = document.createElement('div');
    recentTitle.style.cssText = 'font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;';
    recentTitle.textContent = I18n.t('color.recent', 'Recentes');
    el.appendChild(recentTitle);

    const recentContainer = document.createElement('div');
    recentContainer.style.cssText = 'display: flex; gap: 6px; min-height: 20px;';
    el.appendChild(recentContainer);
    this.recentContainer = recentContainer;

    if (typeof document !== 'undefined') {
      if (document.body) {
        document.body.appendChild(el);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body && !document.body.contains(el)) {
            document.body.appendChild(el);
          }
        });
      }
    }
    this.container = el;
  }

  /**
   * Vincula eventos de arraste do Espectro 2D
   * @private
   */
  _bindSpectrumEvents(box) {
    let isDragging = false;

    const updateFromEvent = (e) => {
      const rect = box.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      this.s = x / rect.width;
      this.v = 1 - (y / rect.height);
      this.isTransparent = false;

      this._updateFromHsv(true);
    };

    box.addEventListener('pointerdown', (e) => {
      isDragging = true;
      box.setPointerCapture(e.pointerId);
      updateFromEvent(e);
    });

    box.addEventListener('pointermove', (e) => {
      if (isDragging) updateFromEvent(e);
    });

    const stopDragging = (e) => {
      if (isDragging) {
        isDragging = false;
        try { box.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    box.addEventListener('pointerup', stopDragging);
    box.addEventListener('pointercancel', stopDragging);
  }

  /**
   * Vincula eventos de arraste do Slider de Matiz
   * @private
   */
  _bindHueEvents(slider) {
    let isDragging = false;

    const updateFromEvent = (e) => {
      const rect = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      this.h = Math.round((x / rect.width) * 360) % 360;
      this.isTransparent = false;

      this._updateFromHsv(true);
    };

    slider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      updateFromEvent(e);
    });

    slider.addEventListener('pointermove', (e) => {
      if (isDragging) updateFromEvent(e);
    });

    const stopDragging = (e) => {
      if (isDragging) {
        isDragging = false;
        try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
  }

  /**
   * Atualiza a UI e a cor atual a partir de (h, s, v)
   * @private
   */
  _updateFromHsv(triggerCallback = false) {
    const rgb = hsvToRgb(this.h, this.s, this.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    this.currentColor = hex;

    this.spectrumBox.style.backgroundColor = `hsl(${this.h}, 100%, 50%)`;
    this.spectrumCursor.style.left = `${this.s * 100}%`;
    this.spectrumCursor.style.top = `${(1 - this.v) * 100}%`;

    this.hueThumb.style.left = `${(this.h / 360) * 100}%`;

    this.previewBox.style.backgroundColor = this.isTransparent ? 'transparent' : hex;

    this._renderInputs();

    if (triggerCallback) {
      this._applyColor(this.isTransparent ? 'transparent' : hex);
    }
  }

  /**
   * Renderiza os inputs numéricos / texto sincronizados
   * @private
   */
  _renderInputs() {
    this.inputsContainer.innerHTML = '';

    // Botão de alternar modo de cor (HEX -> RGB -> HSL)
    const btnMode = document.createElement('button');
    btnMode.type = 'button';
    btnMode.style.cssText = `
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
      border-radius: 4px;
      padding: 0 4px;
      height: 30px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
    `;
    btnMode.textContent = this.colorMode;
    btnMode.title = I18n.t('color.hex', 'HEX');
    btnMode.addEventListener('click', () => {
      if (this.colorMode === 'HEX') this.colorMode = 'RGB';
      else if (this.colorMode === 'RGB') this.colorMode = 'HSL';
      else this.colorMode = 'HEX';
      this._renderInputs();
    });
    this.inputsContainer.appendChild(btnMode);

    if (this.colorMode === 'HEX') {
      const hexInput = document.createElement('input');
      hexInput.type = 'text';
      hexInput.value = this.isTransparent ? I18n.t('prop.transparent', 'Transparente') : this.currentColor;
      hexInput.style.cssText = `
        flex: 1;
        background: #060911;
        border: 1px solid #334155;
        border-radius: 4px;
        color: #f8fafc;
        padding: 4px 6px;
        height: 28px;
        font-family: monospace;
        font-size: 11px;
        box-sizing: border-box;
      `;
      hexInput.addEventListener('change', () => {
        const val = hexInput.value.trim();
        if (val.toLowerCase() === 'transparent') {
          this.isTransparent = true;
          this._applyColor('transparent');
        } else if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
          this.isTransparent = false;
          const formatted = val.startsWith('#') ? val : `#${val}`;
          this.setColor(formatted, true);
        }
      });
      this.inputsContainer.appendChild(hexInput);
    } else if (this.colorMode === 'RGB') {
      const rgb = hexToRgb(this.currentColor);
      const makeField = (label, val, onValChange) => {
        const fWrap = document.createElement('div');
        fWrap.style.cssText = 'flex: 1; display: flex; flex-direction: column; align-items: center;';

        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = '0';
        inp.max = '255';
        inp.value = val;
        inp.style.cssText = 'width: 100%; background: #060911; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; padding: 2px; text-align: center; font-size: 10px; height: 26px; box-sizing: border-box;';
        inp.addEventListener('change', () => {
          const num = Math.max(0, Math.min(255, parseInt(inp.value, 10) || 0));
          onValChange(num);
        });

        fWrap.appendChild(inp);
        return fWrap;
      };

      this.inputsContainer.appendChild(makeField('R', rgb.r, (r) => {
        this.isTransparent = false;
        this.setColor(rgbToHex(r, rgb.g, rgb.b), true);
      }));
      this.inputsContainer.appendChild(makeField('G', rgb.g, (g) => {
        this.isTransparent = false;
        this.setColor(rgbToHex(rgb.r, g, rgb.b), true);
      }));
      this.inputsContainer.appendChild(makeField('B', rgb.b, (b) => {
        this.isTransparent = false;
        this.setColor(rgbToHex(rgb.r, rgb.g, b), true);
      }));
    } else if (this.colorMode === 'HSL') {
      const rgb = hexToRgb(this.currentColor);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      const makeField = (label, val, max, onValChange) => {
        const fWrap = document.createElement('div');
        fWrap.style.cssText = 'flex: 1; display: flex; flex-direction: column; align-items: center;';

        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = '0';
        inp.max = String(max);
        inp.value = val;
        inp.style.cssText = 'width: 100%; background: #060911; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; padding: 2px; text-align: center; font-size: 10px; height: 26px; box-sizing: border-box;';
        inp.addEventListener('change', () => {
          const num = Math.max(0, Math.min(max, parseInt(inp.value, 10) || 0));
          onValChange(num);
        });

        fWrap.appendChild(inp);
        return fWrap;
      };

      this.inputsContainer.appendChild(makeField('H', hsl.h, 360, (h) => {
        this.isTransparent = false;
        const nextRgb = hslToRgb(h, hsl.s, hsl.l);
        this.setColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b), true);
      }));
      this.inputsContainer.appendChild(makeField('S', hsl.s, 100, (s) => {
        this.isTransparent = false;
        const nextRgb = hslToRgb(hsl.h, s, hsl.l);
        this.setColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b), true);
      }));
      this.inputsContainer.appendChild(makeField('L', hsl.l, 100, (l) => {
        this.isTransparent = false;
        const nextRgb = hslToRgb(hsl.h, hsl.s, l);
        this.setColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b), true);
      }));
    }
  }

  /**
   * Renderiza a lista de cores recentes
   * @private
   */
  _renderRecent() {
    this.recentContainer.innerHTML = '';
    this.recentColors.forEach(hex => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.title = hex;
      sw.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.2);
        background-color: ${hex === 'transparent' ? 'transparent' : hex};
        cursor: pointer;
        padding: 0;
        outline: none;
      `;
      if (hex === 'transparent') {
        sw.style.backgroundImage = 'linear-gradient(45deg, #ef4444 0%, transparent 100%)';
      }
      sw.addEventListener('click', () => {
        if (hex === 'transparent') {
          this.isTransparent = true;
          this._applyColor('transparent');
        } else {
          this.isTransparent = false;
          this.setColor(hex, true);
        }
      });
      this.recentContainer.appendChild(sw);
    });
  }

  /**
   * Adiciona cor às recentes
   * @private
   */
  _pushRecent(color) {
    if (!color) return;
    const norm = String(color).toLowerCase();
    this.recentColors = this.recentColors.filter(c => c.toLowerCase() !== norm);
    this.recentColors.unshift(color);
    if (this.recentColors.length > 8) {
      this.recentColors.pop();
    }
    this._saveRecentColors();
    this._renderRecent();
  }

  /**
   * Carrega cores recentes do LocalStorage
   * @private
   */
  _loadRecentColors() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr.slice(0, 8);
      }
    } catch (_) {}
    return ['#ffffff', '#0f172a', '#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', 'transparent'];
  }

  /**
   * Salva cores recentes no LocalStorage
   * @private
   */
  _saveRecentColors() {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentColors));
    } catch (_) {}
  }

  /**
   * Notifica a cor escolhida e atualiza recentes
   * @private
   */
  _applyColor(color) {
    if (this.onChangeCallback) {
      this.onChangeCallback(color);
    }
    this._pushRecent(color);
  }

  /**
   * Define cor no popover e recalcula saturação, valor e matiz
   * @param {string} color
   * @param {boolean} [triggerCallback=false]
   */
  setColor(color, triggerCallback = false) {
    if (!color || color === 'transparent') {
      this.isTransparent = true;
      this.currentColor = '#ffffff';
      this.previewBox.style.backgroundColor = 'transparent';
      this._renderInputs();
      if (triggerCallback) this._applyColor('transparent');
      return;
    }

    this.isTransparent = false;
    const rgb = hexToRgb(color);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.h = hsv.h;
    this.s = hsv.s;
    this.v = hsv.v;
    this._updateFromHsv(triggerCallback);
  }

  /**
   * Exibe o Popover ancorado no elemento
   */
  show(anchorEl, initialColor = '#2563eb', onChangeCallback = null, options = {}) {
    this.anchorEl = anchorEl;
    this.onChangeCallback = onChangeCallback;
    this.options = options || {};

    if (this.options.allowTransparent === false) {
      this.btnTransparent.style.display = 'none';
    } else {
      this.btnTransparent.style.display = 'flex';
    }

    this.setColor(initialColor, false);
    this._renderRecent();

    if (this.container && typeof document !== 'undefined' && document.body && !document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    this.container.style.display = 'block';
    this.isOpen = true;

    this._positionPopover();

    setTimeout(() => {
      document.addEventListener('pointerdown', this._onDocumentClick);
      window.addEventListener('keydown', this._onKeyDown);
    }, 10);
  }

  /**
   * Esconde o Popover
   */
  hide() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.style.display = 'none';
    document.removeEventListener('pointerdown', this._onDocumentClick);
    window.removeEventListener('keydown', this._onKeyDown);
  }

  /**
   * Posicionamento inteligente na tela sem cortar nas bordas
   * @private
   */
  _positionPopover() {
    if (!this.anchorEl) return;
    const rect = this.anchorEl.getBoundingClientRect();
    const popoverWidth = this.container.offsetWidth || 270;
    const popoverHeight = this.container.offsetHeight || 330;

    let top = rect.bottom + 6;
    let left = rect.left;

    // Se transbordar para baixo, posiciona acima do elemento
    if (top + popoverHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - popoverHeight - 6);
    }

    // Se transbordar para a direita, alinha pela direita do âncora
    if (left + popoverWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - popoverWidth - 12);
    }

    this.container.style.top = `${Math.round(top)}px`;
    this.container.style.left = `${Math.round(left)}px`;
  }

  /**
   * Handler para fechar ao clicar fora
   * @private
   */
  _onDocumentClick(e) {
    if (!this.isOpen) return;
    if (
      !this.container.contains(e.target) &&
      e.target !== this.anchorEl &&
      (!this.anchorEl || !this.anchorEl.contains(e.target))
    ) {
      this.hide();
    }
  }

  /**
   * Handler para fechar com Escape
   * @private
   */
  _onKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      this.hide();
    }
  }

  open(anchorEl, initialColor, onChangeCallback, options = {}) {
    this.show(anchorEl, initialColor, onChangeCallback, options);
  }

  close() {
    this.hide();
  }

  parseToRgb(color) {
    return parseToRgb(color);
  }

  rgbToHsv(r, g, b) {
    return rgbToHsv(r, g, b);
  }

  hsvToRgb(h, s, v) {
    return hsvToRgb(h, s, v);
  }

  rgbToHsl(r, g, b) {
    return rgbToHsl(r, g, b);
  }

  hslToRgb(h, s, l) {
    return hslToRgb(h, s, l);
  }
}

export {
  SAFE_COLORS,
  hexToRgb,
  rgbToHex,
  parseToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb
};

export default ColorPickerPopover;
