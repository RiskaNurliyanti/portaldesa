<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Resolves the public base URL of the frontend application.
 *
 * Used to build absolute links that leave the backend (password reset
 * emails, QR verification codes) and therefore cannot rely on relative
 * paths or the backend's own host.
 *
 * Resolution order:
 * 1. The current request's Origin header.
 * 2. The current request's Referer header (scheme + host + port only).
 * 3. The FRONTEND_URL config value.
 *
 * Loopback hosts (localhost, 127.0.0.1) are never accepted from Origin
 * or Referer, since a link resolved to them would be unreachable from
 * any device other than the server itself.
 */
class FrontendUrl
{
    public static function resolve(): string
    {
        $request = app()->bound('request') ? app('request') : null;

        if ($request instanceof Request) {
            $fromOrigin = self::extractOrigin($request->headers->get('origin'));
            if ($fromOrigin && ! self::isLoopback($fromOrigin)) {
                return $fromOrigin;
            }

            $fromReferer = self::extractOrigin($request->headers->get('referer'));
            if ($fromReferer && ! self::isLoopback($fromReferer)) {
                return $fromReferer;
            }
        }

        return self::configFallback();
    }

    /**
     * config('key', $default) only applies $default when the key is
     * absent, not when its value is empty/null. Since 'app.frontend_url'
     * is always defined, an empty FRONTEND_URL env value would otherwise
     * pass through as null. Validate explicitly instead.
     */
    private static function configFallback(): string
    {
        $value = config('app.frontend_url');

        if (empty($value) || ! str_contains($value, '://')) {
            $value = 'http://localhost:3000';
        }

        return rtrim($value, '/');
    }

    private static function isLoopback(string $origin): bool
    {
        $host = parse_url($origin, PHP_URL_HOST);

        return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    }

    private static function extractOrigin(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $parts = parse_url($url);

        if (!isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        return "{$parts['scheme']}://{$parts['host']}{$port}";
    }
}
