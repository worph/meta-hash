import { createReadStream } from "fs";
import {BinaryLike, createHash} from 'crypto';
import { CID } from 'multiformats/cid';
import { create } from "multiformats/hashes/digest";
import {CID_ALGORITHM, CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES} from "../MultiHashData.js";

export interface SimpleHash {
    update(data: BinaryLike),
    digest(): Buffer;
}


/**
 * Compute the CIDs of a file using specific algorithms
 * @param filePath The path to the file
 * @param algorithms Array of algorithms ('sha256', 'sha1')
 * @returns Array of CIDs (in the order of the algorithms)
 */
export default async function computeCIDs({ filePath, algorithms }: { filePath: string; algorithms: CID_ALGORITHM_NAMES[] }): Promise<string[]> {
    const hashFunctions: Record<string, { code: number, hasher: SimpleHash }>
        = {
        [CID_ALGORITHM_NAMES.sha256]: { code: CID_ALGORITHM_CODES.sha256, hasher: createHash('sha256') },
        [CID_ALGORITHM_NAMES.sha1]: { code: CID_ALGORITHM_CODES.sha1, hasher: createHash('sha1') },
        [CID_ALGORITHM_NAMES.md5]: { code: CID_ALGORITHM_CODES.md5, hasher: createHash('md5') },
        [CID_ALGORITHM_NAMES.sha3_256]: { code: CID_ALGORITHM_CODES.sha3_256, hasher:createHash('sha3-256') }
    };

    const hashers = algorithms.map(algo => ({
        hasher: hashFunctions[algo].hasher,
        code: hashFunctions[algo].code
    }));

    const stream = createReadStream(filePath);
    for await (const chunk of stream) {
        for (const item of hashers) {
            item.hasher.update(chunk);
        }
    }

    const cids = await Promise.all(hashers.map(async ({ code, hasher }) => {
        const hashBuffer = hasher.digest();
        const digest = create(code, hashBuffer);
        return CID.createV1(code, digest).toString();
    }));

    return cids;
}
