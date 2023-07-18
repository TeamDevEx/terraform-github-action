import { execSync } from "child_process";
import { getFiles } from "./fsProcesses";
import { logger } from "./logger";

const getProviderToUse = async (pathToExectuable: string) => {
  let providerToUse;
  let architecture = process.arch.split("");
  let machineArchitectures = [];

  architecture.shift();

  const machineArchitecture = process.platform.includes("win")
    ? "windows"
    : process.platform;

  for await (const filePath of getFiles(pathToExectuable)) {
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
const allowAccessToExecutable = async (pathToExectuable: string) => {
  const providerToUse = await getProviderToUse(pathToExectuable);
  logger(`Allowing access for executable: ${providerToUse}`);
  console.log(
    execSync(`chmod +x ${providerToUse}`, {
      encoding: "utf-8",
    })
  );
};

export { allowAccessToExecutable };
