/**
 * A base class for creating callable objects.
 * 
 * Extends Function to create objects that can be called like functions
 * while maintaining object properties and methods. The callable behavior
 * is controlled by the `operator` method.
 * 
 * @example
 * class Calculator extends Callable {
 *   constructor(initial = 0) {
 *     super();
 *     this.value = initial;
 *   }
 * 
 *   add(x) {
 *     this.value += x;
 *     return this;
 *   }
 * 
 *   operator() {
 *     return this.value;
 *   }
 * }
 * 
 * const calc = new Calculator(5);
 * calc.add(3);
 * console.log(calc()); // 8
 */
export default class Callable extends Function {

  /**
   * Creates a new callable object.
   * 
   * @param {string} [method='operator'] - The name of the method to call when the object is invoked
   * 
   * @example
   * class Greeter extends Callable {
   *   constructor(name) {
   *     super();
   *     this.name = name;
   *   }
   * 
   *   operator() {
   *     return `Hello, ${this.name}!`;
   *   }
   * }
   * 
   * const greet = new Greeter('World');
   * console.log(greet()); // "Hello, World!"
   */
  constructor(method = 'operator') {
    const closure = (...args) => closure[method]?.(...args);
    return Object.setPrototypeOf(closure, new.target.prototype);
  }

  /**
   * The default operator method that defines the callable behavior.
   * 
   * This method should be overridden in subclasses to provide the
   * desired functionality when the object is called.
   * 
   * @returns {any} The result of the operation
   * 
   * @example
   * class Counter extends Callable {
   *   constructor() {
   *     super();
   *     this.count = 0;
   *   }
   * 
   *   operator() {
   *     return ++this.count;
   *   }
   * }
   */
  operator() {
    // Default implementation - should be overridden
  }

};