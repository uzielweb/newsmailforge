<?php

declare(strict_types=1);

namespace NewsMailForge\Core;

/**
 * OWASP-compliant Security & Sanitization Guard for Email Templates.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class SecurityGuard
{
    private const ALLOWED_URL_SCHEMES = ['https', 'http', 'mailto', 'tel'];

    /**
     * Sanitizes email HTML, removing scripts and dangerous handlers
     * while preserving MSO conditional comments, VML namespaces and email markup.
     */
    public static function sanitizeHtml(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        // 1. Remove dangerous executable tags and contents
        $dangerousTags = ['script', 'iframe', 'object', 'embed', 'applet', 'form'];
        foreach ($dangerousTags as $tag) {
            $html = preg_replace('/<' . $tag . '\b[^>]*>(.*?)<\/' . $tag . '>/is', '', $html) ?? $html;
            $html = preg_replace('/<' . $tag . '\b[^>]*\/?>/is', '', $html) ?? $html;
        }

        // 2. Remove inline event handlers (onclick, onload, onerror, onmouseover, etc.)
        $html = preg_replace('/\s*on[a-zA-Z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html) ?? $html;

        // 3. Remove dangerous URL pseudo-protocols in attributes (href, src, etc.)
        $html = preg_replace_callback(
            '/\b(href|src|action|poster)\s*=\s*("([^"]*)"|\'([^\']*)\'|([^\s>]+))/i',
            static function (array $matches): string {
                $attr = $matches[1];
                $quote = isset($matches[3]) ? '"' : (isset($matches[4]) ? "'" : '');
                $rawUrl = $matches[3] ?? $matches[4] ?? $matches[5] ?? '';
                $cleanUrl = self::sanitizeUrl(html_entity_decode($rawUrl, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                return $attr . '=' . $quote . htmlspecialchars($cleanUrl, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . $quote;
            },
            $html
        ) ?? $html;

        // 4. Strip dangerous data:text/html or javascript: references embedded in styles
        $html = preg_replace('/url\s*\(\s*["\']?\s*(javascript|data:text\/html|vbscript):[^)]+\)/i', 'none', $html) ?? $html;

        return $html;
    }

    /**
     * Sanitizes URLs, allowing only safe protocols for newsletter templates.
     */
    public static function sanitizeUrl(string $url): string
    {
        $trimmed = trim($url);

        if ($trimmed === '' || $trimmed === '#') {
            return '#';
        }

        // Allow relative anchor links or root-relative paths
        if (str_starts_with($trimmed, '#') || str_starts_with($trimmed, '/')) {
            return $trimmed;
        }

        $scheme = parse_url($trimmed, PHP_URL_SCHEME);
        if ($scheme === null) {
            return 'https://' . ltrim($trimmed, '/');
        }

        $schemeLower = strtolower($scheme);
        if (!in_array($schemeLower, self::ALLOWED_URL_SCHEMES, true)) {
            return '#';
        }

        return $trimmed;
    }

    /**
     * Validates JSON schema document structure, hierarchy and depth.
     *
     * @param array<string, mixed> $schema
     * @return array<string, mixed>
     * @throws \InvalidArgumentException
     */
    public static function validateSchema(array $schema, int $maxDepth = 12): array
    {
        if (empty($schema)) {
            throw new \InvalidArgumentException(Lang::t('bridge.error.invalid_schema'));
        }

        self::checkDepthAndSanitizeNode($schema, 1, $maxDepth);

        return $schema;
    }

    /**
     * @param array<string, mixed> $node
     * @throws \InvalidArgumentException
     */
    private static function checkDepthAndSanitizeNode(array &$node, int $currentDepth, int $maxDepth): void
    {
        if ($currentDepth > $maxDepth) {
            throw new \InvalidArgumentException(Lang::t('bridge.error.depth_exceeded'));
        }

        // Recursive traversal for nested elements: blocks, rows, cells, children, atoms
        $nestedKeys = ['blocks', 'rows', 'cells', 'children', 'atoms'];
        foreach ($nestedKeys as $key) {
            if (isset($node[$key]) && is_array($node[$key])) {
                foreach ($node[$key] as &$child) {
                    if (is_array($child)) {
                        self::checkDepthAndSanitizeNode($child, $currentDepth + 1, $maxDepth);
                    }
                }
                unset($child);
            }
        }

        // Sanitize string content inside nodes if present
        if (isset($node['content']) && is_string($node['content'])) {
            $node['content'] = self::sanitizeHtml($node['content']);
        }
        if (isset($node['url']) && is_string($node['url'])) {
            $node['url'] = self::sanitizeUrl($node['url']);
        }
        if (isset($node['href']) && is_string($node['href'])) {
            $node['href'] = self::sanitizeUrl($node['href']);
        }
        if (isset($node['src']) && is_string($node['src'])) {
            $node['src'] = self::sanitizeUrl($node['src']);
        }
    }
}
