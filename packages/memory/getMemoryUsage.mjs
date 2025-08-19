/**
 * Gets the current memory usage of the process.
 * 
 * @returns {number} The resident set size (RSS) in bytes
 */
export default function getMemoryUsage() {
  return process.memoryUsage().rss; // Returns the whole process memor
};