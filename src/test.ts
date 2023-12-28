// import test from './_confidential.json';
// console.time('test');
// // json to arraybuffer
// const arrayBuffer = new TextEncoder().encode(
//   JSON.stringify(test),
// );
// console.timeLog('test');
import path from 'node:path';
import { OpenAPI } from './index';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const openAPI = new OpenAPI({
  input: path.resolve(__dirname, './_confidential.json'),
  output: '',
});
openAPI.run();
