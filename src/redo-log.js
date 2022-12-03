const fs = require('fs');

const getTable = () => {
  const data = require('../storage/metadata.json');
  const tables = Object.keys(data);
  return tables[0];
}

const performedTransation = async (line, op, transationsAlreadyPerformed, sequelize) => {
  if (
    line.includes(op) &&
    !line.includes('CKPT') &&
    !line.includes('commit') &&
    !line.includes('start')
  ) {
    const arrayInfos = line.replace(`<${op},`, '').replace('>', '').split(',');
    const id = arrayInfos[0];
    const field = arrayInfos[1];
    const values = arrayInfos.slice(2);
    const table = getTable();
    let [results] = await sequelize.query(`SELECT ${field} FROM ${table} WHERE id=${id}`);
    if (results[0][field] !== values[1]) {
      await sequelize.query(`UPDATE ${table} SET ${field}=${values[1]} WHERE id=${id}`);
    }
    [results] = await sequelize.query(`SELECT ${field} FROM ${table} WHERE id=${id}`);
    console.log("-----------------------------------------------------------------------------------");
    console.log(`Transação ${op} realizou o REDO`);
    console.log(`Campo ${field} com ID=${id} alterou seu valor para ${results[0][field]}`);
    console.log("-----------------------------------------------------------------------------------");
    transationsAlreadyPerformed.push(op);
  }
}

module.exports = RedoLog = async (sequelize) => {
  console.log('\n--------------------------- realizando REDO log -----------------------------------');
  console.log("-----------------------------------------------------------------------------------");

  try {
    const data = fs.readFileSync('../log/db.log', 'utf8');
    const lines = data.split('\n');
    const commits = [];
    const transationsAlreadyPerformed = [];
    let checkpoint = [];
    let checkpointLine = 0;
    let lineNumber = 0;
  
    for (const line of lines) {
      if (line.includes('CKPT')) {
        checkpoint = line.match(/(\w+)/g).slice(1);
        checkpointLine = lineNumber;
      }
      if (line.includes('commit')) {
        commits.push(line.replace('<', '').replace('>', '').replace('commit ', ''));
      }
      lineNumber++;
    }
  
    for (let i=0; i<checkpoint.length; i++) {
      if (commits.includes(checkpoint[i])) {
        const op = checkpoint[i];
        for (const line of lines) {
          await performedTransation(line, op, transationsAlreadyPerformed, sequelize);
        }
      }
    }
  
    for (let i=checkpointLine; i<lines.length; i++) {
      if (lines[i].includes('commit')) {
        const op = lines[i].replace('<', '').replace('>', '').replace('commit ', '')
        if (!transationsAlreadyPerformed.includes(op)) {
          await performedTransation(lines[i], op, transationsAlreadyPerformed, sequelize);
        }
      }
    }

    for (const line of lines) {
      if (line.includes('start')) {
        const op = line.replace('<', '').replace('>', '').replace('commit ', '')
        if (!op.includes(transationsAlreadyPerformed)) {
          console.log("-----------------------------------------------------------------------------------");
          console.log(`Transação ${op} não realizou o REDO`);
          console.log("-----------------------------------------------------------------------------------");
        }
      }
    }

  } catch (err) {
    console.error(err);
  }
}