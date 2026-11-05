<?php

declare(strict_types=1);

namespace NewsMailForge\Contracts;

use NewsMailForge\DTO\EmailDocumentDTO;

/**
 * Storage Driver Contract for NewsMailForge Templates.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
interface StorageDriverInterface
{
    /**
     * Persists or updates an email document.
     *
     * @return array{id: string, success: bool}
     */
    public function save(EmailDocumentDTO $dto): array;

    /**
     * Loads a document by its ID.
     */
    public function load(string $id): ?EmailDocumentDTO;

    /**
     * Lists documents up to the specified limit.
     *
     * @return array<int, array{id: string, title: string, updated_at?: string}>
     */
    public function list(int $limit = 50): array;

    /**
     * Deletes a document by its ID.
     */
    public function delete(string $id): bool;
}
