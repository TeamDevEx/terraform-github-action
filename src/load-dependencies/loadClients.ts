import { logger } from "../util";
import { Terraform } from "../classes";
import { Storage } from "@google-cloud/storage";

const loadClients = () => {
  logger(`Loading clients for cloud storage and terraform`);

  const terraform = new Terraform();
  const storage = new Storage();

  logger(`Done loading clients for cloud storage and terraform`);
  return { terraform, storage };
};

export { loadClients };
