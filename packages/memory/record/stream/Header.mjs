import Record from '../../Record.mjs';

/**
 * Stream header record for packet messages.
 * Used to send and receive any kind of records with metadata.
 */
export default Record({
  
  /**
   * Schema ID/Hash of the schema.
   */
  type: 'BigUint64',
  
  /**
   * Size of the body in bytes.
   */
  body: 'Uint32',
  
  /**
   * Size of the schema in bytes.
   */
  schema: 'Uint32',
});