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

module.exports = { isEmptyDir };
