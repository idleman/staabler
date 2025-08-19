import isThenable from './isThenable.mjs';

/**
 * Creates an async iterator that yields values from an iterable in the order they resolve.
 * 
 * Takes an iterable containing promises and non-promise values, and yields them
 * as they become available. Non-promise values are yielded immediately, while
 * promises are yielded when they resolve.
 * 
 * @param {Iterable} iterable - An iterable containing promises and/or values
 * @returns {AsyncGenerator} An async generator that yields values as they resolve
 * 
 * @example
 * // Mix of promises and values
 * const items = [
 *   Promise.resolve('first'),
 *   'immediate',
 *   Promise.resolve('second')
 * ];
 * 
 * for await (const value of createAsyncIterator(items)) {
 *   console.log(value);
 * }
 * // Output: 'immediate', 'first', 'second'
 * 
 * @example
 * // All promises with different resolution times
 * const promises = [
 *   new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
 *   new Promise(resolve => setTimeout(() => resolve('fast'), 10))
 * ];
 * 
 * for await (const value of createAsyncIterator(promises)) {
 *   console.log(value);
 * }
 * // Output: 'fast', 'slow'
 * 
 * @example
 * // Error handling
 * const items = [
 *   Promise.resolve('success'),
 *   Promise.reject(new Error('failure'))
 * ];
 * 
 * try {
 *   for await (const value of createAsyncIterator(items)) {
 *     console.log(value);
 *   }
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 */
export default async function* createAsyncIterator(iterable) {
  const values = new Set(Array
    .from(iterable)
    .map(p => {
      if (isThenable(p)) {
        const promise = p.then((value) => ({ value, promise }))
        return promise;
      }

      const obj = { value: p, promise: null }
      obj.promise = obj;
      return obj;
    }));

  while (values.size) {
    const { value, promise } = await Promise.race(values);
    yield value;
    values.delete(promise); 
  }
}