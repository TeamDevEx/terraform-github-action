const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
} = require("../gcloud/storage");
const { isEmptyDir } = require("../util/fsProcesses");
// const { getInput } = require("@actions/core");
// const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const { logger } = require("../util/logger");

const createResourcesProcess = async (
  cloudStorageClient,
  terraformClient,
  { repoName, terraformDirPath, bucketName, oldStateFolder }
) => {
  const isBucketExist = await doesBucketExist(cloudStorageClient, {
    bucketName,
  });
  if (!isBucketExist) await createBucket(cloudStorageClient, { bucketName });
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);
  if (!fs.existsSync(oldStateFolder)) fs.mkdirSync(oldStateFolder);

  await downloadFolder(cloudStorageClient, {
    folderName: repoName,
    bucketName,
  });

  fs.cpSync(terraformDirPath, repoName, { recursive: true });

  const isOldStateEmpty = await isEmptyDir(oldStateFolder);
  logger(`isOldStateEmpty: ${isOldStateEmpty}`);
  const whatFolderToUse = isOldStateEmpty ? repoName : oldStateFolder;

  //   const absolutePathForTerraformProcesses = __dirname + "/" + whatFolderToUse;

  //   logger(
  //     `absolutePathForTerraformProcesses: ${absolutePathForTerraformProcesses}`
  //   );

  logger(`does old-state exists?: ${fs.existsSync(oldStateFolder)}`);

  const { execSync } = require("child_process");

  //   logger(
  //     execSync(`mount | grep noexec`, {
  //       encoding: "utf-8",
  //     })
  //   );

  logger(
    execSync(
      `chmod +x ${oldStateFolder}/.terraform/providers/registry.terraform.io/hashicorp/google/4.73.1/linux_amd64/terraform-provider-google_v4.73.1_x5`,
      {
        encoding: "utf-8",
      }
    )
  );

  logger(
    execSync(
      `chmod +x ${oldStateFolder}/.terraform/providers/registry.terraform.io/hashicorp/google/4.73.1/windows_amd64/terraform-provider-google_v4.73.1_x5.exe`,
      {
        encoding: "utf-8",
      }
    )
  );

  const initResponse = await terraformClient.init(whatFolderToUse);
  console.log(initResponse);
  const planResponse = await terraformClient.plan(whatFolderToUse, {
    autoApprove: true,
  });

  console.log(planResponse);

  const applyResponse = await terraformClient.apply(whatFolderToUse, {
    autoApprove: true,
  });

  if (!isOldStateEmpty)
    fs.cpSync(oldStateFolder, repoName, { recursive: true });

  if ((isBucketExist || !isOldStateEmpty) && applyResponse)
    await deleteDirectory(cloudStorageClient, {
      bucketName,
      folderName: repoName,
    });

  await uploadDirectory(cloudStorageClient, {
    directoryPath: repoName,
    bucketName,
  });

  console.log(applyResponse);
};

module.exports = { createResourcesProcess };
