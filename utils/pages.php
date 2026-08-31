<?php

/*
 * A.t.A. Tech Wiki
 * Page API
 *
 * Handles reading wiki pages from pages.json.
 */

require_once __DIR__ . '/data.php';


function getPages(): array
{
    return readJsonFile('pages.json');
}


function getPage(string $sku): ?array
{
    $pages = getPages();

    foreach ($pages as $page) {

        if ((string)($page['SKU'] ?? '') === $sku) {
            return $page;
        }

    }

    return null;
}