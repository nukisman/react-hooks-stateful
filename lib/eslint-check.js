// Temporary not used
//
// const { find, exec, exit, echo } = require('shelljs');
//
// const paths = process.argv.slice(2);
// if (paths.length === 0) {
//   echo(`
// Usage: node eslint-check pathPattern...
// Example: node eslint-check src/*.js *.js
//   `);
// } else {
//   const bin = `node_modules/.bin`;
//   find(paths).forEach(file => {
//     echo('');
//     echo(`ESLint Check file: ${file}`);
//     if (
//       exec(
//         `${bin}/eslint --print-config ${file} | ${bin}/eslint-config-prettier-check`
//       ).code !== 0
//     ) {
//       echo(`ESLint Check Error in ${file}`);
//       exit(1);
//     }
//   });
// }
