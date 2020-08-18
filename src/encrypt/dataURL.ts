
/**
 * 任意blob转base64
 * @param {Blob} blob 文件
 */
export function blobToBase64 (blob: Blob): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // 创建 FileReader 用于获取缓冲区内容
    const reader = new FileReader();
    reader.onload = () => {
      // 将缓冲区返回
      resolve(reader.result)
    }
    reader.onerror = (e) => {
      // 将异常抛出
      reject(e)
    }
    // 执行获取
    reader.readAsDataURL(blob)
  });
}
/**
 * base64 转 文件
 * @param base64 base64字符串
 * @param filename 文件名称
 */
export function base64ToFile (base64: string, filename: string) {
  const arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);

  let n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function convertDataURIToBinary (dataURI: string) {
  const BASE64_MARKER = ';base64,';

  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;

  var base64 = dataURI.substring(base64Index);

  var raw = window.atob(base64);

  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));
  for (var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}