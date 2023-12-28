export namespace Utils {
  /**
   * @description  绝对路径url /test/a  转驼峰 testA 并支持指定阶段第几个
   */
  export function urlToCamelCase(
    url: string,
    sliceIndex?: number,
    sameRootLevel = true,
  ) {
    const transformUrl = url.startsWith('/')
      ? url.slice(1)
      : url;
    const arr = transformUrl.split('/');
    const len = arr.length;
    const sliceLen = sliceIndex ?? len;
    for (
      let index = 1 + Number(sameRootLevel);
      index < sliceLen;
      index++
    ) {
      const element = arr[index];
      // 首字母大写
      arr[index] =
        element[0].toUpperCase() + element.slice(1);
    }
    const camelArr = arr.slice(
      Number(sameRootLevel),
      sliceLen,
    );
    return {
      camelStr: camelArr.join(''),
      camelArr,
    };
  }
}
