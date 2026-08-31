<?php

/*
 * A.t.A. Tech Wiki
 * Individual Page API
 */

require_once __DIR__ . '/pages.php';

header('Content-Type: application/json');

try {

    $sku = trim($_GET['sku'] ?? '');

    if ($sku === '') {
        http_response_code(400);

        echo json_encode([
            'error' => 'Missing page SKU'
        ]);

        exit;
    }

    $page = getPage($sku);

    if ($page === null) {
        http_response_code(404);

        echo json_encode([
            'error' => 'Page not found'
        ]);

        exit;
    }

    echo json_encode(
        $page,
        JSON_PRETTY_PRINT
    );

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}