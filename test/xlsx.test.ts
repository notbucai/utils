import { asyncExportXlsxFile, exportXlsx } from '../src/xlsx'
import { writeFile } from '../__mocks__/xlsx'
describe('xlsx utils exportXlsx test', () => {
  jest.mock('xlsx');

  it('should 导出简单格式 参数传递正常', () => {

    expect.assertions(2);

    exportXlsx([{ a: "我", b: "是", c: "谁" }], { a: "我", b: "是", c: "谁" }, '1');

    expect(writeFile.mock.calls.length).toBe(1);
    expect(writeFile.mock.calls[0][1]).toBe('1.xlsx');

  });
});
describe('xlsx utils asyncExportXlsxFile async test', () => {
  jest.mock('xlsx');

  it('should 测试回调是否正确', async () => {
    const callback = jest.fn();
    callback.mockReturnValue([
      {
        a: "1", b: "2", c: "3"
      }
    ]);

    expect.assertions(5);
    const download = asyncExportXlsxFile({
      format: { a: "我", b: "是", c: "谁" },
      callback,
    });

    await download(2, 12);
    // 测试调用数量
    expect(callback.mock.calls.length).toBe(10);
    expect(callback.mock.calls[0][0]).toBe(2);
    expect(callback.mock.calls[0][1]).toBe(null);
    expect(callback.mock.calls[1][1]).toBe(null);
    expect(callback.mock.calls[1][2].length).toBe(0);

  });

  it('should 测试数据是否正常', async () => {
    expect.assertions(4);

    const callback = jest.fn();
    callback.mockReturnValue([
      {
        a: "1", b: "2", c: "3"
      }
    ]);

    const download = asyncExportXlsxFile({
      format: { a: "我", b: "是", c: "谁" },
      callback,
    });

    const list = await download(2, 12);

    // 测试总数
    expect(list.length).toBe(10);
    expect(list[0].a).toBe('1');
    expect(list[0].b).toBe('2');
    expect(list[0].c).toBe('3');
  });

});


describe('xlsx utils asyncExportXlsxFile sync test', () => {
  jest.mock('xlsx');

  it('should 测试回调是否正确', async () => {
    const callback = jest.fn();
    callback.mockReturnValue([
      {
        a: "1", b: "2", c: "3"
      }
    ]);

    expect.assertions(5);
    const download = asyncExportXlsxFile({
      format: { a: "我", b: "是", c: "谁" },
      callback,
      sync:true,
    });

    await download(2, 12);
    // 测试调用数量
    expect(callback.mock.calls.length).toBe(10);
    expect(callback.mock.calls[0][0]).toBe(2);
    expect(callback.mock.calls[0][1]).toBe(null);
    expect(callback.mock.calls[1][1].a).toBe('1');
    expect(callback.mock.calls[1][2].length).toBe(1);

  });

  it('should 测试数据是否正常', async () => {
    expect.assertions(4);

    const callback = jest.fn();
    callback.mockReturnValue([
      {
        a: "1", b: "2", c: "3"
      }
    ]);

    const download = asyncExportXlsxFile({
      format: { a: "我", b: "是", c: "谁" },
      callback,
      sync:true,
    });

    const list = await download(2, 12);

    // 测试总数
    expect(list.length).toBe(10);
    expect(list[0].a).toBe('1');
    expect(list[0].b).toBe('2');
    expect(list[0].c).toBe('3');
  });

});