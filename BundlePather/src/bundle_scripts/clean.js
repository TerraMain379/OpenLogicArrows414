const traverse = require('@babel/traverse').default;
const t = require('@babel/types');


module.exports.exec = (ast, root) => {
  removeEsModulePrefixes(ast, root);
  removeExportsUndefinedAssign(ast, root);
};

function removeEsModulePrefixes(ast, root) {
  traverse(ast, {
    StringLiteral(path) {
      if(path.node.value == "__esModule") {
        path.parentPath.remove()
      }
    }
  })
}
function removeExportsUndefinedAssign(ast, root) {
  function memberExpressionDelete(path, forced) {
    const { left, right } = path.node;

    if (
      left.type == "MemberExpression" &&
      t.isIdentifier(left.object, { name: "exports" }) &&
      t.isIdentifier(left.property) &&
      (t.isIdentifier(right, { name: "undefined" }) || forced)
    ) {
      if (path.parentPath.type == "AssignmentExpression") {
        memberExpressionDelete(path.parentPath, true);
      }
      else {
        path.remove();
        path.skip();
      }
    }
  }
  traverse(ast, {
    AssignmentExpression(path) {
      memberExpressionDelete(path, false);
    }
  })
}
