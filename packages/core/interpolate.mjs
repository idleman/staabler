/**
 * Replaces template variables in a string with provided values
 * @param {string} str - Template string with {{variable}} placeholders
 * @param {[string, any]} param - Key-value pair [key, value] to replace
 * @returns {string} String with replaced values
 */
const helper = (str, [k, v]) => str.replaceAll(`{{${k}}}`, v);

/**
 * Interpolates a template string by replacing {{variable}} placeholders with values from params object
 * @param {string} str - Template string containing {{variable}} placeholders
 * @param {Object} params - Object containing key-value pairs for replacement
 * @returns {string} Interpolated string with all placeholders replaced
 */
export default function interpolate(str, params) {
  return params ? Object.entries(params).reduce(helper, str) : str;
};