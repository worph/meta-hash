import { C as CID_ALGORITHM_NAMES } from './MultiHashData-B-scpa5G.js';
export { c as CID_ALGORITHM, b as CID_ALGORITHM_CODES, a as ComputeInterface, M as MultiHashData } from './MultiHashData-B-scpa5G.js';
import * as Stream from 'stream';

interface FileProcessorInterface {
    processFile(current: number, queueSize: number, nfoFilePath: string): Promise<void>;
    canProcessFile(filePath: string): Promise<boolean>;
    deleteFile(filePath: string): Promise<void>;
}

interface FileIDComputerInterface {
    computeCIDs(filePath: Stream, algorithms: CID_ALGORITHM_NAMES[]): Promise<string[]>;
}

export { CID_ALGORITHM_NAMES, type FileIDComputerInterface, type FileProcessorInterface };
