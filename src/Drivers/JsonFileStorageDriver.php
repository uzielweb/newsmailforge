<?php

declare(strict_types=1);

namespace NewsMailForge\Drivers;

use NewsMailForge\Contracts\StorageDriverInterface;
use NewsMailForge\Core\Lang;
use NewsMailForge\DTO\EmailDocumentDTO;

/**
 * Zero-database JSON file storage driver with Path-Traversal protection.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class JsonFileStorageDriver implements StorageDriverInterface
{
    private string $storageDir;

    public function __construct(?string $storageDir = null)
    {
        $dir = $storageDir ?? dirname(__DIR__, 2) . '/storage';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $this->storageDir = rtrim($dir, '/\\');
    }

    private function sanitizeId(string $id): string
    {
        if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $id)) {
            throw new \InvalidArgumentException(Lang::t('bridge.error.security_violation'));
        }
        return $id;
    }

    private function getFilePath(string $id): string
    {
        $safeId = $this->sanitizeId($id);
        return $this->storageDir . DIRECTORY_SEPARATOR . $safeId . '.json';
    }

    public function save(EmailDocumentDTO $dto): array
    {
        $id = $dto->id !== null && $dto->id !== '' ? $this->sanitizeId($dto->id) : bin2hex(random_bytes(16));
        $filePath = $this->storageDir . DIRECTORY_SEPARATOR . $id . '.json';

        $data = [
            'id' => $id,
            'title' => $dto->title,
            'compiledHtml' => $dto->compiledHtml,
            'schema' => $dto->schema,
            'metadata' => array_merge($dto->metadata, ['updated_at' => date('Y-m-d H:i:s')]),
        ];

        $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($encoded === false || file_put_contents($filePath, $encoded, LOCK_EX) === false) {
            throw new \RuntimeException(Lang::t('bridge.error.storage_failure'));
        }

        return ['id' => $id, 'success' => true];
    }

    public function load(string $id): ?EmailDocumentDTO
    {
        try {
            $filePath = $this->getFilePath($id);
        } catch (\InvalidArgumentException) {
            return null;
        }

        if (!is_file($filePath)) {
            return null;
        }

        $raw = file_get_contents($filePath);
        if ($raw === false) {
            return null;
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return null;
        }

        return EmailDocumentDTO::fromArray($decoded);
    }

    public function list(int $limit = 50): array
    {
        $safeLimit = max(1, min(500, $limit));
        $files = glob($this->storageDir . DIRECTORY_SEPARATOR . '*.json');
        if (!$files) {
            return [];
        }

        // Sort by modification time descending
        usort($files, static function (string $a, string $b): int {
            return filemtime($b) <=> filemtime($a);
        });

        $results = [];
        $count = 0;
        foreach ($files as $file) {
            if ($count >= $safeLimit) {
                break;
            }
            $raw = file_get_contents($file);
            $parsed = $raw ? json_decode($raw, true) : null;
            if (is_array($parsed)) {
                $results[] = [
                    'id' => (string) ($parsed['id'] ?? pathinfo($file, PATHINFO_FILENAME)),
                    'title' => (string) ($parsed['title'] ?? 'Untitled'),
                    'updated_at' => (string) ($parsed['metadata']['updated_at'] ?? date('Y-m-d H:i:s', (int) filemtime($file))),
                ];
                $count++;
            }
        }

        return $results;
    }

    public function delete(string $id): bool
    {
        try {
            $filePath = $this->getFilePath($id);
        } catch (\InvalidArgumentException) {
            return false;
        }

        if (is_file($filePath)) {
            return unlink($filePath);
        }

        return false;
    }
}
