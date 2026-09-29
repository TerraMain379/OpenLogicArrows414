const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const prettier = require('prettier');
 
// const hoistRequires = require('./passes/hoist-requires');
// const injectModLoader = require('./passes/inject-modloader'); 


console.log(process.argv);


const [, , inputPath, outputPath] = process.argv;
 
if (!inputPath || !outputPath) {
  console.error('usage: npm run main <input.js> <output.js>');
  process.exit(1);
}
 
const code = fs.readFileSync(inputPath, 'utf8');
const ast = parser.parse(code, { sourceType: 'unambiguous' });

const root = ast.program;


require('./passes/fix_globalspace.js').exec(ast, root);
require('./passes/mappings.js').exec(ast, root);
traverse(ast, require('./passes/fix_bools.js'));
traverse(ast, require('./passes/fix_void0.js'));
 
// traverse(ast, {
//   Program(path) {
//     hoistRequires(path, requireFnName);
//     injectModLoader(path, requireFnName);
//   },
// });
 
const raw_output = generate(ast, { comments: true, compact: false }).code;

(async () => {
  const formatted_output = await prettier.format(raw_output, {
    parser: 'babel',
    printWidth: 100,
    tabWidth: 2,
    semi: true,
    singleQuote: false,
  });

  fs.writeFileSync(outputPath, formatted_output);
  console.log(`gotovo: ${outputPath}`);
})();
