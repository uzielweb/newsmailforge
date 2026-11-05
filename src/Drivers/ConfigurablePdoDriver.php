<?php

declare(strict_types=1);

namespace NewsMailForge\Drivers;

use NewsMailForge\Contracts\StorageDriverInterface;
use NewsMailForge\Core\Lang;
use NewsMailForge\DTO\EmailDocumentDTO;

/**
 * Highly configurable PDO storage driver with anti-SQLi validation
 * and parameterized prepared statements.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class ConfigurablePdoDriver implements StorageDriverInterface
{
    private \PDO $pdo;
    private string $table;
    private string $idCol;
    private string $titleCol;
    private string $htmlCol;
    private string $jsonCol;
    private string $updatedAtCol;

    /**
     * @param array<string, string> $map
     * @throws \InvalidArgumentException
     */
    public function __construct(\PDO $pdo, array $map = [])
    {
        $this->pdo = $pdo;
        $this->table = $this->assertSafeIdentifier($map['table'] ?? 'newsmailforge_templates');
        $this->idCol = $this->assertSafeIdentifier($map['id_column'] ?? 'id');
        $this->titleCol = $this->assertSafeIdentifier($map['title_column'] ?? 'title');
        $this->htmlCol = $this->assertSafeIdentifier($map['html_column'] ?? 'html');
        $this->jsonCol = $this->assertSafeIdentifier($map['json_column'] ?? 'schema_json');
        $this->updatedAtCol = $this->assertSafeIdentifier($map['updated_at_column'] ?? 'updated_at');
    }

    private function assertSafeIdentifier(string $identifier): string
    {
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $identifier)) {
            throw new \InvalidArgumentException(Lang::t('bridge.error.invalid_sql_identifier') . ': ' . $identifier);
        }
        return $identifier;
    }

    public function save(EmailDocumentDTO $dto): array
    {
        $id = $dto->id ?? bin2hex(random_bytes(16));
        $encodedSchema = json_encode($dto->schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{}';
        $now = date('Y-m-d H:i:s');

        // Check if record exists
        $checkStmt = $this->pdo->prepare("SELECT COUNT(*) FROM {$this->table} WHERE {$this->idCol} = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = ((int) $checkStmt->fetchColumn()) > 0;

        if ($exists) {
            $sql = "UPDATE {$this->table} SET {$this->titleCol} = :title, {$this->htmlCol} = :html, {$this->jsonCol} = :json, {$this->updatedAtCol} = :updated_at WHERE {$this->idCol} = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':title' => $dto->title,
                ':html' => $dto->compiledHtml,
                ':json' => $encodedSchema,
                ':updated_at' => $now,
                ':id' => $id,
            ]);
        } else {
            $sql = "INSERT INTO {$this->table} ({$this->idCol}, {$this->titleCol}, {$this->htmlCol}, {$this->jsonCol}, {$this->updatedAtCol}) VALUES (:id, :title, :html, :json, :updated_at)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':title' => $dto->title,
                ':html' => $dto->compiledHtml,
                ':json' => $encodedSchema,
                ':updated_at' => $now,
            ]);
        }

        return ['id' => $id, 'success' => true];
    }

    public function load(string $id): ?EmailDocumentDTO
    {
        $sql = "SELECT {$this->idCol}, {$this->titleCol}, {$this->htmlCol}, {$this->jsonCol} FROM {$this->table} WHERE {$this->idCol} = :id LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        $decodedSchema = json_decode((string) ($row[$this->jsonCol] ?? '{}'), true);

        return new EmailDocumentDTO(
            (string) $row[$this->idCol],
            (string) ($row[$this->titleCol] ?? ''),
            (string) ($row[$this->htmlCol] ?? ''),
            is_array($decodedSchema) ? $decodedSchema : []
        );
    }

    public function list(int $limit = 50): array
    {
        $safeLimit = max(1, min(500, $limit));
        $sql = "SELECT {$this->idCol} AS id, {$this->titleCol} AS title, {$this->updatedAtCol} AS updated_at FROM {$this->table} ORDER BY {$this->updatedAtCol} DESC LIMIT {$safeLimit}";
        $stmt = $this->pdo->query($sql);

        if (!$stmt) {
            return [];
        }

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function delete(string $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->idCol} = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
