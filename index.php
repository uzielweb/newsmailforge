<?php
/**
 * NewsMailForge - Inicializador Principal do Studio
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use NewsMailForge\Core\Lang;

Lang::init('pt-BR');

$cssVersion = file_exists(__DIR__ . '/dist-vanilla/css/editor.css') ? (string) filemtime(__DIR__ . '/dist-vanilla/css/editor.css') : '1.0.0';
$jsVersion  = file_exists(__DIR__ . '/dist-vanilla/js/NewsMailForge.js') ? (string) filemtime(__DIR__ . '/dist-vanilla/js/NewsMailForge.js') : '1.0.0';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — Studio Visual</title>
  <link rel="stylesheet" href="dist-vanilla/css/editor.css?v=<?php echo $cssVersion; ?>">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #090d16;
    }
    #studio-app {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="studio-app"></div>

  <script type="module">
    import { mount, NewsMailForge } from './dist-vanilla/js/NewsMailForge.js?v=<?php echo $jsVersion; ?>';

    const initEditor = () => {
      const editor = mount('#studio-app', {
        preset: 'editorial_digest',
        locale: 'pt-BR',
        maxHistory: 50,
        saveEndpoint: 'examples/api-bridge.php',
        onSave: async ({ doc, compiledHtml, schemaJson }) => {
          try {
            localStorage.setItem('newsmailforge_saved_doc', schemaJson);
            localStorage.setItem('newsmailforge_saved_html', compiledHtml);
          } catch (_) {}
        }
      });
      window.editorInstance = editor;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEditor);
    } else {
      initEditor();
    }
  </script>
</body>
</html>
