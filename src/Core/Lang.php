<?php

declare(strict_types=1);

namespace NewsMailForge\Core;

/**
 * Agnostic i18n Dictionary Handler.
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class Lang
{
    private static string $locale = 'pt-BR';
    private static string $fallbackLocale = 'en-GB';
    private static ?string $basePath = null;
    /** @var array<string, array<string, string>> */
    private static array $dictionaries = [];

    public static function init(string $locale = 'pt-BR', ?string $basePath = null): void
    {
        self::$locale = $locale;
        self::$basePath = $basePath ?? dirname(__DIR__, 2) . '/language';
        self::loadDictionary(self::$locale);
        if (self::$locale !== self::$fallbackLocale) {
            self::loadDictionary(self::$fallbackLocale);
        }
    }

    public static function setLocale(string $locale): void
    {
        self::$locale = $locale;
        self::loadDictionary($locale);
    }

    public static function getLocale(): string
    {
        return self::$locale;
    }

    public static function loadDictionary(string $locale): void
    {
        if (isset(self::$dictionaries[$locale])) {
            return;
        }

        $base = self::$basePath ?? dirname(__DIR__, 2) . '/language';
        $file = $base . '/' . $locale . '/' . $locale . '.json';

        if (is_file($file)) {
            $raw = file_get_contents($file);
            $parsed = json_decode($raw ?: '', true);
            if (is_array($parsed)) {
                self::$dictionaries[$locale] = $parsed;
                return;
            }
        }

        self::$dictionaries[$locale] = [];
    }

    /**
     * @param array<string, scalar> $replacements
     */
    public static function t(string $key, array $replacements = []): string
    {
        if (empty(self::$dictionaries)) {
            self::init(self::$locale);
        }

        $translation = self::$dictionaries[self::$locale][$key]
            ?? self::$dictionaries[self::$fallbackLocale][$key]
            ?? $key;

        foreach ($replacements as $k => $v) {
            $val = (string) $v;
            $translation = str_replace('{' . $k . '}', $val, $translation);
            $translation = str_replace(':' . $k, $val, $translation);
        }

        return $translation;
    }
}
