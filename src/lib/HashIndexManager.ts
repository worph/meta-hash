import {createReadStream, promises as fs} from 'fs';
import {parse} from 'csv-parse';
import {parse as parseSync} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {existsAsync} from "./ExistsAsync.js";
import path from "path";
import {clearInterval} from "node:timers";
import {CID_ALGORITHM_NAMES} from "./MultiHashData.js";

interface IndexLine extends Partial<Record<CID_ALGORITHM_NAMES, string>> {
    path: string;
    size: string;
    mtime: string;
}
export const INDEX_HEADERS = ['path', 'size', 'mtime'];

export class HashIndexManager {
    private cache: Map<string, IndexLine> = new Map<string, IndexLine>();
    private intervalId: NodeJS.Timeout;
    private intervalTime: number = 30000;
    private lastIndexFileSize: number = 0; //size of the index file last time it was read
    private lastCacheFile: IndexLine[]; //state of the file last time it was read
    private indexOpsInProgress: boolean = false;
    private hasChanged: boolean = false;
    private initialLoad;

    constructor(private filePath: string,private targetHash:CID_ALGORITHM_NAMES[]= [CID_ALGORITHM_NAMES.sha1,CID_ALGORITHM_NAMES.sha256]) {
        if (!filePath) {
            throw new Error('Invalid index file path');
        }
    }

    public getCache(): Map<string, IndexLine> {
        return new Map(this.cache);
    }

    /**
     * After init consseutively calls to this method will not reload the index
     * @param autosave
     */
    async init(autosave = true) {
        if (!this.initialLoad) {
            this.initialLoad = new Promise<void>(async (resolve, reject) => {
                try {
                    if (!this.checkCSVHeaders(this.filePath)) {
                        throw new Error('Invalid index file headers');
                    }
                    await this.loadIndex();
                    if (autosave) {
                        this.start();
                    }
                    resolve();
                }catch (e) {
                    reject(e);
                }
            });
        }
        return this.initialLoad;
    }

    // Function to check CSV headers
    checkCSVHeaders (csvContent: string): boolean {
        const records = parseSync(csvContent, {
            bom: true,
            columns: true,
            skip_empty_lines: true,
        });

        if (records.length === 0) {
            //we will write the headers
            return true;
        }

        // Extract headers
        const headers = Object.keys(records[0]);

        // Define required headers
        //from the IndexLine interface
        const requiredHeaders = ['path', 'size', 'mtime', ...this.targetHash];

        // Check if all required headers are present
        return requiredHeaders.every(header => headers.includes(header));
    };

    public start() {
        this.startAutoSave(this.intervalTime);
    }

    public stopAutoSave() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private startAutoSave(time: number) {
        this.stopAutoSave();
        this.intervalTime = time;
        this.intervalId = setInterval(() => this.saveCacheToFile(), time);
    }

    public async loadIndex(): Promise<IndexLine[]> {
        if (await existsAsync(this.filePath)) {
            // check the file size and if it did not change, do not read the file
            const stats = await fs.stat(this.filePath);
            if (this.lastIndexFileSize !== stats.size) {
                // Read existing file content and parse it
                const records: IndexLine[] = await this.readCsv();
                for (const record of records) {
                    this.cache.set(record.path, record);
                }
                this.lastIndexFileSize = stats.size;
                this.lastCacheFile = records;
                return records;
            } else {
                return this.lastCacheFile;
            }
        }
        return [];
    }

    private loadIndexFromCache(): IndexLine[] {
        return Array.from(this.cache.values());
    }

    private async readCsv(): Promise<IndexLine[]> {
        if (!(await existsAsync(this.filePath))) {
            return [];
        }
        const start = performance.now();

        const parser = parse({
            columns: true,
            skip_empty_lines: true,
        });

        const records: IndexLine[] = [];

        return new Promise((resolve, reject) => {
            createReadStream(this.filePath)
                .pipe(parser)
                .on('data', (record) => {
                    records.push(record);
                }).on('end', () => {
                resolve(records);
                console.log(`Index read time ${performance.now() - start}ms`);
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    private async saveCacheToFile(): Promise<void> {
        if (this.indexOpsInProgress || !this.hasChanged) {
            return;
        }
        this.hasChanged = false;
        this.indexOpsInProgress = true;
        const start = performance.now();
        let existingRows: IndexLine[] = await this.loadIndex();

        if (this.cache.size !== 0) {
            const cacheRows: IndexLine[] = this.loadIndexFromCache();
            // Filter out cacheRows that are already in the file
            const newRows = cacheRows.filter(row => !existingRows.find(existingRow => existingRow.path === row.path));

            if (newRows.length !== 0) {
                // Serialize new cacheRows to CSV string
                const csvString = stringify(newRows, {
                    header: existingRows.length === 0, // Only add header if the file was empty
                    columns: [
                        {key: 'path', header: 'path'},
                        {key: 'size', header: 'size'},
                        {key: 'mtime', header: 'mtime'},
                        ...this.targetHash.map(hash => ({key: hash, header: hash})),
                    ],
                });

                // Append new cacheRows to the file
                await fs.appendFile(this.filePath, csvString);
            }
        }
        const totalTime = performance.now() - start;
        console.log(`Index saved in ${totalTime}ms`);
        // Check if the time to save the index is greater than the interval time. increase the interval time if needed
        if (totalTime * 10 > this.intervalTime) {
            this.startAutoSave(totalTime * 10);
            console.log(`Index save interval increased to ${totalTime * 10}ms`);
        }
        this.indexOpsInProgress = false;
    }

    public getCidForFile(filePath: string, fileSize: number, mtime: string): IndexLine {
        const fileName = path.basename(filePath);
        let fileNameIndex = this.cache.get(fileName);
        if(fileNameIndex) {
            if(fileNameIndex.mtime) {
                //if we have a mtime, we need to check it
                if (fileNameIndex.size === (fileSize + "") && fileNameIndex.mtime === mtime) {
                    return fileNameIndex;
                }
            }else {
                //mtime is optional
                if (fileNameIndex.size === (fileSize + "")) {
                    return fileNameIndex;
                }
            }
        }

        // 3 - if not found, delete the entry (keeps the index clean)
        /*if (fileNameIndex && fileNameIndex.size !== (fileSize + "") && pathIndex && pathIndex.size !== (fileSize + "")) {
            this.cache.delete(fileName);
            this.cache.delete(filePath);
        }*/

        return null;
    }

    public addFileCid(filePath: string, fileSize: number, mtime: string, hashs: Partial<Record<CID_ALGORITHM_NAMES, string>>): void {
        if (!filePath || !fileSize || !mtime || !hashs) {
            throw new Error('Invalid parameters');
        }
        const size = fileSize + "";
        const baseName = path.basename(filePath);
        const data = {path: baseName, size: size, mtime: mtime, ...hashs};
        this.cache.set(baseName, data);
        this.hasChanged = true;
    }

}