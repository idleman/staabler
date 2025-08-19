/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * Modifies the original array and returns it for chaining.
 * 
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array (same reference)
 * 
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * shuffle(numbers);
 * console.log(numbers); // [3, 1, 5, 2, 4] (random order)
 * 
 * // Can be chained
 * const cards = ['A♠', 'K♠', 'Q♠', 'J♠'];
 * shuffle(cards).forEach(card => console.log(card));
 * 
 * // Works with any array type
 * const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
 * shuffle(objects);
 */
export default function shuffleArray(array) {
  const length = array.length;
  for (let i = length - 1; 0 < i; --i) {
    // Generate a random index before the current position
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};