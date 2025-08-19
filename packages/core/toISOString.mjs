const date = new Date();

/**
 * Converts a timestamp or date string to ISO string format.
 * Reuses a single Date instance for better performance.
 * 
 * @param {number|string} val - Timestamp in milliseconds or date string (default: 0)
 * @returns {string} ISO string representation of the date
 * 
 * @example
 * toISOString(0); // '1970-01-01T00:00:00.000Z'
 * toISOString('2023-01-01'); // '2023-01-01T00:00:00.000Z'
 * toISOString(Date.now()); // Current time in ISO format
 */
export default function toISOString(val = 0) {
  const timestamp = typeof val === 'string' ? Date.parse(val) : val;
  date.setTime(timestamp);
  return date.toISOString();
};