
import {init, lbRequest} from "../index";
import * as assert from 'assert';

describe("lb-request", () => {
    it("#init inject null should be ok", (done) => {
        init({}, {env: ''});
        lbRequest({uri: "lb://www.baidu.com"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({"myservice": "www.baidu.com"}, {env: ''});
        lbRequest({uri: "lb://myservice"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })
})
