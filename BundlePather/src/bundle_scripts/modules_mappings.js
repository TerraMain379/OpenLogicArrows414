const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs');
const yaml = require('yaml');


const modules_mappings = yaml.parse(fs.readFileSync("mappings/modules.yaml", "utf8"));

module.exports.exec = (ast, root) => {
  renameModules(ast, root);
  fixRequires(ast, root);
};

function renameModules(ast, root) {
  for (let module of root.get("body.0.declarations.0.init.properties")) {
    let key = module.node.key.value;
    let newKey = modules_mappings[key];
    if (newKey) {
      module.get("key").replaceWith(t.identifier(newKey));
    }
  }
}
function fixRequires(ast, root) {
  traverse(ast, {
    CallExpression(path) {
      let callee = path.get("callee");
      if (
        callee.node.type == "Identifier" &&
        callee.node.name == "require"
      ) {
        let arg = path.get("arguments.0");
        if (arg.node.type == "NumericLiteral") {
          let newArg = modules_mappings[arg.node.value];
          if (newArg) {
            arg.replaceWith(t.stringLiteral(newArg));

            if (path.parentPath.node.type == "VariableDeclarator") {
              fixRequireCallVariable(path.parentPath, newArg)
            }
          }
        }
      }
    }
  })
}
function fixRequireCallVariable(path, name) {
  let oldName = path.node.id.name;
  let binding = path.scope.getBinding(oldName);
  let flag = true;
  let names = {}
  for (let refPath of binding.referencePaths) {
    if (refPath.parentPath.node.type != "MemberExpression") {
      flag = false;
      break;
    }
    else {
      names[refPath.parentPath.node.property.name] = 1;
    }
  }
  if (flag && Object.keys(names).length == 1) {
    name = Object.keys(names)[0];
    path.get("init").replaceWith(
      t.memberExpression(
        path.get("init").node,
        t.identifier(name)
      )
    );

    for (let refPath of binding.referencePaths) {
      refPath.parentPath.replaceWith(
        t.Identifier(oldName)
      );
    }

    path.scope.rename(oldName, name);
  }
  else {
    path.scope.rename(oldName, `_${name}`);
  }
}
