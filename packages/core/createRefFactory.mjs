import noop from './noop.mjs';
import tryCatch from './tryCatch.mjs';
import withCache from './withCache.mjs';
import withValue from './withValue.mjs';
import isNullish from './isNullish.mjs';

/**
 * Creates a function that allows temporary construction and use of objects with automatic cleanup.
 * 
 * The returned function manages object lifecycle by automatically destructing objects
 * once they are no longer being used. This is useful for managing expensive resources
 * that should be shared and reused.
 * 
 * @param {Function} construct - Function that constructs an object given a key
 * @param {Function} [destruct=noop] - Function that cleans up an object when it's no longer needed
 * @returns {Function} A function that takes a key and callback, manages object lifecycle
 * 
 * @example
 * // Simple object factory
 * const withConnection = createRefFactory(
 *   (url) => ({ url, connected: true }), // construct
 *   (conn) => { conn.connected = false } // destruct
 * );
 * 
 * // Use the factory
 * withConnection('https://api.example.com', (connection) => {
 *   console.log('Using connection to:', connection.url);
 *   // connection is automatically cleaned up after this callback
 * });
 * 
 * @example
 * // Database connection factory
 * const withDb = createRefFactory(
 *   (config) => new Database(config),
 *   (db) => db.close()
 * );
 * 
 * withDb({ host: 'localhost', port: 5432 }, (db) => {
 *   return db.query('SELECT * FROM users');
 * });
 * 
 * @example
 * // Error handling
 * withConnection('invalid-url', (conn) => {
 *   throw new Error('Connection failed');
 *   // destruct is still called even if an error occurs
 * });
 * 
 * @example
 * // Async operations
 * const withFile = createRefFactory(
 *   (path) => fs.open(path, 'r'),
 *   (file) => file.close()
 * );
 * 
 * await withFile('/path/to/file.txt', async (file) => {
 *   const content = await file.read();
 *   return content;
 * });
 */
export default function createRefFactory(construct, destruct = noop) {
  const pool = new Map();
  const getHandle = withCache(pool, key => ({ count: 0, value: construct(key) }));
  return function withRef(key, cb) {
    const handle = getHandle(key);
    ++handle.count;
    const result = tryCatch(() => cb(handle.value));
    return withValue(result, ([val, err]) => {
      if(--handle.count <= 0) {
        pool.delete(key);
        destruct(handle.value);
      }
      if(isNullish(err)) {
        return val;
      }
      throw err;
    });
  };
}