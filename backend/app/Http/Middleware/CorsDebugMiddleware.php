<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsDebugMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {   
        $response = $next($request);

    return $response->header('Access-Control-Allow-Origin', 'http://localhost:3000,http://localhost:3001,http://localhost:3002,https://docusign.devcir.co','http://docusign.devcir.co','http://userdocusign.devcir.co','https://userdocusign.devcir.co')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
