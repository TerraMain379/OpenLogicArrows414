const template = require('@babel/template').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

module.exports.exec = (ast, root) => {
  traverse(ast, {
    UnaryExpression(path) {
      const { node } = path;
      if (
        node.operator === '!' &&
        t.isNumericLiteral(node.argument) &&
        (node.argument.value === 0 || node.argument.value === 1)
      ) {
        path.replaceWith(t.booleanLiteral(node.argument.value === 0));
      }
      else if (
        node.operator === 'void' &&
        t.isNumericLiteral(node.argument) &&
        (node.argument.value === 0)
      ) {
        path.replaceWith(t.identifier('undefined'));
      }
    },
  });
};
