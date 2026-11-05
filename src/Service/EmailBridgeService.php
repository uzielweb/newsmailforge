<?php

declare(strict_types=1);

namespace NewsMailForge\Service;

use NewsMailForge\Contracts\StorageDriverInterface;
use NewsMailForge\Core\Lang;
use NewsMailForge\Core\SecurityGuard;
use NewsMailForge\DTO\EmailDocumentDTO;

/**
 * Orchestrator service connecting SecurityGuard, DTO and StorageDriver.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class EmailBridgeService
{
    public function __construct(private StorageDriverInterface $storage)
    {
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{id: string, success: bool, message: string}
     */
    public function save(array $payload): array
    {
        $rawSchema = $payload['schema'] ?? $payload['schemaJson'] ?? null;
        if (is_string($rawSchema)) {
            $rawSchema = json_decode($rawSchema, true);
        }
        $schema = is_array($rawSchema) ? $rawSchema : null;
        if ($schema === null) {
            throw new \InvalidArgumentException(Lang::t('bridge.error.invalid_schema'));
        }

        $validatedSchema = SecurityGuard::validateSchema($schema);
        $rawHtml = (string) ($payload['compiledHtml'] ?? $payload['html'] ?? '');
        $sanitizedHtml = SecurityGuard::sanitizeHtml($rawHtml);

        $dto = new EmailDocumentDTO(
            isset($payload['id']) && $payload['id'] !== '' ? (string) $payload['id'] : null,
            trim((string) ($payload['title'] ?? 'Newsletter')),
            $sanitizedHtml,
            $validatedSchema,
            isset($payload['metadata']) && is_array($payload['metadata']) ? $payload['metadata'] : []
        );

        $saveResult = $this->storage->save($dto);

        return [
            'id' => $saveResult['id'],
            'success' => true,
            'message' => Lang::t('bridge.success.save'),
        ];
    }

    public function load(string $id): ?EmailDocumentDTO
    {
        return $this->storage->load($id);
    }

    /**
     * @return array<int, array{id: string, title: string, updated_at?: string}>
     */
    public function list(int $limit = 50): array
    {
        return $this->storage->list($limit);
    }

    public function delete(string $id): bool
    {
        return $this->storage->delete($id);
    }
}
