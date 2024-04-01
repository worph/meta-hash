import {Piscina} from "piscina";
import {CID_ALGORITHM_NAMES} from "../MultiHashData.js";

export class FileIDComputer {
    private piscina: Piscina;

    constructor() {
        this.piscina = new Piscina({
            maxThreads: 4,
            filename: new URL('./ShaComputeWorker.js', import.meta.url).href
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
