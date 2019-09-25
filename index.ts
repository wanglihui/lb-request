import request = require("request");

let avaServices: {[index: string]: string} = {};

export interface ILbRequestConfig {env?: string, protocol?: string, formatServiceNameFn?: {(serviceName: string):string},};
let lbRequestConfig: ILbRequestConfig = {
    env: 'master',
    protocol: 'http://',
    formatServiceNameFn: function(serviceName) {
        if (lbRequestConfig.env) {
            serviceName += '-' + lbRequestConfig.env
        }
        return serviceName;
    }
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

//@ts-ignore
export function lbRequestPromise(target: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>) {
    return new Promise( (resolve, reject) => {
        lbRequest(target, (err: Error|null, resp: any, body: any) => {
            if (err) {
                return reject(err);
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
        if (avaServices[serviceName]) {
            serviceName = avaServices[serviceName];
        } else if (lbRequestConfig && typeof lbRequestConfig!.formatServiceNameFn == 'function') {
            serviceName = lbRequestConfig!.formatServiceNameFn(serviceName);
        }
        url += serviceName;
        url += groups[2];
        return  url;
    }
    return lbUri;
}

export {lbRequest};

export function init(lbServices: {[index: string]: string}, config?: ILbRequestConfig) {
    if (lbServices){
        avaServices = lbServices;
    }
    lbRequestConfig = Object.assign(lbRequestConfig, config);
}