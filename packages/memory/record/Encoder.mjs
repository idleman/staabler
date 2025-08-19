import Message from './Message.mjs';

/**
 * Maximum message ID value for the sliding window.
 * @type {number}
 */
const kWindowLength = 2**16 - 1;

/**
 * Encodes a stream of record objects into Message buffers.
 * Takes record objects and converts them to standardized Message format
 * for transmission, including schema information and metadata.
 */
export default class Encoder {

  /**
   * Creates a new Encoder instance.
   * Initializes message ID generation and schema indexing.
   */
  constructor() {
    this.lastMessageId = 0;
    this.index = new Map();
    this.message = new Message();
  }

  /**
   * Generates a unique message ID using a sliding window approach.
   * 
   * @returns {number} A unique message ID
   */
  generateMessageId() {
    if(++this.lastMessageId === kWindowLength) {
      this.lastMessageId = 1;
    }
    return this.lastMessageId;
  }
  
  /**
   * Encodes a record object into a Message buffer.
   * 
   * @param {Object} record - The record object to encode
   * @returns {Uint8Array} The encoded message buffer
   */
  encode(record) {
    const index = this.index;
    const schema = record.constructor.schema;
    const maybeId = index.get(schema);
    const id = maybeId ?? this.generateMessageId();
    const isNew = (id !== maybeId);
    if(isNew) {
      // Assume MultiIndex overwrite records if their id exists in duplicate.
      index.set(schema, id);
    }

    const message = this.message;
    message.id = id;
    message.data = record.buffer;
    message.schema = isNew ? JSON.stringify(schema) : '';
    const buffer = message.buffer;
    message.size = buffer.byteLength;
    return buffer;
  }

};