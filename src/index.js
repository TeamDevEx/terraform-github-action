const { loadClients } = require("./load-dependencies");
const {
  BUCKET_NAME: bucketName,
  OLD_STATE_FOLDER: oldStateFolder,
} = require("./constant");
const { main } = require("./main");
const { getInput } = require("@actions/core");
const github = require("@actions/github");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const toDestroy = getInput("to_destroy");
const repoName = github.context.repo.repo;

const { terraform: terraformClient, storage: cloudStorageClient } =
  loadClients();

const run = async () => {
  await main(cloudStorageClient, terraformClient, {
    repoName,
    terraformDirPath,
    bucketName,
    oldStateFolder,
    toDestroy,
  });
};

run();
