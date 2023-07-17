const { execSync } = require("child_process");
const { getFiles } = require("../util/getFiles");

const getProviderToUse = async () => {
    let providerToUse
    let architecture = process.arch.split("");
    let machineArchitectures = [];
  
    architecture.shift();
  
    const machineArchitecture =
      process.platform.includes('win') ? "windows" : process.platform;
  
    for await (const filePath of getFiles("old-state")) {
      try {
        if (filePath.includes(machineArchitecture)) {
          machineArchitectures.push(filePath);
        }
      } catch (e) {
        console.error(e);
      }
    }
  
    providerToUse =  machineArchitectures.find((machine) =>
      machine.includes(architecture.join(""))
    );

    console.log(providerToUse)

    return providerToUse
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
