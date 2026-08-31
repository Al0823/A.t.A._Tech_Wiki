<?php

require_once __DIR__ . '/pages.php';

header('Content-Type: application/json');

try {

    $pages = getPages();

    $search = trim($_GET['search'] ?? '');

    if ($search !== '') {

        $searchLower = strtolower($search);

        $pages = array_filter(
            $pages,
            function ($page) use ($searchLower) {

                $title = strtolower(
                    (string)($page['TITLE'] ?? '')
                );

                return str_contains(
                    $title,
                    $searchLower
                );
            }
        );

        $pages = array_values($pages);
    }

    echo json_encode(
        $pages,
        JSON_PRETTY_PRINT
    );

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}