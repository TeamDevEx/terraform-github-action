const { loadClients } = require("./load-dependencies/loadClients");
const { createResourcesProcess } = require("./proceses/createResourcesProcess");
const { BUCKET_NAME, OLD_STATE_FOLDER } = require("./constant");
const { getInput } = require("@actions/core");
const github = require("@actions/github");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const toDestroy = getInput("destroy", { required: true });
const repoName = github.context.repo.repo;

const { terraform: terraformClient, storage: cloudStorageClient } =
  loadClients();

const run = async () => {
  await createResourcesProcess(cloudStorageClient, terraformClient, {
    bucketName: BUCKET_NAME,
    oldStateFolder: OLD_STATE_FOLDER,
    terraformDirPath,
    repoName
  });
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   logger(destroyResponse);
};

run();
