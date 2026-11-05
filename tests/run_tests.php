<?php

declare(strict_types=1);

/**
 * News Mail Forge - Unified Test Suite & Invariants Verifier (A-OMASE v3.1)
 *
 * Consolidates:
 * 1. UTF-8 No BOM Integrity Audit across the entire repository
 * 2. Syntax Validation (php -l on PHP files, node --check on JS files)
 * 3. i18n Bidirectional Parity (pt-BR vs en-GB JSON & I18n.js & Lang.php)
 * 4. PHP Bridge Unit Tests (DTO, JsonFile, ConfigurablePdo, Callback, Service, Controller <= 15 lines)
 * 5. Edge Invariants Meta-tests (Conditional Boundaries, Nulls/Exceptions, OWASP Security)
 * 6. Vanilla JS Core, Catalog & EmailCompiler Execution Suite
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

require_once __DIR__ . '/../bootstrap.php';

use NewsMailForge\Contracts\StorageDriverInterface;
use NewsMailForge\Controller\BridgeController;
use NewsMailForge\Core\Lang;
use NewsMailForge\Core\Request;
use NewsMailForge\Core\Response;
use NewsMailForge\Core\SecurityGuard;
use NewsMailForge\DTO\EmailDocumentDTO;
use NewsMailForge\Drivers\CallbackStorageDriver;
use NewsMailForge\Drivers\ConfigurablePdoDriver;
use NewsMailForge\Drivers\JsonFileStorageDriver;
use NewsMailForge\Service\EmailBridgeService;

final class UnifiedTestRunner
{
    private int $totalAssertions = 0;
    private int $passedAssertions = 0;
    private int $failedAssertions = 0;
    private float $startTime;
    private string $projectRoot;

    public function __construct()
    {
        $this->startTime = microtime(true);
        $this->projectRoot = dirname(__DIR__);
    }

    public function assert(bool $condition, string $description, ?string $failureDetails = null): void
    {
        $this->totalAssertions++;
        if ($condition) {
            $this->passedAssertions++;
            echo "    [PASS] {$description}\n";
        } else {
            $this->failedAssertions++;
            echo "    [FAIL] {$description}" . ($failureDetails ? " -> {$failureDetails}" : '') . "\n";
        }
    }

    public function run(): int
    {
        echo "====================================================================\n";
        echo " NEWS MAIL FORGE — UNIFIED TEST SUITE & 3 EDGE INVARIANTS (A-OMASE)\n";
        echo "====================================================================\n\n";

        $this->testUtf8NoBomAudit();
        $this->testSyntaxLint();
        $this->testI18nParityAndLang();
        $this->testPhpBridgeUnitTests();
        $this->testEdgeInvariantsMetaTests();
        $this->testJsCoreAndCompilerSuite();

        $elapsed = round(microtime(true) - $this->startTime, 3);

        echo "\n====================================================================\n";
        echo " TEST EXECUTION SUMMARY\n";
        echo "====================================================================\n";
        echo "  Total Assertions : {$this->totalAssertions}\n";
        echo "  Passed           : {$this->passedAssertions}\n";
        echo "  Failed           : {$this->failedAssertions}\n";
        echo "  Execution Time   : {$elapsed}s\n";

        if ($this->failedAssertions === 0) {
            echo "  Result           : ALL SUITES PASSED PERFECTLY [EXIT CODE 0]\n";
            echo "====================================================================\n";
            return 0;
        }

        echo "  Result           : FAILURES DETECTED [EXIT CODE 1]\n";
        echo "====================================================================\n";
        return 1;
    }

    /**
     * 1. Auditoria UTF-8 sem BOM em todos os arquivos do projeto
     */
    private function testUtf8NoBomAudit(): void
    {
        echo "--- [1/6] Auditoria de Codificacao UTF-8 sem BOM (No BOM) ---\n";

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->projectRoot, FilesystemIterator::SKIP_DOTS)
        );

        $bomFiles = [];
        $checkedFiles = 0;
        $ignoredPrefixes = ['.git', '.vscode', 'storage'];
        $trackedExtensions = ['php', 'js', 'mjs', 'json', 'css', 'html', 'md'];

        foreach ($iterator as $file) {
            if ($file->isDir()) {
                continue;
            }
            $pathname = $file->getPathname();
            $rel = ltrim(str_replace($this->projectRoot, '', $pathname), DIRECTORY_SEPARATOR);

            $skip = false;
            foreach ($ignoredPrefixes as $prefix) {
                if (str_starts_with($rel, $prefix . DIRECTORY_SEPARATOR) || $rel === $prefix) {
                    $skip = true;
                    break;
                }
            }
            if ($skip) {
                continue;
            }

            $ext = strtolower(pathinfo($pathname, PATHINFO_EXTENSION));
            if (!in_array($ext, $trackedExtensions, true)) {
                continue;
            }

            $checkedFiles++;
            $handle = @fopen($pathname, 'rb');
            if ($handle) {
                $bytes = fread($handle, 3);
                fclose($handle);
                if ($bytes === "\xEF\xBB\xBF") {
                    $bomFiles[] = $rel;
                }
            }
        }

        $this->assert(
            empty($bomFiles),
            "UTF-8 No BOM estrito verificado em {$checkedFiles} arquivos do projeto",
            'Arquivos com BOM: ' . implode(', ', $bomFiles)
        );
    }

    /**
     * 2. Validacao Sintatica (php -l e node --check)
     */
    private function testSyntaxLint(): void
    {
        echo "\n--- [2/6] Validacao Sintatica CLI (php -l & node --check) ---\n";

        // PHP syntax check
        $phpFiles = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->projectRoot, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if (!$file->isDir() && strtolower($file->getExtension()) === 'php') {
                $rel = ltrim(str_replace($this->projectRoot, '', $file->getPathname()), DIRECTORY_SEPARATOR);
                if (!str_starts_with($rel, '.git') && !str_starts_with($rel, 'storage')) {
                    $phpFiles[] = $file->getPathname();
                }
            }
        }

        $phpSyntaxErrors = [];
        foreach ($phpFiles as $path) {
            $cmd = escapeshellcmd('php -l ' . escapeshellarg($path)) . ' 2>&1';
            $output = [];
            $code = 0;
            exec($cmd, $output, $code);
            if ($code !== 0) {
                $phpSyntaxErrors[] = basename($path) . ': ' . implode(' ', $output);
            }
        }

        $this->assert(
            empty($phpSyntaxErrors),
            'Todos os ' . count($phpFiles) . ' arquivos PHP passaram em php -l com sucesso',
            implode(' | ', $phpSyntaxErrors)
        );

        // JS syntax check
        $jsFiles = [];
        foreach ($iterator as $file) {
            if (!$file->isDir() && in_array(strtolower($file->getExtension()), ['js', 'mjs'], true)) {
                $rel = ltrim(str_replace($this->projectRoot, '', $file->getPathname()), DIRECTORY_SEPARATOR);
                if (!str_starts_with($rel, '.git') && !str_starts_with($rel, 'storage')) {
                    $jsFiles[] = $file->getPathname();
                }
            }
        }

        $jsSyntaxErrors = [];
        foreach ($jsFiles as $path) {
            $cmd = escapeshellcmd('node --check ' . escapeshellarg($path)) . ' 2>&1';
            $output = [];
            $code = 0;
            exec($cmd, $output, $code);
            if ($code !== 0) {
                $jsSyntaxErrors[] = basename($path) . ': ' . implode(' ', $output);
            }
        }

        $this->assert(
            empty($jsSyntaxErrors),
            'Todos os ' . count($jsFiles) . ' arquivos JS/MJS passaram em node --check com sucesso',
            implode(' | ', $jsSyntaxErrors)
        );
    }

    /**
     * 3. Paridade e Resiliencia i18n
     */
    private function testI18nParityAndLang(): void
    {
        echo "\n--- [3/6] Paridade i18n Bidirecional (pt-BR / en-GB / I18n.js / Lang.php) ---\n";

        $ptFile = $this->projectRoot . '/language/pt-BR/pt-BR.json';
        $enFile = $this->projectRoot . '/language/en-GB/en-GB.json';

        $this->assert(is_file($ptFile) && is_file($enFile), 'Arquivos pt-BR.json e en-GB.json existem');

        $pt = json_decode((string) file_get_contents($ptFile), true);
        $en = json_decode((string) file_get_contents($enFile), true);

        $this->assert(is_array($pt) && is_array($en), 'Ambos os arquivos JSON de idioma sao arrays validos');

        $diffPtEn = array_diff_key($pt, $en);
        $diffEnPt = array_diff_key($en, $pt);

        $this->assert(
            empty($diffPtEn) && empty($diffEnPt) && count($pt) === count($en),
            'Paridade bidirecional 100% entre pt-BR e en-GB (' . count($pt) . ' chaves identicas)',
            'Divergencias: pt-BR extra: ' . implode(', ', array_keys($diffPtEn)) . ' | en-GB extra: ' . implode(', ', array_keys($diffEnPt))
        );

        // Verificacao de paridade com dist-vanilla/js/i18n/I18n.js
        $jsFile = $this->projectRoot . '/dist-vanilla/js/i18n/I18n.js';
        $this->assert(is_file($jsFile), 'Arquivo dist-vanilla/js/i18n/I18n.js existe');
        $jsContent = (string) file_get_contents($jsFile);

        $ptJs = [];
        $enJs = [];
        if (preg_match('/\'pt-BR\':\s*(\{.*?\n\s*\}),\s*\'en-GB\'/s', $jsContent, $mPt)) {
            $ptJs = json_decode($mPt[1], true) ?: [];
        }
        if (preg_match('/\'en-GB\':\s*(\{.*?\n\s*\})\s*\};/s', $jsContent, $mEn)) {
            $enJs = json_decode($mEn[1], true) ?: [];
        }

        $diffJsPt = array_diff_key($pt, $ptJs);
        $diffPtJs = array_diff_key($ptJs, $pt);
        $diffJsEn = array_diff_key($en, $enJs);
        $diffEnJs = array_diff_key($enJs, $en);

        $this->assert(
            empty($diffJsPt) && empty($diffPtJs) && empty($diffJsEn) && empty($diffEnJs) && count($ptJs) === count($pt),
            'Paridade 100% comprovada entre I18n.js client-side e os arquivos JSON de language/ (' . count($ptJs) . ' chaves)',
            'Divergencia em I18n.js: pt diff ' . count($diffJsPt) . ' | en diff ' . count($diffJsEn)
        );

        // Server-side Lang.php test
        Lang::init('pt-BR');
        $this->assert(Lang::t('ui.save') === 'Salvar', "Lang::t('ui.save') retorna 'Salvar' em pt-BR");

        Lang::setLocale('en-GB');
        $this->assert(Lang::t('ui.save') === 'Save', "Lang::t('ui.save') retorna 'Save' em en-GB");

        $interpolated = Lang::t('ui.drawer_title', ['category' => 'CTA']);
        $this->assert(str_contains($interpolated, 'CTA'), "Lang::t interpola variaveis ({category} -> CTA)");

        $missingFallback = Lang::t('non_existing_key_xyz_123');
        $this->assert($missingFallback === 'non_existing_key_xyz_123', 'Lang::t chave inexistente retorna o proprio nome');
    }

    /**
     * 4. PHP Bridge Unit Tests (DTO, Drivers, Service, Controller)
     */
    private function testPhpBridgeUnitTests(): void
    {
        echo "\n--- [4/6] Testes Unitarios da PHP Bridge (MVC & Storage Drivers) ---\n";

        // DTO Tests
        $sampleSchema = [
            'type' => 'document',
            'blocks' => [
                [
                    'type' => 'block',
                    'rows' => [
                        [
                            'type' => 'row',
                            'cells' => [
                                [
                                    'type' => 'cell',
                                    'children' => [['type' => 'text', 'content' => 'Boas-vindas']]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $dto = new EmailDocumentDTO(
            id: 'template_01',
            title: 'Campanha Primavera',
            compiledHtml: '<h1>Primavera</h1>',
            schema: $sampleSchema,
            metadata: ['author' => 'Tester']
        );

        $dtoArr = $dto->toArray();
        $this->assert($dtoArr['id'] === 'template_01' && $dtoArr['title'] === 'Campanha Primavera', 'EmailDocumentDTO::toArray()');
        $reconstructed = EmailDocumentDTO::fromArray($dtoArr);
        $this->assert($reconstructed->title === 'Campanha Primavera' && $reconstructed->schema['type'] === 'document', 'EmailDocumentDTO::fromArray()');

        // JsonFileStorageDriver
        $tmpDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'nmf_test_' . uniqid();
        @mkdir($tmpDir, 0755, true);
        $jsonDriver = new JsonFileStorageDriver($tmpDir);

        $saveRes = $jsonDriver->save($dto);
        $this->assert($saveRes['success'] && !empty($saveRes['id']), 'JsonFileStorageDriver::save()');

        $loadedDto = $jsonDriver->load($saveRes['id']);
        $this->assert($loadedDto !== null && $loadedDto->title === 'Campanha Primavera', 'JsonFileStorageDriver::load()');

        $list = $jsonDriver->list(10);
        $this->assert(count($list) === 1 && $list[0]['id'] === $saveRes['id'], 'JsonFileStorageDriver::list()');

        $delOk = $jsonDriver->delete($saveRes['id']);
        $this->assert($delOk && $jsonDriver->load($saveRes['id']) === null, 'JsonFileStorageDriver::delete()');
        @rmdir($tmpDir);

        // ConfigurablePdoDriver (SQLite :memory:)
        $pdo = new \PDO('sqlite::memory:');
        $pdo->exec('CREATE TABLE custom_newsletter (
            col_id TEXT PRIMARY KEY,
            col_subject TEXT,
            col_html TEXT,
            col_json TEXT,
            col_updated TEXT
        )');

        $pdoDriver = new ConfigurablePdoDriver($pdo, [
            'table' => 'custom_newsletter',
            'id_column' => 'col_id',
            'title_column' => 'col_subject',
            'html_column' => 'col_html',
            'json_column' => 'col_json',
            'updated_at_column' => 'col_updated',
        ]);

        $pdoSave = $pdoDriver->save($dto);
        $this->assert($pdoSave['id'] === 'template_01' && $pdoSave['success'], 'ConfigurablePdoDriver::save() (insert)');

        // Update existing ID
        $updatedDto = new EmailDocumentDTO('template_01', 'Campanha Primavera Atualizada', '<h1>Novo</h1>', $sampleSchema);
        $pdoDriver->save($updatedDto);
        $pdoLoaded = $pdoDriver->load('template_01');
        $this->assert($pdoLoaded !== null && $pdoLoaded->title === 'Campanha Primavera Atualizada', 'ConfigurablePdoDriver::save() (update)');

        $pdoList = $pdoDriver->list();
        $this->assert(count($pdoList) === 1, 'ConfigurablePdoDriver::list()');

        $pdoDel = $pdoDriver->delete('template_01');
        $this->assert($pdoDel && $pdoDriver->load('template_01') === null, 'ConfigurablePdoDriver::delete()');

        // CallbackStorageDriver
        $mockStore = [];
        $callbackDriver = new CallbackStorageDriver(
            onSave: function (EmailDocumentDTO $d) use (&$mockStore): array {
                $id = $d->id ?? 'cb_1';
                $mockStore[$id] = $d;
                return ['id' => $id, 'success' => true];
            },
            onLoad: function (string $id) use (&$mockStore): ?EmailDocumentDTO {
                return $mockStore[$id] ?? null;
            },
            onList: function (int $limit) use (&$mockStore): array {
                return array_map(fn($d) => ['id' => $d->id, 'title' => $d->title], array_values($mockStore));
            },
            onDelete: function (string $id) use (&$mockStore): bool {
                unset($mockStore[$id]);
                return true;
            }
        );

        $cbSave = $callbackDriver->save(new EmailDocumentDTO('cb_1', 'Callback Demo', '<p>Test</p>', $sampleSchema));
        $this->assert($cbSave['id'] === 'cb_1', 'CallbackStorageDriver::save()');
        $this->assert($callbackDriver->load('cb_1')?->title === 'Callback Demo', 'CallbackStorageDriver::load()');
        $this->assert(count($callbackDriver->list()) === 1, 'CallbackStorageDriver::list()');
        $this->assert($callbackDriver->delete('cb_1') && $callbackDriver->load('cb_1') === null, 'CallbackStorageDriver::delete()');

        // EmailBridgeService & BridgeController
        $service = new EmailBridgeService($callbackDriver);
        $controller = new BridgeController($service);

        // Save action
        $reqSave = new Request('POST', ['action' => 'save'], [
            'id' => 'ctrl_1',
            'title' => 'Controller Test',
            'compiledHtml' => '<p>Valid HTML</p>',
            'schema' => $sampleSchema,
        ]);
        $resSave = $controller->handleRequest($reqSave);
        $this->assert($resSave->getStatusCode() === 200, 'BridgeController::saveAction status 200');

        // Load action
        $reqLoad = new Request('GET', ['action' => 'load', 'id' => 'ctrl_1']);
        $resLoad = $controller->handleRequest($reqLoad);
        $this->assert($resLoad->getStatusCode() === 200, 'BridgeController::loadAction status 200');

        // List action
        $reqList = new Request('GET', ['action' => 'list']);
        $resList = $controller->handleRequest($reqList);
        $this->assert($resList->getStatusCode() === 200, 'BridgeController::listAction status 200');

        // Delete action
        $reqDel = new Request('POST', ['action' => 'delete', 'id' => 'ctrl_1']);
        $resDel = $controller->handleRequest($reqDel);
        $this->assert($resDel->getStatusCode() === 200, 'BridgeController::deleteAction status 200');

        // Verify BridgeController max 15 lines per action constraint
        $reflection = new \ReflectionClass(BridgeController::class);
        $actions = ['handleRequest', 'saveAction', 'loadAction', 'listAction', 'deleteAction'];
        foreach ($actions as $action) {
            $method = $reflection->getMethod($action);
            $lines = $method->getEndLine() - $method->getStartLine() + 1;
            $this->assert($lines <= 15, "BridgeController::{$action} tem {$lines} linhas (regra MVC <= 15 linhas)");
        }
    }

    /**
     * 5. Metatestes das 3 Invariantes de Borda (A-OMASE v3.1)
     */
    private function testEdgeInvariantsMetaTests(): void
    {
        echo "\n--- [5/6] Metatestes das 3 Invariantes de Borda (A-OMASE v3.1) ---\n";

        // ====================================================================
        // INVARIANTE 1: CONDICIONAL (Limites, Mutações de Operadores e Limites)
        // ====================================================================
        echo "  > Invariante 1: Condicional (Limites e Mutacoes de Operadores)\n";

        // 1.1: Limite exato de profundidade: Depth 12 permitido, Depth 13 rejeitado
        $buildTree = static function (int $depth) use (&$buildTree): array {
            if ($depth <= 1) {
                return ['type' => 'atom', 'content' => 'folha'];
            }
            return ['type' => 'node', 'children' => [$buildTree($depth - 1)]];
        };

        $tree12 = $buildTree(12);
        $passed12 = false;
        try {
            SecurityGuard::validateSchema($tree12, 12);
            $passed12 = true;
        } catch (\InvalidArgumentException) {
            $passed12 = false;
        }
        $this->assert($passed12, 'Invariante Condicional: Schema com profundidade exatamente 12 e aceito');

        $tree13 = $buildTree(13);
        $rejected13 = false;
        try {
            SecurityGuard::validateSchema($tree13, 12);
        } catch (\InvalidArgumentException) {
            $rejected13 = true;
        }
        $this->assert($rejected13, 'Invariante Condicional: Schema com profundidade 13 e rejeitado (> 12)');

        // 1.2: Normalizacao de Limites de Listagem (Clamp [1, 500])
        $pdo = new \PDO('sqlite::memory:');
        $pdo->exec('CREATE TABLE test_clamp (id TEXT PRIMARY KEY, title TEXT, html TEXT, schema_json TEXT, updated_at TEXT)');
        $pdoDriver = new ConfigurablePdoDriver($pdo, ['table' => 'test_clamp']);

        // Inserir 2 registros
        $dummy = new EmailDocumentDTO('id1', 'T1', '<p></p>', ['type' => 'document']);
        $dummy2 = new EmailDocumentDTO('id2', 'T2', '<p></p>', ['type' => 'document']);
        $pdoDriver->save($dummy);
        $pdoDriver->save($dummy2);

        // Limite <= 0 e normalizado para 1
        $listZero = $pdoDriver->list(0);
        $this->assert(count($listZero) === 1, 'Invariante Condicional: list(0) normalizado para limite 1 (max(1, min(500, limit)))');

        // Limite negativo normalizado para 1
        $listNegative = $pdoDriver->list(-10);
        $this->assert(count($listNegative) === 1, 'Invariante Condicional: list(-10) normalizado para limite 1');

        // 1.3: Acao nao suportada no controller retorna HTTP 400
        $service = new EmailBridgeService($pdoDriver);
        $controller = new BridgeController($service);
        $reqUnknown = new Request('GET', ['action' => 'unknown_action_xyz']);
        $resUnknown = $controller->handleRequest($reqUnknown);
        $this->assert($resUnknown->getStatusCode() === 400, 'Invariante Condicional: Acao desconhecida despacha default HTTP 400');

        // ====================================================================
        // INVARIANTE 2: NULOS E EXCECOES (Tratamento Gracioso / Zero Fatal)
        // ====================================================================
        echo "  > Invariante 2: Nulos e Excecoes (Tratamento Gracioso e Resiliencia)\n";

        // 2.1: load() com ID inexistente retorna null sem erro fatal
        $this->assert($pdoDriver->load('non_existent_id') === null, 'Invariante Nulos: load() com ID inexistente retorna null graciosamente');

        // 2.2: delete() com ID inexistente retorna false ou nao explode
        $this->assert($pdoDriver->delete('non_existent_id') === true || $pdoDriver->delete('non_existent_id') === false, 'Invariante Nulos: delete() com ID inexistente trata sem excecao');

        // 2.3: validateSchema com array vazio lanca InvalidArgumentException tratada
        $caughtEmpty = false;
        try {
            SecurityGuard::validateSchema([]);
        } catch (\InvalidArgumentException) {
            $caughtEmpty = true;
        }
        $this->assert($caughtEmpty, 'Invariante Excecoes: Schema vazio lanca InvalidArgumentException tratada');

        // 2.4: Arquivo corrompido em disco lido pelo JsonFileStorageDriver retorna null
        $tmpStorage = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'nmf_corrupt_' . uniqid();
        @mkdir($tmpStorage, 0755, true);
        file_put_contents($tmpStorage . DIRECTORY_SEPARATOR . 'corrupt.json', '{invalid_json_content:');
        $jsonDriverCorrupt = new JsonFileStorageDriver($tmpStorage);
        $loadedCorrupt = $jsonDriverCorrupt->load('corrupt');
        $this->assert($loadedCorrupt === null, 'Invariante Excecoes: JSON corrompido no disco retorna null sem warning fatal');
        @unlink($tmpStorage . DIRECTORY_SEPARATOR . 'corrupt.json');
        @rmdir($tmpStorage);

        // 2.5: Falha no driver em saveAction tratada como HTTP 500 JSON
        $failingDriver = new CallbackStorageDriver(
            onSave: function (): array {
                throw new \RuntimeException('Database disk full');
            },
            onLoad: fn() => null,
            onList: fn() => [],
            onDelete: fn() => false
        );
        $failService = new EmailBridgeService($failingDriver);
        $failController = new BridgeController($failService);
        $reqFail = new Request('POST', ['action' => 'save'], [
            'title' => 'Fail Test',
            'schema' => ['type' => 'document']
        ]);
        $resFail = $failController->handleRequest($reqFail);
        $this->assert($resFail->getStatusCode() === 500, 'Invariante Excecoes: RuntimeException no driver capturada e convertida em HTTP 500');

        // 2.6: Requisições de load e delete sem ID retornam HTTP 400
        $reqNoId = new Request('GET', ['action' => 'load']);
        $this->assert($controller->handleRequest($reqNoId)->getStatusCode() === 400, 'Invariante Nulos: loadAction sem ID retorna HTTP 400');

        // ====================================================================
        // INVARIANTE 3: SEGURANÇA OWASP (Sanitização XSS, SQLi, Path Traversal)
        // ====================================================================
        echo "  > Invariante 3: Seguranca OWASP (XSS, SQLi, Path Traversal e VML/MSO)\n";

        // 3.1: XSS - Tags perigosas e handlers
        $xssHtml = '<script>alert("xss")</script><iframe src="evil.com"></iframe><img src="valid.png" onload="steal()" onerror="hack()"><a href="javascript:alert(1)">Click</a>';
        $cleanedHtml = SecurityGuard::sanitizeHtml($xssHtml);
        $this->assert(!str_contains($cleanedHtml, '<script>'), 'OWASP XSS: <script> eliminado');
        $this->assert(!str_contains($cleanedHtml, '<iframe'), 'OWASP XSS: <iframe> eliminado');
        $this->assert(!str_contains($cleanedHtml, 'onload='), 'OWASP XSS: onload eliminado');
        $this->assert(!str_contains($cleanedHtml, 'onerror='), 'OWASP XSS: onerror eliminado');
        $this->assert(!str_contains($cleanedHtml, 'javascript:'), 'OWASP XSS: javascript: pseudo-protocolo eliminado');

        // 3.2: URL Sanitization & Protocol Smuggling
        $this->assert(SecurityGuard::sanitizeUrl('javascript:steal()') === '#', 'OWASP URL: javascript: higienizado para #');
        $this->assert(SecurityGuard::sanitizeUrl('data:text/html;base64,PHNjcmlwdD4=') === '#', 'OWASP URL: data:text/html higienizado para #');
        $this->assert(SecurityGuard::sanitizeUrl('vbscript:msgbox(1)') === '#', 'OWASP URL: vbscript: higienizado para #');
        $this->assert(SecurityGuard::sanitizeUrl('https://uzielweb.com') === 'https://uzielweb.com', 'OWASP URL: https:// legitimo preservado');
        $this->assert(SecurityGuard::sanitizeUrl('mailto:contato@exemplo.com') === 'mailto:contato@exemplo.com', 'OWASP URL: mailto: legitimo preservado');
        $this->assert(SecurityGuard::sanitizeUrl('tel:+5511999999999') === 'tel:+5511999999999', 'OWASP URL: tel: legitimo preservado');

        // 3.3: Preservacao MSO e VML (Outlook)
        $msoVml = '<!--[if (gte mso 9)|(IE)]><table width="600"><tr><td><![endif]--><v:roundrect arcsize="10%"><v:fill color="#ff0000"/></v:roundrect><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->';
        $preserved = SecurityGuard::sanitizeHtml($msoVml);
        $this->assert(str_contains($preserved, '<!--[if (gte mso 9)|(IE)]>'), 'OWASP Outlook: Comentarios condicionais MSO preservados');
        $this->assert(str_contains($preserved, '<v:roundrect'), 'OWASP Outlook: Tags VML preservadas');

        // 3.4: Anti-SQLi em Identificadores de Tabela e Coluna
        $sqliBlocked = false;
        try {
            new ConfigurablePdoDriver($pdo, ['table' => 'templates; DROP TABLE users;--']);
        } catch (\InvalidArgumentException) {
            $sqliBlocked = true;
        }
        $this->assert($sqliBlocked, 'OWASP Anti-SQLi: Injecao SQL em identificador de tabela bloqueada com InvalidArgumentException');

        $sqliColBlocked = false;
        try {
            new ConfigurablePdoDriver($pdo, ['id_column' => 'id; SELECT * FROM secret;--']);
        } catch (\InvalidArgumentException) {
            $sqliColBlocked = true;
        }
        $this->assert($sqliColBlocked, 'OWASP Anti-SQLi: Injecao SQL em identificador de coluna bloqueada');

        // 3.5: Path Traversal no JsonFileStorageDriver
        $tmpTraversal = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'nmf_trav_' . uniqid();
        @mkdir($tmpTraversal, 0755, true);
        $travDriver = new JsonFileStorageDriver($tmpTraversal);
        $travSaveBlocked = false;
        try {
            $travDriver->save(new EmailDocumentDTO('../../etc/passwd', 'Exploit', '<p></p>', ['type' => 'document']));
        } catch (\InvalidArgumentException) {
            $travSaveBlocked = true;
        }
        $this->assert($travSaveBlocked, 'OWASP Path Traversal: ID com ../ bloqueado em save()');

        $travLoadSafe = $travDriver->load('../../windows/system32');
        $this->assert($travLoadSafe === null, 'OWASP Path Traversal: ID com ../ em load() retorna null seguramente');
        @rmdir($tmpTraversal);
    }

    /**
     * 6. Validacao do Compilador JS e Componentes Front-End
     */
    private function testJsCoreAndCompilerSuite(): void
    {
        echo "\n--- [6/6] Execucao da Suite Front-End JS (Store, Compiler, Presets & Catalog) ---\n";

        $testFile = $this->projectRoot . '/tests/test_core_compiler.mjs';
        $this->assert(is_file($testFile), 'Arquivo tests/test_core_compiler.mjs existe');

        $cmd = 'node ' . escapeshellarg($testFile) . ' 2>&1';
        $output = [];
        $exitCode = 0;
        exec($cmd, $output, $exitCode);

        $this->assert(
            $exitCode === 0,
            'Execucao integral de test_core_compiler.mjs via Node.js completada com status 0',
            implode("\n    ", array_slice($output, -10))
        );

        $fullOut = implode("\n", $output);
        $this->assert(str_contains($fullOut, 'EmailCompiler regras de anti-quebra Outlook, MSO, VML e gaps validadas'), 'EmailCompiler regras de anti-quebra Outlook, MSO, VML e gaps validadas');
        $this->assert(str_contains($fullOut, 'BlockCatalog 8 categorias'), 'BlockCatalog contem as 8 categorias obrigatorias');
        $this->assert(str_contains($fullOut, 'BuiltinPresets 4 templates completos'), 'BuiltinPresets contem 4 templates agnosticos e completos');
        $this->assert(str_contains($fullOut, 'TODOS OS METATESTES E INVARIANTES PASSARAM COM SUCESSO 100%'), 'Todos os metatestes e invariantes do compilador JS passaram 100%');
    }
}

// Inicia execucao direta via CLI
$runner = new UnifiedTestRunner();
exit($runner->run());
