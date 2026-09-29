const fs = require('fs');
const { path } = require("./pather_api");

async function main() {
  const code = fs.readFileSync("cache/sources/bundle-shell.js", 'utf8');
  const output = await path(code, [
    require('./shell_scripts/inject_version.js') 
  ]);

  fs.writeFileSync("cache/output/shell.js", output);
  console.log(`gotovo: cache/output/shell.js`);
}
main();
