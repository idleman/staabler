import autobind from './autobind.mjs';

/**
 * A simple event emitter implementation.
 * 
 * Provides a lightweight event system for subscribing to and publishing events.
 * Supports multiple subscribers per event and provides a `waitUntil` method for
 * waiting for specific events.
 * 
 * @example
 * const emitter = new EventEmitter();
 * 
 * // Subscribe to events
 * const unsubscribe = emitter.subscribe(
 *   (event, data) => console.log('Event:', event, 'Data:', data)
 * );
 * 
 * // Publish events
 * emitter.publish('user:created', { id: 1, name: 'John' });
 * 
 * // Unsubscribe
 * unsubscribe();
 * 
 * @example
 * // Multiple subscribers
 * const emitter = new EventEmitter();
 * 
 * emitter.subscribe((event) => console.log('Logger 1:', event));
 * emitter.subscribe((event) => console.log('Logger 2:', event));
 * 
 * emitter.publish('test'); // Both subscribers receive the event
 * 
 * @example
 * // Wait for specific events
 * const emitter = new EventEmitter();
 * 
 * // Wait for a specific event
 * emitter.waitUntil('ready').then(([event, data]) => {
 *   console.log('System is ready:', data);
 * });
 * 
 * // Later...
 * emitter.publish('ready', { version: '1.0.0' });
 */
export default class EventEmitter {

  /**
   * Creates a new EventEmitter instance.
   * 
   * Initializes the event emitter with an empty subscriber list.
   */
  constructor() {
    autobind(this);
    this._EventEmitter = { subscribers: [] };
  }

  /**
   * Subscribes to events.
   * 
   * Adds one or more listener functions that will be called when events are published.
   * Returns an unsubscribe function that removes all the listeners when called.
   * 
   * @param {...Function} listeners - One or more listener functions to subscribe
   * @returns {Function} An unsubscribe function that removes the listeners
   * 
   * @example
   * const emitter = new EventEmitter();
   * 
   * const unsubscribe = emitter.subscribe(
   *   (event, data) => console.log('Event:', event),
   *   (event, data) => console.log('Data:', data)
   * );
   * 
   * emitter.publish('test', 'hello');
   * // Output:
   * // Event: test
   * // Data: hello
   * 
   * unsubscribe(); // Remove both listeners
   */
  subscribe(...listeners) {
    const { subscribers } = this._EventEmitter;
    const subscriber = args => listeners.forEach(cb => cb.apply(null, args));
    subscribers.push(subscriber);
    return function unsubscribe() {
      const pos = subscribers.indexOf(subscriber);
      if(pos !== -1) {
        subscribers.splice(pos, 1);
      }
    };
  }

  /**
   * Publishes an event to all subscribers.
   * 
   * Calls all subscribed listeners with the provided arguments.
   * 
   * @param {...any} args - Arguments to pass to all subscribers
   * 
   * @example
   * const emitter = new EventEmitter();
   * 
   * emitter.subscribe((event, data) => console.log(event, data));
   * emitter.publish('user:created', { id: 1, name: 'John' });
   * // Output: user:created { id: 1, name: 'John' }
   */
  publish(...args) {
    this._EventEmitter.subscribers.forEach(cb => cb(args));
  }

  /**
   * Waits for a specific event to occur.
   * 
   * Returns a promise that resolves when an event matching the criteria occurs.
   * The promise resolves with the event arguments.
   * 
   * @param {string} event - The event name to wait for
   * @param {Function} [_match] - Optional custom matching function
   * @returns {Promise<Array>} Promise that resolves with the event arguments
   * 
   * @example
   * const emitter = new EventEmitter();
   * 
   * // Wait for specific event
   * emitter.waitUntil('ready').then(([event, data]) => {
   *   console.log('Ready event received:', data);
   * });
   * 
   * // Later...
   * emitter.publish('ready', { status: 'ok' });
   * 
   * @example
   * // Custom matching function
   * emitter.waitUntil('data', (args) => args[1]?.type === 'important')
   *   .then((args) => console.log('Important data received:', args[1]));
   */
  waitUntil(event, _match) {
    const match = _match ?? (args => args[0] === event);
    return new Promise(resolve => {
      const unsubscribe = this.subscribe((...args) => {
        if(match(args)) {
          unsubscribe();
          resolve(args);
        }
      });
    });
  }

};