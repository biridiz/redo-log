const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const LoadDB = require('./loadDB');
const RedoLog = require('./redo-log');

(async () => {
  await LoadDB(sequelize);
  await RedoLog(sequelize);
})()