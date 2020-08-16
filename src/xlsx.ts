import { utils, writeFile, read } from 'xlsx';
import { cloneDeep } from 'lodash';

/**
 * 解析对象类型
 */
export type formatType = {
  [k: string]: string
};

/**
 * 异步导出xlsx文件 回调函数类型
 */
export type callbackfnType<T> = (index: number, prevLastItem?: T, prevList?: T[]) => Promise<T[]>;

/**
 * 异步导出xlsx文件的输入类型
 * @description 异步导出
 */
export type exportXlsxFileOptionsType<T> = {
  // 解析对象
  format: formatType,
  // 回调函数 每页都会调用
  callback: callbackfnType<T>,
  // 自定义解析器
  gen?: (jsonArray: T[], format: formatType, filename: string) => void
  // 文件名
  filename?: string,
  // 是否同步执行 一般用于需要上一页lastId
  sync?: boolean,
}

/**
 * 通过异步数据导出xlsx文件
 * @param {exportXlsxFileOptionsType<T>} options 参数对象
 * @description 通过异步数据导出xlsx文件
 */
export function asyncExportXlsxFile<T> (options: exportXlsxFileOptionsType<T>) {
  if (!options) throw new Error('需要一个参数但是你啥也没传');
  const { callback, format, sync, filename, gen } = options;
  if (typeof format !== 'object') throw new Error('参数错误');
  if (typeof callback !== 'function') throw new Error('参数错误');

  return async (start: number = 0, end: number = 0) => {
    let allList: T[] = [];

    let promiseList = [];

    let list: T[] = [];
    let last: T = null;

    for (let i = start; i < end; i++) {

      const itemPrimise = callback(i, last, list);

      if (sync) {
        list = await itemPrimise;
        last = list[list.length - 1];
        allList.push(...list);
      } else {
        promiseList.push(itemPrimise);
      }

    }

    if (!sync) {
      const list = await Promise.all(promiseList);

      list.forEach((items: T[]) => {
        allList = allList.concat(items);
      });

    }

    if (gen) {
      gen([...allList], format, filename || 'allList')
    } else {
      exportXlsx<T>([...allList], format, filename || 'allList');
    }
    // 解析
    return allList;
  }
}


/**
 * 简单导出表格
 * @param { T[] } json josn数据
 * @param format key：value
 * @param filename 导出文件名
 */
export function exportXlsx<T> (jsonArray: T[], format: formatType, filename: string) {
  let sheetName = 'Sheet1';
  jsonArray = cloneDeep(jsonArray);
  jsonArray.forEach(item => {
    for (let i in item) {
      if (format.hasOwnProperty(i)) {
        item[format[i]] = item[i];
      }
      delete item[i]; //删除原先的对象属性
    }
  });
  const ws = utils.json_to_sheet(
    jsonArray,
    { header: Object.values(format) }
  );
  let wb = utils.book_new();
  wb.SheetNames.push(sheetName)
  wb.Sheets[sheetName] = ws;
  writeFile(wb, filename + '.xlsx');
}

/**
 * xlsx文件转jsonarray
 * @param {File} file 文件
 * @param {object} format 解析对象
 */
export function xlsxFileToJson<T> (file: File, format: formatType) {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const wb = read(data, { type: "binary" });
      const listData = utils.sheet_to_json<T>(wb.Sheets[wb.SheetNames[0]]);

      function findKey (obj: formatType, value: any, compare = (a: any, b: any) => a === b) {
        return Object.keys(obj).find(k => compare(obj[k], value))
      }
      const cloneList = cloneDeep(listData);
      cloneList.forEach(item => {
        for (let i in item) {
          const key = findKey(format, i);
          if (format.hasOwnProperty(key)) {
            item[key] = item[i];
          }
          delete item[i]; //删除原先的对象属性
        }
      });
      resolve(Object.assign([], cloneList).filter(item => Object.keys(item).length));
    };
    reader.onerror = (e: Event) => {
      return reject(e);
    }
    reader.readAsBinaryString(file);
  })

}
