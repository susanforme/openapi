/*
 * @Author: zhicheng ran
 * @Date: 2023-03-01 15:56:14
 * @LastEditTime: 2023-12-26 16:00:50
 * @FilePath: \openapi\rollup.config.ts
 * @Description:
 */
import { defineConfig } from 'rollup';
import type { RollupOptions } from 'rollup';
import path from 'path';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const sharedNodeOptions = defineConfig({
  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: {
    dir: './dist',
    entryFileNames: `src/[name].js`,
    chunkFileNames: 'src/chunks/dep-[hash].js',
    exports: 'named',
    format: 'esm',
    externalLiveBindings: false,
    freeze: false,
  },
  onwarn(warning, warn) {
    // node-resolve complains a lot about this but seems to still work?
    if (warning.message.includes('Package subpath')) {
      return;
    }
    // we use the eval('require') trick to deal with optional deps
    if (warning.message.includes('Use of eval')) {
      return;
    }
    if (warning.message.includes('Circular dependency')) {
      return;
    }
    warn(warning);
  },
});
function createCliConfig(isProduction: boolean) {
  return defineConfig({
    ...sharedNodeOptions,
    input: {
      index: path.resolve(__dirname, 'src/index.ts'),
    },
    output: {
      ...sharedNodeOptions.output,
      sourcemap: !isProduction,
    },
    plugins: [
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        compilerOptions: {
          declaration: false,
        },
      }),
      json(),
    ],
  });
}
function createConfig(isProduction: boolean) {
  return defineConfig({
    ...sharedNodeOptions,
    input: {
      index: path.resolve(__dirname, 'src/index.ts'),
    },
    output: {
      ...sharedNodeOptions.output,
      sourcemap: !isProduction,
    },
    plugins: [
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      }),
      json(),
    ],
  });
}

export default (commandLineArgs: any): RollupOptions[] => {
  const isDev = commandLineArgs.watch;
  const isProduction = !isDev;
  return defineConfig([
    createCliConfig(isProduction),
    createConfig(isProduction),
  ]);
};
