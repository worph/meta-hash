import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { CID } from 'multiformats/cid';
import { create } from 'multiformats/hashes/digest';
import x from 'crc-32';

var o=(s=>(s[s.crc32=306]="crc32",s[s.md5=213]="md5",s[s.sha1=17]="sha1",s[s.sha256=18]="sha256",s[s.sha3_256=22]="sha3_256",s[s.sha3_384=21]="sha3_384",s))(o||{}),d=(s=>(s.crc32="cid_crc32",s.md5="cid_md5",s.sha1="cid_sha1",s.sha256="cid_sha2-256",s.sha3_256="cid_sha3-256",s.sha3_384="cid_sha3-384",s))(d||{}),u=(s=>(s.crc32="crc32",s.md5="md5",s.sha1="sha1",s.sha256="sha2-256",s.sha3_256="sha3-256",s.sha3_384="sha3-384",s))(u||{});var t=class{_crc=void 0;update(a){return this._crc=x.buf(a,this._crc),this}digest(){let a=Buffer.alloc(4);return a.writeInt32BE(this._crc,0),a}};async function B({filePath:h,algorithms:a}){let c={"cid_sha2-256":{code:18,hasher:createHash("sha256")},cid_sha1:{code:17,hasher:createHash("sha1")},cid_md5:{code:213,hasher:createHash("md5")},"cid_sha3-256":{code:22,hasher:createHash("sha3-256")},"cid_sha3-384":{code:21,hasher:createHash("sha3-384")},cid_crc32:{code:306,hasher:new t}},i=a.map(s=>({hasher:c[s].hasher,code:c[s].code})),n=createReadStream(h);for await(let s of n)for(let r of i)r.hasher.update(s);return await Promise.all(i.map(async({code:s,hasher:r})=>{let m=r.digest(),f=create(s,m);return CID.createV1(s,f).toString()}))}

export { o as a, d as b, u as c, B as d };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-4EZ47WAR.js.map