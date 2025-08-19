import noop from './noop.mjs';
import autobind from './autobind.mjs';
import isThenable from './isThenable.mjs';
import DefaultMap from './DefaultMap.mjs';
import EventEmitter from './EventEmitter.mjs';
import createResolvablePromise from './createResolvablePromise.mjs';

const defaultInject = [];

/**
 * Gets the factory function from an array or direct function.
 * @param {Function|Array} obj - Function or array with dependencies and factory
 * @returns {Function} The factory function
 */
export const getFactory = obj => Array.isArray(obj) ? obj.at(-1) : obj;

/**
 * Gets the injection dependencies from a function or array.
 * @param {Function|Array} obj - Function or array with dependencies and factory
 * @returns {Array} Array of dependency identifiers
 */
export function getInject(obj) {
  return  obj?.$inject ?? (
    Array.isArray(obj) ? obj.slice(0, obj.length - 1) :
    defaultInject);
}

/**
 * Asserts that all promises in an array are settled and throws if any are rejected.
 * @param {Array} array - Array of promise results
 * @returns {Array} Array of resolved values
 * @throws {Error} If any promise was rejected
 */
function assertAllSettled(array) {
  return array.map(({ status, value, reason }) => {
    if(status === 'rejected' && reason !== void(0)) {
      throw reason;
    }
    return value;
  });
}

const inbuilts = [
  '$set',
  '$get',
  '$ready',
  '$onExit',
  '$invoke',
  '$publish',
  '$schedule',
  '$subscribe',
  '$isRunning',
  '$terminate',
  '$isTerminated'
];

/**
 * Instance class that manages the lifecycle and execution of a module.
 */
export class Instance extends EventEmitter {

  /**
   * Creates a new Instance for a module.
   * @param {Module} module - The module to create an instance for
   */
  constructor(module) {
    super();
    autobind(this);
    this._Instance = {
      pending: [],
      schedule: [],
      terminated: false,
      module: module.asImmutable(),
      notify: createResolvablePromise(),
      ready: new DefaultMap(() => new Set()),
      objects: new Map([
        ['$set', this.set],
        ['$get', this.get],
        ['$ready', this.ready],
        ['$onExit', this.onExit],
        ['$invoke', this.invoke],
        ['$publish', this.publish],
        ['$schedule', this.schedule],
        ['$subscribe', this.subscribe],
        ['$isRunning', this.isRunning],
        ['$terminate', this.terminate],
        ['$isTerminated', this.isTerminated]
      ])
    };
  }

  /**
   * Registers a callback to be executed when an identity is ready.
   * @param {string} identity - The identity to wait for
   * @param {Function} cb - Callback to execute when ready
   * @returns {Instance} This instance for chaining
   */
  ready(identity, cb) {
    const { ready, objects } = this._Instance;
    const maybe = objects.get(identity);
    if(isThenable(maybe)) {
      maybe.then(() => this.invoke(cb));
      return this;
    }
    ready.get(identity).add(cb);
    return this;
  }

  /**
   * Sets a value for an identity and notifies ready callbacks.
   * @param {string} identity - The identity to set
   * @param {any} value - The value to set
   * @returns {Instance} This instance for chaining
   */
  set(identity, value) {
    const { ready, objects } = this._Instance;
    objects.set(identity, value);
    if(!ready.has(identity)) {
      return this;
    }

    for(const cb of ready.get(identity)) {
      this.invoke(cb);
    }
    ready.delete(identity);
    return this;
  }

  /**
   * Gets a value by identity, creating it if necessary.
   * @param {string} identity - The identity to get
   * @returns {any} The value for the identity
   * @throws {Error} If factory not found for identity
   */
  get(identity) {
    const dataMap = this._Instance;
    const objects = dataMap.objects;
    if(objects.has(identity)) {
      return objects.get(identity);
    }

    const { pool, lifecycle } = dataMap.module._Module;
    const factory = pool.get(identity);
    if(!factory) {
      throw new Error(`Instance<get>: Factory not found: "${identity}"`);
    }

    const promise = Promise
      .resolve()
      .then(async () => {
        const before = lifecycle.get('before').get(identity);
        assertAllSettled(await Promise.allSettled(Array.from(before).map(cb => this.invoke(cb))));
        // Contruct the element and register it
        const value = await this.invoke(factory);
        const map = new Map([ [identity, value] ]);
        const after = lifecycle.get('after').get(identity);
        assertAllSettled(await Promise.allSettled(Array.from(after).map(cb => this.invoke(cb, map))));
        return value;
      });

    this.set(identity, promise);
    return promise;
  }

