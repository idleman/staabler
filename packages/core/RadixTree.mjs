import BiMap from './BiMap.mjs';
import isNullish from './isNullish.mjs';

const defaultResolve = (node, segment) => node.get(segment);

/**
 * A radix tree (trie) implementation for hierarchical data storage and retrieval.
 * Supports nested path-based access and closest match finding.
 * 
 * @example
 * const tree = new RadixTree('root');
 * 
 * // Set values at paths
 * tree.setIn(['users'], 'users')
 *     .setIn(['users', 'john'], 'john')
 *     .setIn(['users', 'john', 'posts'], 'john posts');
 * 
 * // Get values
 * console.log(tree.getIn(['users', 'john'])); // 'john'
 * console.log(tree.getIn(['users', 'john', 'posts'])); // 'john posts'
 * 
 * // Find closest match
 * console.log(tree.closest(['users', 'adam'])); // 'users'
 * console.log(tree.closest(['users', 'john', 'posts', '123'])); // 'john posts'
 */
export default class RadixTree {

  /**
   * Creates a new RadixTree node.
   * 
   * @param {*} [value=''] - The value stored at this node
   * @param {RadixTree} [parent=null] - The parent node
   */
  constructor(value = '', parent = null) {
    this.value = value;
    this.parent = parent;
    this.children = new BiMap();
  }

  /**
   * Checks if a child node exists with the given key.
   * 
   * @param {string} [key=''] - The key to check
   * @returns {boolean} True if the child exists
   */
  has(key = '') {
    return this.children.has(key);
  }

  /**
   * Gets a child node by key.
   * 
   * @param {string} [key=''] - The key to get
   * @returns {RadixTree|undefined} The child node or undefined
   */
  get(key = '') {
    return this.children.get(key);
  }

  /**
   * Sets a child node with the given key and value.
   * 
   * @param {string} [key=''] - The key for the child
   * @param {*} [value=null] - The value to store at the child node
   * @returns {RadixTree} The child node
   */
  set(key = '', value = null) {
    const children = this.children;
    const current = children.get(key);
    if(current) {
      if(!isNullish(value)) {
        current.value = value;
      }
      return current;
    }
    const node = new RadixTree(value, this);
    children.set(key, node);
    return node;
  }
  
  /**
   * Converts the tree to a plain JavaScript object.
   * 
   * @returns {Object} A plain object representation of the tree
   */
  toJS() {
    const children = Array
      .from(this.children.entries())
      .map(([key, node]) => [key, node.toJS()]);

    return { value: this.value, children: Object.fromEntries(children) };
  }

  /**
   * Gets the path from root to this node.
   * 
   * @returns {Array<string>} Array of keys representing the path
   */
  getPath() {
    const path = [];
    let current = this;
    while(true) {
      const parent = current.parent;
      if(!parent) {
        break;
      }
      const key = parent.children.inverse.get(current);
      path.push(key);
      current = parent;
    }
    return path.reverse();
  }

  /**
   * Sets a value at a nested path.
   * 
   * @param {Array<string>} [path=[]] - The path to set the value at
   * @param {*} [value=null] - The value to set
   * @returns {RadixTree} This instance for chaining
   * 
   * @example
   * ```javascript
   * const tree = new RadixTree();
   * tree.setIn(['a', 'b', 'c'], 'value');
   * console.log(tree.getIn(['a', 'b', 'c'])); // 'value'
   * ```
   */
  setIn(path = [], value = null) {
    let current = this;
    const length = path.length;
    const last = path[length - 1];
    for(let i = 0, len = length - 1; i < len; ++i) {
      const segment = path[i];
      current = current.set(segment);
    }
    current.set(last, value);
    return this;
  }

  /**
   * Gets a value at a nested path.
   * 
   * @param {Array<string>} [path=[]] - The path to get the value from
   * @param {*} [defaultValue] - Default value if path doesn't exist
   * @param {Function} [resolve=defaultResolve] - Function to resolve child nodes
   * @returns {*} The value at the path or the default value
   */
  getIn(path = [], defaultValue = void(0), resolve = defaultResolve) {
    return this.getNodetIn(path, resolve)?.value ?? defaultValue;
  }

  /**
   * Gets the closest matching value along a path.
   * 
   * @param {Array<string>} [path=[]] - The path to traverse
   * @param {Function} [resolve=defaultResolve] - Function to resolve child nodes
   * @returns {*} The value of the closest matching node
   */
  closest(path = [], resolve = defaultResolve) {
    return this.closestNode(path, resolve).value;
  }

  /**
   * Gets a node at a nested path.
   * 
   * @param {Array<string>} [path=[]] - The path to get the node from
   * @param {Function} [resolve=defaultResolve] - Function to resolve child nodes
   * @returns {RadixTree|undefined} The node at the path or undefined
   */
  getNodetIn(path = [], resolve = defaultResolve) {
    let current = this;
    const length = path.length;
    for(let i = 0; i < length; ++i) {
      const segment = path[i];
      current = resolve(current, segment);
      if(!current) {
        return;
      }
    }
    return current;
  }
  
  /**
   * Gets the closest matching node along a path.
   * 
   * @param {Array<string>} [path=[]] - The path to traverse
   * @param {Function} [resolve=defaultResolve] - Function to resolve child nodes
   * @returns {RadixTree} The closest matching node
   */
  closestNode(path = [], resolve = defaultResolve) {
    let current = this;
    const length = path.length;
    for(let i = 0; i < length; ++i) {
      const segment = path[i];
      const next = resolve(current, segment);
      if(!next) {
        break;
      }
      current = next;
    }
    return current;
  }

};