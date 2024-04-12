import {CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES} from "../hash-compute/MultiHashData";
import {Readable} from "stream";
import {create} from "multiformats/hashes/digest";
import {CID} from 'multiformats/cid';
import {createHasher, codeTable} from "./CreateHasher";
import {SimpleHash} from "./SimpleHash";

/**
 * Compute the CIDs of a file using specific algorithms
 * @param stream The Readable stream of the file
 * @param algorithms Array of algorithms ('sha256', 'sha1', etc.)
 * @returns Array of CIDs (in the order of the algorithms)
 */
export async function computeCIDs({stream, algorithms}: {
    stream: Readable | ReadableStream;
    algorithms: CID_ALGORITHM_NAMES[]
}): Promise<string[]> {
    const hashers = await hasherDefiner(algorithms);

    // Check if the environment is Node.js or Browser and handle the stream accordingly
    if (stream instanceof Readable) {
        // Node.js environment
        for await (const chunk of stream) {
            for (const item of hashers) {
                await item.hasher.update(chunk as Buffer);
            }
        }
    } else {
        // Browser environment
        const reader = stream.getReader();
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            // Assuming the hasher can handle Uint8Array directly
            for (const item of hashers) {
                await item.hasher.update(Buffer.from(value));
            }
        }
    }

    return cidFinalize(hashers);
}

async function hasherDefiner(algorithms: CID_ALGORITHM_NAMES[]): Promise<{
    hasher: SimpleHash,
    code: CID_ALGORITHM_CODES
}[]> {
    const hashers = algorithms.filter(algo => Object.values(CID_ALGORITHM_NAMES).includes(algo))
        .map(async algo => ({
            hasher: await createHasher(algo),
            code: codeTable[algo]
        }));
    return await Promise.all(hashers);
}

async function cidFinalize(hashers: { hasher: SimpleHash, code: number }[]): Promise<string[]> {
    return await Promise.all(hashers.map(async ({code, hasher}) => {
        const hashBuffer = await hasher.digest();
        const digest = create(code, hashBuffer);
        return CID.createV1(code, digest).toString();
    }));
}