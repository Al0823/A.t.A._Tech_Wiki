<?php

/*
 * A.t.A. Tech Wiki
 * Add Comment API
 */

require_once __DIR__ . '/comments.php';

header('Content-Type: application/json');


try {

    $input = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($input)) {

        http_response_code(400);

        echo json_encode([
            'error' => 'Invalid JSON request'
        ]);

        exit;
    }


    $pageSku = trim(
        (string)($input['pageSku'] ?? '')
    );

    $commentText = trim(
        (string)($input['comment'] ?? '')
    );


    if ($pageSku === '') {

        http_response_code(400);

        echo json_encode([
            'error' => 'Missing page SKU'
        ]);

        exit;
    }


    if ($commentText === '') {

        http_response_code(400);

        echo json_encode([
            'error' => 'Comment cannot be empty'
        ]);

        exit;
    }


    if (strlen($commentText) > 5000) {

        http_response_code(400);

        echo json_encode([
            'error' => 'Comment is too long'
        ]);

        exit;
    }


    $comments = getComments();


    /*
     * Find the next comment SKU.
     */

    $highestSku = 0;

    foreach ($comments as $existingComment) {

        $existingSku =
            (int)($existingComment['SKU'] ?? 0);

        if ($existingSku > $highestSku) {
            $highestSku = $existingSku;
        }
    }


    $newSku = (string)($highestSku + 1);


    /*
     * Create the new comment.
     *
     * R_MEMBERS will temporarily be 0.
     * We will replace this with the actual
     * logged-in member when PHP sessions
     * are implemented.
     */

    $newComment = [
        'SKU' => $newSku,
        'R_MEMBERS' => '0',
        'R_PAGES' => $pageSku,
        'STATUS' => '1',
        'CREATEDATE' => date('m/d/Y'),
        'CREATETIME' => date('H:i:s'),
        'COMMENT' => $commentText
    ];


    $comments[] = $newComment;


    /*
     * Write the updated JSON file.
     */

    $path = getDataPath('comments.json');

    $json = json_encode(
        $comments,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );


    if ($json === false) {

        throw new RuntimeException(
            'Unable to encode comments'
        );
    }


    if (
        file_put_contents(
            $path,
            $json . PHP_EOL,
            LOCK_EX
        ) === false
    ) {

        throw new RuntimeException(
            'Unable to save comments'
        );
    }


    echo json_encode([
        'success' => true,
        'comment' => $newComment
    ]);


} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}