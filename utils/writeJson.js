const fs = require('node:fs/promises');

async function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

module.exports = { writeJson };