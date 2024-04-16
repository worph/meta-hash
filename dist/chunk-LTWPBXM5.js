import { computeCIDs } from './chunk-SV45D2HN.js';
import fs from 'fs';

async function computeCIDs2({ filePath, algorithms }) {
  const stream = fs.createReadStream(filePath);
  return computeCIDs({ stream, algorithms });
}

export { computeCIDs2 as computeCIDs };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-LTWPBXM5.js.map