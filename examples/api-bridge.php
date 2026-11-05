<?php

declare(strict_types=1);

/**
 * NewsMailForge - API Bridge Endpoint
 * Endpoint agnóstico para requisições AJAX do Studio (save, load, list, delete).
 * UTF-8 sem BOM (No BOM)
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

require_once dirname(__DIR__) . '/bootstrap.php';

use NewsMailForge\Controller\BridgeController;
use NewsMailForge\Core\Lang;
use NewsMailForge\Drivers\JsonFileStorageDriver;
use NewsMailForge\Service\EmailBridgeService;

// Inicializa internacionalização
Lang::init('pt-BR');

// Utiliza armazenamento JSON em arquivo no diretório storage/ (zero configuração de SGBD necessária)
$storageDir = dirname(__DIR__) . '/storage';
$driver = new JsonFileStorageDriver($storageDir);

// Instancia o serviço de orquestração e sanitização OWASP
$service = new EmailBridgeService($driver);

// Despacha a requisição via Controller enxuto (<= 15 linhas)
$controller = new BridgeController($service);
$response = $controller->handleRequest();
$response->send();

