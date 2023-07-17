const loadClients = () => {
  const { Terraform } = require("js-terraform");
  const { Storage } = require("@google-cloud/storage");
  const terraform = new Terraform();
  const storage = new Storage();
  return { terraform, storage };
};

module.exports = { loadClients };
