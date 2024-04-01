import { BinaryLike } from 'crypto';

interface MultiHashData {
    "cid_sha2-256"?: string;
    cid_sha1?: string;
    cid_md5?: string;
    "cid_sha3-256"?: string;
}
interface ComputeInterface {
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}
declare enum CID_ALGORITHM_CODES {
    sha256 = 18,
    sha1 = 17,
    md5 = 213,
    sha3_256 = 22
}
declare enum CID_ALGORITHM_NAMES {
    sha256 = "cid_sha2-256",
    sha1 = "cid_sha1",
    md5 = "cid_md5",
    sha3_256 = "cid_sha3-256"
}
declare enum CID_ALGORITHM {
    sha256 = "sha2-256",
    sha1 = "sha1",
    md5 = "md5",
    sha3_256 = "sha3-256"
}

declare class HashComputer implements ComputeInterface {
    private targetHash;
    private fileIDComputer;
    constructor(targetHash: CID_ALGORITHM_NAMES[]);
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
    constructor(indexFilePath: string, targetHash?: CID_ALGORITHM_NAMES[]);
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}

declare function existsAsync(filePath: string): Promise<boolean>;

declare class FileIDComputer {
    private piscina;
    constructor();
    /**
     * Compute the CIDs of a file using specific algorithms
     * @param filePath The path to the file
     * @param algorithms Array of algorithms ('sha256', 'sha1')
     * @returns Array of CIDs (in the order of the algorithms)
     */
    computeCIDs(filePath: string, algorithms: CID_ALGORITHM_NAMES[]): Promise<string[]>;
}

interface SimpleHash {
    update(data: BinaryLike): any;
    digest(): Buffer;
}

interface Properties {
    TARGET_HASHES: string;
    INDEX_FILE_PATH: string;
}

export { CID_ALGORITHM, CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES, ComputeHashIndexCache, type ComputeInterface, FileIDComputer, HashComputer, HashIndexManager, INDEX_HEADERS, type MultiHashData, type Properties, type SimpleHash, existsAsync };
