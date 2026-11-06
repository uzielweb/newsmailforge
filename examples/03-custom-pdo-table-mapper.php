<?php

declare(strict_types=1);

/**
 * NewsMailForge - Exemplo 03: Mapeamento de Tabela e Colunas Customizadas via PDO
 * Demonstra como plugar o NewsMailForge em qualquer banco de dados existente
 * com nomes próprios de tabelas e colunas, sem impor schemas fixos.
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

require_once dirname(__DIR__) . '/bootstrap.php';

use NewsMailForge\Controller\BridgeController;
use NewsMailForge\Core\Lang;
use NewsMailForge\Drivers\ConfigurablePdoDriver;
use NewsMailForge\Service\EmailBridgeService;

Lang::init('pt-BR');

// Cria ou abre banco SQLite demonstrativo em storage/
$dbPath = dirname(__DIR__) . '/storage/custom_pdo_demo.sqlite';
$pdo = new \PDO('sqlite:' . $dbPath);
$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

// Tabela customizada com nomes de colunas do sistema legado do usuário
$pdo->exec('CREATE TABLE IF NOT EXISTS custom_campaigns (
    campaign_uid TEXT PRIMARY KEY,
    campaign_title TEXT,
    compiled_mso_html TEXT,
    template_schema_json TEXT,
    last_modified TEXT
)');

// Instancia o Driver com o mapeamento customizado
$driver = new ConfigurablePdoDriver($pdo, [
    'table'             => 'custom_campaigns',
    'id_column'         => 'campaign_uid',
    'title_column'      => 'campaign_title',
    'html_column'       => 'compiled_mso_html',
    'json_column'       => 'template_schema_json',
    'updated_at_column' => 'last_modified'
]);

$service = new EmailBridgeService($driver);
$controller = new BridgeController($service);

// Se for requisição AJAX (JSON ou com parâmetro action)
if (isset($_GET['action']) || !empty($_POST) || str_contains((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    $response = $controller->handleRequest();
    $response->send();
    exit;
}

// Recupera lista de campanhas salvas na tabela customizada
$stmt = $pdo->query('SELECT campaign_uid, campaign_title, last_modified FROM custom_campaigns ORDER BY last_modified DESC');
$campaigns = $stmt->fetchAll(\PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — Custom PDO Table Mapper</title>
  <link rel="stylesheet" href="../dist-vanilla/css/editor.css">
  <style>
    body {
      background-color: #0b0f17;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
    }
    .demo-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .demo-header {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 16px 20px;
    }
    .demo-campaigns-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }
    .demo-campaigns-table th,
    .demo-campaigns-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #1e293b;
    }
    .demo-campaigns-table th {
      color: #94a3b8;
      font-weight: 600;
    }
    .demo-editor-box {
      height: 700px;
      border: 1px solid #334155;
      border-radius: 6px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="demo-container">
    <div class="demo-header">
      <h2 style="margin: 0 0 6px 0;"><?php echo htmlspecialchars(Lang::t('ui.app_name', 'NewsMailForge')); ?> — Configurable PDO Table Mapper</h2>
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">
        Mapeamento de banco de dados 100% agnóstico gravando na tabela <code>custom_campaigns</code> com colunas personalizadas (<code>campaign_uid</code>, <code>compiled_mso_html</code>, etc.).
      </p>

      <?php if (!empty($campaigns)): ?>
        <table class="demo-campaigns-table">
          <thead>
            <tr>
              <th>ID (campaign_uid)</th>
              <th>Título (campaign_title)</th>
              <th>Última Modificação</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($campaigns as $camp): ?>
              <tr>
                <td><code><?php echo htmlspecialchars((string) $camp['campaign_uid']); ?></code></td>
                <td><?php echo htmlspecialchars((string) $camp['campaign_title']); ?></td>
                <td><?php echo htmlspecialchars((string) $camp['last_modified']); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>

    <!-- Container do Studio -->
    <div id="studio-editor" class="demo-editor-box"></div>
  </div>

  <script type="module">
    import { mount } from '../dist-vanilla/js/NewsMailForge.js';

    // Monta o editor apontando para este próprio script como endpoint de API
    const editor = mount('#studio-editor', {
      preset: 'executive_summit',
      locale: 'pt-BR',
      saveEndpoint: '03-custom-pdo-table-mapper.php'
    });

    window.editor = editor;
  </script>
</body>
</html>

