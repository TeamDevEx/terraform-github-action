import { execSync } from "child_process";
import { logger } from "../util/logger";

class Terraform {
  constructor() {}

  init = (relativePath: string) => {
    return execSync(`terraform -chdir=${relativePath} init`, {
      encoding: "utf-8",
    });
  };

  plan = (relativePath: string) => {
    return execSync(`terraform -chdir=${relativePath} plan`, {
      encoding: "utf-8",
    });
  };

  planDestroy = (relativePath: string) => {
    return execSync(`terraform -chdir=${relativePath} plan -destroy`, {
      encoding: "utf-8",
    });
  };

  apply = (relativePath: string) => {
    return execSync(`terraform -chdir=${relativePath} apply -auto-approve`, {
      encoding: "utf-8",
    });
  };

  destroy = (relativePath: string) => {
    logger("Deleting terraform resources");
    execSync(`terraform -chdir=${relativePath} apply -destroy -auto-approve`, {
      encoding: "utf-8",
    });
    logger("Resources deleted!");
  };
}

export { Terraform };
