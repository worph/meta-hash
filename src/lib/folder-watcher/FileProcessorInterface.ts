export interface FileProcessorInterface {
    processFile(current: number, queueSize: number, nfoFilePath: string): Promise<void>;

    canProcessFile(filePath: string): Promise<boolean>;

    deleteFile?(filePath: string): Promise<void>;

    finalize?(): Promise<void>;
}