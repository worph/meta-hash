import {Piscina} from "piscina";
import {CID_ALGORITHM_NAMES} from "../MultiHashData";

// Construct the URL for the current module
let distFolder = import.meta.dirname;
distFolder = distFolder.replace('src', 'dist');
distFolder = distFolder + "/worker.js";
const workerUrl = new URL(distFolder).href;
console.log("Worker URL: ", workerUrl);

export class FileIDComputer {
    private piscina: Piscina;

    constructor(workerPath?:string) {
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
    public async computeCIDs(filePath: string, algorithms: CID_ALGORITHM_NAMES[]): Promise<string[]> {
        return this.piscina.run({filePath, algorithms});
    }
}
