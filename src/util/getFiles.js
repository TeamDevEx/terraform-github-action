const { promisify } = require("util");
const fs = require("fs");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function* getFiles(directory = ".") {
  for (const file of await readdir(directory)) {
    const fullPath = path.join(directory, file);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      yield* getFiles(fullPath);
    }

    if (stats.isFile()) {
      yield fullPath;
    }
  }
}

module.exports = { getFiles };
