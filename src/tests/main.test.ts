import {HashComputer} from "../lib";
import {CID_ALGORITHM_NAMES} from "../lib";

import {describe, it, expect} from 'vitest';
import * as process from "process";

process.env.WORKER_URL = "./dist/worker.js";

describe('add', () => {
    it('meta data compute', async () => {
        let hashComputer = new HashComputer([
            CID_ALGORITHM_NAMES.sha1,
            CID_ALGORITHM_NAMES.sha256,
            CID_ALGORITHM_NAMES.md5,
            CID_ALGORITHM_NAMES.sha3_256
        ]);
        let metadata = {};
        await hashComputer.computeMissingHash('./src/tests/test.txt', metadata);
        console.log(metadata);
        expect(metadata).toEqual({
            cid_sha1: 'baeircff3eqvxxaqqot2lt242stkdtk3gq4c2vra',
            'cid_sha2-256': 'baejbeibku6ua2l6r5olnggx4pto2sii2s5jeeawgh4cbkhlbmp52gudbua',
            cid_md5: 'bahkqdvibcatpcfl7ine2n625eb5ml5mzkfaa',
            'cid_sha3-256': 'baelbmidner7x3dd7t2kldh6wiq4w6lsye7qrwo6uoqot2t52zkhqk56fnq'
        });
    });
});