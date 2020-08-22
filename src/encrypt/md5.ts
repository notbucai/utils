import _md5 from 'md5';

export function md5(message: string | Buffer | number[], options?: _md5.Options) {
  return _md5(message, options);
}