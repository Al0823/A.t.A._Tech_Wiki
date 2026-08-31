<?php

/*
 * A.t.A. Tech Wiki
 * Data utilities
 * Functions for reading the wiki's data files.
 */

function getDataPath(string $filename): string
{
    return __DIR__ . '/../data/' . $filename;
}

function readJsonFile(string $filename): array
{
    $path = getDataPath($filename);

    if (!file_exists($path)) {
        throw new RuntimeException(
            "Data file not found: " . $filename
        );
    }

    $json = file_get_contents($path);

    if ($json === false) {
        throw new RuntimeException(
            "Unable to read data file: " . $filename
        );
    }

    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException(
            "Invalid JSON in " . $filename . ": " .
            json_last_error_msg()
        );
    }

    return $data;
}