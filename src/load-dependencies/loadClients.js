const loadClients = () => {
  const { Terraform } = require('../classes/CTerraform');
  const { Storage } = require("@google-cloud/storage");
  const terraform = new Terraform();
  const storage = new Storage();
  return { terraform, storage };
};

module.exports = { loadClients };
