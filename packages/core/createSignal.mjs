/**
 * Creates a signal with getter and setter functions.
 * 
 * Returns an array containing a getter function to read the current state
 * and a setter function to update the state. This provides a simple way
 * to manage state with controlled access.
 * 
 * @param {any} state - The initial state value
 * @returns {Array} Array containing [getState, setState] functions
 * 
 * @example
 * // Basic usage
 * const [getCount, setCount] = createSignal(0);
 * 
 * console.log(getCount()); // 0
 * setCount(5);
 * console.log(getCount()); // 5
 * 
 * @example
 * // Object state
 * const [getUser, setUser] = createSignal({ name: 'John', age: 30 });
 * 
 * console.log(getUser()); // { name: 'John', age: 30 }
 * setUser({ name: 'Jane', age: 25 });
 * console.log(getUser()); // { name: 'Jane', age: 25 }
 * 
 * @example
 * // Array state
 * const [getItems, setItems] = createSignal([]);
 * 
 * setItems(['apple', 'banana']);
 * console.log(getItems()); // ['apple', 'banana']
 * 
 * @example
 * // Function state
 * const [getHandler, setHandler] = createSignal(() => console.log('default'));
 * 
 * const handler = getHandler();
 * handler(); // logs 'default'
 * 
 * setHandler(() => console.log('updated'));
 * const newHandler = getHandler();
 * newHandler(); // logs 'updated'
 */
export default function createSignal(state) {
  const getState = () => state;
  const setState = val => (state = val);
  return [
    getState,
    setState
  ];
};