const { terraform: terraformClient, storage: cloudStorageClient } =
  loadClients();
const { createResourcesProcess } = require("./proceses/createResourcesProcess");
const {
  BUCKET_NAME,
  OLD_STATE_FOLDER,
  terraformDirPath,
  repoName,
} = require("./constant");
// const terraformDirPath = getInput("terraform_dir_path", { required: true });

const run = async () => {
  await createResourcesProcess(cloudStorageClient, terraformClient, {
    bucketName: BUCKET_NAME,
    oldStateFolder: OLD_STATE_FOLDER,
    terraformDirPath,
    repoName,
  });
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   logger(destroyResponse);
};

run();
