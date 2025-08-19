/**
 * Creates a reducer function from a map of event handlers.
 * 
 * Takes an object where keys are event types and values are handler functions.
 * Returns a reducer function that can process events and update state accordingly.
 * 
 * @param {Object.<string, Function>} handlers - Object mapping event types to handler functions
 * @returns {Function} A reducer function that takes state and event, returns new state
 * 
 * @example
 * // Define event handlers
 * const handlers = {
 *   'INCREMENT': (state, event) => ({ ...state, count: state.count + 1 }),
 *   'DECREMENT': (state, event) => ({ ...state, count: state.count - 1 }),
 *   'SET_COUNT': (state, event) => ({ ...state, count: event.payload })
 * };
 * 
 * const reducer = createReducer(handlers);
 * 
 * const initialState = { count: 0 };
 * 
 * // Use the reducer
 * let state = initialState;
 * state = reducer(state, { type: 'INCREMENT' }); // { count: 1 }
 * state = reducer(state, { type: 'SET_COUNT', payload: 5 }); // { count: 5 }
 * state = reducer(state, { type: 'DECREMENT' }); // { count: 4 }
 * 
 * @example
 * // With unknown event types (returns current state)
 * state = reducer(state, { type: 'UNKNOWN' }); // { count: 4 } (unchanged)
 * 
 * @example
 * // Using Map instead of object
 * const handlers = new Map([
 *   ['ADD_TODO', (state, event) => ({ ...state, todos: [...state.todos, event.payload] })],
 *   ['REMOVE_TODO', (state, event) => ({ ...state, todos: state.todos.filter(t => t.id !== event.payload }) }]
 * ]);
 * 
 * const reducer = createReducer(handlers);
 */
export default function createReducer(handlers) {
  const map = new Map(handlers);
  return (state, event) => {
    const cb = map.get(event.type);
    return cb ? cb(state, event) : state;
  };
};