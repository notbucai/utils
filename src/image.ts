import imageCompression from 'browser-image-compression';

/**
 * 默认配置
 */
const defaultOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
}

type CompressOptions = {
  /** @default Number.POSITIVE_INFINITY */
  maxSizeMB?: number;
  /** @default undefined */
  maxWidthOrHeight?: number;
  /** @default false */
  useWebWorker?: boolean;
  /** @default 10 */
  maxIteration?: number;
  /** Default to be the exif orientation from the image file */
  exifOrientation?: number;
  /** A function takes one progress argument (progress from 0 to 100) */
  onProgress?: (progress: number) => void;
  /** Default to be the original mime type from the image file */
  fileType?: string;
}
/**
 * 图片压缩
 * @param {File} imageFile 图片文件
 * @param {CompressOptions} options 参数
 */
export async function compress (imageFile: File, options: CompressOptions = defaultOptions) {
  const compressedFile = await imageCompression(imageFile, options);
  return compressedFile;
}