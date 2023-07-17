const { execSync } = require("child_process");
const { getFiles } = require("../util/getFiles");

const getProviderToUse = async (directoryPath) => {
  let providerToUse;

  const machineArchitecture =
    (process.platform === "win32" ? "windows" : process.platform) +
    "_" +
    process.env["PROCESSOR_ARCHITECTURE"].toLowerCase();

  for await (const filePath of getFiles(directoryPath)) {
    try {
      if (filePath.includes(machineArchitecture)) {
        providerToUse = filePath;
        break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  console.log(providerToUse);
};

// allows access to the terraform provider executable file
const allowAccessToExecutable = async (pathToExectuable) => {
  console.log(
    execSync(`chmod +x ${await getProviderToUse(pathToExectuable)}`, {
      encoding: "utf-8",
    })
  );
};

module.exports = { allowAccessToExecutable };
