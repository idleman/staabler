/**
 * A utility function that throws the provided error.
 * Useful for creating throw expressions in contexts where statements are not allowed.
 * 
 * @param {Error} error - The error to throw
 * @throws {Error} Always throws the provided error
 * 
 * @example
 * // In a ternary expression
 * const result = condition ? value : Throw(new Error('Invalid condition'));
 * 
 * @example
 * // In an arrow function
 * const fn = () => Throw(new Error('Not implemented'));
 */
export default function Throw(error) {
  throw error;
};