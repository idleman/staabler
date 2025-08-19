/**
 * Creates a debounced version of a function.
 * The debounced function will only execute after the specified delay has passed
 * since the last time it was invoked.
 * 
 * @param {number} time - The delay in milliseconds
 * @param {Function} cb - The function to debounce
 * @returns {Function} A debounced version of the callback function
 * 
 * @example
 * const debouncedSearch = withDebounce(300, (query) => {
 *   // Perform search with query
 *   console.log('Searching for:', query);
 * });
 * 
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute after 300ms
 * 
 * @example
 * const debouncedResize = withDebounce(100, () => {
 *   // Handle window resize
 *   console.log('Window resized');
 * });
 * 
 * window.addEventListener('resize', debouncedResize);
 */
export default function withDebounce(time, cb) {
  let timeoutId;

  return (...args) => {

    const invoke = () => {
      timeoutId = null;
      cb.apply(null, args);
    };


    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the
    // inside of the previous setTimeout
    if(timeoutId !== null) {
      clearTimeout(timeoutId);
    }


    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs Node)
    timeoutId = setTimeout(invoke, time);

  };
};