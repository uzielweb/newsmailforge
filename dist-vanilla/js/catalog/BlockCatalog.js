/**
 * News Mail Forge - BlockCatalog
 * Catálogo com 8 categorias do Colspan e 24 blocos modulares ricos
 * Cada bloco possui miniatura SVG nítida, chaves i18n e função create() com BlockFactory.
 * UTF-8 sem BOM (No BOM)
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { BlockFactory } from '../core/BlockFactory.js';

export const CATEGORIES = [
  { id: 'menu', nameKey: 'CAT_MENU', icon: 'menu' },
  { id: 'header', nameKey: 'CAT_HEADER', icon: 'layout' },
  { id: 'content', nameKey: 'CAT_CONTENT', icon: 'file-text' },
  { id: 'feature', nameKey: 'CAT_FEATURE', icon: 'grid' },
  { id: 'cta', nameKey: 'CAT_CTA', icon: 'mouse-pointer' },
  { id: 'ecommerce', nameKey: 'CAT_ECOMMERCE', icon: 'shopping-bag' },
  { id: 'transactional', nameKey: 'CAT_TRANSACTIONAL', icon: 'check-circle' },
  { id: 'footer', nameKey: 'CAT_FOOTER', icon: 'align-left' }
];

export const BLOCKS = [
  // ==========================================
  // 1. MENU & NAVEGAÇÃO
  // ==========================================
  {
    id: 'menu_nav_logo',
    category: 'menu',
    nameKey: 'BLOCK_MENU_NAV_NAME',
    descriptionKey: 'BLOCK_MENU_NAV_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="18" width="28" height="14" rx="2" fill="#2563EB"/><rect x="52" y="22" width="16" height="6" rx="2" fill="#94A3B8"/><rect x="74" y="22" width="16" height="6" rx="2" fill="#94A3B8"/><rect x="96" y="22" width="16" height="6" rx="2" fill="#94A3B8"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_MENU_NAV_NAME', 'Barra de Navegação com Logo'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [16, 24, 16, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 16, collapseOnMobile: false },
          cells: [
            BlockFactory.createCell({
              settings: { width: '35%', verticalAlign: 'middle', horizontalAlign: 'left' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/140x40/2563eb/ffffff?text=LOGO',
                  alt: 'Logo',
                  settings: { width: 120, height: 34, align: 'left' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '65%', verticalAlign: 'middle', horizontalAlign: 'right' },
              children: [
                BlockFactory.createMenuAtom({
                  items: [
                    { label: 'Novidades', url: 'https://example.com' },
                    { label: 'Destaques', url: 'https://example.com' },
                    { label: 'Contato', url: 'https://example.com' }
                  ],
                  settings: { align: 'right', itemGap: 18 }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'menu_centered',
    category: 'menu',
    nameKey: 'BLOCK_MENU_CENTERED_NAME',
    descriptionKey: 'BLOCK_MENU_CENTERED_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="44" y="10" width="32" height="12" rx="2" fill="#2563EB"/><rect x="22" y="30" width="18" height="6" rx="2" fill="#94A3B8"/><rect x="46" y="30" width="28" height="6" rx="2" fill="#94A3B8"/><rect x="80" y="30" width="18" height="6" rx="2" fill="#94A3B8"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_MENU_CENTERED_NAME', 'Menu Centralizado'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [20, 24, 16, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/160x45/0f172a/ffffff?text=BRAND',
                  alt: 'Brand',
                  settings: { width: 140, height: 40, align: 'center' }
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [12, 0, 0, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createMenuAtom({
                  items: [
                    { label: 'Coleção', url: 'https://example.com' },
                    { label: 'Sobre Nós', url: 'https://example.com' },
                    { label: 'Blog', url: 'https://example.com' },
                    { label: 'Lojas', url: 'https://example.com' }
                  ],
                  settings: { align: 'center', itemGap: 24 }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'menu_announcement',
    category: 'menu',
    nameKey: 'BLOCK_MENU_ANNOUNCEMENT_NAME',
    descriptionKey: 'BLOCK_MENU_ANNOUNCEMENT_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect width="120" height="14" fill="#0F172A"/><rect x="30" y="4" width="60" height="6" rx="1" fill="#F8FAFC"/><rect x="8" y="24" width="24" height="12" rx="2" fill="#2563EB"/><rect x="68" y="27" width="44" height="6" rx="2" fill="#94A3B8"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_MENU_ANNOUNCEMENT_NAME', 'Barra de Comunicado + Nav'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [0, 0, 16, 0] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { backgroundColor: '#0f172a', spacing: { padding: [8, 16, 8, 16] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0; font-size: 13px; color: #ffffff; text-align: center;">⚡ Frete Grátis para todo o Brasil em compras acima de R$ 199. Aproveite!</p>'
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { spacing: { padding: [16, 24, 0, 24] }, gap: 16 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '40%', verticalAlign: 'middle' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/130x36/2563eb/ffffff?text=STORE',
                  alt: 'Store',
                  settings: { width: 110, height: 32, align: 'left' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '60%', verticalAlign: 'middle', horizontalAlign: 'right' },
              children: [
                BlockFactory.createMenuAtom({
                  items: [
                    { label: 'Categorias', url: 'https://example.com' },
                    { label: 'Ofertas', url: 'https://example.com' },
                    { label: 'Ajuda', url: 'https://example.com' }
                  ],
                  settings: { align: 'right', itemGap: 16 }
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 2. CABEÇALHOS & HERO
  // ==========================================
  {
    id: 'header_hero_classic',
    category: 'header',
    nameKey: 'BLOCK_HEADER_HERO_NAME',
    descriptionKey: 'BLOCK_HEADER_HERO_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="25" y="10" width="70" height="10" rx="2" fill="#0F172A"/><rect x="35" y="24" width="50" height="6" rx="2" fill="#64748B"/><rect x="42" y="34" width="36" height="10" rx="3" fill="#2563EB"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_HEADER_HERO_NAME', 'Hero Clássico com CTA'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [36, 24, 36, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h1 style="margin: 0 0 12px 0; font-size: 30px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.25;">Transforme suas Campanhas com Alta Fidelidade</h1><p style="margin: 0 0 24px 0; font-size: 17px; color: #475569; text-align: center; line-height: 1.5;">Construa e-mails modernos que nunca quebram no Outlook ou dispositivos móveis.</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Conheça os Recursos',
                  link: 'https://example.com',
                  settings: {
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: 16,
                    borderRadius: 6,
                    spacing: { padding: [14, 32, 14, 32] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'header_hero_split',
    category: 'header',
    nameKey: 'BLOCK_HEADER_SPLIT_NAME',
    descriptionKey: 'BLOCK_HEADER_SPLIT_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="10" width="46" height="8" rx="2" fill="#0F172A"/><rect x="8" y="21" width="40" height="5" rx="1" fill="#64748B"/><rect x="8" y="30" width="28" height="9" rx="2" fill="#2563EB"/><rect x="62" y="8" width="50" height="34" rx="4" fill="#CBD5E1"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_HEADER_SPLIT_NAME', 'Hero Dividido em 2 Colunas'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [28, 24, 28, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 24, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '50%', verticalAlign: 'middle', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<span style="display: inline-block; padding: 4px 10px; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; border-radius: 9999px; margin-bottom: 12px;">NOVIDADE 2026</span><h2 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.25;">Tecnologia Ágil para Desenvolvedores</h2><p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; line-height: 1.5;">Compatível com todos os CMSs e frameworks PHP do mercado sem dependências externas.</p>',
                  settings: { align: 'left' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Iniciar Agora',
                  link: 'https://example.com',
                  settings: {
                    align: 'left',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    spacing: { padding: [12, 24, 12, 24] }
                  }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '50%', verticalAlign: 'middle', horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
                  alt: 'Dashboard Mockup',
                  settings: { width: 280, height: 210, borderRadius: 8, align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'header_hero_minimal',
    category: 'header',
    nameKey: 'BLOCK_HEADER_MINIMAL_NAME',
    descriptionKey: 'BLOCK_HEADER_MINIMAL_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="15" y="8" width="30" height="4" rx="1" fill="#94A3B8"/><rect x="15" y="16" width="90" height="10" rx="2" fill="#0F172A"/><rect x="15" y="30" width="80" height="4" rx="1" fill="#64748B"/><line x1="15" y1="40" x2="105" y2="40" stroke="#CBD5E1" stroke-width="1"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_HEADER_MINIMAL_NAME', 'Hero Editorial Minimalista'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [32, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Edição Semanal #42 • Novembro 2026</p><h1 style="margin: 0 0 14px 0; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2;">A Revolução dos Componentes Nativos no PHP</h1><p style="margin: 0 0 20px 0; font-size: 17px; color: #334155; line-height: 1.6;">Uma análise aprofundada sobre arquitetura desacoplada, segurança OWASP e o fim definitivo das dependências pesadas de build.</p>'
                }),
                BlockFactory.createDividerAtom({
                  settings: { color: '#e2e8f0', height: 1, spacing: { margin: [12, 0, 12, 0] } }
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 3. CONTEÚDO & ARTIGOS
  // ==========================================
  {
    id: 'content_article_lead',
    category: 'content',
    nameKey: 'BLOCK_CONTENT_ARTICLE_NAME',
    descriptionKey: 'BLOCK_CONTENT_ARTICLE_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="6" width="104" height="20" rx="2" fill="#CBD5E1"/><rect x="8" y="30" width="70" height="6" rx="1" fill="#0F172A"/><rect x="8" y="39" width="90" height="4" rx="1" fill="#64748B"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CONTENT_ARTICLE_NAME', 'Artigo com Imagem em Destaque'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [16, 24, 24, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 16, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
                  alt: 'Artigo Panorâmico',
                  settings: { width: 552, height: 260, borderRadius: 6, align: 'center' }
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">Como Proteger Seus E-mails Contra Quebras no Word Engine</h3><p style="margin: 0 0 14px 0; font-size: 15px; color: #475569; line-height: 1.6;">O Microsoft Outlook renderiza tabelas utilizando a Word Rendering Engine. Ao implementar Ghost Tables e Gap Spacer Columns, garantimos que nenhum subpixel vazará no fundo.</p><p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">Descubra os métodos cirúrgicos aplicados nas maiores operações corporativas do país.</p>'
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'content_media_text_2col',
    category: 'content',
    nameKey: 'BLOCK_CONTENT_MEDIA_TEXT_NAME',
    descriptionKey: 'BLOCK_CONTENT_MEDIA_TEXT_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="10" width="44" height="30" rx="3" fill="#CBD5E1"/><rect x="58" y="12" width="54" height="6" rx="1" fill="#0F172A"/><rect x="58" y="22" width="48" height="4" rx="1" fill="#64748B"/><rect x="58" y="30" width="36" height="4" rx="1" fill="#64748B"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CONTENT_MEDIA_TEXT_NAME', 'Mídia e Texto (2 Colunas)'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [20, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 20, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '45%', verticalAlign: 'middle', horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
                  alt: 'Mídia Ilustrativa',
                  settings: { width: 240, height: 160, borderRadius: 6, align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '55%', verticalAlign: 'middle', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h4 style="margin: 0 0 8px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">Experiência Unificada e Ágil</h4><p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.55;">Crie layouts dinâmicos com total controle de proporções e espaçamentos.</p><a href="https://example.com" style="color: #2563eb; font-weight: 700; font-size: 14px; text-decoration: none;">Ler Mais &rarr;</a>'
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'content_quote_card',
    category: 'content',
    nameKey: 'BLOCK_CONTENT_QUOTE_NAME',
    descriptionKey: 'BLOCK_CONTENT_QUOTE_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="12" y="10" width="96" height="30" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/><circle cx="26" cy="25" r="8" fill="#2563EB"/><rect x="40" y="20" width="56" height="5" rx="1" fill="#334155"/><rect x="40" y="28" width="38" height="4" rx="1" fill="#94A3B8"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CONTENT_QUOTE_NAME', 'Depoimento / Citação'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [16, 24, 16, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: {
            backgroundColor: '#f8fafc',
            borderRadius: 8,
            border: { width: 1, style: 'solid', color: '#e2e8f0' },
            spacing: { padding: [20, 20, 20, 20] },
            gap: 16
          },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0 0 16px 0; font-size: 16px; font-style: italic; color: #1e293b; line-height: 1.6;">"A arquitetura pura em Vanilla JS com compilador de tabelas eliminou completamente os bugs visuais em clientes legados. Simplesmente impecável!"</p>'
                }),
                BlockFactory.createRow({
                  settings: { gap: 12, collapseOnMobile: false },
                  cells: [
                    BlockFactory.createCell({
                      settings: { width: '48px', verticalAlign: 'middle' },
                      children: [
                        BlockFactory.createImageAtom({
                          src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80',
                          alt: 'Avatar',
                          settings: { width: 44, height: 44, borderRadius: 22 }
                        })
                      ]
                    }),
                    BlockFactory.createCell({
                      settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left' },
                      children: [
                        BlockFactory.createTextAtom({
                          value: '<strong style="display: block; font-size: 14px; color: #0f172a;">Beatriz Mendes</strong><span style="font-size: 13px; color: #64748b;">Diretora de Tecnologia, Nexus Cloud</span>'
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 4. RECURSOS & DESTAQUES
  // ==========================================
  {
    id: 'feature_grid_3col',
    category: 'feature',
    nameKey: 'BLOCK_FEATURE_GRID3_NAME',
    descriptionKey: 'BLOCK_FEATURE_GRID3_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="10" width="30" height="30" rx="3" fill="#E2E8F0"/><circle cx="23" cy="18" r="4" fill="#2563EB"/><rect x="12" y="26" width="22" height="4" rx="1" fill="#0F172A"/><rect x="45" y="10" width="30" height="30" rx="3" fill="#E2E8F0"/><circle cx="60" cy="18" r="4" fill="#2563EB"/><rect x="49" y="26" width="22" height="4" rx="1" fill="#0F172A"/><rect x="82" y="10" width="30" height="30" rx="3" fill="#E2E8F0"/><circle cx="97" cy="18" r="4" fill="#2563EB"/><rect x="86" y="26" width="22" height="4" rx="1" fill="#0F172A"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FEATURE_GRID3_NAME', 'Grid de Recursos (3 Colunas)'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [24, 24, 24, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 16, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [16, 12, 16, 12] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/48x48/2563eb/ffffff?text=01',
                  alt: 'Ícone 1',
                  settings: { width: 44, height: 44, align: 'center', borderRadius: 22 }
                }),
                BlockFactory.createTextAtom({
                  value: '<h5 style="margin: 12px 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: center;">Ultra Rápido</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.45;">Carregamento em milissegundos sem NodeJS.</p>'
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [16, 12, 16, 12] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/48x48/10b981/ffffff?text=02',
                  alt: 'Ícone 2',
                  settings: { width: 44, height: 44, align: 'center', borderRadius: 22 }
                }),
                BlockFactory.createTextAtom({
                  value: '<h5 style="margin: 12px 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: center;">Blindado MSO</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.45;">Compatível com Outlook 2007 a 2024.</p>'
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [16, 12, 16, 12] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/48x48/8b5cf6/ffffff?text=03',
                  alt: 'Ícone 3',
                  settings: { width: 44, height: 44, align: 'center', borderRadius: 22 }
                }),
                BlockFactory.createTextAtom({
                  value: '<h5 style="margin: 12px 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: center;">100% Agnóstico</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.45;">Plug-and-play em qualquer sistema PHP.</p>'
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'feature_highlight_2col',
    category: 'feature',
    nameKey: 'BLOCK_FEATURE_HIGHLIGHT2_NAME',
    descriptionKey: 'BLOCK_FEATURE_HIGHLIGHT2_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="8" width="50" height="34" rx="4" fill="#E2E8F0"/><rect x="62" y="8" width="50" height="34" rx="4" fill="#E2E8F0"/><rect x="14" y="28" width="38" height="6" rx="1" fill="#0F172A"/><rect x="68" y="28" width="38" height="6" rx="1" fill="#0F172A"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FEATURE_HIGHLIGHT2_NAME', 'Destaques em 2 Colunas'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [20, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 20, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '50%', backgroundColor: '#ffffff', borderRadius: 8, border: { width: 1, style: 'solid', color: '#e2e8f0' }, spacing: { padding: [16, 16, 16, 16] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
                  alt: 'Feature 1',
                  settings: { width: 230, height: 130, borderRadius: 6, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h4 style="margin: 12px 0 6px 0; font-size: 17px; font-weight: 700; color: #0f172a;">Edição Visual em Tempo Real</h4><p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">Alterne entre Desktop e Mobile com preview instantâneo e controles contextuais.</p>'
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '50%', backgroundColor: '#ffffff', borderRadius: 8, border: { width: 1, style: 'solid', color: '#e2e8f0' }, spacing: { padding: [16, 16, 16, 16] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
                  alt: 'Feature 2',
                  settings: { width: 230, height: 130, borderRadius: 6, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h4 style="margin: 12px 0 6px 0; font-size: 17px; font-weight: 700; color: #0f172a;">Segurança Sanitizada OWASP</h4><p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">Proteção rigorosa contra injeções XSS e esquemas de links perigosos.</p>'
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'feature_icon_list',
    category: 'feature',
    nameKey: 'BLOCK_FEATURE_ICON_LIST_NAME',
    descriptionKey: 'BLOCK_FEATURE_ICON_LIST_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><circle cx="16" cy="14" r="5" fill="#2563EB"/><rect x="28" y="11" width="80" height="6" rx="1" fill="#0F172A"/><circle cx="16" cy="27" r="5" fill="#2563EB"/><rect x="28" y="24" width="70" height="6" rx="1" fill="#0F172A"/><circle cx="16" cy="40" r="5" fill="#2563EB"/><rect x="28" y="37" width="75" height="6" rx="1" fill="#0F172A"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FEATURE_ICON_LIST_NAME', 'Lista de Itens com Ícones'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [16, 24, 16, 24] }
      },
      rows: [
        // Linha 1: Segue estritamente DIRETRIZES-CONSTRUCAO-EMM-OUTLOOK.md (valign=middle duplo + zero horizontal padding na td do ícone)
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 16, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/36x36/2563eb/ffffff?text=%E2%9C%93',
                  alt: 'Ícone 1',
                  settings: { width: 34, height: 34, align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 16] } },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0; font-size: 16px; color: #1e293b; line-height: 1.45;"><strong>Entrega Instantânea:</strong> Seus destinatários recebem e-mails leves e responsivos.</p>'
                })
              ]
            })
          ]
        }),
        // Linha 2
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 16, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/36x36/10b981/ffffff?text=%E2%9C%93',
                  alt: 'Ícone 2',
                  settings: { width: 34, height: 34, align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 16] } },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0; font-size: 16px; color: #1e293b; line-height: 1.45;"><strong>Zero Frestas:</strong> Imagens travadas matematicamente sem linhas de subpixel.</p>'
                })
              ]
            })
          ]
        }),
        // Linha 3
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 8, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/36x36/f59e0b/ffffff?text=%E2%9C%93',
                  alt: 'Ícone 3',
                  settings: { width: 34, height: 34, align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 16] } },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0; font-size: 16px; color: #1e293b; line-height: 1.45;"><strong>Botões Bulletproof:</strong> Renderização perfeita com tecnologia VML no Windows.</p>'
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 5. CHAMADAS PARA AÇÃO (CTA)
  // ==========================================
  {
    id: 'cta_banner_simple',
    category: 'cta',
    nameKey: 'BLOCK_CTA_BANNER_NAME',
    descriptionKey: 'BLOCK_CTA_BANNER_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#2563EB"/><rect x="20" y="10" width="80" height="8" rx="2" fill="#FFFFFF"/><rect x="30" y="21" width="60" height="5" rx="1" fill="#93C5FD"/><rect x="42" y="31" width="36" height="10" rx="3" fill="#FFFFFF"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CTA_BANNER_NAME', 'Banner de Ação Direta'),
      settings: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        spacing: { padding: [32, 24, 32, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h2 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.3;">Pronto Para Elevar o Nível do Seu Produto?</h2><p style="margin: 0 0 22px 0; font-size: 16px; color: #dbeafe; text-align: center; line-height: 1.5;">Experimente o News Mail Forge hoje mesmo e surpreenda seus usuários.</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Criar Minha Primeira Campanha',
                  link: 'https://example.com',
                  settings: {
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    fontSize: 16,
                    fontWeight: 'bold',
                    borderRadius: 6,
                    spacing: { padding: [14, 28, 14, 28] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'cta_dual_action',
    category: 'cta',
    nameKey: 'BLOCK_CTA_DUAL_NAME',
    descriptionKey: 'BLOCK_CTA_DUAL_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="25" y="10" width="70" height="8" rx="2" fill="#0F172A"/><rect x="20" y="28" width="36" height="12" rx="3" fill="#2563EB"/><rect x="64" y="28" width="36" height="12" rx="3" fill="#E2E8F0"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CTA_DUAL_NAME', 'Chamada com Ação Dupla'),
      settings: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        border: { width: 1, style: 'solid', color: '#e2e8f0' },
        spacing: { padding: [28, 24, 28, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 16, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Escolha a Melhor Opção Para Você</h3><p style="margin: 0; font-size: 15px; color: #64748b; text-align: center;">Teste gratuitamente por 14 dias ou agende uma demonstração personalizada.</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { gap: 16, collapseOnMobile: false },
          cells: [
            BlockFactory.createCell({
              settings: { width: '50%', horizontalAlign: 'right' },
              children: [
                BlockFactory.createButtonAtom({
                  value: 'Teste Grátis',
                  link: 'https://example.com/test',
                  settings: {
                    align: 'right',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    spacing: { padding: [12, 20, 12, 20] }
                  }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '50%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createButtonAtom({
                  value: 'Falar com Consultor',
                  link: 'https://example.com/demo',
                  settings: {
                    align: 'left',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: { width: 1, style: 'solid', color: '#cbd5e1' },
                    spacing: { padding: [12, 20, 12, 20] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'cta_vip_dark',
    category: 'cta',
    nameKey: 'BLOCK_CTA_VIP_DARK_NAME',
    descriptionKey: 'BLOCK_CTA_VIP_DARK_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#0D0D18"/><rect x="25" y="10" width="70" height="8" rx="2" fill="#F59E0B"/><rect x="35" y="22" width="50" height="5" rx="1" fill="#FFFFFF"/><rect x="42" y="32" width="36" height="10" rx="3" fill="#F59E0B"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_CTA_VIP_DARK_NAME', 'Convite VIP Fundo Escuro'),
      settings: {
        backgroundColor: '#0D0D18',
        borderRadius: 8,
        spacing: { padding: [36, 24, 36, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<span style="display: inline-block; padding: 4px 12px; background-color: #f59e0b; color: #0D0D18; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">CONVITE EXCLUSIVO</span><h2 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.25;">Executive Summit & VIP Experience</h2><p style="margin: 0 0 24px 0; font-size: 16px; color: #e2e8f0; text-align: center; line-height: 1.55;">Confirme sua presença no evento mais aguardado do ano para líderes de tecnologia e negócios.</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Confirmar Minha Presença',
                  link: 'https://example.com/vip',
                  settings: {
                    backgroundColor: '#f59e0b',
                    color: '#0D0D18',
                    fontSize: 16,
                    fontWeight: 'bold',
                    borderRadius: 6,
                    spacing: { padding: [14, 32, 14, 32] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 6. E-COMMERCE & PRODUTOS
  // ==========================================
  {
    id: 'ecom_showcase2',
    category: 'ecommerce',
    nameKey: 'BLOCK_ECOM_SHOWCASE2_NAME',
    descriptionKey: 'BLOCK_ECOM_SHOWCASE2_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="8" width="50" height="22" rx="3" fill="#CBD5E1"/><rect x="12" y="33" width="30" height="4" rx="1" fill="#0F172A"/><rect x="12" y="39" width="42" height="6" rx="2" fill="#2563EB"/><rect x="62" y="8" width="50" height="22" rx="3" fill="#CBD5E1"/><rect x="66" y="33" width="30" height="4" rx="1" fill="#0F172A"/><rect x="66" y="39" width="42" height="6" rx="2" fill="#2563EB"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_ECOM_SHOWCASE2_NAME', 'Vitrine de Produtos (2 Colunas)'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [20, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 16, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '50%', backgroundColor: '#ffffff', borderRadius: 8, border: { width: 1, style: 'solid', color: '#e2e8f0' }, spacing: { padding: [16, 16, 16, 16] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=350&auto=format&fit=crop&q=80',
                  alt: 'Smartwatch Pro',
                  settings: { width: 220, height: 160, borderRadius: 6, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h5 style="margin: 12px 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: center;">Smartwatch Titanium</h5><p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #16a34a; text-align: center;">R$ 899,00</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Comprar Agora',
                  link: 'https://example.com/produto1',
                  settings: {
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    spacing: { padding: [10, 16, 10, 16] }
                  }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '50%', backgroundColor: '#ffffff', borderRadius: 8, border: { width: 1, style: 'solid', color: '#e2e8f0' }, spacing: { padding: [16, 16, 16, 16] } },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=350&auto=format&fit=crop&q=80',
                  alt: 'Fone Bluetooth',
                  settings: { width: 220, height: 160, borderRadius: 6, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h5 style="margin: 12px 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: center;">Headphone Hi-Fi</h5><p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #16a34a; text-align: center;">R$ 459,00</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Comprar Agora',
                  link: 'https://example.com/produto2',
                  settings: {
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    spacing: { padding: [10, 16, 10, 16] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'ecom_featured',
    category: 'ecommerce',
    nameKey: 'BLOCK_ECOM_FEATURED_NAME',
    descriptionKey: 'BLOCK_ECOM_FEATURED_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="8" width="46" height="34" rx="3" fill="#CBD5E1"/><rect x="60" y="10" width="20" height="6" rx="2" fill="#EF4444"/><rect x="60" y="19" width="48" height="6" rx="1" fill="#0F172A"/><rect x="60" y="28" width="30" height="5" rx="1" fill="#16A34A"/><rect x="60" y="36" width="45" height="7" rx="2" fill="#2563EB"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_ECOM_FEATURED_NAME', 'Produto em Destaque Especial'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [24, 24, 24, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 20, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '50%', verticalAlign: 'middle', horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=450&auto=format&fit=crop&q=80',
                  alt: 'Destaque',
                  settings: { width: 250, height: 200, borderRadius: 8, align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '50%', verticalAlign: 'middle', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<span style="display: inline-block; padding: 3px 8px; background-color: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 800; border-radius: 4px; margin-bottom: 8px;">35% OFF HOJE</span><h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.25;">Monitor Ultrawide 34" Curvo 144Hz</h3><p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Painel IPS HDR, tempo de resposta de 1ms e suporte ergonômico integrado.</p><p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8; text-decoration: line-through;">De R$ 3.499,00</p><p style="margin: 0 0 18px 0; font-size: 24px; font-weight: 800; color: #16a34a;">Por R$ 2.274,00</p>',
                  settings: { align: 'left' }
                }),
                BlockFactory.createButtonAtom({
                  value: 'Garantir Desconto',
                  link: 'https://example.com/oferta',
                  settings: {
                    align: 'left',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    spacing: { padding: [12, 24, 12, 24] }
                  }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'ecom_grid3',
    category: 'ecommerce',
    nameKey: 'BLOCK_ECOM_GRID3_NAME',
    descriptionKey: 'BLOCK_ECOM_GRID3_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="8" y="8" width="30" height="20" rx="2" fill="#CBD5E1"/><rect x="10" y="31" width="26" height="4" rx="1" fill="#0F172A"/><rect x="10" y="37" width="18" height="4" rx="1" fill="#16A34A"/><rect x="45" y="8" width="30" height="20" rx="2" fill="#CBD5E1"/><rect x="47" y="31" width="26" height="4" rx="1" fill="#0F172A"/><rect x="47" y="37" width="18" height="4" rx="1" fill="#16A34A"/><rect x="82" y="8" width="30" height="20" rx="2" fill="#CBD5E1"/><rect x="84" y="31" width="26" height="4" rx="1" fill="#0F172A"/><rect x="84" y="37" width="18" height="4" rx="1" fill="#16A34A"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_ECOM_GRID3_NAME', 'Grade de Ofertas (3 Colunas)'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [20, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 14, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '33.33%', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [12, 10, 12, 10] }, horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/180x120/cbd5e1/0f172a?text=Item+1',
                  alt: 'Item 1',
                  settings: { width: 140, height: 95, borderRadius: 4, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h6 style="margin: 8px 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: center;">Teclado Slim</h6><p style="margin: 0; font-size: 15px; font-weight: 800; color: #16a34a; text-align: center;">R$ 189,00</p>',
                  settings: { align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [12, 10, 12, 10] }, horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/180x120/cbd5e1/0f172a?text=Item+2',
                  alt: 'Item 2',
                  settings: { width: 140, height: 95, borderRadius: 4, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h6 style="margin: 8px 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: center;">Mouse Sem Fio</h6><p style="margin: 0; font-size: 15px; font-weight: 800; color: #16a34a; text-align: center;">R$ 129,00</p>',
                  settings: { align: 'center' }
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [12, 10, 12, 10] }, horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/180x120/cbd5e1/0f172a?text=Item+3',
                  alt: 'Item 3',
                  settings: { width: 140, height: 95, borderRadius: 4, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h6 style="margin: 8px 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: center;">Hub USB-C 7x1</h6><p style="margin: 0; font-size: 15px; font-weight: 800; color: #16a34a; text-align: center;">R$ 219,00</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 7. TRANSACIONAL & RECIBOS
  // ==========================================
  {
    id: 'trans_confirmation',
    category: 'transactional',
    nameKey: 'BLOCK_TRANS_CONFIRMATION_NAME',
    descriptionKey: 'BLOCK_TRANS_CONFIRMATION_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><circle cx="60" cy="16" r="8" fill="#16A34A"/><rect x="35" y="28" width="50" height="6" rx="2" fill="#0F172A"/><rect x="42" y="38" width="36" height="4" rx="1" fill="#64748B"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_TRANS_CONFIRMATION_NAME', 'Confirmação de Pedido'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [32, 24, 24, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createImageAtom({
                  src: 'https://placehold.co/64x64/16a34a/ffffff?text=%E2%9C%93',
                  alt: 'Sucesso',
                  settings: { width: 54, height: 54, borderRadius: 27, align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<h2 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Obrigado! Seu pedido foi confirmado</h2><p style="margin: 0 0 14px 0; font-size: 15px; color: #475569; text-align: center;">Pedido <strong>#NF-98421</strong> • Previsão de entrega: <strong>12 de Novembro</strong></p><p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">Enviaremos atualizações de rastreamento assim que o pacote for despachado.</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'trans_receipt_table',
    category: 'transactional',
    nameKey: 'BLOCK_TRANS_RECEIPT_TABLE_NAME',
    descriptionKey: 'BLOCK_TRANS_RECEIPT_TABLE_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="12" y="10" width="96" height="6" rx="1" fill="#0F172A"/><line x1="12" y1="20" x2="108" y2="20" stroke="#CBD5E1" stroke-width="1"/><rect x="12" y="24" width="60" height="4" rx="1" fill="#64748B"/><rect x="88" y="24" width="20" height="4" rx="1" fill="#64748B"/><line x1="12" y1="32" x2="108" y2="32" stroke="#CBD5E1" stroke-width="1"/><rect x="68" y="38" width="40" height="6" rx="1" fill="#16A34A"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_TRANS_RECEIPT_TABLE_NAME', 'Tabela de Resumo Financeiro'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [16, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 8, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%' },
              children: [
                BlockFactory.createTextAtom({
                  value: `<table role="presentation" border="0" cellpadding="8" cellspacing="0" width="100%" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
  <thead>
    <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">
      <th style="padding: 8px 4px;">Item / Descrição</th>
      <th style="padding: 8px 4px; text-align: center;">Qtd</th>
      <th style="padding: 8px 4px; text-align: right;">Preço</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f5f9; color: #0f172a;">
      <td style="padding: 10px 4px;"><strong>Plano Enterprise Anual</strong><br><span style="font-size: 12px; color: #64748b;">Suporte Dedicado 24/7</span></td>
      <td style="padding: 10px 4px; text-align: center;">1</td>
      <td style="padding: 10px 4px; text-align: right;">R$ 1.200,00</td>
    </tr>
    <tr style="border-bottom: 1px solid #f1f5f9; color: #0f172a;">
      <td style="padding: 10px 4px;"><strong>IP Dedicado Adicional</strong></td>
      <td style="padding: 10px 4px; text-align: center;">2</td>
      <td style="padding: 10px 4px; text-align: right;">R$ 180,00</td>
    </tr>
    <tr style="color: #475569;">
      <td colspan="2" style="padding: 10px 4px; text-align: right;">Subtotal:</td>
      <td style="padding: 10px 4px; text-align: right;">R$ 1.380,00</td>
    </tr>
    <tr style="border-top: 2px solid #0f172a; color: #0f172a; font-size: 16px;">
      <td colspan="2" style="padding: 12px 4px; text-align: right;"><strong>Total Pago:</strong></td>
      <td style="padding: 12px 4px; text-align: right; color: #16a34a;"><strong>R$ 1.380,00</strong></td>
    </tr>
  </tbody>
</table>`
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'trans_security_code',
    category: 'transactional',
    nameKey: 'BLOCK_TRANS_SECURITY_CODE_NAME',
    descriptionKey: 'BLOCK_TRANS_SECURITY_CODE_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="30" y="8" width="60" height="6" rx="1" fill="#0F172A"/><rect x="25" y="18" width="70" height="18" rx="4" fill="#F1F5F9" stroke="#2563EB" stroke-dasharray="2 2"/><rect x="35" y="24" width="50" height="6" rx="1" fill="#2563EB"/><rect x="38" y="40" width="44" height="4" rx="1" fill="#94A3B8"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_TRANS_SECURITY_CODE_NAME', 'Código de Segurança / Reset'),
      settings: {
        backgroundColor: '#ffffff',
        spacing: { padding: [28, 24, 28, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center;">Código de Verificação de Acesso</h3><p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; text-align: center;">Utilize o código de uso único abaixo para autorizar seu login no painel:</p>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<div style="margin: 0 auto; max-width: 280px; padding: 16px 24px; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; text-align: center; letter-spacing: 6px; font-family: monospace; font-size: 28px; font-weight: 800; color: #1d4ed8;">849-204</div>',
                  settings: { align: 'center' }
                }),
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 16px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;">Este código expira em 10 minutos. Se você não solicitou esta ação, altere sua senha imediatamente.</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  },

  // ==========================================
  // 8. RODAPÉS & LEGAL
  // ==========================================
  {
    id: 'footer_social',
    category: 'footer',
    nameKey: 'BLOCK_FOOTER_SOCIAL_NAME',
    descriptionKey: 'BLOCK_FOOTER_SOCIAL_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#0F172A"/><circle cx="42" cy="16" r="5" fill="#64748B"/><circle cx="54" cy="16" r="5" fill="#64748B"/><circle cx="66" cy="16" r="5" fill="#64748B"/><circle cx="78" cy="16" r="5" fill="#64748B"/><rect x="25" y="28" width="70" height="4" rx="1" fill="#475569"/><rect x="35" y="36" width="50" height="4" rx="1" fill="#475569"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FOOTER_SOCIAL_NAME', 'Rodapé Social e Descadastramento'),
      settings: {
        backgroundColor: '#0f172a',
        spacing: { padding: [28, 24, 28, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [0, 0, 16, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createSocialAtom({
                  settings: { align: 'center', iconTheme: 'light', iconSize: 26, iconGap: 18 }
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5;">Você está recebendo este e-mail porque assinou nossa newsletter corporativa.<br>News Mail Forge Inc. • Av. Paulista, 1000 - São Paulo/SP</p><p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;"><a href="https://example.com/preferences" style="color: #cbd5e1; text-decoration: underline;">Gerenciar Preferências</a> • <a href="https://example.com/unsubscribe" style="color: #cbd5e1; text-decoration: underline;">Descadastrar-se</a></p>',
                  settings: { align: 'center', color: '#94a3b8' }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'footer_nav',
    category: 'footer',
    nameKey: 'BLOCK_FOOTER_NAV_NAME',
    descriptionKey: 'BLOCK_FOOTER_NAV_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="12" y="10" width="24" height="4" rx="1" fill="#0F172A"/><rect x="12" y="18" width="20" height="3" rx="1" fill="#64748B"/><rect x="12" y="24" width="22" height="3" rx="1" fill="#64748B"/><rect x="48" y="10" width="24" height="4" rx="1" fill="#0F172A"/><rect x="48" y="18" width="20" height="3" rx="1" fill="#64748B"/><rect x="48" y="24" width="22" height="3" rx="1" fill="#64748B"/><rect x="84" y="10" width="24" height="4" rx="1" fill="#0F172A"/><rect x="84" y="18" width="20" height="3" rx="1" fill="#64748B"/><rect x="84" y="24" width="22" height="3" rx="1" fill="#64748B"/><line x1="12" y1="36" x2="108" y2="36" stroke="#CBD5E1" stroke-width="1"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FOOTER_NAV_NAME', 'Rodapé com Mapa de Links'),
      settings: {
        backgroundColor: '#ffffff',
        border: { width: 1, style: 'solid', color: '#e2e8f0' },
        spacing: { padding: [28, 24, 20, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 16, collapseOnMobile: true },
          cells: [
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 8px;">PRODUTOS</strong><p style="margin: 0; font-size: 13px; line-height: 1.8;"><a href="https://example.com" style="color: #64748b; text-decoration: none;">SDK Vanilla JS</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">PHP Bridge Adapter</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">Modelos Prontos</a></p>'
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 8px;">RECURSOS</strong><p style="margin: 0; font-size: 13px; line-height: 1.8;"><a href="https://example.com" style="color: #64748b; text-decoration: none;">Documentação</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">Guia Outlook MSO</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">Changelog</a></p>'
                })
              ]
            }),
            BlockFactory.createCell({
              settings: { width: '33.33%', horizontalAlign: 'left' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 8px;">INSTITUCIONAL</strong><p style="margin: 0; font-size: 13px; line-height: 1.8;"><a href="https://example.com" style="color: #64748b; text-decoration: none;">Termos de Uso</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">Privacidade LGPD</a><br><a href="https://example.com" style="color: #64748b; text-decoration: none;">Fale Conosco</a></p>'
                })
              ]
            })
          ]
        }),
        BlockFactory.createRow({
          settings: { gap: 0, spacing: { padding: [16, 0, 0, 0] } },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createDividerAtom({ settings: { color: '#f1f5f9', height: 1 } }),
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">© 2026 News Mail Forge. Todos os direitos reservados. Licença MIT.</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  },
  {
    id: 'footer_minimal',
    category: 'footer',
    nameKey: 'BLOCK_FOOTER_MINIMAL_NAME',
    descriptionKey: 'BLOCK_FOOTER_MINIMAL_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="50" rx="4" fill="#F8FAFC"/><rect x="25" y="20" width="70" height="4" rx="1" fill="#94A3B8"/><rect x="35" y="28" width="50" height="3" rx="1" fill="#CBD5E1"/></svg>`,
    create: () => BlockFactory.createBlock({
      label: I18n.t('BLOCK_FOOTER_MINIMAL_NAME', 'Rodapé Minimalista Legal'),
      settings: {
        backgroundColor: '#transparent',
        spacing: { padding: [20, 24, 24, 24] }
      },
      rows: [
        BlockFactory.createRow({
          settings: { gap: 0 },
          cells: [
            BlockFactory.createCell({
              settings: { width: '100%', horizontalAlign: 'center' },
              children: [
                BlockFactory.createTextAtom({
                  value: '<p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">Esta mensagem foi enviada de forma automática por um sistema seguro.<br><a href="https://example.com/unsub" style="color: #64748b; text-decoration: underline;">Descadastrar</a> este endereço de e-mail.</p>',
                  settings: { align: 'center' }
                })
              ]
            })
          ]
        })
      ]
    })
  }
];

export class BlockCatalog {
  /**
   * Retorna as 8 categorias do catálogo
   * @returns {Array<{id: string, nameKey: string, icon: string}>}
   */
  static getCategories() {
    return CATEGORIES.map(cat => ({
      ...cat,
      name: I18n.t(cat.nameKey, cat.id)
    }));
  }

  /**
   * Retorna os blocos de uma categoria específica
   * @param {string} category
   * @returns {Array<Object>}
   */
  static getBlocksByCategory(category) {
    return BLOCKS
      .filter(b => b.category === category)
      .map(b => ({
        ...b,
        name: I18n.t(b.nameKey, b.id),
        description: I18n.t(b.descriptionKey, '')
      }));
  }

  /**
   * Busca um bloco específico pelo ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getBlockById(id) {
    const found = BLOCKS.find(b => b.id === id);
    if (!found) return null;
    return {
      ...found,
      name: I18n.t(found.nameKey, found.id),
      description: I18n.t(found.descriptionKey, '')
    };
  }

  /**
   * Retorna todos os blocos cadastrados
   * @returns {Array<Object>}
   */
  static getAllBlocks() {
    return BLOCKS.map(b => ({
      ...b,
      name: I18n.t(b.nameKey, b.id),
      description: I18n.t(b.descriptionKey, '')
    }));
  }
}

export default BlockCatalog;
