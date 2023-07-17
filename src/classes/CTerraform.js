const { execSync } = require("child_process");

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
    return execSync(`terraform -chdir=${relativePath} apply -destroy -auto-approve`, {
      encoding: "utf-8",
    });
  };
}

module.exports = { Terraform };
