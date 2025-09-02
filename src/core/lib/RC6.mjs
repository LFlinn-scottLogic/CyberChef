/**
 * RC6 cipher implementation
 * Based on the RC6 algorithm specification
 * 
 * @author Copilot
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/**
 * RC6 block cipher implementation
 * RC6 is a symmetric key block cipher with a block size of 128 bits
 * and variable key length (128, 192, or 256 bits)
 */
class RC6 {
    
    /**
     * RC6 constructor
     * @param {Uint8Array} key - The encryption key
     * @param {number} rounds - Number of rounds (default 20)
     */
    constructor(key, rounds = 20) {
        this.rounds = rounds;
        this.keySchedule = this.keyExpansion(key);
    }

    /**
     * Constants for RC6
     */
    static get P32() { return 0xB7E15163; } // Odd((e-2)*2^32)
    static get Q32() { return 0x9E3779B9; } // Odd((φ-1)*2^32) where φ is golden ratio

    /**
     * Left rotate function for 32-bit integers
     * @param {number} value - Value to rotate
     * @param {number} amount - Amount to rotate
     * @returns {number} Rotated value
     */
    static rotateLeft(value, amount) {
        amount = amount & 0x1F; // Only use bottom 5 bits
        return ((value << amount) | (value >>> (32 - amount))) >>> 0;
    }

    /**
     * Right rotate function for 32-bit integers
     * @param {number} value - Value to rotate
     * @param {number} amount - Amount to rotate
     * @returns {number} Rotated value
     */
    static rotateRight(value, amount) {
        amount = amount & 0x1F; // Only use bottom 5 bits
        return ((value >>> amount) | (value << (32 - amount))) >>> 0;
    }

    /**
     * Convert bytes to 32-bit words (little-endian)
     * @param {Uint8Array} bytes - Input bytes
     * @returns {number[]} Array of 32-bit words
     */
    static bytesToWords(bytes) {
        const words = [];
        for (let i = 0; i < bytes.length; i += 4) {
            let word = 0;
            for (let j = 0; j < 4 && i + j < bytes.length; j++) {
                word |= bytes[i + j] << (j * 8);
            }
            words.push(word >>> 0); // Ensure unsigned 32-bit
        }
        return words;
    }

