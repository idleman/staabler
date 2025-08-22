export default {
  type: 'string',
  minLength: 3,
  maxLength: 255,
  pattern: '^[^\\s@]+@[^\\s@]+.[^\\s@]+$'
};