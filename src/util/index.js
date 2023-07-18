const { allowAccessToExecutable } = require("./chmod");
const { isEmptyDir, moveFiles, getFiles } = require("./fsProcesses");
const { logger } = require("./logger");

module.exports = {
  allowAccessToExecutable,
  isEmptyDir,
  moveFiles,
  getFiles,
  logger,
};
