'use strict';

var chunkPAKJNZBJ_cjs = require('./chunk-PAKJNZBJ.cjs');
var stream = require('stream');
var digest = require('multiformats/hashes/digest');
var cid = require('multiformats/cid');
var crypto = require('crypto');
var u = require('crc-32');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var u__default = /*#__PURE__*/_interopDefault(u);

var c=class{_crc=void 0;update(e){return this._crc=u__default.default.buf(e,this._crc),this}digest(){let e=Buffer.alloc(4);return e.writeInt32BE(this._crc,0),e}};var i={cid_crc32:306,cid_md5:213,cid_sha1:17,"cid_sha2-256":18,"cid_sha3-256":22,"cid_sha3-384":21};function m(r){switch(r){case"cid_sha2-256":return crypto.createHash("sha256");case"cid_sha1":return crypto.createHash("sha1");case"cid_md5":return crypto.createHash("md5");case"cid_sha3-256":return crypto.createHash("sha3-256");case"cid_sha3-384":return crypto.createHash("sha3-384");case"cid_crc32":return new c;default:throw new Error(`Unsupported algorithm: ${r}`)}}async function L({stream:r,algorithms:e}){let a=_(e);if(r instanceof stream.Readable)for await(let t of r)a.forEach(s=>s.hasher.update(t));else {let t=r.getReader();for(;;){let{done:s,value:n}=await t.read();if(s)break;a.forEach(f=>f.hasher.update(Buffer.from(n)));}}return H(a)}function _(r){return r.filter(a=>Object.values(chunkPAKJNZBJ_cjs.b).includes(a)).map(a=>({hasher:m(a),code:i[a]}))}async function H(r){return await Promise.all(r.map(async({code:e,hasher:a})=>{let t=a.digest(),s=digest.create(e,t);return cid.CID.createV1(e,s).toString()}))}

exports.a = L;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-33LRP2HS.cjs.map