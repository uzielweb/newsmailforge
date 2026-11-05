/**
 * NewsMailForge - ScrubNumberInput
 * Controle numérico com ajuste contínuo por arraste horizontal (scrubbing)
 * no rótulo/ícone e digitação direta com suporte a setas e passo customizado.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

export class ScrubNumberInput {
  /**
   * @param {Object} options
   * @param {string} [options.label] - Rótulo curto (ex: 'W', 'H', 'T', 'R', 'B', 'L', 'G')
   * @param {number} [options.value=0] - Valor numérico inicial
   * @param {number} [options.min=0] - Valor mínimo permitido
   * @param {number} [options.max=9999] - Valor máximo permitido
   * @param {number} [options.step=1] - Incremento padrão
   * @param {string} [options.unit='px'] - Sufixo exibido ('px', '%', etc.)
   * @param {number} [options.sensitivity=1] - Fator de sensibilidade do arraste (pixels por incremento)
   * @param {Function} [options.onChange] - Callback (value) => void
   */
  constructor(options = {}) {
    this.label = options.label || '#';
    this.value = Number.isFinite(options.value) ? options.value : 0;
    this.min = options.min !== undefined ? options.min : 0;
    this.max = options.max !== undefined ? options.max : 9999;
    this.step = options.step || 1;
    this.unit = options.unit || 'px';
    this.sensitivity = options.sensitivity || 1;
    this.onChange = options.onChange || null;

    this.isDragging = false;
    this.startX = 0;
    this.startValue = 0;

    this.element = this._render();
    this._attachEvents();
  }

  /**
   * Renderiza a estrutura DOM
   * @private
   * @returns {HTMLElement}
   */
  _render() {
    const wrap = document.createElement('div');
    wrap.className = 'nmf-scrub-group';

    const label = document.createElement('span');
    label.className = 'nmf-scrub-label';
    label.textContent = this.label;
    label.title = 'Arraste para ajustar o valor';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'nmf-scrub-input';
    input.value = String(this.value);

    const unit = document.createElement('span');
    unit.className = 'nmf-scrub-unit';
    unit.textContent = this.unit;

    wrap.appendChild(label);
    wrap.appendChild(input);
    if (this.unit) {
      wrap.appendChild(unit);
    }

    this.labelEl = label;
    this.inputEl = input;

    return wrap;
  }

  /**
   * Conecta eventos de arraste e digitação
   * @private
   */
  _attachEvents() {
    // Scrubbing via arraste no label
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.startValue = this.value;

      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.startX;
      const stepChange = Math.round(deltaX / (3 * this.sensitivity)) * this.step;
      const newValue = this._clamp(this.startValue + stepChange);
      if (newValue !== this.value) {
        this.setValue(newValue, true);
      }
    };

    const onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    this.labelEl.addEventListener('mousedown', onMouseDown);

    // Digitação direta no input
    this.inputEl.addEventListener('change', () => {
      const parsed = parseFloat(this.inputEl.value.replace(/[^0-9.-]/g, ''));
      const finalVal = Number.isFinite(parsed) ? this._clamp(parsed) : this.value;
      this.setValue(finalVal, true);
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const multiplier = e.shiftKey ? 10 : 1;
        this.setValue(this._clamp(this.value + (this.step * multiplier)), true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const multiplier = e.shiftKey ? 10 : 1;
        this.setValue(this._clamp(this.value - (this.step * multiplier)), true);
      } else if (e.key === 'Enter') {
        this.inputEl.blur();
      }
    });

    this.inputEl.addEventListener('focus', () => {
      this.inputEl.select();
    });
  }

  /**
   * Limita o valor entre os limites configurados
   * @private
   */
  _clamp(val) {
    let clamped = Math.max(this.min, Math.min(this.max, val));
    if (this.step >= 1) {
      clamped = Math.round(clamped);
    }
    return clamped;
  }

  /**
   * Atualiza o valor externamente ou internamente
   * @param {number} val
   * @param {boolean} [notify=true]
   */
  setValue(val, notify = true) {
    const num = Number(val);
    const safeVal = Number.isFinite(num) ? this._clamp(num) : this.min;
    this.value = safeVal;
    if (this.inputEl) {
      this.inputEl.value = String(safeVal);
    }
    if (notify && typeof this.onChange === 'function') {
      this.onChange(this.value);
    }
  }

  /**
   * Retorna o valor atual
   * @returns {number}
   */
  getValue() {
    return this.value;
  }

  /**
   * Monta o elemento dentro de um container
   * @param {HTMLElement} parent
   */
  mount(parent) {
    if (parent && parent.appendChild) {
      parent.appendChild(this.element);
    }
    return this;
  }

  /**
   * Remove o elemento e limpa ouvintes
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default ScrubNumberInput;

