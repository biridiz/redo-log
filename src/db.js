const { Sequelize } = require('sequelize');
const data = require('../storage/metadata.json');
const sequelize = new Sequelize('sqlite::memory:');
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    const tables = Object.keys(data);
    const fields = [];
    const querys = [];
    let nameTablesStringQuery = '(';
    for (const table of tables) {
      fields.push(Object.keys(data[table]));
    }
    for (let i=0; i<tables.length; i++) {
      querys.push(`CREATE TABLE ${tables[i]}`);
      for (let j=0; j<fields[i].length; j++) {
        if (j === 0) {
          nameTablesStringQuery += `${fields[i][j]}`;
        } else {
          nameTablesStringQuery += `,${fields[i][j]}`;
        }
      }
      nameTablesStringQuery += ');';
      querys[i] += nameTablesStringQuery;
    }
    for (const query of querys) {
      const [results, metadata] = await sequelize.query(query);
      console.log(results);
      console.log(metadata);
    }

    const q = [];
    let s = '(';

    for (const table of tables) {
      q.push(`INSERT INTO ${table} values`)
      const f = Object.keys(data[table]);
      for (field of f) {
        console.log(field)
        console.log(data[table][field]);

      }
      console.log(q)
    }


  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})()
