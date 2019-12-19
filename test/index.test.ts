
import {init, lbRequest} from "../index";
import * as assert from 'assert';

const nock = require("nock")


nock("http://test-server-test")
.get("/*")
.reply(200)

nock("http://test-server")
.get("/*")
.reply(200)

describe("lb-request", () => {
    it("#init inject null should be ok", (done) => {
        init({}, {endfix: ''});
        nock("http://www.baidu.com")
        .get("/")
        .reply(200);
        lbRequest({uri: "lb://www.baidu.com"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({"myservice": "www.baidu.com"}, {endfix: ''});
        
        nock("http://www.baidu.com")
        .get("/?search=keyword")
        .reply(200);

        lbRequest({uri: "lb://myservice/?search=keyword"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({}, {endfix: '-test:3000'});
        nock("http://test-server-test:3000")
        .get("/p/health/status")
        .reply(200);
        lbRequest({uri: "lb://test-server/p/health/status"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({}, {endfix: '-test:3000'});
        nock("http://test-server-test:3000")
        .get("/")
        .reply(200);
        lbRequest({uri: "lb://test-server/"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })
})
