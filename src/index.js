const { runRestServer } = require('./restBe')
const { runStaticServer } = require('./staticServer')

function main() {
  runStaticServer();
  runRestServer();
}

main();
