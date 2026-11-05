# NewsMailForge

> Construtor e Editor de E-mails Responsivos Agnóstico de Alta Performance, combinando Studio Vanilla JS (zero dependências pesadas) e um PHP Bridge modular e extensível para qualquer CMS, framework ou aplicação nativa.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-777BB4.svg)](https://www.php.net/)
[![Standards](https://img.shields.io/badge/Standards-PSR--4%20%7C%20OWASP-green.svg)](https://www.php-fig.org/)
[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-0ea5e9.svg)](https://uzielweb.github.io/newsmailforge/)

> 🔗 **Demo Interativo (GitHub Pages)**: **[https://uzielweb.github.io/newsmailforge/](https://uzielweb.github.io/newsmailforge/)**

---

## 🚀 Visão Geral

O **NewsMailForge** foi concebido para resolver o problema de criação e edição de e-mails de marketing e transacionais sem aprisionamento a frameworks pesados (React/Vue/Webpack/Vite no core de edição). Ele entrega:

1. **Studio Client-Side (Vanilla JS)**: Opera 100% no navegador ou via GitHub Pages, com i18n offline nativo e drag-and-drop limpo.
2. **PHP Bridge Agnóstico (PSR-4)**: Integração em minutos com qualquer ecossistema:
   - **Joomla 4 / 5 / 6**
   - **WordPress**
   - **Laravel / Symfony**
   - **Aplicações legadas e bancos de dados customizados via PDO ou Callbacks**
3. **Segurança OWASP em Primeiro Lugar**: Sanitização rigorosa contra XSS, sanitização de esquemas de URL, proteção contra injeção SQL em drivers e limitação de profundidade de nós.
4. **Zero Hardcoded Strings**: Toda a interface e mensagens de sistema utilizam o motor de tradução agnóstico (`pt-BR` e `en-GB`).

---

## 📁 Estrutura de Diretórios

```
newsmailforge/
├── index.html                      # Demo interativo full-screen (GitHub Pages / Standalone)
├── bootstrap.php                   # Autoloader PSR-4 e inicialização de i18n
├── dist-vanilla/                   # SDK Visual Front-End em Vanilla JS ES6 (Zero Node.js)
│   ├── css/
│   │   └── editor.css              # Layout Studio 3 colunas, Flyout Drawer, Overlay e Toolbar
│   └── js/
│       ├── NewsMailForge.js        # Fachada pública: mount(), getHtml(), getSchema(), setSchema()
│       ├── i18n/
│       │   └── I18n.js             # Módulo Vanilla JS i18n (offline fallback embutido)
│       ├── core/
│       │   ├── BlockFactory.js     # Construtores de Document, Block, Row, Cell e Atoms
│       │   ├── Store.js            # Estado reativo, Seleção 5 níveis e Undo/Redo
│       │   └── EmailCompiler.js    # Compilador JSON -> HTML Tabelado (Gap Spacers + MSO + VML)
│       ├── catalog/
│       │   ├── BlockCatalog.js     # 24 Blocos modulares nas 8 categorias
│       │   └── BuiltinPresets.js   # 4 Templates completos originais e agnósticos
│       └── ui/
│           ├── HeaderBar.js        # Topbar (Presets, Undo/Redo, Viewport, Código MSO, Export/Save)
│           ├── SidebarPanel.js     # Biblioteca com Flyout Drawer + Aba de Árvore
│           ├── TreeNavigator.js    # Árvore recursiva com linha de inserção '+'
│           ├── CanvasStage.js      # Palco responsivo (600px/375px) + Selection Overlay
│           ├── InlineRichText.js   # Edição rich-text in-place com barra flutuante
│           ├── InspectorPanel.js   # Inspetor contextual de 5 níveis
│           └── ScrubNumberInput.js # Inputs numéricos arrastáveis (scrubbable)
├── examples/
│   ├── api-bridge.php              # Endpoint REST do PHP Bridge
│   ├── 01-studio-full-demo.php     # Studio completo integrado ao PHP Bridge
│   ├── 02-form-textarea-binding.php# Integração via <form> e <textarea> ($_POST)
│   └── 03-custom-pdo-table-mapper.php # Mapeamento customizado de tabela/colunas via PDO
├── tests/
│   ├── run_tests.php               # Suíte unificada + Metatestes das 3 Invariantes de Borda
│   └── test_core_compiler.mjs      # Testes do compilador MSO/VML e Store JS
├── language/
│   ├── en-GB/
│   │   └── en-GB.json             # Dicionário Inglês Britânico
│   └── pt-BR/
│       └── pt-BR.json             # Dicionário Português do Brasil
├── src/
│   ├── Contracts/
│   │   └── StorageDriverInterface.php  # Contrato agnóstico de persistência
│   ├── Controller/
│   │   └── BridgeController.php        # Controlador REST (<= 15 linhas por action)
│   ├── Core/
│   │   ├── Lang.php                    # Gerenciador agnóstico de traduções
│   │   ├── Request.php                 # Wrapper agnóstico de requisição HTTP
│   │   ├── Response.php                # Wrapper agnóstico de resposta JSON
│   │   └── SecurityGuard.php           # Sanitizador OWASP (HTML, URL, Schema)
│   ├── Drivers/
│   │   ├── CallbackStorageDriver.php   # Driver baseado em Closures (Joomla/WP/Laravel)
│   │   ├── ConfigurablePdoDriver.php   # Driver PDO parametrizado (anti-SQLi)
│   │   └── JsonFileStorageDriver.php   # Driver baseado em arquivos JSON (zero-db)
│   ├── DTO/
│   │   └── EmailDocumentDTO.php        # DTO com imutabilidade e tipagem estrita
│   └── Service/
│       └── EmailBridgeService.php      # Orquestrador de validação e persistência
├── storage/                            # Diretório local padrão para armazenamento JSON
│   └── .gitkeep
├── LICENSE                             # Licença MIT
└── README.md
```

---

## 🛡️ Segurança (OWASP)

- **Sanitização de HTML (`SecurityGuard::sanitizeHtml`)**:
  - Elimina tags executáveis (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<form>`).
  - Remove manipuladores de evento (`onclick`, `onload`, `onerror`, etc.).
  - Remove URLs com esquemas maliciosos (`javascript:`, `vbscript:`, `data:text/html`).
  - **Preserva comentários condicionais MSO (`<!--[if mso]>...<![endif]-->`)** essenciais para renderização no Microsoft Outlook.
  - **Preserva namespaces e formas VML** (`<v:roundrect>`, `<v:fill>`, `<v:stroke>`, `<w:anchorlock/>`).
- **Sanitização de URLs (`SecurityGuard::sanitizeUrl`)**:
  - Aceita apenas esquemas seguros: `https://`, `http://`, `mailto:`, `tel:`, além de links âncora `#`.
- **Validação de Profundidade de Árvore (`SecurityGuard::validateSchema`)**:
  - Previne estouro de pilha e ataques de negação de serviço (DoS) por JSON aninhado, limitando a profundidade da árvore a 12 níveis.
- **Proteção Anti-SQL Injection (`ConfigurablePdoDriver`)**:
  - Validação estrita por expressão regular `^[a-zA-Z0-9_]+$` para qualquer nome de tabela ou coluna.
  - Execução 100% parametrizada via Prepared Statements PDO.
- **Proteção Anti-Path Traversal (`JsonFileStorageDriver`)**:
  - Validação de identificadores de documento com `^[a-zA-Z0-9_\-]+$`.

---

## 🌐 Internacionalização (i18n)

### Uso no PHP

```php
use NewsMailForge\Core\Lang;

// Inicializa o idioma desejado (padrão 'pt-BR')
Lang::init('pt-BR');

// Obtém mensagem traduzida com interpolação de parâmetros
$mensagem = Lang::t('bridge.success.save');
$formatada = Lang::t('bridge.error.invalid_sql_identifier', ['identifier' => 'unsafe_col;']);
```

### Uso no JavaScript (Vanilla)

```javascript
import i18n, { I18n } from './dist-vanilla/js/i18n/I18n.js';

// Tradução imediata
console.log(i18n.t('ui.save')); // "Salvar"

// Alternar idioma em tempo de execução
i18n.setLocale('en-GB');
console.log(i18n.t('ui.save')); // "Save"

// Registrar ouvintes para atualização reativa da UI
i18n.onLocaleChange((locale) => {
  console.log('Idioma alterado para:', locale);
});
```

---

## 🔌 Exemplos de Integração do PHP Bridge

### 1. Zero Banco (Armazenamento em Arquivos JSON)

```php
require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Drivers\JsonFileStorageDriver;
use NewsMailForge\Service\EmailBridgeService;
use NewsMailForge\Controller\BridgeController;

$driver = new JsonFileStorageDriver(__DIR__ . '/storage');
$service = new EmailBridgeService($driver);
$controller = new BridgeController($service);

$response = $controller->handleRequest();
$response->send();
```

### 2. Integração com Banco de Dados Existente (PDO)

```php
require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Drivers\ConfigurablePdoDriver;
use NewsMailForge\Service\EmailBridgeService;
use NewsMailForge\Controller\BridgeController;

$pdo = new PDO('mysql:host=localhost;dbname=myapp;charset=utf8mb4', 'user', 'pass', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$driver = new ConfigurablePdoDriver($pdo, [
    'table'             => 'my_newsletters',
    'id_column'         => 'uuid',
    'title_column'      => 'subject',
    'html_column'       => 'body_html',
    'json_column'       => 'builder_schema',
    'updated_at_column' => 'modified_at',
]);

$service = new EmailBridgeService($driver);
$controller = new BridgeController($service);

$controller->handleRequest()->send();
```

### 3. Integração em CMS (Joomla, WordPress, Laravel) via Callbacks

```php
require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Drivers\CallbackStorageDriver;
use NewsMailForge\Service\EmailBridgeService;
use NewsMailForge\Controller\BridgeController;
use NewsMailForge\DTO\EmailDocumentDTO;

$driver = new CallbackStorageDriver(
    onSave: function (EmailDocumentDTO $dto): array {
        // Exemplo: Salvar via Joomla JTable / ORM Laravel / WordPress wpdb
        $id = $dto->id ?? uniqid('tpl_');
        // MeuOrm::save(['id' => $id, 'title' => $dto->title, ...]);
        return ['id' => $id, 'success' => true];
    },
    onLoad: function (string $id): ?EmailDocumentDTO {
        // $record = MeuOrm::find($id);
        // return new EmailDocumentDTO($record->id, $record->title, ...);
        return null;
    },
    onList: function (int $limit): array {
        return [];
    },
    onDelete: function (string $id): bool {
        return true;
    }
);

$service = new EmailBridgeService($driver);
$controller = new BridgeController($service);
$controller->handleRequest()->send();
```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [`LICENSE`](LICENSE) para mais detalhes.

**Autor**: Uziel Almeida Oliveira ([uzielweb](https://github.com/uzielweb))
