const { execSync } = require("child_process");
const { logger } = require("../util/logger");

class Terraform {
  constructor() {}

  init = (relativePath) => {
    return execSync(`terraform -chdir=${relativePath} init`, {
      encoding: "utf-8",
    });
  };

  plan = (relativePath) => {
    return execSync(`terraform -chdir=${relativePath} plan`, {
      encoding: "utf-8",
    });
  };

  apply = (relativePath) => {
    return execSync(`terraform -chdir=${relativePath} apply -auto-approve`, {
      encoding: "utf-8",
    });
  };

  destroy = (relativePath) => {
    logger("Deleting terraform resources");
    execSync(`terraform -chdir=${relativePath} apply -destroy -auto-approve`, {
      encoding: "utf-8",
    });
    logger("Resources deleted!");
  };
}

module.exports = { Terraform };
