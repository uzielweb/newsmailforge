<?php

declare(strict_types=1);

/**
 * NewsMailForge - Exemplo 01: Full Studio Demo integrado ao PHP Bridge
 * Apresenta o estúdio completo em tela cheia com persistência ativa via AJAX POST
 * para o endpoint PHP Bridge agnóstico.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

require_once dirname(__DIR__) . '/bootstrap.php';

use NewsMailForge\Core\Lang;

Lang::init('pt-BR');

$cssVersion = file_exists(dirname(__DIR__) . '/dist-vanilla/css/editor.css') ? (string) filemtime(dirname(__DIR__) . '/dist-vanilla/css/editor.css') : '1.0.0';
$jsVersion  = file_exists(dirname(__DIR__) . '/dist-vanilla/js/NewsMailForge.js') ? (string) filemtime(dirname(__DIR__) . '/dist-vanilla/js/NewsMailForge.js') : '1.0.0';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — <?php echo htmlspecialchars(Lang::t('preset.newsletter', 'Newsletter')); ?></title>
  <link rel="stylesheet" href="../dist-vanilla/css/editor.css?v=<?php echo $cssVersion; ?>">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #090d16;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    #editor-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="editor-container"></div>

  <script type="module">
    import { mount } from '../dist-vanilla/js/NewsMailForge.js?v=<?php echo $jsVersion; ?>';

    const initEditor = () => {
      // Inicializa o Studio com persistência direta no backend PHP Bridge
      const editor = mount('#editor-container', {
        preset: 'editorial_digest',
        locale: 'pt-BR',
        saveEndpoint: 'api-bridge.php',
        maxHistory: 50
      });

      window.editor = editor;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEditor);
    } else {
      initEditor();
    }
  </script>
</body>
</html>

