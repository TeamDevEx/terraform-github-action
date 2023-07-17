const { execSync } = require("child_process");
const { getFiles } = require("../util/fsProcesses");
const { logger } = require("./logger");

const getProviderToUse = async () => {
  let providerToUse;
  let architecture = process.arch.split("");
  let machineArchitectures = [];

  architecture.shift();

  const machineArchitecture = process.platform.includes("win")
    ? "windows"
    : process.platform;

  for await (const filePath of getFiles("old-state")) {
    try {
      if (filePath.includes(machineArchitecture)) {
        machineArchitectures.push(filePath);
      }
    } catch (e) {
      console.error(e);
    }
  }

  providerToUse = machineArchitectures.find((machine) =>
    machine.includes(architecture.join(""))
  );

  return providerToUse;
};

// allows access to the terraform provider executable file
const allowAccessToExecutable = async (pathToExectuable) => {
  const providerToUse = await getProviderToUse(pathToExectuable);
  logger(`Allowing access for executable: ${providerToUse}`);
  console.log(
    execSync(`chmod +x ${providerToUse}`, {
      encoding: "utf-8",
    })
  );
};

module.exports = { allowAccessToExecutable };
