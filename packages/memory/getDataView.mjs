import withCache from '@staabler/core/withCache.mjs';

/**
 * Simple cache for DataView objects to avoid repeated allocations.
 * Maintains a history of the last two buffers for quick access.
 */
const history = [null, null];
const construct = withCache(new WeakMap(), buffer => new DataView(buffer));

/**
 * Gets a DataView for the specified buffer, using caching for performance.
 * 
 * @param {ArrayBuffer|SharedArrayBuffer|TypedArray} buffer - The buffer to create a DataView for
 * @returns {DataView} A DataView object for the buffer
 */
export default function getDataView(buffer) {
  if (history[0] === buffer) {
    return history[1];
  }
  const view = construct(buffer.buffer ?? buffer);
  history[0] = buffer;
  history[1] = view;
  return view;
};