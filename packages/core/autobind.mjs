import withCache from './withCache.mjs';

const inbuiltMethods = ['constructor'];

/**
 * Gets the context methods for an object, excluding built-in methods.
 * 
 * @param {Object} context - The object to get methods from
 * @returns {Array<string>} Array of method names
 * @private
 */
const getContextMethods = withCache(new WeakMap(), context => {
  return Reflect
    .ownKeys(Object.getPrototypeOf(context))
    .filter(name => !inbuiltMethods.includes(name));
});

/**
 * Binds a set of methods to a specific object context.
 * 
 * @param {Object} context - The object to bind methods to
 * @param {Array<string>} methods - Array of method names to bind
 * @returns {Object} The context object with bound methods
 * @private
 */
function setContextMethods(context, methods) {
  methods.forEach(name => (context[name] = context[name].bind(context)));
  return context;
}

/**
 * Binds methods to a specific object to ensure the "this" value is always correct.
 * 
 * When used without method names, automatically detects and binds all prototype methods.
 * When used with method names, binds only the specified methods.
 * 
 * @param {Object} context - The object whose methods should be bound
 * @param {...string} methods - Optional method names to bind. If none provided, binds all prototype methods
 * @returns {Object} The context object with bound methods
 * 
 * @example
 * // Bind specific methods
 * const obj = {
 *   name: 'John',
 *   sayHello() {
 *     return `Hi ${this.name}!`;
 *   }
 * };
 * autobind(obj, 'sayHello');
 * 
 * @example
 * // Auto-detect and bind all prototype methods (typically used in class constructors)
 * class Person {
 *   constructor(name) {
 *     this.name = name;
 *     autobind(this); // Binds all prototype methods
 *   }
 *   
 *   sayHello() {
 *     return `Hi ${this.name}!`;
 *   }
 * }
 * 
 * @example
 * // The bound methods maintain their context
 * const person = new Person('John');
 * const hello = person.sayHello;
 * hello(); // "Hi John!" (not undefined)
 */
export default function autobind(context, ...methods) {
  return  methods.length === 0 ? setContextMethods(context, getContextMethods(context)) :
    setContextMethods(context, methods);
};