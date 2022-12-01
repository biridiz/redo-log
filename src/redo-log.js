const fs = require('fs');

try {
  const data = fs.readFileSync('../log/db.log', 'utf8');
  const lines = data.split('\n');
  const checkpoints = [];
  const commits = [];
  const operationsAlreadyPerformed = [];
  let checkpointLine = 0;
  let lineNumber = 0;

  for (const line of lines) {
    if (line.includes('CKPT')) {
      checkpoints.push(line.match(/(\w+)/g).slice(1));
      checkpointLine = lineNumber;
    }
    if (line.includes('commit')) {
      commits.push(line.replace('<', '').replace('>', '').replace('commit ', ''));
    }
    lineNumber++;
  }

  for (let i=0; i<checkpoints.length; i++) {
    for (let j=0; j<checkpoints[i].length; j++) {
      if (commits.includes(checkpoints[i][j])) {
        const op = checkpoints[i][j];
        // Econtrou o nome da operação
        // Agora percorre até encontrar qual operação executar,
        // interpreta a linha e atualiza o banco

        for (const line of lines) {
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
            console.log(id, field, values);
            // verificar se o valor do banco é diferente do valor novo
            // se for, realiza o update
            // imprime qual operação realizou o redo
            // e faz o select para verificar que os dados foram atualizados
          }
        }

        operationsAlreadyPerformed.push(op);
      }
    }
  }

  // percorre a partir do checkpoint, se encontrar um commit
  // deve buscar a operação, interpretar a linha e atualizar o banco
  // IMPORTANTE - ignorar operaçãoes já feitas

  for (let i=checkpointLine; i<lines.length; i++) {
    if (lines[i].includes('commit')) {
      const op = lines[i].replace('<', '').replace('>', '').replace('commit ', '')
      if (!operationsAlreadyPerformed.includes(op)) {
        // Econtrou o nome da operação
        // Agora percorre até encontrar qual operação executar,
        // interpreta a linha e atualiza o banco
        operationsAlreadyPerformed.push(op);
      }
    }
  }

  // console.log('CKPT', checkpoints);
  // console.log('Commits', commits);
  // console.log('checkpoint line', checkpointLine);
  // console.log('op executadas', operationsAlreadyPerformed);

} catch (err) {
  console.error(err);
}

module.exports = {}