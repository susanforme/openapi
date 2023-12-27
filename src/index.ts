// https://astexplorer.net/
import parser from '@babel/parser';
import types from '@babel/types';
import _generator from '@babel/generator';
import test from './_confidential.json';
// 能读写$ref 并转换,但是这样导致生成多个重复model,所以没必要
import $RefParser from '@apidevtools/json-schema-ref-parser';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
//@ts-ignore
globalThis.fetch = fetch;
// Babel is a CJS package and uses `default` as named binding (`exports.default =`).
// https://github.com/babel/babel/issues/15269.
const generator = (_generator as any)[
  'default'
] as typeof _generator;

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
console.log(tsCode);
