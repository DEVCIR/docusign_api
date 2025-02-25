<?php

namespace App\Http\Middleware;

use Closure;

class AddCsrfToken
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('X-CSRF-TOKEN', csrf_token());
        return $response;
    }
}