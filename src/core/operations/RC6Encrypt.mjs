/**
 * @author Copilot
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import RC6 from "../lib/RC6.mjs";
import OperationError from "../errors/OperationError.mjs";
import {toBase64} from "../lib/Base64.mjs";

/**
 * RC6 Encrypt operation
 */
class RC6Encrypt extends Operation {

    /**
     * RC6Encrypt constructor
     */
    constructor() {
        super();

        this.name = "RC6 Encrypt";
        this.module = "Ciphers";
        this.description = "RC6 is a symmetric-key block cipher derived from RC5. It was designed by Ronald Rivest, Matt Robshaw, Ray Sidney, and Yiqun Lisa Yin to meet the requirements of the Advanced Encryption Standard (AES) competition. RC6 proper has a block size of 128 bits and supports key sizes of 128, 192, and 256 bits.<br><br><b>Key:</b> RC6 supports variable key lengths. The algorithm will use the provided key length (128, 192, or 256 bits are recommended).<br><br><b>IV:</b> For CBC mode, the Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes for CBC mode. For ECB mode, no IV is required.<br><br><b>Padding:</b> PKCS#7 padding will be used.";
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
                "value": ["Raw", "Hex"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Hex", "Raw", "Base64"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid key length
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

        // Convert input to byte string, then to Uint8Array
        const inputByteString = Utils.convertToByteString(input, inputType);
        const inputBytes = new Uint8Array(Array.from(inputByteString).map(c => c.charCodeAt(0)));

        // Convert key and IV to Uint8Array
        const keyBytes = new Uint8Array(Array.from(key).map(c => c.charCodeAt(0)));
        const ivBytes = iv.length > 0 ? new Uint8Array(Array.from(iv).map(c => c.charCodeAt(0))) : new Uint8Array(16);

        // Create RC6 cipher instance
        const cipher = new RC6(keyBytes);

        let ciphertext;
        
        if (mode === "CBC") {
            if (ivBytes.length !== 16) {
                throw new OperationError("IV must be 16 bytes for CBC mode");
            }
            ciphertext = cipher.encryptCBC(inputBytes, ivBytes);
        } else if (mode === "ECB") {
            ciphertext = cipher.encryptECB(inputBytes);
        } else {
            throw new OperationError("Unsupported mode: " + mode);
        }

        // Convert output to requested format
        if (outputType === "Hex") {
            return Array.from(ciphertext).map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (outputType === "Base64") {
            return toBase64(ciphertext);
        } else {
            return String.fromCharCode(...ciphertext);
        }
    }
}

export default RC6Encrypt;