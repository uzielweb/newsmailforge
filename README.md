# NewsMailForge

> **High-Performance, Framework-Agnostic Responsive Email Visual Studio & Builder** — combining a zero-dependency **Vanilla JS ES6 Visual Studio** with a modular, extensible **PSR-4 PHP Bridge** for any CMS, framework, or custom application.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-777BB4.svg)](https://www.php.net/)
[![Standards](https://img.shields.io/badge/Standards-PSR--4%20%7C%20OWASP-green.svg)](https://www.php-fig.org/)
[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-0ea5e9.svg)](https://uzielweb.github.io/newsmailforge/)

> 🔗 **Interactive Live Demo (GitHub Pages)**: **[https://uzielweb.github.io/newsmailforge/](https://uzielweb.github.io/newsmailforge/)**  
> 📖 **Full Technical Documentation**: **[`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)**

---

## ✨ Key Features & Highlights

1. **Unified, Intuitive 3-Level Visual Hierarchy (`Row ➔ Column ➔ Element`)**:
   - **Rows (`Linhas`)**: Top-level horizontal structural containers supporting 1 to 6 customizable columns (`100%`, `50/50`, `33/33/33`, `25/25/25/25`, `30/70`, `70/30`, or custom interactive percentages) with drag-and-drop placement above or below any row.
   - **Columns (`Colunas`)**: Responsive table cells with interactive drag-resizers on the canvas, empty-state quick-insert popovers (`+ Insert Content`), vertical alignment, background, and per-column padding controls.
   - **Elements (`Elementos`)**: Rich atomic components (**Text**, **Image**, **Button**, **Divider**, **Spacer**, **Menu**, **Social Networks**) that always drop cleanly inside columns or before/after sibling elements.
2. **Enterprise-Grade Vanilla JS Visual Studio (Zero Build Step)**:
   - Runs 100% natively in any modern browser via ES Modules (`dist-vanilla/js/NewsMailForge.js`) without React, Vue, Webpack, or Node.js runtime requirements.
   - **Custom Universal Color Picker (`ColorPickerPopover.js`)**: Floating 2D HSV saturation/value canvas, hue slider, 50 email-safe swatches, recent colors history (`localStorage`), `HEX`/`RGB`/`HSL` live switcher, and one-click `Transparent` support across the entire Inspector and Rich Text toolbar.
   - **In-Place Rich Text Editor (`InlineRichText.js`)**: Single-click editing with floating toolbar, dynamic Merge Tags (`{{first_name}}`, `{{email}}`, `{{unsubscribe_url}}`), and **Inline Image Framing & Link Manager** (supporting `Float Left`, `Float Right`, `Centered Block`, `Aligned Left/Right Block`, `Inline`, custom pixel width, alt text, and clickable `<a href="...">` wrapping).
   - **Customizable Social Networks Element**: Built-in crisp inline vector icons (`Facebook`, `Instagram`, `LinkedIn`, `X/Twitter`, `YouTube`, `GitHub`, `WhatsApp`, `Website`) with global or per-network custom icon color pickers, official brand colors theme, AND custom icon image URL (`customIconUrl`) replacement per network.
   - **Full-Width Preview Mode**: Collapses both left and right sidebars automatically to showcase Desktop (`600px`) and Mobile (`375px`) email rendering at 100% studio width.
3. **Bulletproof Outlook (Word Engine) & Mobile Email Compiler (`EmailCompiler.js`)**:
   - Compiles the JSON document tree into **XHTML 1.0 Transitional** table-based markup.
   - **MSO Conditional Ghost Tables** (`<!--[if mso]>...<![endif]-->`), **VML `<v:roundrect>` buttons**, physical `<td>` gap spacer columns, subpixel bleeding prevention, and `@media only screen and (max-width: 600px)` responsive stacking.
4. **Framework-Agnostic PHP Bridge (PSR-4 & MVC)**:
   - Drop-in backend integration for **Joomla 4/5/6**, **WordPress**, **Laravel**, **Symfony**, or custom PHP applications via three built-in drivers:
     - `JsonFileStorageDriver` (Zero-database file storage)
     - `ConfigurablePdoDriver` (Maps to any existing database table and column names)
     - `CallbackStorageDriver` (Hooks directly into any CMS ORM or service layer via closures)
5. **OWASP Security & Bilingual i18n (`pt-BR` & `en-GB`)**:
   - Strict XSS sanitization preserving Outlook MSO/VML comments, URL scheme whitelisting, SQL identifier regex validation, path traversal protection, and 100% key parity across `pt-BR` and `en-GB` dictionaries.

---

## 📁 Directory Structure

```text
newsmailforge/
├── index.html                      # Standalone full-screen Interactive Studio (GitHub Pages)
├── index.php                       # Local server entry point (redirects/serves the Studio)
├── bootstrap.php                   # PSR-4 autoloader and server-side i18n bootstrap
├── docs/
│   └── DOCUMENTATION.md            # Complete Architecture, SDK API & Integration Manual
├── dist-vanilla/                   # Front-End Visual SDK in pure ES6 Vanilla JS
│   ├── css/
│   │   └── editor.css              # 3-Column Studio layout, Overlays, Resizers & Popovers
│   └── js/
│       ├── NewsMailForge.js        # Public SDK Facade: mount(), getHtml(), getSchema(), setSchema()
│       ├── i18n/
│       │   └── I18n.js             # Reactive Vanilla JS i18n engine (with offline embedded fallback)
│       ├── core/
│       │   ├── BlockFactory.js     # Factory constructors for Document, Row, Column, and Elements
│       │   ├── Store.js            # Reactive state container, selection hierarchy, and Undo/Redo
│       │   └── EmailCompiler.js    # JSON -> XHTML 1.0 Transitional compiler (MSO + VML + Gap Spacers)
│       ├── catalog/
│       │   ├── BlockCatalog.js     # 24 Ready-made Row Models across 8 categories
│       │   └── BuiltinPresets.js   # 4 Complete, ready-to-use Email Templates
│       └── ui/
│           ├── HeaderBar.js        # Topbar (Templates, Undo/Redo, Viewport, MSO Code, Import/Export/Save)
│           ├── SidebarPanel.js     # Left Library (Rows & Columns, Custom Proportions, Elements, Ready Rows)
│           ├── TreeNavigator.js    # Interactive hierarchy tree (Row -> Column -> Element) with DnD
│           ├── CanvasStage.js      # Responsive stage (600px/375px), Selection Overlay & Column Resizers
│           ├── InlineRichText.js   # In-place rich text toolbar & Inline Image Framing/Link Popover
│           ├── InspectorPanel.js   # Context-aware right property inspector & visual column manager
│           ├── ColorPickerPopover.js # Universal floating HSV/HEX/RGB/HSL + 50-swatch color picker
│           └── ScrubNumberInput.js # Scrubbable numeric inputs with drag-to-adjust support
├── examples/
│   ├── api-bridge.php              # REST endpoint for the PHP Bridge
│   ├── 01-studio-full-demo.php     # Full Studio integrated with the PHP Bridge
│   ├── 02-form-textarea-binding.php# Standard HTML <form> & <textarea> ($_POST) integration
│   └── 03-custom-pdo-table-mapper.php # Custom PDO table/column mapping example
├── tests/
│   ├── run_tests.php               # Unified test runner + 3 Edge Invariant Metatests (76 assertions)
│   └── test_core_compiler.mjs      # Node.js ES Module test suite for Store, Compiler & UI components
├── language/
│   ├── en-GB/
│   │   └── en-GB.json              # British English dictionary (334 keys)
│   └── pt-BR/
│       └── pt-BR.json              # Brazilian Portuguese dictionary (334 keys)
├── src/
│   ├── Contracts/
│   │   └── StorageDriverInterface.php  # Agnostic persistence contract
│   ├── Controller/
│   │   └── BridgeController.php        # REST controller (strictly <= 15 lines per action)
│   ├── Core/
│   │   ├── Lang.php                    # Server-side translation manager
│   │   ├── Request.php                 # HTTP request wrapper
│   │   ├── Response.php                # JSON HTTP response wrapper
│   │   └── SecurityGuard.php           # OWASP sanitizer (HTML, URL, Schema depth)
│   ├── Drivers/
│   │   ├── CallbackStorageDriver.php   # Closure-based driver (Joomla/WordPress/Laravel)
│   │   ├── ConfigurablePdoDriver.php   # Parameterized PDO driver with SQL identifier validation
│   │   └── JsonFileStorageDriver.php   # Zero-DB JSON file storage driver
│   ├── DTO/
│   │   └── EmailDocumentDTO.php        # Immutable, strictly typed Email Document DTO
│   └── Service/
│       └── EmailBridgeService.php      # Validation and persistence orchestrator
├── storage/                            # Default local directory for JSON storage
├── LICENSE                             # MIT License
└── README.md
```

---

## ⚡ Quick Start

### 1. Front-End Standalone (Vanilla JS ES Modules)

Mount the complete Visual Studio inside any container element with zero build tools:

```html
<link rel="stylesheet" href="./dist-vanilla/css/editor.css" />
<div id="email-studio" style="height: 100vh;"></div>

<script type="module">
  import { NewsMailForge } from './dist-vanilla/js/NewsMailForge.js';

  const editor = NewsMailForge.mount('#email-studio', {
    locale: 'en-GB', // or 'pt-BR'
    preset: 'welcome', // 'welcome' | 'newsletter' | 'promotion' | 'transactional'
    apiEndpoint: './examples/api-bridge.php', // optional PHP Bridge endpoint
    onSave: ({ html, schema }) => {
      console.log('Compiled Outlook-ready HTML:', html);
      console.log('JSON AST Schema:', schema);
    },
    onChange: ({ html, schema }) => {
      // Real-time synchronization (e.g., hidden <textarea>)
    }
  });
</script>
```

### 2. Binding to an Existing HTML `<form>` / `<textarea>`

```javascript
import { NewsMailForge } from './dist-vanilla/js/NewsMailForge.js';

const htmlInput = document.querySelector('#newsletter_html');
const jsonInput = document.querySelector('#newsletter_json');

const studio = NewsMailForge.mount('#studio-container', {
  locale: 'en-GB',
  initialSchema: jsonInput.value ? JSON.parse(jsonInput.value) : null,
  onChange: ({ html, schema }) => {
    htmlInput.value = html;
    jsonInput.value = JSON.stringify(schema);
  }
});
```

---

## 🔌 PHP Bridge Integration Examples

### 1. Zero-Database Mode (`JsonFileStorageDriver`)

```php
require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Drivers\JsonFileStorageDriver;
use NewsMailForge\Service\EmailBridgeService;
use NewsMailForge\Controller\BridgeController;

$driver = new JsonFileStorageDriver(__DIR__ . '/storage');
$service = new EmailBridgeService($driver);
$controller = new BridgeController($service);

$controller->handleRequest()->send();
```

### 2. Custom Database Table Mapping (`ConfigurablePdoDriver`)

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

### 3. CMS & Framework Integration (`CallbackStorageDriver` for Joomla, WordPress, Laravel)

```php
require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Drivers\CallbackStorageDriver;
use NewsMailForge\Service\EmailBridgeService;
use NewsMailForge\Controller\BridgeController;
use NewsMailForge\DTO\EmailDocumentDTO;

$driver = new CallbackStorageDriver(
    onSave: function (EmailDocumentDTO $dto): array {
        $id = $dto->id ?? uniqid('tpl_');
        // Save via Joomla Table / Laravel Eloquent / WordPress $wpdb
        return ['id' => $id, 'success' => true];
    },
    onLoad: function (string $id): ?EmailDocumentDTO {
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

## 🛡️ Security Architecture (OWASP)

- **HTML Sanitization (`SecurityGuard::sanitizeHtml`)**:
  - Strips executable tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<form>`).
  - Removes inline event handlers (`onclick`, `onload`, `onerror`, etc.).
  - Blocks dangerous URI schemes (`javascript:`, `vbscript:`, `data:text/html`).
  - **Preserves Microsoft Outlook conditional comments** (`<!--[if mso]>...<![endif]-->`) and **VML vector shapes** (`<v:roundrect>`, `<v:fill>`, `<v:stroke>`, `<w:anchorlock/>`).
- **URL Sanitization (`SecurityGuard::sanitizeUrl` & `escapeHref`)**:
  - Whitelists `https://`, `http://`, `mailto:`, `tel:`, and `#` anchors.
- **AST Depth Guard (`SecurityGuard::validateSchema`)**:
  - Prevents stack overflow and JSON bomb DoS attacks by enforcing a maximum tree depth of 12 levels.
- **Anti-SQL Injection (`ConfigurablePdoDriver`)**:
  - Enforces strict `^[a-zA-Z0-9_]+$` identifier validation on table and column names alongside 100% prepared PDO statements.
- **Anti-Path Traversal (`JsonFileStorageDriver`)**:
  - Validates document IDs against `^[a-zA-Z0-9_\-]+$`.

---

## 🧪 Running the Test Suite

NewsMailForge includes a unified test runner verifying **UTF-8 No BOM encoding**, **PHP & JS syntax (`php -l` & `node --check`)**, **100% bidirectional i18n parity**, **MVC controller line limits**, **3 Edge Invariant Metatests**, and **JS Compiler/DOM simulations**:

```bash
# Run the complete PHP + Node.js verification suite (76 assertions)
php tests/run_tests.php

# Run the standalone Node.js ES Module compiler & UI test suite
node tests/test_core_compiler.mjs
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

**Author**: Uziel Almeida Oliveira ([uzielweb](https://github.com/uzielweb))
