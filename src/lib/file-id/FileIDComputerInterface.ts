import {CID_ALGORITHM_NAMES} from "@root/hash-compute/MultiHashData";
import * as Stream from "stream";

export interface FileIDComputerInterface{
    computeCIDs(filePath: Stream, algorithms: CID_ALGORITHM_NAMES[]): Promise<string[]>;
}