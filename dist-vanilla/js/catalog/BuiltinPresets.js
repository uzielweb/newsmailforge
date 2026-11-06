/**
 * News Mail Forge - BuiltinPresets
 * 4 Presets completos e originais:
 * 1. Editorial Digest (Newsletter editorial de artigos e curadoria)
 * 2. Executive Summit Invite (Convite corporativo escuro #0D0D18 com cronograma e botão VML)
 * 3. SaaS Product Launch (Apresentação de novidades em grid de 2 e 3 colunas)
 * 4. Order & System Receipt (Recibo transacional com resumo financeiro tabelado)
 * UTF-8 sem BOM (No BOM)
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

import { I18n } from '../i18n/I18n.js';
import { BlockFactory } from '../core/BlockFactory.js';

export const PRESETS = [
  // ==========================================
  // 1. EDITORIAL DIGEST
  // ==========================================
  {
    id: 'editorial_digest',
    nameKey: 'PRESET_EDITORIAL_DIGEST_NAME',
    descriptionKey: 'PRESET_EDITORIAL_DIGEST_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" rx="4" fill="#F1F5F9"/><rect x="15" y="8" width="90" height="64" rx="2" fill="#FFFFFF"/><rect x="25" y="14" width="70" height="5" rx="1" fill="#0F172A"/><rect x="25" y="24" width="70" height="18" rx="2" fill="#CBD5E1"/><rect x="25" y="46" width="50" height="4" rx="1" fill="#0F172A"/><rect x="25" y="53" width="70" height="3" rx="1" fill="#64748B"/><rect x="25" y="58" width="60" height="3" rx="1" fill="#64748B"/></svg>`,
    create: () => BlockFactory.createDocument({
      title: 'Editorial Digest — Edição Semanal',
      generalSettings: BlockFactory.createGeneralSettings({
        previewText: 'Edição Especial: Curadoria semanal sobre arquitetura de software e engenharia web.',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: { color: '#f1f5f9' },
        bodyBackground: { color: '#ffffff' }
      }),
      blocks: [
        // Topo Editorial
        BlockFactory.createBlock({
          label: 'Cabeçalho Editorial',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [24, 24, 16, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase;">NEWSLETTER SEMANAL • EDIÇÃO #42</p><h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">THE FORGE DIGEST</h1>',
                      settings: { align: 'center' }
                    }),
                    BlockFactory.createDividerAtom({
                      settings: { color: '#e2e8f0', height: 1, spacing: { margin: [8, 0, 8, 0] } }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Artigo Principal Hero
        BlockFactory.createBlock({
          label: 'Artigo de Capa',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [12, 24, 24, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'left' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
                      alt: 'Capa do Artigo Principal',
                      settings: { width: 552, height: 260, borderRadius: 6, align: 'center', spacing: { margin: [0, 0, 16, 0] } }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.25;">A Arte da Engenharia Limpa: Como Reduzir Dependências Sem Perder Velocidade</h2><p style="margin: 0 0 16px 0; font-size: 15px; color: #475569; line-height: 1.6;">O excesso de frameworks e compiladores pesados introduziu uma dívida técnica silenciosa nas empresas. Examinamos como o retorno a padrões web nativos (ES6 Modules, Vanilla JS e PHP moderno) está transformando a produtividade de equipes de alto rendimento.</p>'
                    }),
                    BlockFactory.createButtonAtom({
                      value: 'Continuar Lendo o Artigo →',
                      link: 'https://example.com/artigo-capa',
                      settings: {
                        align: 'left',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        spacing: { padding: [12, 22, 12, 22] }
                      }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Duas Colunas Secundárias
        BlockFactory.createBlock({
          label: 'Matérias em Destaque (2 Colunas)',
          settings: {
            backgroundColor: '#ffffff',
            border: { width: 1, style: 'solid', color: '#f1f5f9' },
            spacing: { padding: [24, 24, 24, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 20, collapseOnMobile: true },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '50%', verticalAlign: 'top' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
                      alt: 'Matéria 1',
                      settings: { width: 260, height: 150, borderRadius: 6, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h4 style="margin: 12px 0 6px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">O Fim das Quebras no Outlook 365</h4><p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; line-height: 1.5;">Entenda como as tabelas fantasmas e espaçadores automáticos blindam seus e-mails.</p><a href="https://example.com" style="color: #2563eb; font-weight: 700; font-size: 13px; text-decoration: none;">Ler Estudo →</a>'
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: '50%', verticalAlign: 'top' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
                      alt: 'Matéria 2',
                      settings: { width: 260, height: 150, borderRadius: 6, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h4 style="margin: 12px 0 6px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">Segurança OWASP em E-mails</h4><p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; line-height: 1.5;">Checklist definitivo para sanitização rigorosa de payloads e prevenção de XSS.</p><a href="https://example.com" style="color: #2563eb; font-weight: 700; font-size: 13px; text-decoration: none;">Acessar Guia →</a>'
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Rodapé
        BlockFactory.createBlock({
          label: 'Rodapé Institucional',
          settings: {
            backgroundColor: '#0f172a',
            spacing: { padding: [28, 24, 28, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createSocialAtom({
                      settings: { align: 'center', iconTheme: 'light', iconSize: 26, iconGap: 18, spacing: { margin: [0, 0, 14, 0] } }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-align: center;">News Mail Forge Editorial • Conhecimento Técnico Livre</p><p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;"><a href="https://example.com/unsub" style="color: #cbd5e1; text-decoration: underline;">Descadastrar</a> • <a href="https://example.com/prefs" style="color: #cbd5e1; text-decoration: underline;">Preferências</a></p>',
                      settings: { align: 'center' }
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
  // 2. EXECUTIVE SUMMIT INVITE
  // ==========================================
  {
    id: 'executive_summit',
    nameKey: 'PRESET_EXECUTIVE_SUMMIT_NAME',
    descriptionKey: 'PRESET_EXECUTIVE_SUMMIT_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" rx="4" fill="#07070D"/><rect x="15" y="8" width="90" height="64" rx="2" fill="#0D0D18" stroke="#1F1F35"/><rect x="35" y="14" width="50" height="4" rx="1" fill="#F59E0B"/><rect x="25" y="22" width="70" height="8" rx="1" fill="#FFFFFF"/><circle cx="28" cy="38" r="3" fill="#F59E0B"/><rect x="36" y="36" width="55" height="4" rx="1" fill="#E2E8F0"/><circle cx="28" cy="48" r="3" fill="#F59E0B"/><rect x="36" y="46" width="55" height="4" rx="1" fill="#E2E8F0"/><rect x="35" y="58" width="50" height="8" rx="2" fill="#F59E0B"/></svg>`,
    create: () => BlockFactory.createDocument({
      title: 'Executive Summit 2026 — Convite Exclusivo',
      generalSettings: BlockFactory.createGeneralSettings({
        previewText: 'Confirmação de Acesso VIP ao Executive Summit 2026. Confira os horários e credenciamento.',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: { color: '#07070d' },
        bodyBackground: { color: '#0D0D18' },
        textColor: '#ffffff'
      }),
      blocks: [
        // Bloco Hero Escuro (#0D0D18 com Ghost Table MSO sincronizada)
        BlockFactory.createBlock({
          label: 'Hero VIP Fundo Escuro',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [36, 24, 28, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<span style="display: inline-block; padding: 4px 14px; background-color: #f59e0b; color: #0D0D18; font-size: 11px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 14px;">CONVITE EXCLUSIVO VIP</span><h1 style="margin: 0 0 14px 0; font-size: 28px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.25;">Executive Tech Summit 2026</h1><p style="margin: 0 0 20px 0; font-size: 16px; color: #cbd5e1; text-align: center; line-height: 1.55;">Sua experiência de liderança e inovação está confirmada no Grand Hall.</p><div style="margin: 0 auto 24px auto; max-width: 440px; padding: 12px 20px; background-color: #161626; border: 1px solid #282845; border-radius: 6px; text-align: center; font-size: 14px; color: #f59e0b; font-weight: 700;">📅 18 de Novembro de 2026 • São Paulo/SP</div>',
                      settings: { align: 'center', color: '#ffffff' }
                    }),
                    BlockFactory.createButtonAtom({
                      value: 'Confirmar Minha Credencial VIP',
                      link: 'https://example.com/credencial',
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
        }),

        // Seção Contínua de Cronograma (Blocos individuais de 1 Linha com Colunas)
        BlockFactory.createBlock({
          label: 'Cabeçalho do Cronograma',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [16, 24, 8, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'left' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #f59e0b; border-bottom: 1px solid #282845; padding-bottom: 8px;">Cronograma e Orientações Importantes</h3>',
                      settings: { color: '#ffffff' }
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Item 1: Relógio / Abertura
        BlockFactory.createBlock({
          label: 'Cronograma: Credenciamento',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [6, 24, 6, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/40x40/f59e0b/0D0D18?text=%E2%8F%B0',
                      alt: 'Horário',
                      settings: { width: 36, height: 36, align: 'center' }
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 18] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 16px; color: #ffffff; line-height: 1.45;"><strong style="color: #f59e0b;">08h30:</strong> Credenciamento VIP e Welcome Coffee exclusivo no Lounge Principal.</p>',
                      settings: { color: '#ffffff' }
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Item 2: Keynote
        BlockFactory.createBlock({
          label: 'Cronograma: Painel de Abertura',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [6, 24, 6, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/40x40/f59e0b/0D0D18?text=%E2%98%85',
                      alt: 'Keynote',
                      settings: { width: 36, height: 36, align: 'center' }
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 18] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 16px; color: #ffffff; line-height: 1.45;"><strong style="color: #f59e0b;">09h30:</strong> Painel de Abertura: Arquiteturas de Alta Confiabilidade para 2027.</p>',
                      settings: { color: '#ffffff' }
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Item 3: Almoço / Networking
        BlockFactory.createBlock({
          label: 'Cronograma: Almoço Executivo',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [6, 24, 6, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/40x40/f59e0b/0D0D18?text=%F0%9F%8D%BD',
                      alt: 'Almoço',
                      settings: { width: 36, height: 36, align: 'center' }
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 18] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 16px; color: #ffffff; line-height: 1.45;"><strong style="color: #f59e0b;">12h30:</strong> Almoço Executivo & Sessão Privada de Rodadas de Negócios.</p>',
                      settings: { color: '#ffffff' }
                    })
                  ]
                })
              ]
            })
          ]
        }),
        // Item 4: Transfers e Retorno
        BlockFactory.createBlock({
          label: 'Cronograma: Encerramento',
          settings: {
            backgroundColor: '#0D0D18',
            spacing: { padding: [6, 24, 28, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '48px', verticalAlign: 'middle', horizontalAlign: 'center', spacing: { padding: [0, 0, 0, 0] } },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/40x40/f59e0b/0D0D18?text=%F0%9F%9A%90',
                      alt: 'Vans',
                      settings: { width: 36, height: 36, align: 'center' }
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: 'auto', verticalAlign: 'middle', horizontalAlign: 'left', spacing: { padding: [0, 0, 0, 18] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 16px; color: #ffffff; line-height: 1.45;"><strong style="color: #f59e0b;">18h00:</strong> Encerramento e saída de vans executivas para Congonhas e Guarulhos.</p>',
                      settings: { color: '#ffffff' }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Card de Suporte / Acessibilidade
        BlockFactory.createBlock({
          label: 'Card de Acessibilidade e Suporte',
          settings: {
            backgroundColor: '#161626',
            borderRadius: 8,
            border: { width: 1, style: 'solid', color: '#282845' },
            spacing: { padding: [20, 20, 20, 20] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<h4 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 700; color: #ffffff; text-align: center;">Necessidades Especiais ou Acessibilidade?</h4><p style="margin: 0 0 14px 0; font-size: 14px; color: #94a3b8; text-align: center;">Nossa equipe de concierge está à disposição via canal prioritário.</p>',
                      settings: { align: 'center' }
                    }),
                    BlockFactory.createButtonAtom({
                      value: 'Falar com Concierge Executivo',
                      link: 'https://api.whatsapp.com/send?phone=551131928912',
                      settings: {
                        backgroundColor: '#282845',
                        color: '#ffffff',
                        border: { width: 1, style: 'solid', color: '#f59e0b' },
                        spacing: { padding: [10, 20, 10, 20] }
                      }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Rodapé Noturno
        BlockFactory.createBlock({
          label: 'Rodapé Summit',
          settings: {
            backgroundColor: '#07070d',
            spacing: { padding: [24, 24, 28, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6;">Ingresso pessoal e intransferível. Traje sugerido: Esporte Fino.<br>© 2026 Executive Summit. Todos os direitos reservados.</p>',
                      settings: { align: 'center' }
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
  // 3. SAAS PRODUCT LAUNCH
  // ==========================================
  {
    id: 'saas_launch',
    nameKey: 'PRESET_SAAS_LAUNCH_NAME',
    descriptionKey: 'PRESET_SAAS_LAUNCH_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" rx="4" fill="#F8FAFC"/><rect x="15" y="8" width="90" height="64" rx="2" fill="#FFFFFF"/><rect x="25" y="14" width="70" height="6" rx="1" fill="#2563EB"/><rect x="25" y="24" width="70" height="12" rx="2" fill="#0F172A"/><rect x="20" y="42" width="24" height="16" rx="2" fill="#E2E8F0"/><rect x="48" y="42" width="24" height="16" rx="2" fill="#E2E8F0"/><rect x="76" y="42" width="24" height="16" rx="2" fill="#E2E8F0"/><rect x="35" y="62" width="50" height="6" rx="2" fill="#2563EB"/></svg>`,
    create: () => BlockFactory.createDocument({
      title: 'Lançamento Oficial — News Mail Forge 2.0',
      generalSettings: BlockFactory.createGeneralSettings({
        previewText: 'Conheça a nova versão 2.0 com suporte a 8 categorias e Ghost Tables MSO.',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: { color: '#f8fafc' },
        bodyBackground: { color: '#ffffff' }
      }),
      blocks: [
        // Navbar com Logo
        BlockFactory.createBlock({
          label: 'Barra Superior',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [16, 24, 16, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 16, collapseOnMobile: false },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '40%', verticalAlign: 'middle' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/150x38/2563eb/ffffff?text=FORGE+2.0',
                      alt: 'News Mail Forge',
                      settings: { width: 130, height: 32, align: 'left' }
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: '60%', verticalAlign: 'middle', horizontalAlign: 'right' },
                  children: [
                    BlockFactory.createMenuAtom({
                      items: [
                        { label: 'Recursos', url: 'https://example.com/features' },
                        { label: 'Documentação', url: 'https://example.com/docs' }
                      ],
                      settings: { align: 'right', itemGap: 16 }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Hero Principal com Badge e Imagem de Dashboard
        BlockFactory.createBlock({
          label: 'Apresentação Hero',
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
                      value: '<span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; border-radius: 9999px; margin-bottom: 12px;">LANÇAMENTO OFICIAL 2.0</span><h1 style="margin: 0 0 12px 0; font-size: 30px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.25;">O E-mail Marketing que os Desenvolvedores Sempre Quiseram</h1><p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; text-align: center; line-height: 1.55;">Zero Node.js no cliente, compilação instantânea de tabelas blindadas e integração direta com qualquer sistema PHP.</p>',
                      settings: { align: 'center' }
                    }),
                    BlockFactory.createButtonAtom({
                      value: 'Experimentar Gratuitamente',
                      link: 'https://example.com/trial',
                      settings: {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: 16,
                        borderRadius: 6,
                        spacing: { padding: [14, 32, 14, 32] }
                      }
                    }),
                    BlockFactory.createImageAtom({
                      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
                      alt: 'Editor Preview',
                      settings: { width: 552, height: 280, borderRadius: 8, align: 'center', spacing: { margin: [24, 0, 0, 0] } }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Grid 3 Colunas com Gap Spacers
        BlockFactory.createBlock({
          label: 'Grid de 3 Benefícios',
          settings: {
            backgroundColor: '#f8fafc',
            border: { width: 1, style: 'solid', color: '#e2e8f0' },
            spacing: { padding: [28, 24, 28, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 16, collapseOnMobile: true },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '33.33%', backgroundColor: '#ffffff', borderRadius: 8, spacing: { padding: [16, 12, 16, 12] }, horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/44x44/2563eb/ffffff?text=%E2%9A%A1',
                      alt: 'Desempenho',
                      settings: { width: 40, height: 40, borderRadius: 20, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h5 style="margin: 10px 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a; text-align: center;">Ultra Rápido</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">Zero dependências pesadas de bundle.</p>'
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: '33.33%', backgroundColor: '#ffffff', borderRadius: 8, spacing: { padding: [16, 12, 16, 12] }, horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/44x44/10b981/ffffff?text=%F0%9F%9B%A1%EF%B8%8F',
                      alt: 'Blindado',
                      settings: { width: 40, height: 40, borderRadius: 20, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h5 style="margin: 10px 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a; text-align: center;">Anti-Quebra MSO</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">Ghost Tables contra linhas de subpixel.</p>'
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: '33.33%', backgroundColor: '#ffffff', borderRadius: 8, spacing: { padding: [16, 12, 16, 12] }, horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/44x44/8b5cf6/ffffff?text=%F0%9F%94%97',
                      alt: 'Bridge',
                      settings: { width: 40, height: 40, borderRadius: 20, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h5 style="margin: 10px 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a; text-align: center;">Bridge Agnóstico</h5><p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">Grava no banco via PDO ou Callbacks.</p>'
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Rodapé Corporativo
        BlockFactory.createBlock({
          label: 'Rodapé SaaS',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [24, 24, 24, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.6;">News Mail Forge Open Source • Licença MIT<br>Desenvolvido com excelência técnica por Uziel Almeida Oliveira (uzielweb).</p>',
                      settings: { align: 'center' }
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
  // 4. ORDER & SYSTEM RECEIPT
  // ==========================================
  {
    id: 'order_receipt',
    nameKey: 'PRESET_ORDER_RECEIPT_NAME',
    descriptionKey: 'PRESET_ORDER_RECEIPT_DESC',
    thumbnailSvg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" rx="4" fill="#F1F5F9"/><rect x="15" y="8" width="90" height="64" rx="2" fill="#FFFFFF"/><circle cx="60" cy="18" r="6" fill="#16A34A"/><rect x="35" y="28" width="50" height="5" rx="1" fill="#0F172A"/><rect x="25" y="38" width="70" height="14" rx="1" fill="#F8FAFC" stroke="#E2E8F0"/><line x1="25" y1="44" x2="95" y2="44" stroke="#E2E8F0" stroke-width="1"/><rect x="65" y="58" width="30" height="6" rx="1" fill="#16A34A"/></svg>`,
    create: () => BlockFactory.createDocument({
      title: 'Comprovante de Pagamento — Pedido #NMF-4820',
      generalSettings: BlockFactory.createGeneralSettings({
        previewText: 'Seu pagamento foi confirmado com sucesso. Visualize o recibo detalhado.',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: { color: '#f1f5f9' },
        bodyBackground: { color: '#ffffff' }
      }),
      blocks: [
        // Topo com Logo e Selo de Confirmação
        BlockFactory.createBlock({
          label: 'Cabeçalho do Recibo',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [32, 24, 20, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%', horizontalAlign: 'center' },
                  children: [
                    BlockFactory.createImageAtom({
                      src: 'https://placehold.co/60x60/16a34a/ffffff?text=%E2%9C%93',
                      alt: 'Aprovado',
                      settings: { width: 50, height: 50, borderRadius: 25, align: 'center' }
                    }),
                    BlockFactory.createTextAtom({
                      value: '<h2 style="margin: 16px 0 6px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Pagamento Aprovado</h2><p style="margin: 0; font-size: 15px; color: #475569; text-align: center;">Pedido <strong>#NMF-4820</strong> • 05 de Novembro de 2026</p>',
                      settings: { align: 'center' }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Tabela Discriminada de Itens
        BlockFactory.createBlock({
          label: 'Itens Faturados',
          settings: {
            backgroundColor: '#ffffff',
            border: { width: 1, style: 'solid', color: '#e2e8f0' },
            spacing: { padding: [20, 24, 20, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 0 },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '100%' },
                  children: [
                    BlockFactory.createTextAtom({
                      value: `<table role="presentation" border="0" cellpadding="8" cellspacing="0" width="100%" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
  <thead>
    <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">
      <th style="padding: 8px 4px;">Produto / Licença</th>
      <th style="padding: 8px 4px; text-align: center;">Qtd</th>
      <th style="padding: 8px 4px; text-align: right;">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f5f9; color: #0f172a;">
      <td style="padding: 12px 4px;"><strong>News Mail Forge — Licença Comercial</strong><br><span style="font-size: 12px; color: #64748b;">Chave: NMF-ENTERPRISE-2026-X49</span></td>
      <td style="padding: 12px 4px; text-align: center;">1</td>
      <td style="padding: 12px 4px; text-align: right;">R$ 490,00</td>
    </tr>
    <tr style="border-bottom: 1px solid #f1f5f9; color: #0f172a;">
      <td style="padding: 12px 4px;"><strong>Pacote de Suporte Prioritário (12 meses)</strong></td>
      <td style="padding: 12px 4px; text-align: center;">1</td>
      <td style="padding: 12px 4px; text-align: right;">R$ 200,00</td>
    </tr>
    <tr style="color: #475569;">
      <td colspan="2" style="padding: 12px 4px; text-align: right;">Subtotal:</td>
      <td style="padding: 12px 4px; text-align: right;">R$ 690,00</td>
    </tr>
    <tr style="color: #475569;">
      <td colspan="2" style="padding: 4px 4px; text-align: right;">Desconto Aplicado (Cupom FORGE):</td>
      <td style="padding: 4px 4px; text-align: right; color: #dc2626;">- R$ 90,00</td>
    </tr>
    <tr style="border-top: 2px solid #0f172a; color: #0f172a; font-size: 16px;">
      <td colspan="2" style="padding: 14px 4px; text-align: right;"><strong>Valor Total Cobrado:</strong></td>
      <td style="padding: 14px 4px; text-align: right; color: #16a34a;"><strong>R$ 600,00</strong></td>
    </tr>
  </tbody>
</table>`
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Informações de Acesso e Suporte (2 Colunas)
        BlockFactory.createBlock({
          label: 'Instruções de Acesso',
          settings: {
            backgroundColor: '#ffffff',
            spacing: { padding: [20, 24, 24, 24] }
          },
          rows: [
            BlockFactory.createRow({
              settings: { gap: 16, collapseOnMobile: true },
              cells: [
                BlockFactory.createCell({
                  settings: { width: '50%', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [16, 16, 16, 16] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 6px;">Dados do Comprador</strong><p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Uziel Almeida Oliveira<br>contato@uzielweb.com.br<br>Cartão de Crédito final •••• 9241</p>'
                    })
                  ]
                }),
                BlockFactory.createCell({
                  settings: { width: '50%', backgroundColor: '#f8fafc', borderRadius: 6, spacing: { padding: [16, 16, 16, 16] } },
                  children: [
                    BlockFactory.createTextAtom({
                      value: '<strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 6px;">Próximos Passos</strong><p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Seus dados de acesso ao repositório privado foram liberados automaticamente.</p>'
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Rodapé de Atendimento
        BlockFactory.createBlock({
          label: 'Rodapé de Suporte',
          settings: {
            backgroundColor: '#f8fafc',
            border: { width: 1, style: 'solid', color: '#e2e8f0' },
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
                      value: '<p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">Dúvidas sobre esta cobrança? Responda a este e-mail ou entre em contato pelo suporte 24h.<br>© 2026 News Mail Forge Financeiro. Documento fiscal eletrônico.</p>',
                      settings: { align: 'center' }
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  }
];

export class BuiltinPresets {
  /**
   * Retorna a lista de todos os 4 presets com nomes e descrições traduzidos
   * @returns {Array<Object>}
   */
  static getAll() {
    return PRESETS.map(p => ({
      ...p,
      name: I18n.t(p.nameKey, p.id),
      description: I18n.t(p.descriptionKey, '')
    }));
  }

  /**
   * Busca um preset por ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getById(id) {
    const aliasMap = {
      'summit_invite': 'executive_summit',
      'product_launch': 'saas_launch'
    };
    const targetId = aliasMap[id] || id;
    const found = PRESETS.find(p => p.id === targetId);
    if (!found) return null;
    return {
      ...found,
      name: I18n.t(found.nameKey, found.id),
      description: I18n.t(found.descriptionKey, '')
    };
  }

  /**
   * Constrói e retorna um novo DocumentNode baseado no preset escolhido
   * @param {string} id
   * @returns {Object|null}
   */
  static createPreset(id) {
    const aliasMap = {
      'summit_invite': 'executive_summit',
      'product_launch': 'saas_launch'
    };
    const targetId = aliasMap[id] || id;
    const found = PRESETS.find(p => p.id === targetId);
    if (!found || typeof found.create !== 'function') {
      return null;
    }
    return found.create();
  }
}

// Vincula chaves de ID no array PRESETS para acesso direto por nome ou iteração
PRESETS.forEach((p) => {
  if (p && p.id) {
    PRESETS[p.id] = p;
  }
});

export default BuiltinPresets;
