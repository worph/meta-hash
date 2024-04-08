interface MultiHashData {
    cid_crc32?: string;
    cid_md5?: string;
    cid_sha1?: string;
    "cid_sha2-256"?: string;
    "cid_sha3-256"?: string;
    "cid_sha3_384"?: string;
}
interface ComputeInterface {
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}
/**
 * according to
 * https://ipfs.io/ipfs/QmXec1jjwzxWJoNbxQF5KffL8q6hFXm9QwUGaa3wKGk6dT/#title=Multicodecs&src=https://raw.githubusercontent.com/multiformats/multicodec/master/table.csv
 */
declare enum CID_ALGORITHM_CODES {
    crc32 = 306,
    md5 = 213,
    sha1 = 17,
    sha256 = 18,
    sha3_256 = 22,
    sha3_384 = 21
}
declare enum CID_ALGORITHM_NAMES {
    crc32 = "cid_crc32",
    md5 = "cid_md5",
    sha1 = "cid_sha1",
    sha256 = "cid_sha2-256",
    sha3_256 = "cid_sha3-256",
    sha3_384 = "cid_sha3-384"
}
declare enum CID_ALGORITHM {
    crc32 = "crc32",
    md5 = "md5",
    sha1 = "sha1",
    sha256 = "sha2-256",
    sha3_256 = "sha3-256",
    sha3_384 = "sha3-384"
}

export { CID_ALGORITHM_NAMES as C, type MultiHashData as M, type ComputeInterface as a, CID_ALGORITHM_CODES as b, CID_ALGORITHM as c };
