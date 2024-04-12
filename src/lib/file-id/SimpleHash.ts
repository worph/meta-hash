export interface SimpleHash {
    update(data: Buffer): SimpleHash | Promise<SimpleHash>;

    digest(): Buffer | Promise<Buffer>;
}