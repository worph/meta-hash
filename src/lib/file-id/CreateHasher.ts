import {CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES} from "../hash-compute/MultiHashData";
import {Readable} from "stream";
import {ReadableStream} from "stream/web";
import {SimpleHash} from "./SimpleHash";
import {createHash} from "crypto";
import {Crc32Hash} from "./Crc32Hash";

export const codeTable = {
    [CID_ALGORITHM_NAMES.crc32]: CID_ALGORITHM_CODES.crc32,
    [CID_ALGORITHM_NAMES.md5]: CID_ALGORITHM_CODES.md5,
    [CID_ALGORITHM_NAMES.sha1]: CID_ALGORITHM_CODES.sha1,
    [CID_ALGORITHM_NAMES.sha256]: CID_ALGORITHM_CODES.sha256,
    [CID_ALGORITHM_NAMES.sha3_256]: CID_ALGORITHM_CODES.sha3_256,
    [CID_ALGORITHM_NAMES.sha3_384]: CID_ALGORITHM_CODES.sha3_384
}

/**
 * Compute the CIDs of a file using specific algorithms
 * @returns Array of CIDs (in the order of the algorithms)
 * @param algo
 */
export function createHasher(algo: CID_ALGORITHM_NAMES): SimpleHash {
    switch (algo) {
        case CID_ALGORITHM_NAMES.sha256:
            return createHash("sha256");
        case CID_ALGORITHM_NAMES.sha1:
            return createHash("sha1");
        case CID_ALGORITHM_NAMES.md5:
            return createHash("md5");
        case CID_ALGORITHM_NAMES.sha3_256:
            return createHash("sha3-256");
        case CID_ALGORITHM_NAMES.sha3_384:
            return createHash("sha3-384");
        case CID_ALGORITHM_NAMES.crc32:
            return new Crc32Hash();
        default:
            throw new Error(`Unsupported algorithm: ${algo}`);
    }
}