import LRUMap from './LRUMap.mjs';
import withCache from './withCache.mjs';
import PersistentMap from './PersistentMap.mjs';

/**
 * Creates a cached Uint8Array from an object.
 * 
 * Uses a persistent map with LRU cache to efficiently create and reuse Uint8Array
 * instances. This is useful for performance optimization when creating many
 * Uint8Array instances from similar objects.
 */
export default withCache(new PersistentMap(null, new LRUMap(2**9)), obj => new Uint8Array(obj));