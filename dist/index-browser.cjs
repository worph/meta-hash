'use strict';

require('./chunk-KWYLOVWT.cjs');
var chunkOHUFSPVO_cjs = require('./chunk-OHUFSPVO.cjs');
var chunkS7BSPELE_cjs = require('./chunk-S7BSPELE.cjs');

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
    const cids = await chunkOHUFSPVO_cjs.computeCIDs({ stream, algorithms: neededHashes });
    for (const [index, cid] of cids.entries()) {
      const hashType = neededHashes[index];
      metadata[hashType] = cid;
    }
  }
};

Object.defineProperty(exports, "computeCIDs", {
  enumerable: true,
  get: function () { return chunkOHUFSPVO_cjs.computeCIDs; }
});
Object.defineProperty(exports, "CID_ALGORITHM", {
  enumerable: true,
  get: function () { return chunkS7BSPELE_cjs.CID_ALGORITHM; }
});
Object.defineProperty(exports, "CID_ALGORITHM_CODES", {
  enumerable: true,
  get: function () { return chunkS7BSPELE_cjs.CID_ALGORITHM_CODES; }
});
Object.defineProperty(exports, "CID_ALGORITHM_NAMES", {
  enumerable: true,
  get: function () { return chunkS7BSPELE_cjs.CID_ALGORITHM_NAMES; }
});
exports.HashComputer = HashComputer;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index-browser.cjs.map