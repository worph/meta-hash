'use strict';

require('./chunk-KWYLOVWT.cjs');
var chunk33LRP2HS_cjs = require('./chunk-33LRP2HS.cjs');
var chunkPAKJNZBJ_cjs = require('./chunk-PAKJNZBJ.cjs');

var a=class{constructor(r){this.targetHash=r;}async computeMissingHash(r,e){let t=this.targetHash.filter(o=>!e[o]);if(t.length===0)return;let i=await chunk33LRP2HS_cjs.a({stream:r,algorithms:t});for(let[o,c]of i.entries()){let n=t[o];e[n]=c;}}};

Object.defineProperty(exports, "computeCIDs", {
	enumerable: true,
	get: function () { return chunk33LRP2HS_cjs.a; }
});
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
exports.HashComputer = a;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index-browser.cjs.map