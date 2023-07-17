const { logger } = require("../util/logger");
const loadClients = () => {
  logger(`Loading clients for cloud storage and terraform`);

  const { Terraform } = require("../classes/CTerraform");
  const { Storage } = require("@google-cloud/storage");
  const terraform = new Terraform();
  const storage = new Storage();

  logger(`Done loading clients for cloud storage and terraform`);
  return { terraform, storage };
};

module.exports = { loadClients };
