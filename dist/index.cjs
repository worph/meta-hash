'use strict';

var chunkDL4KI2PZ_cjs = require('./chunk-DL4KI2PZ.cjs');
var piscina = require('piscina');
var fs = require('fs');
var csvParse = require('csv-parse');
var sync = require('csv-parse/sync');
var sync$1 = require('csv-stringify/sync');
var promises = require('fs/promises');
var n = require('path');
var timers = require('timers');
var w = require('chokidar');
var b = require('p-queue');

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

var n__namespace = /*#__PURE__*/_interopNamespace(n);
var w__default = /*#__PURE__*/_interopDefault(w);
var b__default = /*#__PURE__*/_interopDefault(b);

var h=undefined;h=h.replace("src","dist");h=h+"/worker.js";var f=new URL(h).href;console.log("Worker URL: ",f);var l=class{piscina;constructor(e){this.piscina=new piscina.Piscina({maxThreads:4,filename:e||process.env.WORKER_URL||f});}async computeCIDs(e,t){return this.piscina.run({filePath:e,algorithms:t})}};var p=class{constructor(e,t){this.targetHash=e;this.fileIDComputer=new l(t);}fileIDComputer;async computeMissingHash(e,t){let r=this.targetHash.filter(i=>!t[i]);if(r.length===0)return;(await this.fileIDComputer.computeCIDs(e,r)).forEach((i,a)=>{let o=r[a];t[o]=i;});}};async function d(c){try{return await promises.access(c,promises.constants.F_OK),!0}catch{return !1}}var Q=["path","size","mtime"],m=class{constructor(e,t=["cid_sha1","cid_sha2-256"]){this.filePath=e;this.targetHash=t;if(!e)throw new Error("Invalid index file path")}cache=new Map;intervalId;intervalTime=3e4;lastIndexFileSize=0;lastCacheFile;indexOpsInProgress=!1;hasChanged=!1;initialLoad;getCache(){return new Map(this.cache)}async init(e=!0){return this.initialLoad||(this.initialLoad=new Promise(async(t,r)=>{try{if(!this.checkCSVHeaders(this.filePath))throw new Error("Invalid index file headers");await this.loadIndex(),e&&this.start(),t();}catch(s){r(s);}})),this.initialLoad}checkCSVHeaders(e){let t=sync.parse(e,{bom:!0,columns:!0,skip_empty_lines:!0});if(t.length===0)return !0;let r=Object.keys(t[0]);return ["path","size","mtime",...this.targetHash].every(i=>r.includes(i))}start(){this.startAutoSave(this.intervalTime);}stopAutoSave(){this.intervalId&&timers.clearInterval(this.intervalId);}startAutoSave(e){this.stopAutoSave(),this.intervalTime=e,this.intervalId=setInterval(()=>this.saveCacheToFile(),e);}async loadIndex(){if(await d(this.filePath)){let e=await fs.promises.stat(this.filePath);if(this.lastIndexFileSize!==e.size){let t=await this.readCsv();for(let r of t)this.cache.set(r.path,r);return this.lastIndexFileSize=e.size,this.lastCacheFile=t,t}else return this.lastCacheFile}return []}loadIndexFromCache(){return Array.from(this.cache.values())}async readCsv(){if(!await d(this.filePath))return [];let e=performance.now(),t=csvParse.parse({columns:!0,skip_empty_lines:!0}),r=[];return new Promise((s,i)=>{fs.createReadStream(this.filePath).pipe(t).on("data",a=>{r.push(a);}).on("end",()=>{s(r),console.log(`Index read time ${performance.now()-e}ms`);}).on("error",a=>{i(a);});})}async saveCacheToFile(){if(this.indexOpsInProgress||!this.hasChanged)return;this.hasChanged=!1,this.indexOpsInProgress=!0;let e=performance.now(),t=await this.loadIndex();if(this.cache.size!==0){let i=this.loadIndexFromCache().filter(a=>!t.find(o=>o.path===a.path));if(i.length!==0){let a=sync$1.stringify(i,{header:t.length===0,columns:[{key:"path",header:"path"},{key:"size",header:"size"},{key:"mtime",header:"mtime"},...this.targetHash.map(o=>({key:o,header:o}))]});await fs.promises.appendFile(this.filePath,a);}}let r=performance.now()-e;console.log(`Index saved in ${r}ms`),r*10>this.intervalTime&&(this.startAutoSave(r*10),console.log(`Index save interval increased to ${r*10}ms`)),this.indexOpsInProgress=!1;}getCidForFile(e,t,r){let s=n__namespace.default.basename(e),i=this.cache.get(s);if(i){if(i.mtime){if(i.size===t+""&&i.mtime===r)return i}else if(i.size===t+"")return i}return null}addFileCid(e,t,r,s){if(!e||!t||!r||!s)throw new Error("Invalid parameters");let i=t+"",a=n__namespace.default.basename(e),o={path:a,size:i,mtime:r,...s};this.cache.set(a,o),this.hasChanged=!0;}};var v=class{constructor(e,t=["cid_sha1","cid_sha2-256"],r){this.targetHash=t;this.hashComputer=new p(this.targetHash,r),this.hashIndexManager=new m(e);}hashIndexManager;hashComputer;async computeMissingHash(e,t){await this.hashIndexManager.init();let r=await promises.stat(e);if(this.hashIndexManager.getCache().has(n__namespace.default.basename(e))){let s=this.hashIndexManager.getCidForFile(e,r.size,r.mtime.toISOString());if(s)for(let i of this.targetHash)!t[i]&&s[i]&&(t[i]=s[i]);}await this.hashComputer.computeMissingHash(e,t),this.hashIndexManager.addFileCid(e,r.size,r.mtime.toISOString(),t);}};var y=class{constructor(e,t,r){this.WATCH_FOLDER_LIST=t;this.config=r;this.fileProcessor=e;}initialized=!1;queue=new b__default.default({concurrency:100,autoStart:!0});fileProcessor;queueSize=-1;current=0;processing=new Set;async processDirectory(e,t){let r=await promises.readdir(e,{withFileTypes:!0});for(let s of r){let i=n__namespace.join(e,s.name);if(s.isDirectory())await this.processDirectory(i,t);else {let a=this.processFile(i);t.push(a);}}}async countFile(e){let t=await promises.readdir(e,{withFileTypes:!0}),r=[];for(let i of t){let a=n__namespace.join(e,i.name);i.isDirectory()?r.push(this.countFile(a)):r.push(this.queue.add(async()=>await this.fileProcessor.canProcessFile(a)?1:0));}return (await Promise.all(r)).reduce((i,a)=>i+a,0)}async processFile(e){if(await this.fileProcessor.canProcessFile(e)&&!this.processing.has(e)){this.processing.add(e);let t=++this.current;await this.queue.add(()=>this.fileProcessor.processFile(t,this.queueSize,e)),this.processing.delete(e);}}async processFileExtended(e){let t=n__namespace.dirname(e);await this.processDirectory(t,[]);}chokidarWatch(e){let t={ignoreInitial:!0,persistent:!0,depth:1/0,awaitWriteFinish:{stabilityThreshold:this.config.stabilityThreshold||3e4,pollInterval:this.config.pollInterval||5e3}},r;(this.config.interval||0)<=0?r=w__default.default.watch(e,t):r=w__default.default.watch(e,{...t,usePolling:!0,interval:this.config.interval||0}),r.on("add",async s=>{try{await this.processFileExtended(s);}catch(i){console.error(`Error processing file ${s}:`,i);}}).on("change",async s=>{try{await this.processFileExtended(s);}catch(i){console.error(`Error processing file ${s}:`,i);}}).on("unlink",async s=>{try{await this.fileProcessor.deleteFile(s),await this.processFileExtended(s);}catch(i){console.error("Error processing file deletion:",i);}}).on("error",s=>console.error(`Watcher error: ${s}`)).on("ready",()=>{console.log(`Watching for file changes on ${e}`);});}async watch(){let e=this.WATCH_FOLDER_LIST;if(!e)throw new Error("No folder to watch");let t=e.split(",");this.chokidarWatch(t);let r=[];for(let a=0;a<t.length;a++)t[a]=n__namespace.normalize(t[a]),r.push(this.countFile(t[a]));let s=(await Promise.all(r)).reduce((a,o)=>a+o,0);console.log(`Found ${s} files to process`),this.queueSize=s;let i=[];for(let a=0;a<t.length;a++)t[a]=n__namespace.normalize(t[a]),await this.processDirectory(t[a],i);await Promise.all(i),this.initialized=!0,console.log("Watcher ready");}};

Object.defineProperty(exports, "CID_ALGORITHM", {
	enumerable: true,
	get: function () { return chunkDL4KI2PZ_cjs.c; }
});
Object.defineProperty(exports, "CID_ALGORITHM_CODES", {
	enumerable: true,
	get: function () { return chunkDL4KI2PZ_cjs.a; }
});
Object.defineProperty(exports, "CID_ALGORITHM_NAMES", {
	enumerable: true,
	get: function () { return chunkDL4KI2PZ_cjs.b; }
});
exports.ComputeHashIndexCache = v;
exports.FileIDComputer = l;
exports.FolderWatcher = y;
exports.HashComputer = p;
exports.HashIndexManager = m;
exports.INDEX_HEADERS = Q;
exports.existsAsync = d;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.cjs.map