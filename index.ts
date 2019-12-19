import request = require("request");
import {init as lbServiceInit, getServiceAddress} from 'lb-service'

// let avaServices: {[index: string]: string} = {};

export interface ILbRequestConfig {debug?: boolean; endfix?: string, protocol?: string};
let lbRequestConfig: ILbRequestConfig = {
    debug: false,
    endfix: '',
    protocol: 'http://',
}

const LBReg = /^lb:\/\/([^\/]+)(.*)/;
//@ts-ignore
const lbRequest = new Proxy<request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>|request>(request, {
    // @ts-ignore
    apply(target: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>|request, thisArg: any, argArray?: any): any {
        if (!argArray.length) {
            throw new Error("lbRequest param error! need uri or url!");
        }
        let arg0 = argArray[0];
        if (typeof arg0 == 'string' && LBReg.test(arg0)) {
            argArray[0] = replaceLbProtocol(arg0);
        } else if (typeof arg0 == 'object') {
            arg0.uri = replaceLbProtocol(arg0.uri);
            arg0.url = replaceLbProtocol(arg0.url);
        }
        target.apply(thisArg, argArray);
    }
});

// @ts-ignore
export function lbRequestPromise(target: any) {
    return new Promise( (resolve, reject) => {
        if (lbRequestConfig.debug) {
            console.debug(`lb-request request`)
            console.debug(target);
        }
        lbRequest(target, (err: Error|null, resp: any, body: any) => {
            if (err) {
                return reject(err);
            }
            if (lbRequestConfig.debug) {
                console.debug(`lb-request response`);
                console.debug(body);
            }
            resolve(body);
        })
    })
}

function replaceLbProtocol(lbUri: string) {
    if (!lbUri) return lbUri;
    if (typeof lbUri !== "string") return lbUri;
    let reg = /^lb:\/\/([^\/]+)(.*)/;
    let groups = reg.exec(lbUri);
    if (groups && groups.length) {
        let url = lbRequestConfig.protocol;
        let serviceName = groups[1];
        serviceName = getServiceAddress(serviceName);
        url += serviceName;
        url += groups[2];
        return  url;
    }
    return lbUri;
}

export {lbRequest};

export function init(lbServices: {[index: string]: string}, config?: ILbRequestConfig) {
    lbServiceInit({
        services: lbServices,
        endfix: config && config.endfix || ''
    })
    lbRequestConfig = Object.assign(lbRequestConfig, config);
}