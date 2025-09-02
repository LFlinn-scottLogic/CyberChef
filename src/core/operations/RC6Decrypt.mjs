/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import CryptoJS from "crypto-js";
import OperationError from "../errors/OperationError.mjs";

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
        this.description = "RC6 is a symmetric key block cipher derived from RC5. It was a finalist in the AES contest. It has a block size of 128 bits and supports key sizes of 128, 192, and 256 bits.<br><br><b>Key:</b> The key length determines the algorithm used (e.g., 16 bytes for RC6-128).<br><br><b>IV:</b> The Initialization Vector should be 16 bytes long.<br><br><b>Padding:</b> PKCS#7 padding is assumed by default.";
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
                "type": "option",
                "value": ["CBC", "CFB", "OFB", "CTR", "ECB", "CBC/NoPadding", "ECB/NoPadding"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Base64", "Hex", "Raw"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["UTF8", "Hex", "Raw"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const keyByteString = Utils.convertToByteString(args[0].string, args[0].option);
        const ivByteString = Utils.convertToByteString(args[1].string, args[1].option);
        const modeArg = args[2];
        const inputType = args[3];
        const outputType = args[4];

        const key = CryptoJS.enc.Latin1.parse(keyByteString);
        const iv = CryptoJS.enc.Latin1.parse(ivByteString);

        if (iv.sigBytes !== 16 && iv.sigBytes > 0) {
            throw new OperationError("IV must be 16 bytes long.");
        }

        const modeName = modeArg.split("/")[0];
        const noPadding = modeArg.endsWith("NoPadding");

        const modeObj = CryptoJS.mode[modeName];
        if (!modeObj) {
            throw new OperationError(`Unsupported mode: ${modeName}`);
        }

        const padding = noPadding ? CryptoJS.pad.NoPadding : CryptoJS.pad.Pkcs7;

        let ciphertext;
        if (inputType === "Raw") {
            ciphertext = CryptoJS.enc.Latin1.parse(input);
        } else if (inputType === "Hex") {
            ciphertext = CryptoJS.enc.Hex.parse(input);
        } else { // Base64
            ciphertext = CryptoJS.enc.Base64.parse(input);
        }

        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: ciphertext
        });

        if (noPadding && ciphertext.sigBytes % 16 !== 0) {
            throw new OperationError("Input length must be a multiple of 16 bytes for NoPadding modes.");
        }

        // Decrypt
        const decrypted = CryptoJS.RC6.decrypt(cipherParams, key, {
            iv: iv,
            mode: modeObj,
            padding: padding
        });

        if (decrypted.sigBytes === 0 && ciphertext.sigBytes > 0) {
            throw new OperationError("Unable to decrypt input with these parameters. The key may be incorrect or the data is corrupted.");
        }

        try {
            if (outputType === "Hex") {
                return decrypted.toString(CryptoJS.enc.Hex);
            } else if (outputType === "Raw") {
                return decrypted.toString(CryptoJS.enc.Latin1);
            } else { // UTF8
                const utf8String = decrypted.toString(CryptoJS.enc.Utf8);
                if (utf8String.length === 0 && decrypted.sigBytes > 0) {
                    throw new Error("Invalid UTF-8 output");
                }
                return utf8String;
            }
        } catch (err) {
            throw new OperationError("Unable to decrypt input with these parameters. The key may be incorrect or the data is not valid " + outputType + ".");
        }
    }
}

export default RC6Decrypt;
