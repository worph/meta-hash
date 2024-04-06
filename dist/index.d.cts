import { C as CID_ALGORITHM_NAMES, a as ComputeInterface, M as MultiHashData } from './ShaComputeWorker-BzBitaFi.cjs';
export { c as CID_ALGORITHM, b as CID_ALGORITHM_CODES, S as SimpleHash } from './ShaComputeWorker-BzBitaFi.cjs';
import * as PQueue from 'p-queue';
import PQueue__default from 'p-queue';
import * as p_queue_dist_priority_queue_js from 'p-queue/dist/priority-queue.js';

interface IndexLine extends Partial<Record<CID_ALGORITHM_NAMES, string>> {
    path: string;
    size: string;
    mtime: string;
}
declare const INDEX_HEADERS: string[];
declare class HashIndexManager {
    private targetHash;
    private cache;
    private intervalId;
    private intervalTime;
    private lastIndexFileSize;
    private lastCacheFile;
    private indexOpsInProgress;
    private hasChanged;
    private initialLoad;
    private filePaths;
    constructor(filePath: string, targetHash?: CID_ALGORITHM_NAMES[]);
    getCache(): Map<string, IndexLine>;
    /**
     * After init consseutively calls to this method will not reload the index
     * @param autosave
     */
    init(autosave?: boolean): Promise<void>;
    private checkCSVHeaders;
    start(): void;
    stopAutoSave(): void;
    private startAutoSave;
    loadIndex(hash: CID_ALGORITHM_NAMES): Promise<IndexLine[]>;
    private loadIndexFromCache;
    private readCsv;
    saveCacheToFile(): Promise<void>;
    getCidForFileAsync(filePath: string): Promise<IndexLine>;
    getCidForFile(filePath: string, fileSize: number, mtime: string): IndexLine;
    addFileCid(filePath: string, fileSize: number, mtime: string, hashs: Partial<Record<CID_ALGORITHM_NAMES, string>>): void;
}

declare class ComputeHashIndexCache implements ComputeInterface {
    private targetHash;
    private hashIndexManager;
    private hashComputer;
    constructor(indexFilePath: string, targetHash?: CID_ALGORITHM_NAMES[], workerPath?: string);
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
    getHashIndexManager(): Promise<HashIndexManager>;
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

declare class HashComputer implements ComputeInterface {
    private targetHash;
    private fileIDComputer;
    constructor(targetHash: CID_ALGORITHM_NAMES[], workerPath?: string);
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}

interface Properties {
    TARGET_HASHES: string;
    INDEX_FILE_PATH: string;
}

interface FileProcessorInterface {
    processFile(current: number, queueSize: number, nfoFilePath: string): Promise<void>;
    canProcessFile(filePath: string): Promise<boolean>;
    deleteFile(filePath: string): Promise<void>;
}

declare class FolderWatcher {
    private WATCH_FOLDER_LIST;
    private config;
    initialized: boolean;
    queue: PQueue__default<p_queue_dist_priority_queue_js.default, PQueue.QueueAddOptions>;
    fileProcessor: FileProcessorInterface;
    queueSize: number;
    current: number;
    processing: Set<string>;
    constructor(fileProcessor: FileProcessorInterface, WATCH_FOLDER_LIST: string, config: {
        interval?: number;
        stabilityThreshold?: number;
        pollInterval?: number;
    });
    /**
     * Process the directory and its subdirectories
     * @param directory
     * @param promises
     * @private
     */
    private processDirectory;
    private countFile;
    private processFile;
    /**
     * Process the file and its sibling file included other folder it is a recursive function
     * @param filePath
     * @private
     */
    private processFileExtended;
    private chokidarWatch;
    watch(): Promise<void>;
}

export { CID_ALGORITHM_NAMES, ComputeHashIndexCache, ComputeInterface, FileIDComputer, type FileProcessorInterface, FolderWatcher, HashComputer, HashIndexManager, INDEX_HEADERS, MultiHashData, type Properties, existsAsync };
