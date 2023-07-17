const { loadClients } = require("./load-dependencies/loadClients");
const { createResourcesProcess } = require("./proceses/createResourcesProcess");
const { destroyProcess } = require("./proceses/destroyProcess");
const { BUCKET_NAME, OLD_STATE_FOLDER } = require("./constant");
const { getInput } = require("@actions/core");
const github = require("@actions/github");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const toDestroy = getInput("to_destroy");
const repoName = github.context.repo.repo;

const { terraform: terraformClient, storage: cloudStorageClient } =
  loadClients();

const run = async () => {
  if (toDestroy === 'true') {
    await destroyProcess(cloudStorageClient, terraformClient, {
      bucketName: BUCKET_NAME,
      oldStateFolder: OLD_STATE_FOLDER,
      terraformDirPath,
      repoName,
    });
  } else {
    await createResourcesProcess(cloudStorageClient, terraformClient, {
      bucketName: BUCKET_NAME,
      oldStateFolder: OLD_STATE_FOLDER,
      terraformDirPath,
      repoName,
    });
  }
};

run();