    /**
     * Convert 32-bit words to bytes (little-endian)
     * @param {number[]} words - Array of 32-bit words
     * @returns {Uint8Array} Output bytes
     */
    static wordsToBytes(words) {
        const bytes = new Uint8Array(words.length * 4);
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < 4; j++) {
                bytes[i * 4 + j] = (word >>> (j * 8)) & 0xFF;
            }
        }
        return bytes;
    }

    /**
     * Key expansion algorithm
     * @param {Uint8Array} key - Input key
     * @returns {number[]} Expanded key schedule
     */
    keyExpansion(key) {
        const keyWords = RC6.bytesToWords(key);
        const c = keyWords.length;
        const t = 2 * (this.rounds + 2);
        
        // Initialize S array
        const S = new Array(t);
        S[0] = RC6.P32;
        for (let i = 1; i < t; i++) {
            S[i] = (S[i - 1] + RC6.Q32) >>> 0;
        }

        // Key mixing
        let i = 0, j = 0;
        let A = 0, B = 0;
        const v = 3 * Math.max(t, c);

        for (let s = 0; s < v; s++) {
            A = S[i] = RC6.rotateLeft((S[i] + A + B) >>> 0, 3);
            B = keyWords[j] = RC6.rotateLeft((keyWords[j] + A + B) >>> 0, (A + B) & 0x1F);
            i = (i + 1) % t;
            j = (j + 1) % c;
        }

        return S;
    }

    /**
     * Encrypt a single 128-bit block
     * @param {Uint8Array} plaintext - 16-byte plaintext block
     * @returns {Uint8Array} 16-byte ciphertext block
     */
    encryptBlock(plaintext) {
        if (plaintext.length !== 16) {
            throw new Error("Block size must be 16 bytes");
        }

        const words = RC6.bytesToWords(plaintext);
        let [A, B, C, D] = words;

        // Pre-whitening
        B = (B + this.keySchedule[0]) >>> 0;
        D = (D + this.keySchedule[1]) >>> 0;

        // Main rounds
        for (let i = 1; i <= this.rounds; i++) {
            const t = RC6.rotateLeft((B * (2 * B + 1)) >>> 0, 5);
            const u = RC6.rotateLeft((D * (2 * D + 1)) >>> 0, 5);
            A = (RC6.rotateLeft((A ^ t) >>> 0, u & 0x1F) + this.keySchedule[2 * i]) >>> 0;
            C = (RC6.rotateLeft((C ^ u) >>> 0, t & 0x1F) + this.keySchedule[2 * i + 1]) >>> 0;
            [A, B, C, D] = [B, C, D, A];
        }

        // Post-whitening
        A = (A + this.keySchedule[2 * this.rounds + 2]) >>> 0;
        C = (C + this.keySchedule[2 * this.rounds + 3]) >>> 0;

        return RC6.wordsToBytes([A, B, C, D]);
    }

    /**
     * Decrypt a single 128-bit block
     * @param {Uint8Array} ciphertext - 16-byte ciphertext block
     * @returns {Uint8Array} 16-byte plaintext block
     */
    decryptBlock(ciphertext) {
        if (ciphertext.length !== 16) {
            throw new Error("Block size must be 16 bytes");
        }

        const words = RC6.bytesToWords(ciphertext);
        let [A, B, C, D] = words;

        // Undo post-whitening
        C = (C - this.keySchedule[2 * this.rounds + 3]) >>> 0;
        A = (A - this.keySchedule[2 * this.rounds + 2]) >>> 0;

        // Undo main rounds
        for (let i = this.rounds; i >= 1; i--) {
            [A, B, C, D] = [D, A, B, C];
            const u = RC6.rotateLeft((D * (2 * D + 1)) >>> 0, 5);
            const t = RC6.rotateLeft((B * (2 * B + 1)) >>> 0, 5);
            C = (RC6.rotateRight((C - this.keySchedule[2 * i + 1]) >>> 0, t & 0x1F) ^ u) >>> 0;
            A = (RC6.rotateRight((A - this.keySchedule[2 * i]) >>> 0, u & 0x1F) ^ t) >>> 0;
        }

        // Undo pre-whitening
        D = (D - this.keySchedule[1]) >>> 0;
        B = (B - this.keySchedule[0]) >>> 0;

        return RC6.wordsToBytes([A, B, C, D]);
    }

    /**
     * Encrypt data in CBC mode
     * @param {Uint8Array} plaintext - Input plaintext
     * @param {Uint8Array} iv - 16-byte initialization vector
     * @returns {Uint8Array} Encrypted ciphertext
     */
    encryptCBC(plaintext, iv) {
        if (iv.length !== 16) {
            throw new Error("IV must be 16 bytes");
        }

        // PKCS#7 padding
        const paddedLength = Math.ceil(plaintext.length / 16) * 16;
        const padded = new Uint8Array(paddedLength);
        padded.set(plaintext);
        const paddingValue = paddedLength - plaintext.length;
        for (let i = plaintext.length; i < paddedLength; i++) {
            padded[i] = paddingValue;
        }

        const ciphertext = new Uint8Array(paddedLength);
        let previousBlock = iv;

        for (let i = 0; i < paddedLength; i += 16) {
            const block = new Uint8Array(16);
            for (let j = 0; j < 16; j++) {
                block[j] = padded[i + j] ^ previousBlock[j];
            }
            const encryptedBlock = this.encryptBlock(block);
            ciphertext.set(encryptedBlock, i);
            previousBlock = encryptedBlock;
        }

        return ciphertext;
    }

    /**
     * Decrypt data in CBC mode
     * @param {Uint8Array} ciphertext - Input ciphertext
     * @param {Uint8Array} iv - 16-byte initialization vector
     * @returns {Uint8Array} Decrypted plaintext
     */
    decryptCBC(ciphertext, iv) {
        if (iv.length !== 16) {
            throw new Error("IV must be 16 bytes");
        }
        if (ciphertext.length % 16 !== 0) {
            throw new Error("Ciphertext length must be multiple of 16");
        }

        const plaintext = new Uint8Array(ciphertext.length);
        let previousBlock = iv;

        for (let i = 0; i < ciphertext.length; i += 16) {
            const block = ciphertext.slice(i, i + 16);
            const decryptedBlock = this.decryptBlock(block);
            for (let j = 0; j < 16; j++) {
                plaintext[i + j] = decryptedBlock[j] ^ previousBlock[j];
            }
            previousBlock = block;
        }

        // Remove PKCS#7 padding
        const paddingValue = plaintext[plaintext.length - 1];
        if (paddingValue > 0 && paddingValue <= 16) {
            return plaintext.slice(0, plaintext.length - paddingValue);
        }

        return plaintext;
    }

    /**
     * Encrypt data in ECB mode
     * @param {Uint8Array} plaintext - Input plaintext
     * @returns {Uint8Array} Encrypted ciphertext
     */
    encryptECB(plaintext) {
        // PKCS#7 padding
        const paddedLength = Math.ceil(plaintext.length / 16) * 16;
        const padded = new Uint8Array(paddedLength);
        padded.set(plaintext);
        const paddingValue = paddedLength - plaintext.length;
        for (let i = plaintext.length; i < paddedLength; i++) {
            padded[i] = paddingValue;
        }

        const ciphertext = new Uint8Array(paddedLength);

        for (let i = 0; i < paddedLength; i += 16) {
            const block = padded.slice(i, i + 16);
            const encryptedBlock = this.encryptBlock(block);
            ciphertext.set(encryptedBlock, i);
        }

        return ciphertext;
    }

    /**
     * Decrypt data in ECB mode
     * @param {Uint8Array} ciphertext - Input ciphertext
     * @returns {Uint8Array} Decrypted plaintext
     */
    decryptECB(ciphertext) {
        if (ciphertext.length % 16 !== 0) {
            throw new Error("Ciphertext length must be multiple of 16");
        }

        const plaintext = new Uint8Array(ciphertext.length);

        for (let i = 0; i < ciphertext.length; i += 16) {
            const block = ciphertext.slice(i, i + 16);
            const decryptedBlock = this.decryptBlock(block);
            plaintext.set(decryptedBlock, i);
        }

        // Remove PKCS#7 padding
        const paddingValue = plaintext[plaintext.length - 1];
        if (paddingValue > 0 && paddingValue <= 16) {
            return plaintext.slice(0, plaintext.length - paddingValue);
        }

        return plaintext;
    }
}

export default RC6;