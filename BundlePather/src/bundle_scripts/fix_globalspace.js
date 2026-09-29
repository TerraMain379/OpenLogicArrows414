const traverse = require('@babel/traverse').default;
const t = require('@babel/types');


module.exports.exec = (ast, root) => {
  unwrapCode(root);
  renameGlobals(ast, root);
  fixRequire(ast, root);
  fixModulesSignatures(ast, root);
};

function unwrapCode(root) {
  const elements = root.get('body.0.expression.callee.body.body');
  const nodes = elements.map(p => p.node);
  root.pushContainer('body', nodes);
  root.get("body.0").remove();
}
function renameGlobals(ast, root) {
  traverse(ast, {
    Program(path) {
      path.scope.rename('e', 'modules');
      path.scope.rename('t', 'loaded_modules');
      path.scope.rename('s', 'require');
    }
  });
}
function fixRequire(ast, root) {
  traverse(ast, {
    Program(path) {
      let requirePath = path.get("body")[1].get("body");
      requirePath.scope.rename('i', 'name');
      requirePath.scope.rename('o', 'loadded');
      requirePath.scope.rename('a', 'module');

      let bodyElements = path.get("body")[1].get("body").get("body");
      let returnPath = bodyElements[3];
      let returnArgs = returnPath.get("argument").get("expressions");

      returnPath.insertBefore(returnArgs[0].node);
      returnPath.insertBefore(t.returnStatement(returnArgs[1].node));
      returnPath.remove();

      let callModuleArguments = returnArgs[0].get("arguments");
      callModuleArguments[2].remove();
      callModuleArguments[0].remove();
    }
  });
}
function fixModulesSignatures(ast, root) {
  traverse(ast, {
    Program(path) {
      let p = path.get("body")[0].get("declarations")[0].get("init").get("properties")
      for (let modulePath of p) {
        let bodyPath = modulePath.get("body");
        let paramsPaths = modulePath.get("params");

        bodyPath.scope.rename("t", "exports");
        if (modulePath.node.params.length == 3) {
          bodyPath.scope.rename("s", "require");
          paramsPaths[2].remove();
        }
        paramsPaths[0].remove();

        let firstInBody = bodyPath.get("body")[0];
        let sequance = firstInBody.get("expression");

        let esModuleLiteralPath;
        try {
          esModuleLiteralPath = sequance.node.expressions[0].arguments[1].value
        } catch(e) {}
        if (esModuleLiteralPath === "__esModule") {
          sequance.get("expressions")[0].remove();
        }
      }
    }
  });
}
