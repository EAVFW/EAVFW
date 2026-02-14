
export type EAVServiceCollection = {
    
    logger?: IQuickFormLogger
    loggerFactory?: (category: string) => IQuickFormLogger
}
declare global {
    var __eav_services: EAVServiceCollection | undefined;
}
//let _quickFormFeatures: QuickFormFeatures = {
//};
export interface IQuickFormLogger {
    log(body: string, ...args: any[]): void;
    warn(body: string, ...args: any[]): void;
}
export function getOrCreateEAVServiceCollection(): EAVServiceCollection {
    if (!globalThis.__eav_services) {
        globalThis.__eav_services = {};
        ;
    }
    return globalThis.__eav_services;
}

export function registerEAVService<Key extends keyof EAVServiceCollection>(name: Key, instance: (EAVServiceCollection)[Key]) {
    let services = getOrCreateEAVServiceCollection();
    services[name] = instance;
}

export function resolveEAVService<Key extends keyof EAVServiceCollection>(name: Key) {

    let services = getOrCreateEAVServiceCollection();
    let f = services[name];
    if (!f)
        throw new Error(`'${name}' was not registered, registred keys: ${Object.keys(services)}`);
    return f as Required<EAVServiceCollection>[Key];
}
 
export class DefaultLogger implements IQuickFormLogger {

    constructor(private category: string = "eavfw") {
    }
    private replaceLiteral(body: string, ...args: any[]) {
        var iterLiteral = "{(.*?)}";
        let i = 0;
        var re = new RegExp(iterLiteral, "g");

        return body.replace(re, (s) => {
            try {
                return s.startsWith("{@") ? JSON.stringify(args[i++]) : args[i++]
            } catch (e) {
                return "..." + args[i - 1] + "..."
            }
        });
    }
    log(message: string, ...args: any[]): void {
    }
    warn(message: string, ...args: any[]): void {
    }

}

registerEAVService("logger", new DefaultLogger());
registerEAVService("loggerFactory", (category: string) => new DefaultLogger(category));
