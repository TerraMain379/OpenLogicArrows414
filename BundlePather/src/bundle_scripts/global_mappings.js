const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const espree = require('espree');
const esquery = require('esquery');
const fs = require('fs');
const yaml = require('yaml');


const global_mappings = yaml.parse(fs.readFileSync("mappings/global.yaml", "utf8")).modules;

module.exports.exec = (ast, root) => {
  let nodeToPathMap = new Map();
  traverse(ast, {
    enter(path) {
      nodeToPathMap.set(path.node, path);
    }
  });

  let modulesPathes = root.get("body.0.declarations.0.init.properties");
  let modules = {};
  for (let path of modulesPathes) {
    modules[path.node.key.name] = path.get("body");
  }
  for (let mappingModule in global_mappings) {
    let module = modules[mappingModule];
    execute(module, global_mappings[mappingModule], nodeToPathMap);
  }
};

function execute(path, mappings, nodeToPathMap) {
  debugger;
  for (let mapping of mappings) {
    let selector = mapping.path;
    let all = mapping.all || false;
    let map = mapping.map;
    let rename = mapping.rename;

    let matches = esquery.query(path.node, selector);
    if (rename) {
      if (all) {
        for (let match of matches) {
          nodeToPathMap.get(match).scope.rename(match.name, rename)
        }
      }
      else if (matches.length > 0) {
        let match = matches[0];
        nodeToPathMap.get(match).scope.rename(match.name, rename)
      }
    }
    else if (map) {
      if (all) {
        for (let match of matches) {
          let path = nodeToPathMap.get(match);
          execute(path, map, nodeToPathMap)
        }
      }
      else if (matches.length > 0) {
        let match = matches[0];
        let path = nodeToPathMap.get(match);
        execute(path, map, nodeToPathMap)
      }
    }
  }
}
