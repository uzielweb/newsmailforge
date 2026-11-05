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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — <?php echo htmlspecialchars(Lang::t('preset.newsletter', 'Newsletter')); ?></title>
  <link rel="stylesheet" href="../dist-vanilla/css/editor.css">
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
    import { mount } from '../dist-vanilla/js/NewsMailForge.js';

    // Inicializa o Studio com persistência direta no backend PHP Bridge
    const editor = mount('#editor-container', {
      preset: 'editorial_digest',
      locale: 'pt-BR',
      saveEndpoint: 'api-bridge.php',
      maxHistory: 50
    });

    window.editor = editor;
  </script>
</body>
</html>

