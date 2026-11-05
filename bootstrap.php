<?php

declare(strict_types=1);

/**
 * NewsMailForge - PSR-4 Autoloader & Bootstrap
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */

spl_autoload_register(static function (string $class): void {
    $prefix = 'NewsMailForge\\';
    $baseDir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

\NewsMailForge\Core\Lang::init('pt-BR');
