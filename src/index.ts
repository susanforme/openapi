const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');
const path = require('path');
function unicodeToString(unicode) {
  return unescape(unicode);
}

const resolve = (url) => path.resolve(__dirname, url);

const zh = resolve('src/locales/zh-CN.json');
const en = resolve('src/locales/en-US.json');
let zhData = {};
let enData = {};
if (fs.existsSync(zh)) {
  zhData = JSON.parse(fs.readFileSync(zh));
}
if (fs.existsSync(en)) {
  enData = JSON.parse(fs.readFileSync(en));
}

const getLocales = (value) => {
  if (value && !zhData.hasOwnProperty(value)) {
    zhData[value] = value;
  }
  if (value && !enData.hasOwnProperty(value)) {
    enData[value] = '';
  }
};

const getValue = (words) => {
  const { value, isTemplate, isJsxText } = words;

  if (isTemplate) {
    return `\${t("${value}")}`;
  }
  if (isJsxText) {
    return `{t("${value}")}`;
  }

  return `t('${value}')`;
};

const extractAndConvert = (fullPath, isConvert) => {
  const contents = fs.readFileSync(fullPath, 'utf-8');
  // 将代码转换成 AST
  const ast = parser.parse(contents, {
    sourceType: 'module',
    plugins: [
      'jsx',
      [
        'decorators',
        {
          decoratorsBeforeExport: true,
        },
      ],
      'typescript',
    ],
  });

  // 提取中文，替换为 t() 形式
  traverse(ast, {
    StringLiteral(path) {
      const { value } = path.node;
      if (/[\u4e00-\u9fa5]/.test(value)) {
        // console.info('StringLiteral', path.parent.type, unicodeToString(value));
        const val = unicodeToString(
          value.replace(/\n/g, '').trim(),
        );
        getLocales(val);
        if (!isConvert) {
          return;
        }
        const word = {
          value: val,
          loc: path.node.loc,
          isJsxAttr: path.parent.type === 'JSXAttribute',
        };
        const callExpression = types.callExpression(
          types.identifier('t'),
          [types.stringLiteral(value)],
        );

        if (path.parent.type === 'JSXAttribute') {
          path.replaceWith(
            types.jsxExpressionContainer(callExpression),
          );
          // path.node.value =
        } else if (path.parent.type !== 'CallExpression') {
          path.replaceWith(
            types.expressionStatement(callExpression),
          );
        }
      }
    },
    ['JSXText']: (path) => {
      if (/[\u4e00-\u9fa5]/.test(path.node.value)) {
        console.info(
          'JSXText',
          unicodeToString(path.node.value),
        );
        const val = unicodeToString(
          path.node.value.replace(/\n/g, '').trim(),
        );
        getLocales(val);
        if (!isConvert) {
          return;
        }
        const word = {
          value: val,
          loc: path.node.loc,
          iloc: path.node.loc,
          isJsxAttr: true,
          isJsxText: true,
        };
        path.node.value = getValue(word);
      }
    },
    ['TemplateElement']: (path) => {
      if (/[\u4e00-\u9fa5]/.test(path.node.value.raw)) {
        // console.info('TemplateElement', path.node.value);
        const val = unicodeToString(
          path.node.value.raw.replace(/\n/g, '').trim(),
        );
        getLocales(val);
        if (!isConvert) {
          return;
        }
        const word = {
          value: val,
          loc: path.node.loc,
          isTemplate: true,
        };
        path.node.value = getValue(word);
      }
    },
  });
  if (!isConvert) {
    return;
  }

  // 将修改后的 AST 转换回代码
  const { code } = generator(ast, {
    jsescOption: { minimal: true },
    retainLines: true,
  });
  // 写入修改后的代码到文件
  fs.writeFileSync(fullPath, code, 'utf-8');
};

const dealFiles = (folderPath) => {
  fs.readdirSync(resolve(folderPath)).forEach((file) => {
    const fullPath = resolve(path.join(folderPath, file));
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      dealFiles(fullPath);
    } else if (path.extname(file) === '.tsx') {
      extractAndConvert(fullPath, true);
    } else if (path.extname(file) === '.ts') {
      extractAndConvert(fullPath, false);
    }
  });
};

const dealFile = (filePath) => {
  if (path.extname(filePath) === '.tsx') {
    extractAndConvert(resolve(filePath), true);
  } else if (path.extname(file) === '.ts') {
    extractAndConvert(resolve(filePath), false);
  }
};

const main = () => {
  // 提取和转换中文
  dealFiles('src/components');
  dealFiles('src/layout');
  dealFiles('src/pages');

  // // 将中文写入locales文件
  fs.writeFileSync(
    zh,
    JSON.stringify(zhData, null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    en,
    JSON.stringify(enData, null, 2),
    'utf-8',
  );
};

main();
