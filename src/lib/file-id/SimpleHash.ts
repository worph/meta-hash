export interface SimpleHash {
    update(data: Buffer),

    digest(): Buffer;
}