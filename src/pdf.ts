import { getDocument, PDFPageProxy } from 'pdfjs-dist';
import { blobToBase64, convertDataURIToBinary } from './encrypt';
import { blobToFile } from './file';

export async function getPdfTaskByFile (file: File) {
  const base64 = await blobToBase64(file);
  const bufferData = convertDataURIToBinary(base64 as string);
  const loadingTask = getDocument({
    data: bufferData,
  });
  const pdf = await (loadingTask.promise);
  return pdf;
}


type PdfParseReturnType = {
  /**
   * 页面数量
   */
  numPages: number,
  /**
   * 页面列表
   */
  pages: PDFPageProxy[],
  toFile: (start: number, size: number) => Promise<File[]>,
  toBase64: (start: number, size: number) => Promise<string[]>
};

/**
 * 
 * @param file pdf文件
 * @param start 开始页数
 * @param end 结束页数
 */
export async function pdfParse (file: File): Promise<PdfParseReturnType> {

  const task = await getPdfTaskByFile(file);
  const numPages = task.numPages;

  const pages: (PDFPageProxy | null)[] = [];

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await task.getPage(i)
      pages.push(page);
    } catch (error) {
      pages.push(null);
      console.warn(`处理异常：第${i}页，错误信息：`, error);
    }
  }

  const getEndScope = (start: number, size: number, max: number) => {
    if (start < 0) {
      throw new Error('参数错误,start不能为负数');
    }
    const end = start + size >= max ? max : start + size;
    return end;
  }

  const pageToCanvas = (page: PDFPageProxy) => {
    if (!page) return null;

    let scale = 1.5; //缩放倍数，1表示原始大小
    let viewport = page.getViewport({ scale });
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d'); //创建绘制canvas的对象
    canvas.height = viewport.height; //定义canvas高和宽
    canvas.width = viewport.width;
    let renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);

    return canvas;
  }

  return {
    numPages,
    pages,
    /**
     * 获取base64的pdf页面
     * @param start 第几张开始
     * @param size 共多少张
     */
    async toBase64 (start: number = 0, size: number = numPages): Promise<string[]> {
      const end = getEndScope(start, size, numPages);
      const $pages = pages.slice(start, end);
      const pagesPromise = $pages.map(async page => {
        const canvas = pageToCanvas(page);
        if (!canvas) return null;
        let base64 = canvas.toDataURL('image/png');
        return base64;
      });
      return await Promise.all(pagesPromise);
    },
    /**
    * 获取文件的pdf页面
     * @param start 第几张开始
     * @param size 共多少张
     */
    async toFile (start: number = 0, size: number = numPages) {
      const end = getEndScope(start, size, numPages);
      const $pages = pages.slice(start, end);

      const pagesPromise = $pages.map(async page => {
        const canvas = pageToCanvas(page);
        if (!canvas) return null;

        return new Promise<File>((resolve) => {
          canvas.toBlob((blob) => {
            const file = blobToFile(blob, page.pageNumber + '.png');
            resolve(file);
          });
        });
      });

      return await Promise.all(pagesPromise);
    }
  };
}