const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const prettier = require('prettier');
 
module.exports.path = async function path(code, scripts) {
  const ast = parser.parse(code, { sourceType: 'unambiguous' });
  let root;
  traverse(ast, {
    Program(path) {
      root = path;
    }
  });

  for (let script of scripts) {
    script.exec(ast, root);
  }
  const raw_output = generate(ast, { comments: true, compact: false }).code;
  const formatted_output = await prettier.format(raw_output, {
    parser: 'babel',
    printWidth: 100,
    tabWidth: 2,
    semi: true,
    singleQuote: false,
  });
  return formatted_output;
}
