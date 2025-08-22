export const type = 'string';
export const minLength = 1;
export const maxLength = 96;
export const pattern = '^[\\p{L}\\p{N}]+[\\p{L}\\p{N}\\p{Zs}\\p{P}\\p{M}]*[\\p{L}\\p{N}\\p{P}]+$';


export default {
  type,
  pattern,
  minLength,
  maxLength
};