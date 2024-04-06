'use strict';

var fs = require('fs');
var crypto = require('crypto');
var cid = require('multiformats/cid');
var digest = require('multiformats/hashes/digest');
var x = require('crc-32');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var x__default = /*#__PURE__*/_interopDefault(x);

var o=(s=>(s[s.crc32=306]="crc32",s[s.md5=213]="md5",s[s.sha1=17]="sha1",s[s.sha256=18]="sha256",s[s.sha3_256=22]="sha3_256",s[s.sha3_384=21]="sha3_384",s))(o||{}),d=(s=>(s.crc32="cid_crc32",s.md5="cid_md5",s.sha1="cid_sha1",s.sha256="cid_sha2-256",s.sha3_256="cid_sha3-256",s.sha3_384="cid_sha3-384",s))(d||{}),u=(s=>(s.crc32="crc32",s.md5="md5",s.sha1="sha1",s.sha256="sha2-256",s.sha3_256="sha3-256",s.sha3_384="sha3-384",s))(u||{});var t=class{_crc=void 0;update(a){return this._crc=x__default.default.buf(a,this._crc),this}digest(){let a=Buffer.alloc(4);return a.writeInt32BE(this._crc,0),a}};async function B({filePath:h,algorithms:a}){let c={"cid_sha2-256":{code:18,hasher:crypto.createHash("sha256")},cid_sha1:{code:17,hasher:crypto.createHash("sha1")},cid_md5:{code:213,hasher:crypto.createHash("md5")},"cid_sha3-256":{code:22,hasher:crypto.createHash("sha3-256")},"cid_sha3-384":{code:21,hasher:crypto.createHash("sha3-384")},cid_crc32:{code:306,hasher:new t}},i=a.map(s=>({hasher:c[s].hasher,code:c[s].code})),n=fs.createReadStream(h);for await(let s of n)for(let r of i)r.hasher.update(s);return await Promise.all(i.map(async({code:s,hasher:r})=>{let m=r.digest(),f=digest.create(s,m);return cid.CID.createV1(s,f).toString()}))}

exports.a = o;
exports.b = d;
exports.c = u;
exports.d = B;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-ASEKTFOG.cjs.map