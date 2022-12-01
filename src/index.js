const DB = require('./db');
// const RedoLog = require('./redo-log');

(async () => {
  await DB();
})()