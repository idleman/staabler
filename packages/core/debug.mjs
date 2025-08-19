import createSignal from './createSignal.mjs';

const clr = ''.padEnd(240, '\b');
const [getMaxLength, setMaxLength] = createSignal(0);
const [getResetTime, setResetTime] = createSignal(Date.now());
const [getTime, setTime] = createSignal(getResetTime());

const { process } = globalThis;
const TEST = process?.env.TEST || typeof it === 'function';
const write = process ? str => process.stdout.write(str) : str => console.log(str.trim());

/**
 * Debug output function with rate limiting and formatting.
 * 
 * Provides a debug logging utility that:
 * - Rate limits output to prevent spam (200ms minimum between messages)
 * - Formats output with consistent spacing
 * - Suppresses output during tests
 * - Supports newline characters for resetting the display
 * 
 * @param {string} msg - The debug message to output
 * 
 * @example
 * // Basic usage
 * debug('Processing item 1...');
 * debug('Processing item 2...');
 * debug('Processing item 3...');
 * 
 * @example
 * // Reset display with newline
 * debug('Current status: 50%');
 * debug('\n'); // Resets the display
 * debug('New status: 75%');
 * 
 * @example
 * // Rate limiting behavior
 * for (let i = 0; i < 100; i++) {
 *   debug(`Progress: ${i}%`); // Only outputs every 200ms
 * }
 * 
 * @example
 * // In test environment (suppressed)
 * // When TEST environment variable is set or 'it' function exists
 * debug('This will not be output during tests');
 */
export default function debug(msg) {
  if(TEST) {
    return;
  }
  
  if(msg === '\n') {
    if(getTime() !== getResetTime()) {
      write(`\n`);
    }
    setResetTime(Date.now());
    return;
  }

  const now = Date.now();
  const elapsed = now - getTime();
  if(elapsed < 200) {
    return;
  }
  
  const msgLength = msg.length;
  if(getMaxLength() < msgLength) {
    setMaxLength(msgLength);
  }
  setTime(now);
  const spaceLength = getMaxLength() - msgLength;
  const space = 0 < spaceLength ? ''.padEnd(spaceLength, ' ') : '';
  write(`${clr}${msg}${space}`);
};