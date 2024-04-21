export interface FileProcessorInterface {
    initialize?(): Promise<void>;

    processFile(current: number, queueSize: number, nfoFilePath: string): Promise<void>;

    canProcessFile(filePath: string): Promise<boolean>;

    deleteFile?(filePath: string): Promise<void>;

    finalize?(): Promise<void>;
}