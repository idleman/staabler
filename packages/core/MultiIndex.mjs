/**
 * MultiIndex allows querying entities by multiple keys.
 */
import BiMap from './BiMap.mjs';
import DefaultMap from './DefaultMap.mjs';


let lastItemId = 0;
const createArray = () => [];
const createIndexMap = () => new DefaultMap(createArray);

/**
 * MultiIndex class for indexing objects by multiple keys.
 */
export default class MultiIndex {

  /**
   * Creates a new MultiIndex instance.
   * @param {Function} getIndexes - Function that returns array of [keyName, keyValue] pairs for an object
   * @param {Function} ItemMap - Constructor function for the item map (defaults to BiMap)
   */
  constructor(getIndexes = createArray) {
    this.size = 0;
    const items = new BiMap();                              // itemId -> value
    const indexes = new DefaultMap(createIndexMap);         // key => value => [itemId]
    this._MultiIndex = { items, indexes, getIndexes };
  }

  /**
   * Adds a value to the index.
   * @param {any} obj - The value to add
   * @returns {MultiIndex} This instance for chaining
   */
  add(obj) {
    const { items, indexes, getIndexes } = this._MultiIndex;
    if(items.inverse.has(obj)) {
      return this;
    }

    ++this.size;
    const itemId = Symbol(`Item<${++lastItemId}>`);
    const entries = getIndexes(obj);
    items.set(itemId, obj);
    entries.forEach(([name, value]) => indexes.get(name).get(value).push(itemId));
    return this;
  }

  /**
   * Gets a value by key name and identifier.
   * @param {string} name - The key name
   * @param {any} value - The key value
   * @returns {any} The value associated with the key, or undefined if not found
   */
  get(name = '', value = null) {
    const { items, indexes } = this._MultiIndex;
    const itemId = indexes.getMaybe(name)?.getMaybe(value)?.[0];
    return itemId ? items.get(itemId) : void(0);
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
   * @param {any} obj - The item to remove
   * @returns {MultiIndex} This instance for chaining
   */
  delete(obj) {
    const { items, indexes, getIndexes } = this._MultiIndex;
    const itemId = items.inverse.get(obj);
    if(!itemId) {
      return this;
    }
    --this.size;
    items.delete(itemId);
    getIndexes(obj).forEach(([name, value]) => {
      const values = indexes.getMaybe(name);
      if(!values) {
        return;
      }
      const container = values.getMaybe(value);
      if(!container) {
        return;
      }

      const index = container.indexOf(itemId);
      if(index === -1) {
        return;
      }
      container.splice(index, 1);
      if(container.length !== 0) {
        return;
      }

      values.delete(value);
      if(values.size === 0) {
        indexes.delete(name);
      }
    });
  }

  /**
   * Return all nodes that matches a specific attribute value
   * @param {string} name - Attribute name.
   * @param {any} value - The value of the attribute
   * @returns {Array} An array of all matching nodes.
   */
  getAll(name = '', value = null) {
    const { items, indexes } = this._MultiIndex;
    const array = indexes.getMaybe(name)?.getMaybe(value);
    return array ? array.map(itemId => items.get(itemId)) : [];
  }

  /**
   * Converts the index to an array of values.
   * @returns {Array} Array of all values in the index
   */
  toArray() {
    const { items } = this._MultiIndex;
    return Array.from(items.values());
  }

  *entries() {
    for(const value of this.values()) {
      yield [value, value];
    }
  }

  *keys() {
    yield* this.toArray().values();
  }

  *values() {
    yield* this.toArray().values();
  }

  [Symbol.iterator]() {
    return this.values();
  }
  
};