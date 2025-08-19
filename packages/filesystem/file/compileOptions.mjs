const defaultOptions = {};

export default function compileOptions(buffer, opt) {
  const options = opt ?? defaultOptions;
  const { position = -1 } = options; // The location where to begin reading data from the file. If null or -1, data will be read from the current file position.
  const offset = Math.max(0, options.offset ?? 0); // The location in the buffer at which to start filling.
  const bufferLength = buffer.byteLength;
  const maxLength = bufferLength - offset;
  const len = options.length ?? maxLength; // The number of bytes to read. Default: buffer.byteLength - offset
  const length = Math.max(0, Math.min(len, maxLength));
  return {
    offset,
    length,
    position
  };
};