import test from './_confidential.json';
console.time('test');
// json to arraybuffer
const arrayBuffer = new TextEncoder().encode(
  JSON.stringify(test),
);
console.timeLog('test');
