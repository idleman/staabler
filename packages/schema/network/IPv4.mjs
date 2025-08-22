export default {
  type: 'string',
  pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', // simple IPv4 validation pattern
  description: 'IP address associated with the user’s device'
};