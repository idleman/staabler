/**
 * Gets the beginning index of the package name in a normalized path.
 * 
 * @param {string} [normalized=''] - The normalized path
 * @param {string} [namespace=''] - The namespace to search for
 * @returns {number} The index where the package name begins
 * @private
 */
function getBegin(normalized = '', namespace = '') { 
  const index = normalized.indexOf(namespace);
  return  (index === -1) ? (normalized.lastIndexOf('/') + 1) :
          (index + namespace.length);
}

/**
 * Gets the ending index of the package name in a normalized path.
 * 
 * @param {string} [normalized=''] - The normalized path
 * @param {string} [namespace=''] - The namespace to search for
 * @returns {number} The index where the package name ends
 * @private
 */
function getEnd(normalized = '', namespace = '') { 
  const slash = normalized.lastIndexOf('/');
  const dot = normalized.indexOf('.', slash);
  return  (dot === -1) ? (namespace.length - 1) : dot;
}

/**
 * Extracts the package name from a file path.
 * 
 * Parses a file path to extract the package name, typically used to identify
 * which package a file belongs to in a monorepo structure. The function
 * looks for a specific namespace pattern and extracts the package name
 * between the namespace and the file extension.
 * 
 * @param {string} [path=''] - The file path to parse
 * @param {string} [namespace='packages/'] - The namespace to search for in the path
 * @returns {string} The extracted package name
 * 
 * @example
 * // Basic usage
 * getPackageName('/path/to/packages/core/src/utils.mjs'); // 'core/src/utils'
 * getPackageName('/path/to/packages/ui/components/Button.mjs'); // 'ui/components/Button'
 * 
 * @example
 * // With custom namespace
 * getPackageName('/path/to/modules/core/utils.mjs', 'modules/'); // 'core/utils'
 * 
 * @example
 * // Without namespace (falls back to last directory)
 * getPackageName('/path/to/some/file.mjs'); // 'file'
 * 
 * @example
 * // Windows paths (normalized)
 * getPackageName('C:\\path\\to\\packages\\core\\utils.mjs'); // 'core/utils'
 * 
 * @example
 * // URLs
 * getPackageName('https://example.com/packages/core/utils.mjs'); // 'core/utils'
 * 
 * @example
 * // Edge cases
 * getPackageName(''); // ''
 * getPackageName('packages/'); // ''
 * getPackageName('packages/core'); // 'core'
 */
export default function getPackageName(path = '', namespace = 'packages/') {

  const normalized = path
    .replaceAll('\\', '/')
    .replaceAll('//', '/');

  const end = getEnd(normalized);
  const begin = getBegin(normalized, namespace);
  return normalized.substring(begin, end); 
};