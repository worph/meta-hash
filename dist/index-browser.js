import './chunk-XCJZALP2.js';
import { computeCIDs } from './chunk-SV45D2HN.js';
export { computeCIDs } from './chunk-SV45D2HN.js';
export { CID_ALGORITHM, CID_ALGORITHM_CODES, CID_ALGORITHM_NAMES } from './chunk-HTZ763NS.js';

// src/lib/hash-compute/HashComputer.ts
var HashComputer = class {
  constructor(targetHash) {
    this.targetHash = targetHash;
  }
  async computeMissingHash(stream, metadata) {
    const neededHashes = this.targetHash.filter((hashName) => !metadata[hashName]);
    if (neededHashes.length === 0) {
      return;
    }
    const cids = await computeCIDs({ stream, algorithms: neededHashes });
    for (const [index, cid] of cids.entries()) {
      const hashType = neededHashes[index];
      metadata[hashType] = cid;
    }
  }
};

export { HashComputer };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index-browser.js.map