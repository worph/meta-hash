import './chunk-XCJZALP2.js';
import './chunk-LTWPBXM5.js';
import './chunk-SV45D2HN.js';
export { CID_ALGORITHM, CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES } from './chunk-HTZ763NS.js';
import { Piscina } from 'piscina';
import { promises, createReadStream } from 'fs';
import { parse as parse$1 } from 'csv-parse';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { stat, readdir, access, constants } from 'fs/promises';
import * as path3 from 'path';
import path3__default from 'path';
import { clearInterval } from 'node:timers';
import chokidar from 'chokidar';
import PQueue from 'p-queue';

var distFolder = import.meta.dirname;
distFolder = distFolder.replace("src", "dist");
distFolder = distFolder + "/worker.js";
var workerUrl = new URL(distFolder).href;
console.log("Worker URL: ", workerUrl);
var FileIDComputerWorker = class {
  piscina;
  constructor(workerPath) {
    this.piscina = new Piscina({
      maxThreads: 4,
      //filename: new URL('./ShaComputeWorker.ts', import.meta.url).href
      filename: workerPath || process.env.WORKER_URL || workerUrl
    });
  }
  /**
   * Compute the CIDs of a file using specific algorithms
   * @param filePath The path to the file
   * @param algorithms Array of algorithms ('sha256', 'sha1')
   * @returns Array of CIDs (in the order of the algorithms)
   */
  async computeCIDs(filePath, algorithms) {
    return this.piscina.run({ filePath, algorithms });
  }
};

