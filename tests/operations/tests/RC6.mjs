/**
 * RC6 tests.
 *
 * @author Jules
 *
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "RC6 Encrypt: example from issue",
        input: "flag{68f25cc8-1a9f-40e8-ac3b-a85982a52f8f}",
        expectedOutput: "RKCTaz+fty1J2qsz4DI6t9bmMiLBxqFrpI70fU4IMemczIlM+z1IoVQobIt1MbXF",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    {
                        "option": "Hex",
                        "string": "46535a33366633765538733504040404"
                    },
                    {
                        "option": "UTF8",
                        "string": "WcE4Bbm4kHYQsAcX"
                    },
                    "CBC",
                    "Raw",
                    "Base64"
                ]
            }
        ],
    },
    {
        name: "RC6 Decrypt: example from issue",
        input: "RKCTaz+fty1J2qsz4DI6t9bmMiLBxqFrpI70fU4IMemczIlM+z1IoVQobIt1MbXF",
        expectedOutput: "flag{68f25cc8-1a9f-40e8-ac3b-a85982a52f8f}",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    {
                        "option": "Hex",
                        "string": "46535a33366633765538733504040404"
                    },
                    {
                        "option": "UTF8",
                        "string": "WcE4Bbm4kHYQsAcX"
                    },
                    "CBC",
                    "Base64",
                    "UTF8"
                ]
            }
        ],
    },
]);
