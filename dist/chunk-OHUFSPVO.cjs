'use strict';

var chunkS7BSPELE_cjs = require('./chunk-S7BSPELE.cjs');
var stream = require('stream');
var digest = require('multiformats/hashes/digest');
var cid = require('multiformats/cid');
var crypto = require('crypto');
var crc32 = require('crc-32');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var crc32__default = /*#__PURE__*/_interopDefault(crc32);

var Crc32Hash = class {
  _crc = void 0;
  update(data) {
    this._crc = crc32__default.default.buf(data, this._crc);
    return this;
  }
  digest() {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(this._crc, 0);
    return buffer;
  }
};

// src/lib/file-id/CreateHasher.ts
var codeTable = {
  ["cid_crc32" /* crc32 */]: 306 /* crc32 */,
  ["cid_md5" /* md5 */]: 213 /* md5 */,
  ["cid_sha1" /* sha1 */]: 17 /* sha1 */,
  ["cid_sha2-256" /* sha256 */]: 18 /* sha256 */,
  ["cid_sha3-256" /* sha3_256 */]: 22 /* sha3_256 */,
  ["cid_sha3-384" /* sha3_384 */]: 21 /* sha3_384 */
};
async function createHasher(algo) {
  switch (algo) {
    case "cid_sha2-256" /* sha256 */:
      return crypto.createHash("sha256");
    case "cid_sha1" /* sha1 */:
      return crypto.createHash("sha1");
    case "cid_md5" /* md5 */:
      return crypto.createHash("md5");
    case "cid_sha3-256" /* sha3_256 */:
      return crypto.createHash("sha3-256");
    case "cid_sha3-384" /* sha3_384 */:
      return crypto.createHash("sha3-384");
    case "cid_crc32" /* crc32 */:
      return new Crc32Hash();
    default:
      throw new Error(`Unsupported algorithm: ${algo}`);
  }
}

// src/lib/file-id/ComputeHash.ts
async function computeCIDs({ stream: stream$1, algorithms }) {
  const hashers = await hasherDefiner(algorithms);
  if (stream$1 instanceof stream.Readable) {
    for await (const chunk of stream$1) {
      for (const item of hashers) {
        await item.hasher.update(chunk);
      }
    }
  } else {
    const reader = stream$1.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      for (const item of hashers) {
        await item.hasher.update(Buffer.from(value));
      }
    }
  }
  return cidFinalize(hashers);
}
async function hasherDefiner(algorithms) {
  const hashers = algorithms.filter((algo) => Object.values(chunkS7BSPELE_cjs.CID_ALGORITHM_NAMES).includes(algo)).map(async (algo) => ({
    hasher: await createHasher(algo),
    code: codeTable[algo]
  }));
  return await Promise.all(hashers);
}
async function cidFinalize(hashers) {
  return await Promise.all(hashers.map(async ({ code, hasher }) => {
    const hashBuffer = await hasher.digest();
    const digest$1 = digest.create(code, hashBuffer);
    return cid.CID.createV1(code, digest$1).toString();
  }));
}

exports.computeCIDs = computeCIDs;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-OHUFSPVO.cjs.map