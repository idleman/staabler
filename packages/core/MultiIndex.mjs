/**
 * MultiIndex allows querying entities by multiple keys.
 */
import BiMap from './BiMap.mjs';
import autobind from './autobind.mjs';
import DefaultMap from './DefaultMap.mjs';
import isNullish from './isNullish.mjs';

const defaultGetIndexes = () => [];

/**
 * MultiIndex class for indexing objects by multiple keys.
 */
export default class MultiIndex {

  /**
   * Creates a new MultiIndex instance.
   * @param {Function} getIndexes - Function that returns array of [keyName, keyValue] pairs for an object
   * @param {Function} ItemMap - Constructor function for the item map (defaults to BiMap)
   */
  constructor(getIndexes = defaultGetIndexes, ItemMap = BiMap) {
    autobind(this);
    const items = new ItemMap();                      // itemId -> value
    const indexes = new DefaultMap(() => new Map())   // key => bucket
    this.size = 0;
    this._MultiIndex = { items, indexes, getIndexes };
  }

  /**
   * Adds a value to the index.
   * @param {any} value - The value to add
   * @returns {MultiIndex} This instance for chaining
   */
  add(value) {
    const { items, indexes, getIndexes } = this._MultiIndex;
    const itemId = Symbol(`Item<${Math.floor(Number.MAX_SAFE_INTEGER*Math.random())}>`);
    const entries = getIndexes(value);
    if(entries.length === 0) {
      return this;
    }
    ++this.size;
    items.set(itemId, value);
    entries.forEach(([name, identifier]) => indexes.get(name).set(identifier, itemId));
    return this;
  }

  /**
   * Gets a value by key name and identifier.
   * @param {string} name - The key name
   * @param {any} identifier - The key value
   * @returns {any} The value associated with the key, or undefined if not found
   */
  get(name = '', identifier = null) {
    const { items, indexes } = this._MultiIndex;
    const index = indexes.get(name);
    const offset = index.get(identifier);
    return isNullish(offset) ? void(0) : items.get(offset);
  }

  /**
   * Checks if a value exists in the index.
   * @param {any} item - The item to check
   * @returns {boolean} True if the item exists, false otherwise
   */
  has(item) {
    const { items } = this._MultiIndex;
    return items.inverse?.has(item);
  }

  /**
   * Removes a value from the index.
   * @param {any} item - The item to remove
   * @returns {MultiIndex} This instance for chaining
   */
  delete(item) {
    const { items, indexes, getIndexes } = this._MultiIndex;
    const itemId = items.inverse?.get(item);
    if(isNullish(itemId)) {
      return this;
    }
    items.delete(itemId)
    getIndexes(item).forEach(([name, identifier]) => indexes.get(name).delete(identifier));
    --this.size;
  }

  /**
   * Converts the index to an array of values.
   * @returns {Array} Array of all values in the index
   */
  toArray() {
    const { items } = this._MultiIndex;
    return Array.from(items.values());
  }

};