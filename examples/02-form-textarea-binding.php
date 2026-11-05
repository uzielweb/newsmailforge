<?php

declare(strict_types=1);

/**
 * NewsMailForge - Exemplo 02: Vinculação com Formulário Tradicional ($_POST Binding)
 * Demonstra como integrar o editor em qualquer tela administrativa existente (Joomla,
 * WordPress, Laravel ou legado) sem requisições AJAX, vinculando o HTML compilado e o JSON
 * diretamente a campos <textarea> e <input type="hidden"> de um <form> tradicional.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

require_once dirname(__DIR__) . '/bootstrap.php';

use NewsMailForge\Core\Lang;
use NewsMailForge\Core\SecurityGuard;

Lang::init('pt-BR');

$message = null;
$savedSubject = '';
$savedHtmlLength = 0;
$savedBlocksCount = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $subject = trim((string) ($_POST['subject'] ?? ''));
    $rawHtml = (string) ($_POST['email_html'] ?? '');
    $rawJson = (string) ($_POST['email_json'] ?? '');

    // Sanitização e validação estrita (OWASP)
    $cleanHtml = SecurityGuard::sanitizeHtml($rawHtml);
    $parsedJson = json_decode($rawJson, true);

    if (is_array($parsedJson)) {
        try {
            $validatedSchema = SecurityGuard::validateSchema($parsedJson);
            $savedSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
            $savedHtmlLength = strlen($cleanHtml);
            $savedBlocksCount = count($validatedSchema['blocks'] ?? []);
            $message = Lang::t('bridge.success.save', 'Documento salvo com sucesso.');
        } catch (\Throwable $e) {
            $message = Lang::t('bridge.error.invalid_schema', 'Estrutura inválida: ') . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — Form Binding</title>
  <link rel="stylesheet" href="../dist-vanilla/css/editor.css">
  <style>
    body {
      background-color: #0b0f17;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 24px;
      margin: 0;
    }
    .demo-wrap {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .demo-header {
      border-bottom: 1px solid #1e293b;
      padding-bottom: 12px;
    }
    .demo-form-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .demo-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
    }
    .demo-input {
      height: 36px;
      padding: 0 12px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 4px;
      color: #ffffff;
      font-size: 13px;
      outline: none;
    }
    .demo-editor-frame {
      height: 650px;
      border: 1px solid #334155;
      border-radius: 6px;
      overflow: hidden;
    }
    .demo-alert {
      padding: 12px 16px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      border-radius: 6px;
      color: #34d399;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="demo-wrap">
    <div class="demo-header">
      <h2><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — Form &lt;textarea&gt; Binding</h2>
      <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">
        <?php echo htmlspecialchars(Lang::t('ui.library_hint', 'O editor sincroniza em tempo real com campos de formulário normais.')); ?>
      </p>
    </div>

    <?php if ($message): ?>
      <div class="demo-alert">
        <strong>✓ <?php echo htmlspecialchars($message); ?></strong><br>
        Assunto: <?php echo $savedSubject; ?> | Tamanho HTML: <?php echo $savedHtmlLength; ?> bytes | Blocos: <?php echo $savedBlocksCount; ?>
      </div>
    <?php endif; ?>

    <form method="POST" action="" class="demo-form-card">
      <label class="demo-label" for="subject">Assunto da Campanha:</label>
      <input type="text" id="subject" name="subject" class="demo-input" required value="Lançamento Oficial 2026">

      <!-- Campos ocultos sincronizados automaticamente pelo SDK -->
      <textarea id="email_html" name="email_html" style="display: none;"></textarea>
      <input type="hidden" id="email_json" name="email_json">

      <label class="demo-label">Corpo do E-mail (Editor Visual):</label>
      <div id="editor-wrapper" class="demo-editor-frame"></div>

      <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
        <button type="submit" class="nmf-btn nmf-btn-primary" style="height: 38px; padding: 0 20px; font-size: 13px;">
          <?php echo htmlspecialchars(Lang::t('ui.save', 'Salvar Formulário PHP')); ?>
        </button>
      </div>
    </form>
  </div>

  <script type="module">
    import { mount } from '../dist-vanilla/js/NewsMailForge.js';

    // Monta o editor apontando para os seletores dos campos do formulário
    mount('#editor-wrapper', {
      preset: 'welcome',
      locale: 'pt-BR',
      bindHtmlInput: '#email_html',
      bindJsonInput: '#email_json'
    });
  </script>
</body>
</html>

