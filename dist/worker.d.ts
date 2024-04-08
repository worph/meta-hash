import { C as CID_ALGORITHM_NAMES } from './MultiHashData-B-scpa5G.js';

/**
 * Compute the CIDs of a file using specific algorithms
 * @param filePath The path to the file
 * @param algorithms Array of algorithms ('sha256', 'sha1')
 * @returns Array of CIDs (in the order of the algorithms)
 */
declare function computeCIDs({ filePath, algorithms }: {
    filePath: string;
    algorithms: CID_ALGORITHM_NAMES[];
}): Promise<string[]>;

export { computeCIDs as default };
