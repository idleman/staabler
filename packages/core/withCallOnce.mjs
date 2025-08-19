/**
 * Wraps a function to ensure it can only be called once.
 * Subsequent calls return the cached result or throw the cached error.
 * 
 * @param {Function} cb - The function to wrap
 * @returns {Function} A function that can only be called once
 * 
 * @example
 * const expensiveOperation = withCallOnce(() => {
 *   console.log('Computing...');
 *   return 'expensive result';
 * });
 * 
 * expensiveOperation(); // Logs 'Computing...', returns 'expensive result'
 * expensiveOperation(); // Returns 'expensive result' without logging
 * 
 * @example
 * const failingOperation = withCallOnce(() => {
 *   throw new Error('Something went wrong');
 * });
 * 
 * try {
 *   failingOperation(); // Throws error
 * } catch (e) {
 *   // Handle error
 * }
 * 
 * failingOperation(); // Throws the same error again
 */
export default function withCallOnce(cb) {
  const history = [];
  return (...args) => {
    if(history.length === 0) {
      let value;
      try {
        value = cb(...args);
        history.push([value]);
      } catch(err) {
        history.push([null, err]);
        throw err;
      }
      return value;
    }
    const result = history[0];
    if(result.length === 2) {
      throw result[1];
    }
    return result[0];
  };
};