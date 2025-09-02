/**
 * @author Copilot
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "RC6 Encrypt: Basic test, 128-bit key",
        "input": "Hello, World!",
        "expectedOutput": "8c70b5eac2518728f7e3bf5842d080b5",
        "recipeConfig": [
            {
                "op": "RC6 Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": ""},
                    "ECB",
                    "Raw", "Hex"
                ],
            },
        ],
    },
    {
        "name": "RC6 Decrypt: Basic test, 128-bit key",
        "input": "8c70b5eac2518728f7e3bf5842d080b5",
        "expectedOutput": "Hello, World!",
        "recipeConfig": [
            {
                "op": "RC6 Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": ""},
                    "ECB",
                    "Hex", "Raw"
                ],
            },
        ],
    },
    {
        "name": "RC6 Encrypt: CBC mode with IV",
        "input": "The quick brown fox jumps over the lazy dog",
        "expectedOutput": "thwDe+MzSz+QwUDdLopkVGNACxrKg6qBz6hkIb3xNrLoYw+dw7cxmDHzcMb/BLRP",
        "recipeConfig": [
            {
                "op": "RC6 Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": "0123456789abcdef"},
                    "CBC",
                    "Raw", "Base64"
                ],
            },
        ],
    },
    {
        "name": "RC6 Decrypt: CBC mode with IV",
        "input": "thwDe+MzSz+QwUDdLopkVGNACxrKg6qBz6hkIb3xNrLoYw+dw7cxmDHzcMb/BLRP",
        "expectedOutput": "The quick brown fox jumps over the lazy dog",
        "recipeConfig": [
            {
                "op": "RC6 Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": "0123456789abcdef"},
                    "CBC",
                    "Base64", "Raw"
                ],
            },
        ],
    },
]);