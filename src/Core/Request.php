<?php

declare(strict_types=1);

namespace NewsMailForge\Core;

/**
 * Agnostic HTTP Request Wrapper.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class Request
{
    private string $method;
    /** @var array<string, mixed> */
    private array $query;
    /** @var array<string, mixed> */
    private array $body;
    /** @var array<string, string> */
    private array $headers;

    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed> $body
     * @param array<string, string> $headers
     */
    public function __construct(string $method = 'GET', array $query = [], array $body = [], array $headers = [])
    {
        $this->method = strtoupper($method);
        $this->query = $query;
        $this->body = $body;
        $this->headers = $headers;
    }

    public static function createFromGlobals(): self
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $query = $_GET;
        $rawInput = file_get_contents('php://input') ?: '';
        $body = [];

        if (trim($rawInput) !== '') {
            $decoded = json_decode($rawInput, true);
            if (is_array($decoded)) {
                $body = $decoded;
            }
        }

        if (empty($body) && !empty($_POST)) {
            $body = $_POST;
        }

        $headers = [];
        foreach ($_SERVER as $key => $val) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerName = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$headerName] = (string) $val;
            }
        }

        return new self($method, $query, $body, $headers);
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    /**
     * @return array<string, mixed>
     */
    public function getQueryAll(): array
    {
        return $this->query;
    }

    public function getQuery(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    /**
     * @return array<string, mixed>
     */
    public function getBody(): array
    {
        return $this->body;
    }

    public function getJson(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }
}