// src/lib/hash-compute/HashComputerWorker.ts
var HashComputerWorker = class {
  constructor(targetHash, workerPath) {
    this.targetHash = targetHash;
    this.fileIDComputer = new FileIDComputerWorker(workerPath);
  }
  fileIDComputer;
  async computeMissingHash(filePath, metadata) {
    const neededHashes = this.targetHash.filter((hashName) => !metadata[hashName]);
    if (neededHashes.length === 0) {
      return;
    }
    const cids = await this.fileIDComputer.computeCIDs(filePath, neededHashes);
    for (const [index, cid] of cids.entries()) {
      const hashType = neededHashes[index];
      metadata[hashType] = cid;
    }
  }
};
async function existsAsync(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
var INDEX_HEADERS = ["path", "size", "mtime"];
var HashIndexManager = class {
  constructor(filePath, targetHash = ["cid_sha1" /* sha1 */, "cid_sha2-256" /* sha256 */]) {
    this.targetHash = targetHash;
    filePath = filePath.replace(".csv", "");
    for (const hash of this.targetHash) {
      this.filePaths[hash] = `${filePath}-${hash}.csv`;
      if (!this.filePaths[hash]) {
        throw new Error(`Invalid index file path for ${hash}`);
      }
    }
  }
  cache = /* @__PURE__ */ new Map();
  intervalId;
  intervalTime = 3e4;
  lastIndexFileSize = 0;
  //size of the index file last time it was read
  lastCacheFile;
  //state of the file last time it was read
  indexOpsInProgress = false;
  hasChanged = false;
  initialLoad;
  filePaths = {};
  getCache() {
    return new Map(this.cache);
  }
  /**
   * After init consseutively calls to this method will not reload the index
   * @param autosave
   */
  async init(autosave = true) {
    if (!this.initialLoad) {
      this.initialLoad = new Promise(async (resolve, reject) => {
        try {
          for (const hash of this.targetHash) {
            if (!this.checkCSVHeaders(this.filePaths[hash], hash)) {
              throw new Error(`Invalid index file headers for ${hash}`);
            }
            await this.loadIndex(hash);
          }
          if (autosave) {
            this.start();
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }
    return this.initialLoad;
  }
  // Function to check CSV headers
  checkCSVHeaders(csvContent, hash) {
    const records = parse(csvContent, {
      bom: true,
      columns: true,
      skip_empty_lines: true
    });
    if (records.length === 0) {
      return true;
    }
    const headers = Object.keys(records[0]);
    const requiredHeaders = [...INDEX_HEADERS, hash];
    return requiredHeaders.every((header) => headers.includes(header));
  }
  start() {
    this.startAutoSave(this.intervalTime);
  }
  stopAutoSave() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  startAutoSave(time) {
    this.stopAutoSave();
    this.intervalTime = time;
    this.intervalId = setInterval(() => this.saveCacheToFile(), time);
  }
  async loadIndex(hash) {
    if (await existsAsync(this.filePaths[hash])) {
      const stats = await promises.stat(this.filePaths[hash]);
      if (this.lastIndexFileSize !== stats.size) {
        const records = await this.readCsv(hash);
        for (const record of records) {
          let indexLine = this.cache.get(record.path);
          if (!indexLine) {
            this.cache.set(record.path, record);
          } else {
            indexLine[hash] = record[hash];
          }
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
  loadIndexFromCache() {
    return Array.from(this.cache.values());
  }
  async readCsv(hash) {
    if (!await existsAsync(this.filePaths[hash])) {
      return [];
    }
    const start = performance.now();
    const parser = parse$1({
      columns: true,
      skip_empty_lines: true
    });
    const records = [];
    return new Promise((resolve, reject) => {
      createReadStream(this.filePaths[hash]).pipe(parser).on("data", (record) => {
        records.push(record);
      }).on("end", () => {
        resolve(records);
        console.log(`Index read ${hash} time ${performance.now() - start}ms`);
      }).on("error", (err) => {
        reject(err);
      });
    });
  }
  async saveCacheToFile() {
    if (this.indexOpsInProgress || !this.hasChanged) {
      return;
    }
    this.hasChanged = false;
    this.indexOpsInProgress = true;
    const start = performance.now();
    let cacheRows;
    if (this.cache.size !== 0) {
      cacheRows = this.loadIndexFromCache();
    }
    for (const hash of this.targetHash) {
      let existingRows = await this.loadIndex(hash);
      let existingRowsAsMap = new Map(existingRows.map((row) => [row.path, row]));
      if (this.cache.size !== 0) {
        const newRows = cacheRows.filter((row) => {
          const newRow = !existingRowsAsMap.has(row.path);
          return newRow && !!row[hash];
        });
        if (newRows.length !== 0) {
          const csvString = stringify(newRows, {
            header: existingRows.length === 0,
            // Only add header if the file was empty
            columns: [
              { key: "path", header: "path" },
              { key: "size", header: "size" },
              { key: "mtime", header: "mtime" },
              { key: hash, header: hash }
            ]
          });
          await promises.appendFile(this.filePaths[hash], csvString);
        }
      }
    }
    const totalTime = performance.now() - start;
    console.log(`Index saved in ${totalTime}ms`);
    if (totalTime * 10 > this.intervalTime) {
      this.startAutoSave(totalTime * 10);
      console.log(`Index save interval increased to ${totalTime * 10}ms`);
    }
    this.indexOpsInProgress = false;
  }
  async getCidForFileAsync(filePath) {
    const fileName = path3__default.basename(filePath);
    const stats = await stat(filePath);
    return this.getCidForFile(fileName, stats.size, stats.mtime.toISOString());
  }
  getCidForFile(filePath, fileSize, mtime) {
    const fileName = path3__default.basename(filePath);
    let fileNameIndex = this.cache.get(fileName);
    for (const hash of this.targetHash) {
      if (!fileNameIndex[hash]) {
        delete fileNameIndex[hash];
      }
    }
    if (fileNameIndex) {
      if (fileNameIndex.mtime) {
        if (fileNameIndex.size === fileSize + "" && fileNameIndex.mtime === mtime) {
          return fileNameIndex;
        }
      } else {
        if (fileNameIndex.size === fileSize + "") {
          return fileNameIndex;
        }
      }
    }
    return null;
  }
  addFileCid(filePath, fileSize, mtime, hashs) {
    if (!filePath || !fileSize || !mtime || !hashs) {
      throw new Error("Invalid parameters");
    }
    for (const hash of this.targetHash) {
      if (!hashs[hash]) {
        throw new Error(`Missing hash ${hash}`);
      }
    }
    const size = fileSize + "";
    const baseName = path3__default.basename(filePath);
    let indexLine = this.cache.get(baseName);
    if (!indexLine) {
      let filteredHash = {};
      for (const hash of this.targetHash) {
        filteredHash[hash] = hashs[hash];
      }
      const data = { path: baseName, size, mtime, ...filteredHash };
      this.cache.set(baseName, data);
    } else {
      for (const hash of this.targetHash) {
        indexLine[hash] = hashs[hash];
      }
    }
    this.hasChanged = true;
  }
};
var HashComputerIndexCache = class {
  constructor(indexFilePath, targetHash = ["cid_sha1" /* sha1 */, "cid_sha2-256" /* sha256 */], workerPath) {
    this.targetHash = targetHash;
    this.hashComputer = new HashComputerWorker(targetHash, workerPath);
    this.hashIndexManager = new HashIndexManager(indexFilePath, targetHash);
  }
  hashIndexManager;
  hashComputer;
  async computeMissingHash(filePath, metadata) {
    await this.hashIndexManager.init();
    let stats = await stat(filePath);
    if (this.hashIndexManager.getCache().has(path3__default.basename(filePath))) {
      const indexLine = this.hashIndexManager.getCidForFile(filePath, stats.size, stats.mtime.toISOString());
      if (indexLine) {
        for (const hash of this.targetHash) {
          if (!metadata[hash] && indexLine[hash]) {
            metadata[hash] = indexLine[hash];
          }
        }
      }
    }
    await this.hashComputer.computeMissingHash(filePath, metadata);
    this.hashIndexManager.addFileCid(filePath, stats.size, stats.mtime.toISOString(), metadata);
  }
  async getHashIndexManager() {
    await this.hashIndexManager.init();
    return this.hashIndexManager;
  }
};
var FolderWatcher = class {
  constructor(fileProcessor, WATCH_FOLDER_LIST, config) {
    this.WATCH_FOLDER_LIST = WATCH_FOLDER_LIST;
    this.config = config;
    this.fileProcessor = fileProcessor;
  }
  initialized = false;
  queue = new PQueue({ concurrency: 100, autoStart: true });
  fileProcessor;
  queueSize = -1;
  current = 0;
  processing = /* @__PURE__ */ new Set();
  /**
   * Process the directory and its subdirectories
   * @param directory
   * @param promises
   * @private
   */
  async processDirectory(directory, promises) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path3.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this.processDirectory(fullPath, promises);
      } else {
        const promise = this.processFile(fullPath);
        promises.push(promise);
      }
    }
  }
  async countFile(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const countPromises = [];
    for (const entry of entries) {
      const fullPath = path3.join(directory, entry.name);
      if (entry.isDirectory()) {
        countPromises.push(this.countFile(fullPath));
      } else {
        countPromises.push(this.queue.add(
          async () => await this.fileProcessor.canProcessFile(fullPath) ? 1 : 0
        ));
      }
    }
    const counts = await Promise.all(countPromises);
    return counts.reduce((acc, current) => acc + current, 0);
  }
  async processFile(filePath) {
    if (await this.fileProcessor.canProcessFile(filePath)) {
      if (!this.processing.has(filePath)) {
        this.processing.add(filePath);
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
  async processFileExtended(filePath) {
    let dirname2 = path3.dirname(filePath);
    await this.processDirectory(dirname2, []);
  }
  chokidarWatch(folderList) {
    const chokidarconfig = {
      ignoreInitial: true,
      //ignore the initial scan we have our own function
      persistent: true,
      depth: Infinity,
      awaitWriteFinish: {
        stabilityThreshold: this.config.stabilityThreshold || 3e4,
        pollInterval: this.config.pollInterval || 5e3
      }
    };
    let watcher;
    if ((this.config.interval || 0) <= 0) {
      watcher = chokidar.watch(folderList, chokidarconfig);
    } else {
      watcher = chokidar.watch(folderList, {
        ...chokidarconfig,
        usePolling: true,
        interval: this.config.interval || 0
      });
    }
    watcher.on("add", async (filePath) => {
      try {
        await this.processFileExtended(filePath);
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }).on("change", async (filePath) => {
      try {
        await this.processFileExtended(filePath);
      } catch (e) {
        console.error(`Error processing file ${filePath}:`, e);
      }
    }).on("unlink", async (filePath) => {
      try {
        await this.fileProcessor.deleteFile(filePath);
        await this.processFileExtended(filePath);
      } catch (e) {
        console.error(`Error processing file deletion:`, e);
      }
    }).on("error", (error) => console.error(`Watcher error: ${error}`)).on("ready", () => {
      console.log(`Watching for file changes on ${folderList}`);
    });
  }
  async watch() {
    let folders = this.WATCH_FOLDER_LIST;
    if (!folders) {
      throw new Error(`No folder to watch`);
    }
    let folderList = folders.split(",");
    this.chokidarWatch(folderList);
    let countPromises = [];
    for (let i = 0; i < folderList.length; i++) {
      folderList[i] = path3.normalize(folderList[i]);
      countPromises.push(this.countFile(folderList[i]));
    }
    const count = (await Promise.all(countPromises)).reduce((acc, current) => acc + current, 0);
    console.log(`Found ${count} files to process`);
    this.queueSize = count;
    let promises = [];
    for (let i = 0; i < folderList.length; i++) {
      folderList[i] = path3.normalize(folderList[i]);
      await this.processDirectory(folderList[i], promises);
    }
    await Promise.all(promises);
    this.initialized = true;
    console.log(`Watcher ready`);
  }
};

export { FileIDComputerWorker, FolderWatcher, HashComputerIndexCache, HashComputerWorker, HashIndexManager, INDEX_HEADERS };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map