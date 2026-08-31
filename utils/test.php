<?php

require_once __DIR__ . '/data.php';

try {
    $pages = readJsonFile('pages.json');

    header('Content-Type: application/json');

    echo json_encode([
        'success' => true,
        'count' => count($pages),
        'pages' => $pages
    ], JSON_PRETTY_PRINT);

} catch (Throwable $e) {

    http_response_code(500);

    header('Content-Type: application/json');

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}