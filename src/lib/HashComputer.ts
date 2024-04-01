import { FileIDComputer } from "./fileID/FileIDComputer.js";
import {CID_ALGORITHM_NAMES, ComputeInterface, MultiHashData} from "./MultiHashData.js";

export class HashComputer implements ComputeInterface{
    private fileIDComputer = new FileIDComputer();

    constructor(private targetHash: CID_ALGORITHM_NAMES[]) {
    }

    async computeMissingHash(filePath: string, metadata: MultiHashData): Promise<void> {
        // Dynamically determine which hashes are needed
        const neededHashes = this.targetHash.filter(hashName => !metadata[hashName]);

        // If all hashes are already computed, skip the processing
        if (neededHashes.length === 0) {
            return;
        }

        // Compute only the needed CIDs
        const cids = await this.fileIDComputer.computeCIDs(filePath, neededHashes);

        // Map the computed CIDs back to their respective metadata properties
        cids.forEach((cid, index) => {
            const hashType = neededHashes[index];
            metadata[hashType] = cid;
        });
    }
}
