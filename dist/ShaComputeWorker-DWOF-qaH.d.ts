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

interface SimpleHash {
    update(data: BinaryLike): any;
    digest(): Buffer;
}
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

export { type ComputeInterface as C, type MultiHashData as M, type SimpleHash as S, CID_ALGORITHM_NAMES as a, CID_ALGORITHM_CODES as b, CID_ALGORITHM as c, computeCIDs as d };
