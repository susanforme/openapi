import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const BASE_DIST_PATH_URL = path.resolve(
  __dirname,
  '../dist',
);
/**
 * 获取源文件夹
 */
const sourceFilePath = path.resolve(
  BASE_DIST_PATH_URL,
  'src',
);
/**
 * 获取目标文件路径
 */
const targetFilePath = path.resolve(BASE_DIST_PATH_URL, '');

// 移动文件
(async function mv() {
  try {
    // 获取源文件夹下的文件
    const files = await fs.readdir(sourceFilePath);
    // 创建目标文件夹
    await fs.mkdir(targetFilePath, { recursive: true });
    // 移动文件
    for (const file of files) {
      await fs.rename(
        path.resolve(sourceFilePath, file),
        path.resolve(targetFilePath, file),
      );
    }
    await fs.rmdir(sourceFilePath);
  } catch (error) {
    console.log('🐛 🐛 🐛  移动失败!');
    console.error(error);
    return;
  }
  console.log('🚩 🚩 🚩 移动成功!');
})();