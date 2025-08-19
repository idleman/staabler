import Record from '../Record.mjs';

/**
 * Packet message record for sending and receiving any kind of records.
 * Provides a standardized format for serialized record data with metadata.
 */
export default Record('Message', {
  
  /**
   * Size of the complete message in bytes.
   * Set automatically by the encoder.
   */
  size: 'Uint32',
  
  /**
   * Message schema ID.
   * If not zero and schema is set, the receiver should store
   * the provided schema together with this ID for later retrieval.
   */
  id: 'Uint32',

  /**
   * A JSON encoded array of the Record schema used to encode the data field.
   */
  schema: 'Utf8',

  /**
   * A raw record buffer containing the serialized data.
   */
  data: 'Bytes'
});