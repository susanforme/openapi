import test from './_confidential.json';
// 能读写$ref 并转换,但是这样导致生成多个重复model,所以没必要
import $RefParser from '@apidevtools/json-schema-ref-parser';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

//@ts-ignore
globalThis.fetch = fetch;

async function testRef() {
  try {
    let schema = await $RefParser.dereference(test as any);
    await writeFile(
      './src/_output.json',
      JSON.stringify(schema),
    );
  } catch (error) {
    console.error('err', error);
  }
}
testRef();

class OpenAPI {
  options: Options;
  models: any[] = [];
  api: any[] = [];
  /** json */
  jsonSchema: string = '';
  constructor(options: Options) {
    this.options = this.#defineConfig(options);
  }
  async run() {
    // 1.获取json
    await this.#getJsonSchema();
    // 2.解析json,生成ast的同时,生成models和api 的代码
    this.generateAll();
    // 3.统一写入,node异步io性能更好
  }
  async #getJsonSchema() {
    const { input } = this.options;
    try {
      this.jsonSchema = JSON.parse(input);
    } catch (error) {
      // const value = await fetch(input);
      // this.jsonSchema = (await value.json()) as string;
    }
  }
  /**
   * @description  任务分片
   */
  async generateAll() {
    const tasks: any[] = [];
    console.time('worker');
    for (let index = 0; index < 100; index++) {
      tasks.push(this.#createTask(index));
    }
    const data = await Promise.all(tasks);
    let time = 0;
    data.forEach((item) => {
      time += item.time;
    });
    console.timeEnd('worker');
    console.log('代码执行时间', time);
  }
  #createTask(id: any) {
    const worker = new Worker(
      path.resolve(__dirname, './worker.ts'),
      {},
    );
    console.time('worker' + id);
    return new Promise((resolve, reject) => {
      worker.on('message', (value) => {
        console.timeEnd('worker' + id);
        resolve(value);
      });
      worker.on('error', (value) => {
        console.log('err', value);
        reject(value);
      });
      worker.on('exit', (code) => {
        console.log('exit', code);
        if (code !== 0) {
          reject(code);
        }
      });
    });
  }
  #parseJsonSchema() {}
  /**
   * 生成ts代码
   */
  async #generateTsCode() {
    // web worker
  }
  #defineConfig(options: Options): Options {
    const {
      modelsDirectoryName = 'models',
      apiDirectoryName = 'api',
    } = options;
    return {
      ...options,
      modelsDirectoryName,
      apiDirectoryName,
    };
  }
  async write(propPath: string, content: string) {
    const outputpath = path.resolve(
      this.options.output,
      propPath,
    );
    await writeFile(outputpath, content);
  }
}

const openAPI = new OpenAPI({
  input: './_confidential.json',
  output: '',
});
openAPI.run();

export type Options = {
  /** 输入json */
  input: string;
  /** 输出路径 */
  output: string;
  modelsDirectoryName?: string;
  apiDirectoryName?: string;
};
