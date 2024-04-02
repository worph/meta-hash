import { C as ComputeInterface, a as CID_ALGORITHM_NAMES, M as MultiHashData } from './ShaComputeWorker-DWOF-qaH.js';
export { c as CID_ALGORITHM, b as CID_ALGORITHM_CODES, S as SimpleHash } from './ShaComputeWorker-DWOF-qaH.js';
import 'crypto';

declare class HashComputer implements ComputeInterface {
    private targetHash;
    private fileIDComputer;
    constructor(targetHash: CID_ALGORITHM_NAMES[], workerPath?: string);
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}

interface IndexLine extends Partial<Record<CID_ALGORITHM_NAMES, string>> {
    path: string;
    size: string;
    mtime: string;
}
declare const INDEX_HEADERS: string[];
declare class HashIndexManager {
    private filePath;
    private targetHash;
    private cache;
    private intervalId;
    private intervalTime;
    private lastIndexFileSize;
    private lastCacheFile;
    private indexOpsInProgress;
    private hasChanged;
    private initialLoad;
    constructor(filePath: string, targetHash?: CID_ALGORITHM_NAMES[]);
    getCache(): Map<string, IndexLine>;
    /**
     * After init consseutively calls to this method will not reload the index
     * @param autosave
     */
    init(autosave?: boolean): Promise<any>;
    checkCSVHeaders(csvContent: string): boolean;
    start(): void;
    stopAutoSave(): void;
    private startAutoSave;
    loadIndex(): Promise<IndexLine[]>;
    private loadIndexFromCache;
    private readCsv;
    private saveCacheToFile;
    getCidForFile(filePath: string, fileSize: number, mtime: string): IndexLine;
    addFileCid(filePath: string, fileSize: number, mtime: string, hashs: Partial<Record<CID_ALGORITHM_NAMES, string>>): void;
}

declare class ComputeHashIndexCache implements ComputeInterface {
    private targetHash;
    hashIndexManager: HashIndexManager;
    hashComputer: HashComputer;
    constructor(indexFilePath: string, targetHash?: CID_ALGORITHM_NAMES[], workerPath?: string);
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}

declare function existsAsync(filePath: string): Promise<boolean>;

declare class FileIDComputer {
    private piscina;
    constructor(workerPath?: string);
    /**
     * Compute the CIDs of a file using specific algorithms
     * @param filePath The path to the file
     * @param algorithms Array of algorithms ('sha256', 'sha1')
     * @returns Array of CIDs (in the order of the algorithms)
     */
    computeCIDs(filePath: string, algorithms: CID_ALGORITHM_NAMES[]): Promise<string[]>;
}

interface Properties {
    TARGET_HASHES: string;
    INDEX_FILE_PATH: string;
}

export { CID_ALGORITHM_NAMES, ComputeHashIndexCache, ComputeInterface, FileIDComputer, HashComputer, HashIndexManager, INDEX_HEADERS, MultiHashData, type Properties, existsAsync };
