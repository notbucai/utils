export function blobToFile (blob: Blob, fileName: string): File {
  const file = new File([blob], fileName);
  return file;
}