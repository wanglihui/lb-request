
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
        lbRequest({uri: "lb://myservice/?search=keyword"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({}, {env: 'master'});
        lbRequest({uri: "lb://primary_admin/p/health/status"}, (err: any, resp: any) => {
            assert.equal(!!err, true);
            done();
        })
    })

    it("#init inject service should be ok", (done) => {
        init({}, {env: 'master', formatServiceNameFn: (serviceName => {return 'www.baidu.com'})});
        lbRequest({uri: "lb://primary_admin/"}, (err: any, resp: any) => {
            assert.equal(err, null);
            done();
        })
    })
})
