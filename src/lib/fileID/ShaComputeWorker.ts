import {createReadStream} from "fs";
import {createHash} from 'crypto';
import {CID} from 'multiformats/cid';
import {create} from "multiformats/hashes/digest";
import crc32 from 'crc-32';
import {CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES} from "../MultiHashData";

export interface SimpleHash {
    update(data: Buffer),

    digest(): Buffer;
}

class Crc32Hash implements SimpleHash {
    private _crc: number = undefined;

    update(data: Buffer): Crc32Hash {
        // Update the CRC-32 checksum with the new chunk of data
        this._crc = crc32.buf(data, this._crc);
        return this;
    }

    digest(): Buffer {
        const buffer = Buffer.alloc(4); // Create a buffer of 4 bytes (32 bits)
        buffer.writeInt32BE(this._crc, 0); // Write the unsigned integer to the buffer in big-endian format
        return buffer;
    }
}


/**
 * Compute the CIDs of a file using specific algorithms
 * @param filePath The path to the file
 * @param algorithms Array of algorithms ('sha256', 'sha1')
 * @returns Array of CIDs (in the order of the algorithms)
 */
export default async function computeCIDs({filePath, algorithms}: {
    filePath: string;
    algorithms: CID_ALGORITHM_NAMES[]
}): Promise<string[]> {
    const hashFunctions: Record<string, { code: number, hasher: SimpleHash }>
        = {
        [CID_ALGORITHM_NAMES.sha256]: {code: CID_ALGORITHM_CODES.sha256, hasher: createHash('sha256')},
        [CID_ALGORITHM_NAMES.sha1]: {code: CID_ALGORITHM_CODES.sha1, hasher: createHash('sha1')},
        [CID_ALGORITHM_NAMES.md5]: {code: CID_ALGORITHM_CODES.md5, hasher: createHash('md5')},
        [CID_ALGORITHM_NAMES.sha3_256]: {code: CID_ALGORITHM_CODES.sha3_256, hasher: createHash('sha3-256')},
        [CID_ALGORITHM_NAMES.sha3_384]: {code: CID_ALGORITHM_CODES.sha3_384, hasher: createHash('sha3-384')},
        [CID_ALGORITHM_NAMES.crc32]: {code: CID_ALGORITHM_CODES.crc32, hasher: new Crc32Hash()}

    };

    const hashers = algorithms.map(algo => ({
        hasher: hashFunctions[algo].hasher,
        code: hashFunctions[algo].code
    }));

    const stream = createReadStream(filePath);
    for await (const chunk of stream) {
        for (const item of hashers) {
            item.hasher.update(chunk as Buffer);
        }
    }

    const cids = await Promise.all(hashers.map(async ({code, hasher}) => {
        const hashBuffer = hasher.digest();
        const digest = create(code, hashBuffer);
        return CID.createV1(code, digest).toString();
    }));

    return cids;
}