  /**
   * Invokes a callback with resolved dependencies.
   * @param {Function|Array} cb - Callback to invoke
   * @param {Map} map - Optional map of pre-resolved dependencies
   * @returns {Promise} Promise that resolves to the callback result
   */
  invoke(cb, map = new Map()) {
    const promise = (async () => {
      const factory = getFactory(cb);
      const dependencies = assertAllSettled(await Promise.allSettled(getInject(cb).map(id => map.get(id) ?? this.get(id))));
      return factory(...dependencies);
    })();
      
    const { pending } = this._Instance;
    pending.push(promise);
    return promise;
  }

  /**
   * Registers a callback to be executed on exit.
   * @param {Function} cb - Callback to execute on exit
   * @returns {Function} Unsubscribe function
   */
  onExit(cb) {
    if(this.isTerminated()) {
      cb();
      return noop;
    }
    return this.subscribe(type => type === 'exit' && cb());
  }

  /**
   * Schedules a callback to be invoked. If the handler returns a function, it will be invoked when the "exit" event is emitted.
   * @param {Function} cb - Callback to schedule
   * @returns {Instance} This instance for chaining
   */
  schedule(cb) {
    const dataMap = this._Instance;
    dataMap.schedule.push(cb);
    dataMap.notify.resolve();
    dataMap.notify = createResolvablePromise();
    return this;
  }

  /**
   * Runs the module instance, executing scheduled tasks and managing lifecycle.
   * @returns {Promise} Promise that resolves when all tasks are complete
   */
  async run() {
    const dataMap = this._Instance;
    const schedule = dataMap.schedule;
    Array
      .from(dataMap.module._Module.schedule)
      .map(cb => this.invoke(cb));

    const tasks = dataMap.pending;
    while(tasks.length) {
      const promises = tasks
        .concat(dataMap.notify)
        .map(task => task.then(() => ({ task })));

      let obj;
      try {
        obj = await Promise.race(promises);
      } catch(error) {
        this.terminate();
        throw error;
      }

      const index = tasks.indexOf(obj.task);
      if(index !== -1) {
        // should not happen, but in case of
        tasks.splice(index, 1);
      }

      if(schedule.length) {
        schedule.forEach(cb => tasks.push(this.invoke(cb)));
        schedule.length = 0;
      }
    }
    this.terminate();
  }

  /**
   * Terminates the instance and emits exit event.
   */
  terminate() {
    const dataMap = this._Instance;
    if(!dataMap.terminated) {
      dataMap.terminated = true;
      this.publish('exit');
    }
  }

  /**
   * Checks if the instance is terminated.
   * @returns {boolean} True if terminated, false otherwise
   */
  isTerminated() {
    return this._Instance.terminated;
  }

}

/**
 * Module class for dependency injection and lifecycle management.
 */
export default class Module {

  /**
   * Creates a new Module instance.
   * @param {Object} props - Module properties
   * @param {Map} props.pool - Map of identity to factory functions
   * @param {boolean} props.mutable - Whether the module is mutable
   * @param {Set} props.schedule - Set of scheduled functions
   * @param {Map} props.lifecycle - Map of lifecycle hooks
   */
  constructor(props) {
    // { pool, mutable, schedule, lifecycle }
    const mutable = !!props?.mutable;
    const schedule = new Set(props?.schedule);
    const pool = new Map(props?.pool);
    const lifecycle = new DefaultMap(() => new DefaultMap(() => new Set())); // before => target => module
    const propsLifecycle = props?.lifecycle;
    if(propsLifecycle) {
      ['after', 'before'].forEach(type => {
        const our = lifecycle.get(type);
        const their = propsLifecycle.get(type);
        for(const [k, v] of their) {
          our.set(k, new Set(v));
        }
      });
    }

    this._Module = {
      pool,
      mutable,
      schedule,
      lifecycle
    };
  }

  /**
   * Checks if the module is mutable.
   * @returns {boolean} True if mutable, false otherwise
   */
  isMutable() {
    return !!this._Module.mutable;
  }

  /**
   * Checks if the module is immutable.
   * @returns {boolean} True if immutable, false otherwise
   */
  isImmutable() {
    return !this.isMutable();
  }

