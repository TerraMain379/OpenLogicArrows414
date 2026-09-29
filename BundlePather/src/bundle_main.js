const fs = require('fs');
const { path } = require("./pather_api");

async function main() {
  const code = fs.readFileSync("cache/sources/bundle.js", 'utf8');
  const output = await path(code, [
    require('./bundle_scripts/fix_globalspace.js'),
    require('./bundle_scripts/fix_short_consts.js'),
    require('./bundle_scripts/modules_mappings.js'),
    require('./bundle_scripts/clean.js'),
    require('./bundle_scripts/global_mappings.js'),
  ]);

  fs.writeFileSync("cache/output/bundle.js", output);
  console.log(`gotovo: cache/output/bundle.js`);
}
main();
