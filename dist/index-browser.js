import './chunk-XCJZALP2.js';
import { a as a$1 } from './chunk-A6J5HDTV.js';
export { a as computeCIDs } from './chunk-A6J5HDTV.js';
export { c as CID_ALGORITHM, a as CID_ALGORITHM_CODES, b as CID_ALGORITHM_NAMES } from './chunk-YCFZVUZC.js';

var a=class{constructor(r){this.targetHash=r;}async computeMissingHash(r,e){let t=this.targetHash.filter(o=>!e[o]);if(t.length===0)return;let i=await a$1({stream:r,algorithms:t});for(let[o,c]of i.entries()){let n=t[o];e[n]=c;}}};

export { a as HashComputer };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index-browser.js.map