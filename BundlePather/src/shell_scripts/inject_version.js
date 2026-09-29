const template = require('@babel/template').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const fs = require('fs');
const yaml = require('yaml');


module.exports.exec = (ast, root) => {
  let openVersion = template.expression(`{
    id: 'openarrows',
    title: 'openarrows',
    script: 'open_bundle.js',
    style: 'style.css',
    gameVersion: 'openarrows',
    isDefault: false,
  }`, { placeholderPattern: false })();
  traverse(ast, {
    VariableDeclarator(path) {
      const node = path.node;
      if (node.id.name == 'versions') {
        path.get("init").pushContainer("elements", openVersion);
        // node.init.elements.push(openVersion);
        // console.log(node.init.elements);
      }
    }
  })
};
