'use strict';

require('./chunk-KWYLOVWT.cjs');
require('./chunk-KZVIGNTH.cjs');
require('./chunk-33LRP2HS.cjs');
var chunkPAKJNZBJ_cjs = require('./chunk-PAKJNZBJ.cjs');
var piscina = require('piscina');
var fs = require('fs');
var csvParse = require('csv-parse');
var sync = require('csv-parse/sync');
var sync$1 = require('csv-stringify/sync');
var promises = require('fs/promises');
var c = require('path');
var timers = require('timers');
var M = require('chokidar');
var z = require('p-queue');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var c__namespace = /*#__PURE__*/_interopNamespace(c);
var M__default = /*#__PURE__*/_interopDefault(M);
var z__default = /*#__PURE__*/_interopDefault(z);

var l=undefined;l=l.replace("src","dist");l=l+"/worker.js";var w=new URL(l).href;console.log("Worker URL: ",w);var p=class{piscina;constructor(e){this.piscina=new piscina.Piscina({maxThreads:4,filename:e||process.env.WORKER_URL||w});}async computeCIDs(e,t){return this.piscina.run({filePath:e,algorithms:t})}};var m=class{constructor(e,t){this.targetHash=e;this.fileIDComputer=new p(t);}fileIDComputer;async computeMissingHash(e,t){let i=this.targetHash.filter(s=>!t[s]);if(i.length===0)return;let r=await this.fileIDComputer.computeCIDs(e,i);for(let[s,a]of r.entries()){let n=i[s];t[n]=a;}}};async function f(h){try{return await promises.access(h,promises.constants.F_OK),!0}catch{return !1}}var E=["path","size","mtime"],d=class{constructor(e,t=["cid_sha1","cid_sha2-256"]){this.targetHash=t;e=e.replace(".csv","");for(let i of this.targetHash)if(this.filePaths[i]=`${e}-${i}.csv`,!this.filePaths[i])throw new Error(`Invalid index file path for ${i}`)}cache=new Map;intervalId;intervalTime=3e4;lastIndexFileSize=0;lastCacheFile;indexOpsInProgress=!1;hasChanged=!1;initialLoad;filePaths={};getCache(){return new Map(this.cache)}async init(e=!0){return this.initialLoad||(this.initialLoad=new Promise(async(t,i)=>{try{for(let r of this.targetHash){if(!this.checkCSVHeaders(this.filePaths[r],r))throw new Error(`Invalid index file headers for ${r}`);await this.loadIndex(r);}e&&this.start(),t();}catch(r){i(r);}})),this.initialLoad}checkCSVHeaders(e,t){let i=sync.parse(e,{bom:!0,columns:!0,skip_empty_lines:!0});if(i.length===0)return !0;let r=Object.keys(i[0]);return [...E,t].every(a=>r.includes(a))}start(){this.startAutoSave(this.intervalTime);}stopAutoSave(){this.intervalId&&timers.clearInterval(this.intervalId);}startAutoSave(e){this.stopAutoSave(),this.intervalTime=e,this.intervalId=setInterval(()=>this.saveCacheToFile(),e);}async loadIndex(e){if(await f(this.filePaths[e])){let t=await fs.promises.stat(this.filePaths[e]);if(this.lastIndexFileSize!==t.size){let i=await this.readCsv(e);for(let r of i){let s=this.cache.get(r.path);s?s[e]=r[e]:this.cache.set(r.path,r);}return this.lastIndexFileSize=t.size,this.lastCacheFile=i,i}else return this.lastCacheFile}return []}loadIndexFromCache(){return Array.from(this.cache.values())}async readCsv(e){if(!await f(this.filePaths[e]))return [];let t=performance.now(),i=csvParse.parse({columns:!0,skip_empty_lines:!0}),r=[];return new Promise((s,a)=>{fs.createReadStream(this.filePaths[e]).pipe(i).on("data",n=>{r.push(n);}).on("end",()=>{s(r),console.log(`Index read ${e} time ${performance.now()-t}ms`);}).on("error",n=>{a(n);});})}async saveCacheToFile(){if(this.indexOpsInProgress||!this.hasChanged)return;this.hasChanged=!1,this.indexOpsInProgress=!0;let e=performance.now(),t;this.cache.size!==0&&(t=this.loadIndexFromCache());for(let r of this.targetHash){let s=await this.loadIndex(r),a=new Map(s.map(n=>[n.path,n]));if(this.cache.size!==0){let n=t.filter(o=>!a.has(o.path)&&!!o[r]);if(n.length!==0){let o=sync$1.stringify(n,{header:s.length===0,columns:[{key:"path",header:"path"},{key:"size",header:"size"},{key:"mtime",header:"mtime"},{key:r,header:r}]});await fs.promises.appendFile(this.filePaths[r],o);}}}let i=performance.now()-e;console.log(`Index saved in ${i}ms`),i*10>this.intervalTime&&(this.startAutoSave(i*10),console.log(`Index save interval increased to ${i*10}ms`)),this.indexOpsInProgress=!1;}async getCidForFileAsync(e){let t=c__namespace.default.basename(e),i=await promises.stat(e);return this.getCidForFile(t,i.size,i.mtime.toISOString())}getCidForFile(e,t,i){let r=c__namespace.default.basename(e),s=this.cache.get(r);for(let a of this.targetHash)s[a]||delete s[a];if(s){if(s.mtime){if(s.size===t+""&&s.mtime===i)return s}else if(s.size===t+"")return s}return null}addFileCid(e,t,i,r){if(!e||!t||!i||!r)throw new Error("Invalid parameters");for(let o of this.targetHash)if(!r[o])throw new Error(`Missing hash ${o}`);let s=t+"",a=c__namespace.default.basename(e),n=this.cache.get(a);if(n)for(let o of this.targetHash)n[o]=r[o];else {let o={};for(let I of this.targetHash)o[I]=r[I];let g={path:a,size:s,mtime:i,...o};this.cache.set(a,g);}this.hasChanged=!0;}};var y=class{constructor(e,t=["cid_sha1","cid_sha2-256"],i){this.targetHash=t;this.hashComputer=new m(t,i),this.hashIndexManager=new d(e,t);}hashIndexManager;hashComputer;async computeMissingHash(e,t){await this.hashIndexManager.init();let i=await promises.stat(e);if(this.hashIndexManager.getCache().has(c__namespace.default.basename(e))){let r=this.hashIndexManager.getCidForFile(e,i.size,i.mtime.toISOString());if(r)for(let s of this.targetHash)!t[s]&&r[s]&&(t[s]=r[s]);}await this.hashComputer.computeMissingHash(e,t),this.hashIndexManager.addFileCid(e,i.size,i.mtime.toISOString(),t);}async getHashIndexManager(){return await this.hashIndexManager.init(),this.hashIndexManager}};var F=class{constructor(e,t,i){this.WATCH_FOLDER_LIST=t;this.config=i;this.fileProcessor=e;}initialized=!1;queue=new z__default.default({concurrency:100,autoStart:!0});fileProcessor;queueSize=-1;current=0;processing=new Set;async processDirectory(e,t){let i=await promises.readdir(e,{withFileTypes:!0});for(let r of i){let s=c__namespace.join(e,r.name);if(r.isDirectory())await this.processDirectory(s,t);else {let a=this.processFile(s);t.push(a);}}}async countFile(e){let t=await promises.readdir(e,{withFileTypes:!0}),i=[];for(let s of t){let a=c__namespace.join(e,s.name);s.isDirectory()?i.push(this.countFile(a)):i.push(this.queue.add(async()=>await this.fileProcessor.canProcessFile(a)?1:0));}return (await Promise.all(i)).reduce((s,a)=>s+a,0)}async processFile(e){if(await this.fileProcessor.canProcessFile(e)&&!this.processing.has(e)){this.processing.add(e);let t=++this.current;await this.queue.add(()=>this.fileProcessor.processFile(t,this.queueSize,e)),this.processing.delete(e);}}async processFileExtended(e){let t=c__namespace.dirname(e);await this.processDirectory(t,[]);}chokidarWatch(e){let t={ignoreInitial:!0,persistent:!0,depth:1/0,awaitWriteFinish:{stabilityThreshold:this.config.stabilityThreshold||3e4,pollInterval:this.config.pollInterval||5e3}},i;(this.config.interval||0)<=0?i=M__default.default.watch(e,t):i=M__default.default.watch(e,{...t,usePolling:!0,interval:this.config.interval||0}),i.on("add",async r=>{try{await this.processFileExtended(r);}catch(s){console.error(`Error processing file ${r}:`,s);}}).on("change",async r=>{try{await this.processFileExtended(r);}catch(s){console.error(`Error processing file ${r}:`,s);}}).on("unlink",async r=>{try{await this.fileProcessor.deleteFile(r),await this.processFileExtended(r);}catch(s){console.error("Error processing file deletion:",s);}}).on("error",r=>console.error(`Watcher error: ${r}`)).on("ready",()=>{console.log(`Watching for file changes on ${e}`);});}async watch(){let e=this.WATCH_FOLDER_LIST;if(!e)throw new Error("No folder to watch");let t=e.split(",");this.chokidarWatch(t);let i=[];for(let a=0;a<t.length;a++)t[a]=c__namespace.normalize(t[a]),i.push(this.countFile(t[a]));let r=(await Promise.all(i)).reduce((a,n)=>a+n,0);console.log(`Found ${r} files to process`),this.queueSize=r;let s=[];for(let a=0;a<t.length;a++)t[a]=c__namespace.normalize(t[a]),await this.processDirectory(t[a],s);await Promise.all(s),this.initialized=!0,console.log("Watcher ready");}};

Object.defineProperty(exports, "CID_ALGORITHM", {
	enumerable: true,
	get: function () { return chunkPAKJNZBJ_cjs.c; }
});
Object.defineProperty(exports, "CID_ALGORITHM_CODES", {
	enumerable: true,
	get: function () { return chunkPAKJNZBJ_cjs.a; }
});
Object.defineProperty(exports, "CID_ALGORITHM_NAMES", {
	enumerable: true,
	get: function () { return chunkPAKJNZBJ_cjs.b; }
});
exports.FileIDComputerWorker = p;
exports.FolderWatcher = F;
exports.HashComputerIndexCache = y;
exports.HashComputerWorker = m;
exports.HashIndexManager = d;
exports.INDEX_HEADERS = E;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.cjs.map