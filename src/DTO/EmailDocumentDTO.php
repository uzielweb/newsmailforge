<?php

declare(strict_types=1);

namespace NewsMailForge\DTO;

/**
 * Data Transfer Object for Email Document.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class EmailDocumentDTO
{
    /**
     * @param array<string, mixed> $schema
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public readonly ?string $id,
        public readonly string $title,
        public readonly string $compiledHtml,
        public readonly array $schema,
        public readonly array $metadata = []
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $id = isset($data['id']) && $data['id'] !== '' ? (string) $data['id'] : null;
        $title = isset($data['title']) ? (string) $data['title'] : 'Untitled Newsletter';
        $compiledHtml = isset($data['compiledHtml']) ? (string) $data['compiledHtml'] : (isset($data['html']) ? (string) $data['html'] : '');
        $schema = isset($data['schema']) && is_array($data['schema']) ? $data['schema'] : [];
        $metadata = isset($data['metadata']) && is_array($data['metadata']) ? $data['metadata'] : [];

        return new self($id, $title, $compiledHtml, $schema, $metadata);
    }

    /**
     * @return array{id: ?string, title: string, compiledHtml: string, schema: array<string, mixed>, metadata: array<string, mixed>}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'compiledHtml' => $this->compiledHtml,
            'schema' => $this->schema,
            'metadata' => $this->metadata,
        ];
    }
}
