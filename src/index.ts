// 能读写$ref 并转换,但是这样导致生成多个重复model,所以没必要
// import $RefParser from '@apidevtools/json-schema-ref-parser';
import fetch from 'node-fetch';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'node:url';
import {
  OpenAPIJSONSchema,
  OpenAPIModelType,
  OpenAPIServicesType,
  Options,
} from './type';
import { Utils } from './utils';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
// 大字符串 arraybuffer
//@ts-ignore
globalThis.fetch = fetch;

/**
 * @description 根据openapi2.0 json 生成ts代码
 */
export class OpenAPI {
  #options: Required<Options>;
  #models: OpenAPIModelType = {};
  #services: OpenAPIServicesType = {};
  /** 传入的json实例化后的对象 */
  jsonSchema?: OpenAPIJSONSchema;
  constructor(options: Options) {
    this.#options = this.#defineConfig(options);
  }
  async run() {
    // 1.获取json
    await this.#getJsonSchema();
    // 2.解析json,生成ast的同时,生成models和api 的代码
    this.#generateAll();
    // 3.统一写入,node异步io性能更好
  }
  async #getJsonSchema() {
    const { input } = this.#options;
    try {
      this.jsonSchema = JSON.parse(input);
    } catch (error) {
      // 判断输入是否为本地文件协议,兼容linux
      const isAbsolute = path.isAbsolute(input);
      if (isAbsolute) {
        const value = await readFile(input, 'utf-8');
        this.jsonSchema = JSON.parse(value);
      } else {
        if (
          ['http:', 'https:'].every(
            (item) => !input.startsWith(item),
          )
        ) {
          throw new Error('请输入正确的json字符串或者路径');
        } else {
          const value = await fetch(input);
          this.jsonSchema = (await value.json()) as any;
        }
      }
    }
  }
  /**
   * @description  任务分片
   */
  async #generateAll() {
    this.#tagServicesAndModels();
    // const tasks: any[] = [];
    // console.time('总任务耗时');
    // let box = [];
    // let boxIndex = 0;
    // for (let index = 0; index < 100; index++) {
    //   if (box.length < this.#options.workerCapacity) {
    //     box.push(index);
    //     boxIndex++;
    //   } else {
    //     tasks.push(this.#createTask(box));
    //     boxIndex = 0;
    //     box = [];
    //   }
    // }
    // const data = await Promise.all(tasks);
    // let time = 0;
    // data.forEach((item) => {
    //   time += item.time;
    // });
    // console.timeEnd('总任务耗时');
    // console.log('多worker代码合并执行时间', time);
  }
  /**
   * @description 给路径分组,
   * @example 有路径 /labms/a/b/c , /labms/a/b/d /admin/a/b/c
   * 在sameRootLevel为true时,  不会生成文件夹直接放在services下, 如pathSplitLevel为2, 会生成a.ts 和 b.ts 两个文件. 若为3 则生成aB.ts
   * 在sameRootLevel为false时, 会生成两个文件夹/labms 和 /admin, 如pathSplitLevel为2, 会生成a.ts 和 b.ts 两个文件. 若为3 则生成aB.ts
   */
  #tagServicesAndModels() {
    // 最多创建一级文件夹,后续文件名为路径
    const { paths, definitions } = this.jsonSchema!;
    const { pathSplitLevel, sameRootLevel } = this.#options;
    // 对service进行分组
    Object.entries(paths).forEach(([path, value]) => {
      const pathObj = Utils.urlToCamelCase(
        path,
        pathSplitLevel,
        sameRootLevel,
      );
      const serviceKey = pathObj.camelStr;
      const serviceValue = this.#services[serviceKey];
      if (!serviceValue) {
        this.#services[serviceKey] = {};
      }
      this.#services[serviceKey][path] = value;
    });
    this.#models = definitions;
  }
  #createTask(ids: number[]) {
    const worker = new Worker(
      path.resolve(__dirname, './worker.ts'),
      {
        workerData: ids,
      },
    );
    return new Promise((resolve, reject) => {
      worker.on('message', (value) => {
        resolve(value);
      });
      worker.on('error', (value) => {
        console.log('err', value);
        reject(value);
      });
      // worker.on('exit', (code) => {
      //   console.log('exit', code);
      //   if (code !== 0) {
      //     reject(code);
      //   }
      // });
    });
  }
  #parseJsonSchema() {}
  /**
   * 生成ts代码
   */
  async #generateTsCode() {
    // web worker
  }
  #defineConfig(options: Options): Required<Options> {
    const {
      modelsDirectoryName = 'models',
      apiDirectoryName = 'api',
      workerCapacity = 10,
      pathSplitLevel = 2,
      sameRootLevel = true,
    } = options;
    return {
      ...options,
      modelsDirectoryName,
      apiDirectoryName,
      workerCapacity,
      pathSplitLevel,
      sameRootLevel,
    };
  }
  async #write(propPath: string, content: string) {
    const outputpath = path.resolve(
      this.#options.output,
      propPath,
    );
    await writeFile(outputpath, content);
  }
}
