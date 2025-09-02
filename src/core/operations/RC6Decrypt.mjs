/**
 * @author Copilot
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import RC6 from "../lib/RC6.mjs";
import OperationError from "../errors/OperationError.mjs";
import {fromBase64} from "../lib/Base64.mjs";

/**
 * RC6 Decrypt operation
 */
class RC6Decrypt extends Operation {

    /**
     * RC6Decrypt constructor
     */
    constructor() {
        super();

        this.name = "RC6 Decrypt";
        this.module = "Ciphers";
        this.description = "RC6 is a symmetric-key block cipher derived from RC5. It was designed by Ronald Rivest, Matt Robshaw, Ray Sidney, and Yiqun Lisa Yin to meet the requirements of the Advanced Encryption Standard (AES) competition. RC6 proper has a block size of 128 bits and supports key sizes of 128, 192, and 256 bits.<br><br><b>Key:</b> RC6 supports variable key lengths. The algorithm will use the provided key length (128, 192, or 256 bits are recommended).<br><br><b>IV:</b> For CBC mode, the Initialization Vector should be 16 bytes long. For ECB mode, no IV is required.<br><br><b>Padding:</b> PKCS#7 padding will be used.";
        this.infoURL = "https://wikipedia.org/wiki/RC6";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Mode",
                "type": "argSelector",
                "value": [
                    {
                        name: "CBC",
                        off: []
                    },
                    {
                        name: "ECB",
                        off: []
                    }
                ]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Hex", "Raw", "Base64"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid key or input
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        // Validate key length
        if (key.length === 0) {
            throw new OperationError("Key cannot be empty");
        }

        // Convert input to Uint8Array based on input type
        let inputBytes;
        if (inputType === "Hex") {
            const inputByteString = Utils.convertToByteString(input, inputType);
            inputBytes = new Uint8Array(Array.from(inputByteString).map(c => c.charCodeAt(0)));
        } else if (inputType === "Base64") {
            inputBytes = fromBase64(input);
        } else {
            const inputByteString = Utils.convertToByteString(input, inputType);
            inputBytes = new Uint8Array(Array.from(inputByteString).map(c => c.charCodeAt(0)));
        }

        // Convert key and IV to Uint8Array
        const keyBytes = new Uint8Array(Array.from(key).map(c => c.charCodeAt(0)));
        const ivBytes = new Uint8Array(Array.from(iv).map(c => c.charCodeAt(0)));

        // Create RC6 cipher instance
        const cipher = new RC6(keyBytes);

        let plaintext;
        
        if (mode === "CBC") {
            // Validate IV
            if (ivBytes.length !== 16) {
                throw new OperationError("IV must be 16 bytes for CBC mode");
            }
            plaintext = cipher.decryptCBC(inputBytes, ivBytes);
        } else if (mode === "ECB") {
            plaintext = cipher.decryptECB(inputBytes);
        } else {
            throw new OperationError("Unsupported mode: " + mode);
        }

        // Convert output to requested format
        if (outputType === "Hex") {
            return Array.from(plaintext).map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
            return String.fromCharCode(...plaintext);
        }
    }
}

export default RC6Decrypt;