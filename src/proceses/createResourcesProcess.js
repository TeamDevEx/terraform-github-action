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

//   const { execSync } = require("child_process");

//   logger(
//     execSync(`mount | grep noexec`, {
//       encoding: "utf-8",
//     })
//   );

//   logger(
//     execSync(
//       `chmod +x ${oldStateFolder}/.terraform/providers/registry.terraform.io/hashicorp/aws/3.34.0/linux_amd64/.terraform/providers/registry.terraform.io/hashicorp/aws/3.34.0/linux_amd64`,
//       {
//         encoding: "utf-8",
//       }
//     )
//   );

  const initResponse = await terraformClient.init(whatFolderToUse);
  logger(initResponse);
  const planResponse = await terraformClient.plan(whatFolderToUse, {
    autoApprove: true,
  });

  logger(planResponse);

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

  logger(applyResponse);
};

module.exports = { createResourcesProcess };
