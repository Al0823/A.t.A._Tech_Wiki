<?php

/*
 * A.t.A. Tech Wiki
 * Comment List API
 */

require_once __DIR__ . '/comments.php';

header('Content-Type: application/json');

try {

    $pageSku = trim($_GET['pageSku'] ?? '');

    if ($pageSku === '') {

        http_response_code(400);

        echo json_encode([
            'error' => 'Missing page SKU'
        ]);

        exit;
    }

    $comments =
        getCommentsForPage($pageSku);

    echo json_encode(
        $comments,
        JSON_PRETTY_PRINT
    );

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}