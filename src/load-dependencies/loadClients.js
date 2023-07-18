const { logger } = require("../util");
const { Terraform } = require("../classes");
const { Storage } = require("@google-cloud/storage");

const loadClients = () => {
  logger(`Loading clients for cloud storage and terraform`);

  const terraform = new Terraform();
  const storage = new Storage();

  logger(`Done loading clients for cloud storage and terraform`);
  return { terraform, storage };
};

module.exports = { loadClients };
