/**
 * Error thrown when a stream write operation fails to write the expected number of bytes.
 * Indicates a mismatch between the number of bytes written and the expected number.
 */
export default class StreamWriteError extends Error {
  
  /**
   * Creates a new StreamWriteError instance.
   * 
   * @param {number} [wrote=0] - Number of bytes actually written
   * @param {number} [expected=0] - Number of bytes expected to be written
   */
  constructor(wrote = 0, expected = 0) {
    super(`Wrote ${wrote} bytes but expected to write ${expected} bytes.`);
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, StreamWriteError);
    }
    this.name = "StreamWriteError";
  }
};