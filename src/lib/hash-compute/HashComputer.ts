import {CID_ALGORITHM_NAMES, MultiHashData} from "./MultiHashData";
import {Readable} from "stream";

import {computeCIDs} from "@root/file-id/ComputeHash";

export class HashComputer{

    constructor(private targetHash: CID_ALGORITHM_NAMES[]) {
    }

    async computeMissingHash(stream: Readable, metadata: MultiHashData): Promise<void> {
        // Dynamically determine which hashes are needed
        const neededHashes = this.targetHash.filter(hashName => !metadata[hashName]);

        // If all hashes are already computed, skip the processing
        if (neededHashes.length === 0) {
            return;
        }

        // Compute only the needed CIDs
        const cids = await computeCIDs({stream, algorithms:neededHashes});

        // Map the computed CIDs back to their respective metadata properties
        for (const [index, cid] of cids.entries()) {
            const hashType = neededHashes[index];
            metadata[hashType] = cid;
        }
    }
}
