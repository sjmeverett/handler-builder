
/**
 * Handlers are stored under this key on an object.
 */
export const handlersSymbol = Symbol('handlers');

/**
 * The default handler, if defined, is stored under this key.
 */
export const defaultHandlerSymbol = Symbol('defaultHandler');

/**
 * A handler function with key.
 */
export interface Handler<T> {
  key: T;
  handler: Function;
};

/**
 * The main class.
 */
export default class HandlerBuilder<T> {

  /**
   * Constructor.
   * @param selector a function, which when given arguments supplied to the built handler method, returns
   * the descriminator (route key)
   * @param defaultValue what to do in the event that no handler is found: a value, to return that value; a function
   * accepting the arguments passed to the handler method which returns the value to be returned; or if not provided,
   * an exception will be thrown
   */
  constructor(private selector: (...args: any[]) => T, private defaultValue?) {
  }


  /**
   * Returns a function which dispatches calls to methods on the target object based on the values of
   * discriminator found using the selector passed to the constructor.
   */
  build(target: Object) {
    let map = new Map<T, Function>();
    let handlers = target[handlersSymbol] as Handler<T>[];
    let defaultHandler = target[defaultHandlerSymbol] as Function;
    
    if (!handlers)
      throw new Error('no routes found on target');

    handlers.forEach(({key, handler}) => map.set(key, handler));

    return (...args: any[]) => {
      let key = this.selector(...args);
      let handler = map.get(key);

      if (handler) {
        return handler.apply(target, args);

      } else if (defaultHandler) {
        return defaultHandler.apply(target, args);

      } else if (typeof this.defaultValue === 'function') {
        return this.defaultValue.apply(null, args);

      } else if (typeof this.defaultValue !== 'undefined') {
        return this.defaultValue;

      } else {
        throw new Error('no matching handler or default value available for ' + key);
      }
    };
  }
};


/**
 * Marks the method as handling the specified discriminator.
 */
export function handler<K>(key: K) {
  return <T extends Function>(target: Object, prop: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
    if (!target[handlersSymbol])
      target[handlersSymbol] = [];
    
    target[handlersSymbol].push({
      key,
      handler: descriptor.value
    });
    return descriptor;
  };
};


/**
 * Marks the method as handling the case in which no other matching handler is found.
 */
export function defaultHandler<T extends Function>(target: Object, prop: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
  target[defaultHandlerSymbol] = descriptor.value;
  return descriptor;
};
