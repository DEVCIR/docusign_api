<?php
return [
    // 'paths' => ['api/*', 'storage/*','public/storage/*'], // Ensure storage paths are included
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/documents/*'], // Allow CORS for specific paths

    'allowed_methods' => ['*'], // Allow all HTTP methods
    'allowed_origins' => ['http://localhost','http://localhost:3000','https://localhost:3000','http://localhost:3001','https://localhost:3001','http://localhost:3002','https://localhost:3002','https://docusign.devcir.co','http://docusign.devcir.co','https://userdocusign.devcir.co','http://userdocusign.devcir.co'], // Add your frontend URL
    // 'allowed_origins' => ['*'], // Add your frontend URL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*', 'X-API-Key', 'Authorization'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // If sending credentials like cookies
];
