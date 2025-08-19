/**
 * A simple memoize function.
 **/
import withCache from './withCache.mjs';
import PersistentMap from './PersistentMap.mjs';

const valueId = {};
const defaultFactory = () => new PersistentMap();

/**
 * Creates a helper function to seek and create items in a map.
 * @param {Function} Map - Constructor function for the map
 * @returns {Function} Helper function for seeking items
 */
function createSeekHelper(Map) {
  return (map, id) => {
    const initial = map.get(id);
    if(initial) {
      return initial;
    }
    const item = Map();
    map.set(id, item);
    return item;
  };
}

/**
 * Creates a factory function that generates identity objects for memoization.
 * @param {Function} seeker - Helper function for seeking items
 * @param {Map} cache - Cache map to store identities
 * @returns {Function} Factory function for creating identities
 */
function createIdentityFactory(seeker, cache) {
  return args => {
    const map = args.reduce(seeker, cache);
    if(!map.has(valueId)) {
      map.set(valueId, {});
    }
    return map.get(valueId);
  };
}

const construct = withCache(new WeakMap(), Map => {
  const seekHelper = createSeekHelper(Map);
  return withCache(new WeakMap(), cb => {
    const cache = Map();
    const createIdentity = createIdentityFactory(seekHelper, cache);
    return (...args) => {
      const identity = createIdentity(args);
      const cached = cache.get(identity);
      if(cached !== void(0)) {
        return cached;
      }
      const value = cb(...args);
      cache.set(identity, value);
      return value;
    };
  });
});

/**
 * Creates a memoized version of a function that caches results based on arguments.
 * @param {Function} cb - The function to memoize
 * @param {Function} factory - Factory function to create cache (defaults to PersistentMap)
 * @returns {Function} Memoized version of the input function
 */
export default function memoize(cb, factory = defaultFactory) {
  return (construct(factory))(cb);
};