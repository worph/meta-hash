import { C as CID_ALGORITHM_NAMES, M as MultiHashData } from './MultiHashData-B-scpa5G.js';
export { c as CID_ALGORITHM, b as CID_ALGORITHM_CODES, a as ComputeInterface } from './MultiHashData-B-scpa5G.js';
export { FileIDComputerInterface, FileProcessorInterface } from './index-interface.js';
import { Readable } from 'stream';

/**
 * Compute the CIDs of a file using specific algorithms
 * @param stream The Readable stream of the file
 * @param algorithms Array of algorithms ('sha256', 'sha1', etc.)
 * @returns Array of CIDs (in the order of the algorithms)
 */
declare function computeCIDs({ stream, algorithms }: {
    stream: Readable | ReadableStream;
    algorithms: CID_ALGORITHM_NAMES[];
}): Promise<string[]>;

declare class HashComputer {
    private targetHash;
    constructor(targetHash: CID_ALGORITHM_NAMES[]);
    computeMissingHash(stream: Readable, metadata: MultiHashData): Promise<void>;
}

export { CID_ALGORITHM_NAMES, HashComputer, MultiHashData, computeCIDs };
