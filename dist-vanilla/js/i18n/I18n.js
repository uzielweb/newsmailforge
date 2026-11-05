/**
 * NewsMailForge i18n Engine (Vanilla JS)
 * Suporte 100% offline/client-side e internacionalização agnóstica.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

const DICTIONARIES = {
  'pt-BR': {
    "ui.app_name": "NewsMailForge",
    "ui.topbar": "Barra Superior",
    "ui.undo": "Desfazer (Ctrl+Z)",
    "ui.redo": "Refazer (Ctrl+Y)",
    "ui.desktop": "Desktop (600px)",
    "ui.mobile": "Mobile (375px)",
    "ui.presets": "Modelos Prontos",
    "ui.save": "Salvar",
    "ui.export_html": "Exportar HTML",
    "ui.export_json": "Exportar JSON",
    "ui.import_json": "Importar JSON",
    "ui.new_template": "Novo Modelo",
    "ui.replace": "Substituir",
    "ui.append": "Anexar",
    "ui.tabs.library": "Biblioteca de Blocos",
    "ui.tabs.tree": "Árvore de Elementos",
    "ui.language": "Idioma",
    "ui.preview_code": "Ver Código",
    "ui.download_html": "Baixar HTML (.html)",
    "ui.download_json": "Baixar JSON (.json)",
    "ui.import_prompt": "Como deseja importar o JSON selecionado?",
    "ui.import_replace": "Substituir modelo atual",
    "ui.import_append": "Anexar blocos ao final",
    "ui.confirm_new_template": "Deseja iniciar um novo modelo? Alterações não salvas serão perdidas.",
    "ui.confirm_delete": "Deseja realmente excluir este elemento?",
    "ui.code_modal_title": "Código do E-mail",
    "ui.tab_html": "HTML Compilado (MSO)",
    "ui.tab_json": "Estrutura JSON",
    "ui.copy": "Copiar Código",
    "ui.copied": "Copiado com sucesso!",
    "ui.close": "Fechar",
    "ui.add_block": "+ Adicionar Bloco",
    "ui.add_row": "+ Adicionar Linha",
    "ui.add_cell": "+ Adicionar Coluna",
    "ui.add_atom": "+ Adicionar Elemento",
    "ui.add_child": "+ Inserir Elemento",
    "ui.select_parent": "Selecionar Pai",
    "ui.canvas_empty_title": "Seu e-mail está vazio",
    "ui.canvas_empty_desc": "Selecione um bloco da biblioteca à esquerda para começar a editar.",
    "ui.drawer_title": "Blocos de {category}",
    "ui.drawer_close": "Fechar Gaveta",
    "ui.insert_block": "Inserir Bloco",
    "ui.status_ready": "Pronto",
    "ui.status_saving": "Salvando...",
    "ui.status_saved": "Documento salvo com sucesso",
    "ui.status_error": "Erro ao salvar",
    "type.document": "Documento",
    "type.block": "Bloco",
    "type.row": "Linha",
    "type.cell": "Coluna",
    "type.atom": "Elemento",
    "atom.text": "Texto",
    "atom.button": "Botão",
    "atom.image": "Imagem",
    "atom.divider": "Divisor",
    "atom.menu": "Menu",
    "atom.social": "Redes Sociais",
    "cat.menu": "Menus & Navegação",
    "cat.header": "Cabeçalhos & Banners",
    "cat.content": "Conteúdo & Artigos",
    "cat.feature": "Destaques & Recursos",
    "cat.cta": "Chamada para Ação (CTA)",
    "cat.ecommerce": "E-commerce & Produtos",
    "cat.transactional": "Transacional & Notificações",
    "cat.footer": "Rodapés & Assinaturas",
    "preset.welcome": "Boas-vindas & Onboarding",
    "preset.welcome_desc": "Template completo de boas-vindas com cabeçalho, introdução e CTA principal.",
    "preset.newsletter": "Newsletter Semanal",
    "preset.newsletter_desc": "Layout editorial com múltiplos artigos, destaques e grade de conteúdo.",
    "preset.ecommerce": "Lançamento de Produto",
    "preset.ecommerce_desc": "Exibição de produtos, cupons promocionais e botões de compra rápida.",
    "preset.transactional": "Confirmação de Pedido",
    "preset.transactional_desc": "Recibo transacional limpo com tabela de itens, resumo e dados de envio.",
    "block.menu_standard": "Menu Padrão com Logotipo",
    "block.header_hero": "Banner Hero com Título e Subtítulo",
    "block.content_article": "Artigo de Texto com Imagem Lateral",
    "block.feature_3col": "Grade de 3 Colunas com Ícones",
    "block.cta_box": "Caixa de CTA com Botão em Destaque",
    "block.product_card": "Cartão de Produto com Preço e Botão",
    "block.order_summary": "Resumo de Pedido e Fatura",
    "block.footer_social": "Rodapé com Redes Sociais e Unsubscribe",
    "inspector.main": "Configurações do Documento",
    "inspector.block": "Configurações do Bloco",
    "inspector.row": "Configurações da Linha",
    "inspector.cell": "Configurações da Célula",
    "inspector.atom": "Configurações do Elemento",
    "prop.preview_text": "Texto de Pré-visualização (Preheader)",
    "prop.background_color": "Cor de Fundo",
    "prop.background_image": "Imagem de Fundo",
    "prop.content_background": "Fundo do Conteúdo",
    "prop.canvas_width": "Largura Máxima (px)",
    "prop.padding": "Espaçamento Interno (Padding)",
    "prop.margin": "Margem Externa (Margin)",
    "prop.padding_t": "Superior",
    "prop.padding_r": "Direita",
    "prop.padding_b": "Inferior",
    "prop.padding_l": "Esquerda",
    "prop.width_mode": "Modo de Largura",
    "prop.fill": "Preencher (100%)",
    "prop.hug": "Ajustar ao Conteúdo",
    "prop.gap": "Espaço entre Elementos (Gap)",
    "prop.height": "Altura",
    "prop.collapse_on_mobile": "Empilhar no Mobile",
    "prop.hidden_on_mobile": "Ocultar no Mobile",
    "prop.vertical_align": "Alinhamento Vertical",
    "prop.horizontal_align": "Alinhamento Horizontal",
    "prop.valign_top": "Topo",
    "prop.valign_middle": "Meio",
    "prop.valign_bottom": "Base",
    "prop.align_left": "Esquerda",
    "prop.align_center": "Centro",
    "prop.align_right": "Direita",
    "prop.border_radius": "Arredondamento de Borda",
    "prop.border_width": "Espessura da Borda",
    "prop.border_color": "Cor da Borda",
    "prop.opacity": "Opacidade",
    "prop.font_family": "Família da Fonte",
    "prop.font_size": "Tamanho da Fonte",
    "prop.line_height": "Altura da Linha",
    "prop.text_color": "Cor do Texto",
    "prop.button_text": "Texto do Botão",
    "prop.button_link": "Link do Botão",
    "prop.button_bg": "Cor do Botão",
    "prop.image_src": "URL da Imagem",
    "prop.image_alt": "Texto Alternativo (Alt)",
    "prop.image_link": "Link da Imagem",
    "prop.image_width": "Largura da Imagem",
    "prop.image_height": "Altura da Imagem",
    "prop.divider_height": "Espessura do Divisor",
    "prop.divider_color": "Cor do Divisor",
    "prop.cell_width": "Largura da Coluna",
    "prop.cell_link": "Link da Coluna",
    "prop.add_cell": "+ Adicionar Coluna",
    "prop.add_nested_row": "+ Inserir Linha Aninhada",
    "prop.add_child": "+ Inserir Elemento",
    "rt.font": "Fonte",
    "rt.size": "Tamanho",
    "rt.bold": "Negrito",
    "rt.italic": "Itálico",
    "rt.underline": "Sublinhado",
    "rt.strike": "Tachado",
    "rt.color": "Cor do Texto",
    "rt.align_left": "Alinhar à Esquerda",
    "rt.align_center": "Centralizar",
    "rt.align_right": "Alinhar à Direita",
    "rt.link": "Inserir Link",
    "rt.link_prompt": "Informe a URL do link:",
    "action.move_up": "Mover para Cima",
    "action.move_down": "Mover para Baixo",
    "action.duplicate": "Duplicar",
    "action.delete": "Excluir",
    "action.insert_element": "Inserir Elemento",
    "bridge.success.save": "Documento salvo com sucesso.",
    "bridge.success.load": "Documento carregado com sucesso.",
    "bridge.success.list": "Documentos listados com sucesso.",
    "bridge.success.delete": "Documento excluído com sucesso.",
    "bridge.error.invalid_json": "Payload JSON inválido ou malformado.",
    "bridge.error.invalid_schema": "Estrutura do documento inválida ou excede profundidade máxima.",
    "bridge.error.not_found": "Documento não encontrado.",
    "bridge.error.missing_id": "Identificador do documento não fornecido.",
    "bridge.error.unsupported_action": "Ação não suportada.",
    "bridge.error.storage_failure": "Falha na operação de armazenamento.",
    "bridge.error.invalid_sql_identifier": "Identificador SQL não seguro detectado.",
    "bridge.error.depth_exceeded": "A árvore de blocos excede a profundidade máxima permitida.",
    "bridge.error.security_violation": "Violação de segurança detectada no conteúdo."
  },
  'en-GB': {
    "ui.app_name": "NewsMailForge",
    "ui.topbar": "Topbar",
    "ui.undo": "Undo (Ctrl+Z)",
    "ui.redo": "Redo (Ctrl+Y)",
    "ui.desktop": "Desktop (600px)",
    "ui.mobile": "Mobile (375px)",
    "ui.presets": "Presets",
    "ui.save": "Save",
    "ui.export_html": "Export HTML",
    "ui.export_json": "Export JSON",
    "ui.import_json": "Import JSON",
    "ui.new_template": "New Template",
    "ui.replace": "Replace",
    "ui.append": "Append",
    "ui.tabs.library": "Block Library",
    "ui.tabs.tree": "Element Tree",
    "ui.language": "Language",
    "ui.preview_code": "Preview Code",
    "ui.download_html": "Download HTML (.html)",
    "ui.download_json": "Download JSON (.json)",
    "ui.import_prompt": "How would you like to import the selected JSON?",
    "ui.import_replace": "Replace current template",
    "ui.import_append": "Append blocks to bottom",
    "ui.confirm_new_template": "Create a new template? Any unsaved changes will be lost.",
    "ui.confirm_delete": "Are you sure you want to delete this element?",
    "ui.code_modal_title": "Email Code",
    "ui.tab_html": "Compiled HTML (MSO)",
    "ui.tab_json": "JSON Schema",
    "ui.copy": "Copy Code",
    "ui.copied": "Copied to clipboard!",
    "ui.close": "Close",
    "ui.add_block": "+ Add Block",
    "ui.add_row": "+ Add Row",
    "ui.add_cell": "+ Add Column",
    "ui.add_atom": "+ Add Element",
    "ui.add_child": "+ Insert Element",
    "ui.select_parent": "Select Parent",
    "ui.canvas_empty_title": "Your email is empty",
    "ui.canvas_empty_desc": "Select a block from the library on the left to begin editing.",
    "ui.drawer_title": "{category} Blocks",
    "ui.drawer_close": "Close Drawer",
    "ui.insert_block": "Insert Block",
    "ui.status_ready": "Ready",
    "ui.status_saving": "Saving...",
    "ui.status_saved": "Document saved successfully",
    "ui.status_error": "Error saving",
    "type.document": "Document",
    "type.block": "Block",
    "type.row": "Row",
    "type.cell": "Column",
    "type.atom": "Element",
    "atom.text": "Text",
    "atom.button": "Button",
    "atom.image": "Image",
    "atom.divider": "Divider",
    "atom.menu": "Menu",
    "atom.social": "Social Links",
    "cat.menu": "Menus & Navigation",
    "cat.header": "Headers & Banners",
    "cat.content": "Content & Articles",
    "cat.feature": "Features & Highlights",
    "cat.cta": "Call to Action (CTA)",
    "cat.ecommerce": "E-commerce & Products",
    "cat.transactional": "Transactional & Notifications",
    "cat.footer": "Footers & Signatures",
    "preset.welcome": "Welcome & Onboarding",
    "preset.welcome_desc": "Complete onboarding template with header, introduction, and primary CTA.",
    "preset.newsletter": "Weekly Newsletter",
    "preset.newsletter_desc": "Editorial layout with multiple articles, highlights, and content grid.",
    "preset.ecommerce": "Product Launch",
    "preset.ecommerce_desc": "Showcase products, promotional coupons, and quick buy buttons.",
    "preset.transactional": "Order Confirmation",
    "preset.transactional_desc": "Clean transactional receipt with items table, summary, and shipping details.",
    "block.menu_standard": "Standard Menu with Logo",
    "block.header_hero": "Hero Banner with Heading & Subtitle",
    "block.content_article": "Text Article with Side Image",
    "block.feature_3col": "3-Column Feature Grid with Icons",
    "block.cta_box": "CTA Box with Highlighted Button",
    "block.product_card": "Product Card with Price & Button",
    "block.order_summary": "Order Summary & Invoice",
    "block.footer_social": "Footer with Social Links & Unsubscribe",
    "inspector.main": "Document Settings",
    "inspector.block": "Block Settings",
    "inspector.row": "Row Settings",
    "inspector.cell": "Cell Settings",
    "inspector.atom": "Element Settings",
    "prop.preview_text": "Preview Text (Preheader)",
    "prop.background_color": "Background Color",
    "prop.background_image": "Background Image",
    "prop.content_background": "Content Background",
    "prop.canvas_width": "Max Width (px)",
    "prop.padding": "Internal Spacing (Padding)",
    "prop.margin": "External Margin",
    "prop.padding_t": "Top",
    "prop.padding_r": "Right",
    "prop.padding_b": "Bottom",
    "prop.padding_l": "Left",
    "prop.width_mode": "Width Mode",
    "prop.fill": "Fill (100%)",
    "prop.hug": "Hug Contents",
    "prop.gap": "Spacing between Elements (Gap)",
    "prop.height": "Height",
    "prop.collapse_on_mobile": "Stack on Mobile",
    "prop.hidden_on_mobile": "Hide on Mobile",
    "prop.vertical_align": "Vertical Alignment",
    "prop.horizontal_align": "Horizontal Alignment",
    "prop.valign_top": "Top",
    "prop.valign_middle": "Middle",
    "prop.valign_bottom": "Bottom",
    "prop.align_left": "Left",
    "prop.align_center": "Center",
    "prop.align_right": "Right",
    "prop.border_radius": "Border Radius",
    "prop.border_width": "Border Width",
    "prop.border_color": "Border Color",
    "prop.opacity": "Opacity",
    "prop.font_family": "Font Family",
    "prop.font_size": "Font Size",
    "prop.line_height": "Line Height",
    "prop.text_color": "Text Color",
    "prop.button_text": "Button Text",
    "prop.button_link": "Button Link",
    "prop.button_bg": "Button Background Color",
    "prop.image_src": "Image URL",
    "prop.image_alt": "Alternative Text (Alt)",
    "prop.image_link": "Image Link",
    "prop.image_width": "Image Width",
    "prop.image_height": "Image Height",
    "prop.divider_height": "Divider Thickness",
    "prop.divider_color": "Divider Color",
    "prop.cell_width": "Column Width",
    "prop.cell_link": "Column Link",
    "prop.add_cell": "+ Add Column",
    "prop.add_nested_row": "+ Insert Nested Row",
    "prop.add_child": "+ Insert Element",
    "rt.font": "Font",
    "rt.size": "Size",
    "rt.bold": "Bold",
    "rt.italic": "Italic",
    "rt.underline": "Underline",
    "rt.strike": "Strikethrough",
    "rt.color": "Text Color",
    "rt.align_left": "Align Left",
    "rt.align_center": "Center",
    "rt.align_right": "Align Right",
    "rt.link": "Insert Link",
    "rt.link_prompt": "Enter link URL:",
    "action.move_up": "Move Up",
    "action.move_down": "Move Down",
    "action.duplicate": "Duplicate",
    "action.delete": "Delete",
    "action.insert_element": "Insert Element",
    "bridge.success.save": "Document saved successfully.",
    "bridge.success.load": "Document loaded successfully.",
    "bridge.success.list": "Documents listed successfully.",
    "bridge.success.delete": "Document deleted successfully.",
    "bridge.error.invalid_json": "Invalid or malformed JSON payload.",
    "bridge.error.invalid_schema": "Invalid document schema or exceeds maximum depth.",
    "bridge.error.not_found": "Document not found.",
    "bridge.error.missing_id": "Document ID was not provided.",
    "bridge.error.unsupported_action": "Unsupported action.",
    "bridge.error.storage_failure": "Storage operation failure.",
    "bridge.error.invalid_sql_identifier": "Unsafe SQL identifier detected.",
    "bridge.error.depth_exceeded": "The block tree exceeds the maximum allowed depth.",
    "bridge.error.security_violation": "Security violation detected in content."
  }
};

class I18n {
  constructor(locale = 'pt-BR') {
    this.locale = locale;
    this.fallbackLocale = 'en-GB';
    this.dictionaries = { ...DICTIONARIES };
    this.listeners = [];
  }

  setLocale(locale) {
    if (!locale || typeof locale !== 'string') return;
    this.locale = locale;
    this.notifyLocaleChange();
  }

  getLocale() {
    return this.locale;
  }

  onLocaleChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notifyLocaleChange() {
    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](this.locale);
      } catch (err) {
        console.error('[NewsMailForge I18n] Listener error:', err);
      }
    }
  }

  async loadExternalDictionary(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data && typeof data === 'object') {
        const targetLocale = this.locale;
        this.dictionaries[targetLocale] = {
          ...(this.dictionaries[targetLocale] || {}),
          ...data
        };
        this.notifyLocaleChange();
      }
      return true;
    } catch (error) {
      console.warn(`[NewsMailForge I18n] Failed to load external dictionary from ${url}:`, error);
      return false;
    }
  }

  t(key, fallbackOrParams = {}, params = {}) {
    if (!key || typeof key !== 'string') return '';

    let fallback = '';
    let interpolation = params;

    if (typeof fallbackOrParams === 'string') {
      fallback = fallbackOrParams;
    } else if (fallbackOrParams && typeof fallbackOrParams === 'object') {
      interpolation = fallbackOrParams;
    }

    const currentDict = this.dictionaries[this.locale] || {};
    const fallbackDict = this.dictionaries[this.fallbackLocale] || {};

    let translation = currentDict[key] ?? fallbackDict[key] ?? (fallback || key);

    if (interpolation && typeof interpolation === 'object') {
      for (const [k, v] of Object.entries(interpolation)) {
        translation = translation.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        translation = translation.replace(new RegExp(`:${k}`, 'g'), String(v));
      }
    }

    return translation;
  }

  static t(key, fallbackOrParams, params) {
    return i18n.t(key, fallbackOrParams, params);
  }

  static setLocale(locale) {
    return i18n.setLocale(locale);
  }

  static getLocale() {
    return i18n.getLocale();
  }

  static onLocaleChange(callback) {
    return i18n.onLocaleChange(callback);
  }
}

const i18n = new I18n('pt-BR');

if (typeof window !== 'undefined') {
  window.NewsMailForgeI18n = i18n;
  window.I18n = I18n;
}

export { I18n, i18n };
export default i18n;
