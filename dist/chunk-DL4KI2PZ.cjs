'use strict';

var fs = require('fs');
var crypto = require('crypto');
var cid = require('multiformats/cid');
var digest = require('multiformats/hashes/digest');

var i=(a=>(a[a.sha256=18]="sha256",a[a.sha1=17]="sha1",a[a.md5=213]="md5",a[a.sha3_256=22]="sha3_256",a))(i||{}),o=(a=>(a.sha256="cid_sha2-256",a.sha1="cid_sha1",a.md5="cid_md5",a.sha3_256="cid_sha3-256",a))(o||{}),f=(a=>(a.sha256="sha2-256",a.sha1="sha1",a.md5="md5",a.sha3_256="sha3-256",a))(f||{});async function x({filePath:c,algorithms:m}){let r={"cid_sha2-256":{code:18,hasher:crypto.createHash("sha256")},cid_sha1:{code:17,hasher:crypto.createHash("sha1")},cid_md5:{code:213,hasher:crypto.createHash("md5")},"cid_sha3-256":{code:22,hasher:crypto.createHash("sha3-256")}},h=m.map(s=>({hasher:r[s].hasher,code:r[s].code})),a=fs.createReadStream(c);for await(let s of a)for(let t of h)t.hasher.update(s);return await Promise.all(h.map(async({code:s,hasher:t})=>{let d=t.digest(),n=digest.create(s,d);return cid.CID.createV1(s,n).toString()}))}

exports.a = i;
exports.b = o;
exports.c = f;
exports.d = x;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-DL4KI2PZ.cjs.map