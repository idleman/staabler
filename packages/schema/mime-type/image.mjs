export default {
  type: 'string',
  minLength: 6, // "image/".length => 6
  maxLength: 24,
  pattern: '^image\\/'
};