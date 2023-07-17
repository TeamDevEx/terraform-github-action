const { promises } = require("fs");

const isEmptyDir = async (path) => {
  try {
    const directory = await promises.opendir(path);
    const entry = await directory.read();
    await directory.close();

    return entry === null;
  } catch (error) {
    return false;
  }
};

const moveFiles = async (oldFolder, newFolder) => {
  let filePathsParsed = [];
  let oldFilePaths = [];

  for await (const filePath of getFiles(oldFolder)) {
    try {
      filePathsParsed.push(path.parse(filePath));
      oldFilePaths.push(filePath);
    } catch (e) {
      console.error(e);
    }
  }

  const newFilePaths = filePathsParsed.map((f) => {
    const { root, base } = f;

    return path.join(root, newFolder, base);
  });

  for (let i = 0; i < oldFilePaths.length; i++) {
    fs.rename(oldFilePaths[i], newFilePaths[i], (e) => console.error(e));
  }
};

module.exports = { isEmptyDir, moveFiles };
