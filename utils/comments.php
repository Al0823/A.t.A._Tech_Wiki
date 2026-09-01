<?php

/*
 * A.t.A. Tech Wiki
 * Comment data utilities
 */

require_once __DIR__ . '/data.php';


function getComments(): array
{
    return readJsonFile('comments.json');
}


function getCommentsForPage(string $pageSku): array
{
    $comments = getComments();

    $results = array_filter(
        $comments,
        function ($comment) use ($pageSku) {

            return
                (string)($comment['R_PAGES'] ?? '') === $pageSku
                &&
                (string)($comment['STATUS'] ?? '') === '1';
        }
    );

    return array_values($results);
}