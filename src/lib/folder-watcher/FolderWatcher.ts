import * as path from 'path';
import chokidar from 'chokidar';
import {readdir} from "fs/promises";
import PQueue from "p-queue";
import debounce from 'debounce';
import {FileProcessorInterface} from "./FileProcessorInterface.js";

export class FolderWatcher {
    initialized = false;
    queue = new PQueue({concurrency: 100, autoStart: true});
    fileProcessor: FileProcessorInterface;
    queueSize = -1;
    current = 0;
    processing = new Set<string>();
    private readonly finalizeDebounced: () => Promise<void>;

    constructor(fileProcessor:FileProcessorInterface,private WATCH_FOLDER_LIST: string, private config:{
        interval?: number,
        stabilityThreshold?: number,
        pollInterval?: number,
        outputFolderUpdateIntervalMs?: number
    }) {
        this.fileProcessor = fileProcessor;
        if(this.fileProcessor.finalize) {
            const debounced = debounce(() => this.fileProcessor.finalize(), this.config.outputFolderUpdateIntervalMs || 10000, {immediate: true});
            this.finalizeDebounced = async () => {
                if (this.initialized) {
                    return debounced();
                }
            }
        }

    }

    /**
     * Process the directory and its subdirectories
     * @param directory
     * @param promises
     * @private
     */
    private async processDirectory(directory: string, promises: Promise<any>[]) {
        const entries = await readdir(directory, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                await this.processDirectory(fullPath, promises);
            } else {
                const promise = this.processFile(fullPath);
                promises.push(promise);
            }
        }
    }

    private async countFile(directory: string): Promise<number> {
        const entries = await readdir(directory, {withFileTypes: true});
        const countPromises: Promise<any>[] = [];

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                // Push the promise without waiting for it here
                countPromises.push(this.countFile(fullPath));
            } else {
                // Use an IIFE (Immediately Invoked Function Expression) to handle asynchronous condition
                countPromises.push(this.queue.add(
                    async () => (await this.fileProcessor.canProcessFile(fullPath)) ? 1 : 0
                ));
            }
        }

        // Wait for all promises to resolve and then sum up their results
        const counts = await Promise.all(countPromises);
        return counts.reduce((acc, current) => acc + current, 0);
    }

    private async processFile(filePath: string):Promise<void> {
        if(await this.fileProcessor.canProcessFile(filePath)) {
            if(!this.processing.has(filePath)) {
                this.processing.add(filePath);//avoid double processing in the queue
                const current = ++this.current;
                await this.queue.add(() => this.fileProcessor.processFile(current, this.queueSize, filePath));
                this.processing.delete(filePath);
            }
        }
    }

    /**
     * Process the file and its sibling file included other folder it is a recursive function
     * @param filePath
     * @private
     */
    private async processFileExtended(filePath: string):Promise<void> {
        let dirname = path.dirname(filePath);
        await this.processDirectory(dirname, []);
    }

    private chokidarWatch(folderList: string[]){
        const chokidarconfig = {
            ignoreInitial: true,//ignore the initial scan we have our own function
            persistent: true,
            depth: Infinity,
            awaitWriteFinish: {
                stabilityThreshold: this.config.stabilityThreshold || 30000,
                pollInterval: this.config.pollInterval || 5000
            }
        };

        let watcher: chokidar.FSWatcher;
        if ((this.config.interval || 0) <= 0) {
            watcher = chokidar.watch(folderList, chokidarconfig);
        } else {
            watcher = chokidar.watch(folderList, {
                ...chokidarconfig,
                usePolling: true,
                interval: this.config.interval || 0
            });
        }

        watcher
            .on('add', async (filePath) => {
                try {
                    await this.processFileExtended(filePath);
                    if(this.finalizeDebounced) {
                        await this.finalizeDebounced();
                    }
                } catch (error) {
                    console.error(`Error processing file ${filePath}:`, error);
                }
            })
            .on('change', async (filePath) => {
                try {
                    await this.processFileExtended(filePath);
                    if(this.finalizeDebounced) {
                        await this.finalizeDebounced();
                    }
                } catch (e) {
                    console.error(`Error processing file ${filePath}:`, e);
                }
            })
            .on('unlink', async (filePath) => {
                try {
                    if(this.fileProcessor.deleteFile) {
                        await this.fileProcessor.deleteFile(filePath);
                    }
                    await this.processFileExtended(filePath);
                    if(this.finalizeDebounced) {
                        await this.finalizeDebounced();
                    }
                } catch (e) {
                    console.error(`Error processing file deletion:`, e);
                }
            })
            .on('error', (error) => console.error(`Watcher error: ${error}`))
            .on('ready', () => {
                console.log(`Watching for file changes on ${folderList}`);
            });
    }

    async watch() {
        let folders = this.WATCH_FOLDER_LIST;
        if (!folders) {
            throw new Error(`No folder to watch`);
        }
        let folderList = folders.split(',');

        this.chokidarWatch(folderList);

        //start the initial scan
        let countPromises = [];
        for (let i = 0; i < folderList.length; i++) {
            folderList[i] = path.normalize(folderList[i]);
            countPromises.push(this.countFile(folderList[i]));
        }
        const count = (await Promise.all(countPromises)).reduce((acc, current) => acc + current, 0);
        console.log(`Found ${count} files to process`);
        this.queueSize = count;
        let promises: Promise<any>[] = [];
        for (let i = 0; i < folderList.length; i++) {
            folderList[i] = path.normalize(folderList[i]);
            await this.processDirectory(folderList[i], promises);
        }
        await Promise.all(promises);
        this.initialized = true;
        if(this.finalizeDebounced) {
            await this.finalizeDebounced();
        }

        console.log(`Watcher ready`);
    }
}
