'use strict';

var chunkOHUFSPVO_cjs = require('./chunk-OHUFSPVO.cjs');
var fs = require('fs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fs__default = /*#__PURE__*/_interopDefault(fs);

async function computeCIDs2({ filePath, algorithms }) {
  const stream = fs__default.default.createReadStream(filePath);
  return chunkOHUFSPVO_cjs.computeCIDs({ stream, algorithms });
}

exports.computeCIDs = computeCIDs2;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-Y5FIE5OK.cjs.map