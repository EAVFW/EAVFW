/**
 * Registry of globally available EAVFW services. Services are stored on
 * `globalThis` so they survive hot-module reloads and are shared across
 * packages.
 *
 * @see {@link registerEAVService}
 * @see {@link resolveEAVService}
 */
export type EAVServiceCollection = {
  logger?: IQuickFormLogger;
  loggerFactory?: (category: string) => IQuickFormLogger;
};
declare global {
  var __eav_services: EAVServiceCollection | undefined;
}
//let _quickFormFeatures: QuickFormFeatures = {
//};
/**
 * Structured-logging interface used by EAVFW services. Supports template
 * literals with `{name}` placeholders.
 */
export interface IQuickFormLogger {
  log(body: string, ...args: any[]): void;
  warn(body: string, ...args: any[]): void;
}
/**
 * Returns the global {@link EAVServiceCollection}, creating it if it does not
 * yet exist.
 *
 * @returns The singleton service collection stored on `globalThis`.
 *
 * @example
 * ```ts
 * const services = getOrCreateEAVServiceCollection();
 * ```
 */
export function getOrCreateEAVServiceCollection(): EAVServiceCollection {
  if (!globalThis.__eav_services) {
    globalThis.__eav_services = {};
  }
  return globalThis.__eav_services;
}

/**
 * Registers a service instance in the global {@link EAVServiceCollection}.
 *
 * @typeParam Key - A key of {@link EAVServiceCollection}.
 * @param name - The service key to register under.
 * @param instance - The service instance to store.
 *
 * @example
 * ```ts
 * registerEAVService('logger', new DefaultLogger());
 * ```
 *
 * @see {@link resolveEAVService}
 */
export function registerEAVService<Key extends keyof EAVServiceCollection>(
  name: Key,
  instance: EAVServiceCollection[Key],
) {
  let services = getOrCreateEAVServiceCollection();
  services[name] = instance;
}

/**
 * Resolves a previously registered service from the global
 * {@link EAVServiceCollection}. Throws if the service has not been
 * registered.
 *
 * @typeParam Key - A key of {@link EAVServiceCollection}.
 * @param name - The service key to resolve.
 * @returns The registered service instance.
 * @throws {Error} When the requested service is not registered.
 *
 * @example
 * ```ts
 * const logger = resolveEAVService('logger');
 * logger.log('Entity {name} saved', entityName);
 * ```
 *
 * @see {@link registerEAVService}
 */
export function resolveEAVService<Key extends keyof EAVServiceCollection>(name: Key) {
  let services = getOrCreateEAVServiceCollection();
  let f = services[name];
  if (!f) throw new Error(`'${name}' was not registered, registred keys: ${Object.keys(services)}`);
  return f as Required<EAVServiceCollection>[Key];
}

/**
 * Default no-op implementation of {@link IQuickFormLogger}. Log and warn
 * calls are silently discarded. Registered as the default logger on module
 * load.
 *
 * @example
 * ```ts
 * const logger = new DefaultLogger('my-category');
 * logger.log('Hello {name}', 'world'); // no-op
 * ```
 */
export class DefaultLogger implements IQuickFormLogger {
  constructor(private category: string = 'eavfw') {}
  private replaceLiteral(body: string, ...args: any[]) {
    var iterLiteral = '{(.*?)}';
    let i = 0;
    var re = new RegExp(iterLiteral, 'g');

    return body.replace(re, (s) => {
      try {
        return s.startsWith('{@') ? JSON.stringify(args[i++]) : args[i++];
      } catch (e) {
        return '...' + args[i - 1] + '...';
      }
    });
  }
  log(message: string, ...args: any[]): void {}
  warn(message: string, ...args: any[]): void {}
}

registerEAVService('logger', new DefaultLogger());
registerEAVService('loggerFactory', (category: string) => new DefaultLogger(category));
