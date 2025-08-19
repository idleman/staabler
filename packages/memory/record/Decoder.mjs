import Message from './Message.mjs';
import Record from '../Record.mjs';
import SparseMap from '@staabler/core/SparseMap.mjs';

/**
 * Decodes Message buffers back into record objects.
 * Takes encoded message buffers and reconstructs the original record objects,
 * handling schema caching and reuse for efficiency.
 */
export default class Decoder {

  /**
   * Creates a new Decoder instance.
   * Initializes message parsing and schema caching.
   */
  constructor() {
    this.message = new Message();
    this.index = new SparseMap();
  }

  /**
   * Decodes a Message buffer into a record object.
   * 
   * @param {Uint8Array} uint8Array - The encoded message buffer to decode
   * @returns {Object} The decoded record object
   * @throws {Error} If no schema is provided in the message
   */
  decode(uint8Array) {
    const index = this.index;
    const message = this.message;
    message.buffer = uint8Array;
    const id = message.id;
    const data = message.data;
    const schema = message.schema;
    if(id && schema) {
      const args = JSON.parse(schema);
      const Type = Record(...args);
      const instance = new Type(data);
      index.set(id, instance);
      return instance;
    }
  
    const instance = id ? index.get(id) : null;
    if(instance) {
      instance.buffer = data;
      return instance;
    }
  
    if(!schema) {
      throw new Error('No schema provided in message');
    }
    const Type = Record(JSON.parse(schema));
    return new Type(data);
  }
  
};