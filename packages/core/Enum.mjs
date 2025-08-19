/**
 * Reduces an enum type by adding a name property.
 * 
 * @param {Function} Type - The enum type constructor
 * @param {string} name - The name to add to the type
 * @returns {Function} The modified enum type
 * @private
 */
function reduceHelper(Type, name) {
  Type[name] = name;
  return Type;
}

/**
 * Creates an enum type with validation and factory methods.
 * 
 * Creates a class-like enum type that provides type safety and validation.
 * The enum values are case-insensitive strings, and the type provides a
 * `from()` method to safely convert strings to enum values.
 * 
 * @param {...string} args - The enum values (last argument) and optional name (second to last)
 * @returns {Function} An enum type constructor with validation methods
 * 
 * @example
 * // Basic enum
 * const Status = Enum('open', 'closed');
 * 
 * Status.open; // 'open'
 * Status.closed; // 'closed'
 * Status.from('open'); // 'open'
 * Status.from('OPEN'); // 'open' (case insensitive)
 * Status.from('invalid'); // throws BadValue error
 * 
 * @example
 * // Named enum
 * const Color = Enum('Color', 'red', 'green', 'blue');
 * 
 * Color.red; // 'red'
 * Color.from('RED'); // 'red'
 * 
 * @example
 * // Error handling
 * try {
 *   Status.from('invalid');
 * } catch (error) {
 *   console.log(error.message); // 'Unsupported value: ("invalid").'
 *   console.log(error.name); // 'BadValue<Status>'
 * }
 * 
 * @example
 * // Constructor is private
 * try {
 *   new Status();
 * } catch (error) {
 *   console.log(error.message); // 'Private constructor'
 * }
 */
export default function Enum(...args) {
  const values = args.pop();
  const name = args.pop() ?? `Enum<${values.join()}>`;
  
  /**
   * Error thrown when an invalid enum value is provided.
   * 
   * @extends {Error}
   */
  class BadValue extends Error {
    /**
     * Creates a new BadValue error.
     * 
     * @param {string} value - The invalid value that caused the error
     */
    constructor(value) {
      super(`Unsupported value: ("${value}").`);
  
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, BadValue);
      }
  
      this.name = `BadValue<${name}>`;
    }
  }

  const wrapper = {
    [name]: class {

      /**
       * Converts a string to an enum value.
       * 
       * Performs case-insensitive validation and returns the normalized enum value.
       * 
       * @param {string} [val=''] - The string value to convert
       * @returns {string} The normalized enum value
       * @throws {BadValue} When the value is not a valid enum value
       * 
       * @example
       * const Status = Enum('open', 'closed');
       * Status.from('open'); // 'open'
       * Status.from('OPEN'); // 'open'
       * Status.from('Open'); // 'open'
       */
      static from(val = '') {
        const value = val.toLowerCase();
        if(values.includes(value)) {
          return value;
        }
        throw new BadValue(value);
      }
  
      /**
       * Private constructor - enum types cannot be instantiated.
       * 
       * @throws {Error} Always throws an error
       */
      constructor() {
        throw new Error('Private constructor');
      }
    }
  };
  
  
  return values.reduce(reduceHelper, wrapper[name]);
};