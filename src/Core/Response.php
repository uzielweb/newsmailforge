<?php

declare(strict_types=1);

namespace NewsMailForge\Core;

/**
 * Agnostic HTTP Response Wrapper.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class Response
{
    private int $statusCode;
    private string $content;
    /** @var array<string, string> */
    private array $headers;

    /**
     * @param array<string, string> $headers
     */
    public function __construct(string $content = '', int $statusCode = 200, array $headers = [])
    {
        $this->content = $content;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    /**
     * @param array<string, string> $headers
     */
    public static function json(mixed $data, int $statusCode = 200, array $headers = []): self
    {
        $defaultHeaders = ['Content-Type' => 'application/json; charset=UTF-8'];
        $mergedHeaders = array_merge($defaultHeaders, $headers);
        $encoded = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{}';

        return new self($encoded, $statusCode, $mergedHeaders);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    /**
     * @return array<string, string>
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function send(): void
    {
        if (!headers_sent()) {
            http_response_code($this->statusCode);
            foreach ($this->headers as $name => $val) {
                header($name . ': ' . $val);
            }
        }
        echo $this->content;
    }
}
