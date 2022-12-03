const data = require('../storage/metadata.json');

const DatabaseConnection = async (sequelize) => {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
}

const CreateTables = async (sequelize) => {
  const tables = Object.keys(data);
  const fields = [];
  const querys = [];
  let nameTablesStringQuery;
  for (const table of tables) {
    fields.push(Object.keys(data[table]));
  }
  for (let i=0; i<tables.length; i++) {
    querys.push(`CREATE TABLE ${tables[i]} `);
    nameTablesStringQuery = '(';
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
    await sequelize.query(query);
  }
}

const InsertValues = async (sequelize) => {
  const tables = Object.keys(data);

  for (const table of tables) {
    const querys = [];
    const values = [];
    let queryIndex= 0;
    let valueTablesStringQuery;
    const fields = Object.keys(data[table]);
    for (const field of fields) {
      values.push(data[table][field])
    }
    for (let j=0; j<values[0].length; j++) {
      querys.push(`INSERT INTO ${table} values `);
      valueTablesStringQuery = '';
      for (let i=0; i<values.length; i++) {
        if (i === 0) {
          valueTablesStringQuery += `(${values[i][j]}`;
        } else {
          valueTablesStringQuery += `,${values[i][j]}`;
        }
      }
      valueTablesStringQuery += ');';
      querys[queryIndex] += valueTablesStringQuery;
      queryIndex++;
    }
    for (const query of querys) {
      await sequelize.query(query);
    }
    const [results] = await sequelize.query(`SELECT * FROM ${table};`);
    if (!results?.length) {
      console.log(`Unable to insert values in ${table}`)
    }
    console.log(results);
  }
}

module.exports = LoadDB = async (sequelize) => {
  try {
    console.log('-------------- Inicializando banco de dados e carregando valores ------------------');
    console.log("-----------------------------------------------------------------------------------");
    await DatabaseConnection(sequelize);
    await CreateTables(sequelize);
    await InsertValues(sequelize);

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
