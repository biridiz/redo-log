const fs = require('fs');

// As transações que devem realizar o redo, são todos os commits dos checkpoints
// e todos os commits após a linha do checkpoint

try {
  const data = fs.readFileSync('../log/db.log', 'utf8');
  const lines = data.split('\n');
  const checkpoints = [];
  const commits = [];

  for (const line of lines) {
    if (line.includes('CKPT')) {
      checkpoints.push(line.match(/(\w+)/g));
    }

    if (line.includes('commit')) {
      commits.push(line.replace('<', '').replace('>', '').split(' '));
    }
  }

  // identifcar qual commit esta no checkpoint, encontrar e executar sua operação
  // verificar se alguma operação deve ser executada após o checkpoint

  console.log(checkpoints);
  console.log(commits);

  // console.log(lines)
} catch (err) {
  console.error(err);
}

module.exports = {}