  /**
   * Creates a new module with specified mutability.
   * @param {boolean} mutable - Whether the new module should be mutable
   * @returns {Module} New module instance
   */
  asMutable(mutable = true) {
    const dataMap = this._Module;
    return dataMap.mutable === mutable ? this : new Module({ ...dataMap, mutable });
  }

  /**
   * Creates an immutable copy of the module.
   * @returns {Module} Immutable module instance
   */
  asImmutable() {
    return this.asMutable(false);
  }

  /**
   * Executes a callback with a mutable version of the module.
   * @param {Function} cb - Callback to execute
   * @returns {Module} Immutable module after mutations
   */
  withMutations(cb) {
    const obj = this.asMutable();
    cb(obj);
    return obj.asImmutable();
  }

  /**
   * Checks if the module has a factory for the given identity.
   * @param {string} identity - Identity to check
   * @returns {boolean} True if factory exists, false otherwise
   */
  has(identity) {
    return this._Module.pool.has(identity);
  }

  /**
   * Registers an after lifecycle hook for an identity.
   * @param {string} identity - Identity to register hook for
   * @param {Function} cb - Callback function (optional, defaults to identity)
   * @returns {Module} This module for chaining
   */
  after(identity, cb) {
    cb = cb ?? identity;
    return this.lifecycle('after', identity, cb);
  }

  /**
   * Registers a before lifecycle hook for an identity.
   * @param {string} identity - Identity to register hook for
   * @param {Function} cb - Callback function (optional, defaults to identity)
   * @returns {Module} This module for chaining
   */
  before(identity, cb) {
    cb = cb ?? identity;
    return this.lifecycle('before', identity, cb);
  }

  /**
   * Registers a factory function for an identity.
   * @param {string} identity - Identity to register factory for
   * @param {Function} cb - Factory function (optional, defaults to identity)
   * @returns {Module} This module for chaining
   */
  factory(identity, cb) {
    cb = cb ?? identity;
    return this.withMutations(obj => obj._Module.pool.set(identity, cb));
  }

  /**
   * Registers a scheduled function.
   * @param {Function} cb - Function to schedule
   * @returns {Module} This module for chaining
   */
  schedule(cb) {
    return this.withMutations(obj => obj._Module.schedule.add(cb));
  }

  /**
   * Registers a lifecycle hook.
   * @param {string} type - Lifecycle type ('before' or 'after')
   * @param {string} identity - Identity to register hook for
   * @param {Function} cb - Callback function (optional, defaults to identity)
   * @returns {Module} This module for chaining
   */
  lifecycle(type, identity, cb) {
    cb = cb ?? identity;
    return this.withMutations(obj => obj._Module.lifecycle.get(type).get(identity).add(cb));
  }

  /**
   * Extends this module with another module's factories, schedules, and lifecycle hooks.
   * @param {Module} other - Module to extend from
   * @returns {Module} This module for chaining
   * @throws {Error} If other is not a Module instance
   */
  extends(other) {
    if(!(other instanceof Module)) {
      throw new Error('Module<extend>: source must be an instance of Module');
    }
    return this.withMutations(our => {
      const { pool, schedule, lifecycle } = other._Module;

      for(const [k,v] of pool) { our.factory(k, v); }
      for(const v of schedule) { our.schedule(v); }
      for(const [type, map] of lifecycle) {
        for(const [identity, set] of map) {
          for(const cb of set) {
            our.lifecycle(type, identity, cb);
          }
        }
      }
    });
  }

  /**
   * Validates that all dependencies are available.
   * @returns {Module} This module for chaining
   * @throws {Error} If unknown dependencies are found
   */
  validate() {

    const { pool, schedule, lifecycle } = this._Module;

    const check = [schedule, pool.values()];

    ['before', 'after'].forEach(type => check.push(lifecycle.get(type).values()));

    for(const iterable of check) {
      for(const cb of iterable) {
        for(const identity of getInject(cb)) {
          if(!this.has(identity) && !inbuilts.includes(identity)) {
            throw new Error(`Unknown dependency: "${identity?.name ?? identity}" for factory:  "${cb?.name ?? cb}"`);
          }
        }
      }
    }

    return this;
  }

  /**
   * Creates and runs a module instance.
   * @returns {Promise} Promise that resolves when the instance completes
   */
  initiate() {
    const instance = new Instance(this); //this.validate()); Does not work in service-api because of bu
    return Object.assign(instance.run(), instance);
  }

};