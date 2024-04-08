import { b } from './chunk-YCFZVUZC.js';
import { Readable } from 'stream';
import { create } from 'multiformats/hashes/digest';
import { CID } from 'multiformats/cid';
import { createHash } from 'crypto';
import u from 'crc-32';

var c=class{_crc=void 0;update(e){return this._crc=u.buf(e,this._crc),this}digest(){let e=Buffer.alloc(4);return e.writeInt32BE(this._crc,0),e}};var i={cid_crc32:306,cid_md5:213,cid_sha1:17,"cid_sha2-256":18,"cid_sha3-256":22,"cid_sha3-384":21};function m(r){switch(r){case"cid_sha2-256":return createHash("sha256");case"cid_sha1":return createHash("sha1");case"cid_md5":return createHash("md5");case"cid_sha3-256":return createHash("sha3-256");case"cid_sha3-384":return createHash("sha3-384");case"cid_crc32":return new c;default:throw new Error(`Unsupported algorithm: ${r}`)}}async function L({stream:r,algorithms:e}){let a=_(e);if(r instanceof Readable)for await(let t of r)a.forEach(s=>s.hasher.update(t));else {let t=r.getReader();for(;;){let{done:s,value:n}=await t.read();if(s)break;a.forEach(f=>f.hasher.update(Buffer.from(n)));}}return H(a)}function _(r){return r.filter(a=>Object.values(b).includes(a)).map(a=>({hasher:m(a),code:i[a]}))}async function H(r){return await Promise.all(r.map(async({code:e,hasher:a})=>{let t=a.digest(),s=create(e,t);return CID.createV1(e,s).toString()}))}

export { L as a };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-A6J5HDTV.js.map