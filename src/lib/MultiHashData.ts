export interface MultiHashData {
    "cid_sha2-256"?: string;//0x12 sha2-256
    cid_sha1?: string; // 0x11 sha1
    cid_md5?: string; // 0xd5 md5
    "cid_sha3-256"?: string; // 0x16 sha3-256
    //cid_crc32?: string; //0x0132 CRC32 (SFV) TODO
}

export interface ComputeInterface {
    computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void>;
}

export enum CID_ALGORITHM_CODES {
    sha256 = 0x12,
    sha1 = 0x11,
    md5 = 0xd5,
    sha3_256 = 0x16,
    //crc32 = 0x0132
}

export enum CID_ALGORITHM_NAMES {
    sha256 = 'cid_sha2-256',
    sha1 = 'cid_sha1',
    md5 = 'cid_md5',
    sha3_256 = 'cid_sha3-256',
    //crc32 = 'cid_crc32'
}

export enum CID_ALGORITHM {
    sha256 = 'sha2-256',
    sha1 = 'sha1',
    md5 = 'md5',
    sha3_256 = 'sha3-256',
    //crc32 = 'crc32'
}