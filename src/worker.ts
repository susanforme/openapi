import { workerData, parentPort } from 'worker_threads';
// https://astexplorer.net/
import parser from '@babel/parser';
import types from '@babel/types';
import _generator from '@babel/generator';
// Babel is a CJS package and uses `default` as named binding (`exports.default =`).
// https://github.com/babel/babel/issues/15269.
const generator = (_generator as any)[
  'default'
] as typeof _generator;

const start = Date.now();
for (let index = 0; index < 100; index++) {
  const ast = parser.parse('', {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  /**
   *  type a = {
    work:string;
     } 
   */
  ast.program.body.push(
    types.typeAlias(
      types.identifier('a'),
      null,
      types.objectTypeAnnotation([
        types.objectTypeProperty(
          types.identifier('work'),
          types.stringTypeAnnotation(),
        ),
      ]),
    ),
  );
  // 生成ts代码
  const tsCode = generator(ast, {}).code;
}

parentPort?.postMessage({
  code: '',
  time: Date.now() - start,
});

// 断开
parentPort?.close();
