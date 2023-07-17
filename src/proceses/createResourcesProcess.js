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

  // const absolutePathForTerraformProcesses = __dirname + "/" + whatFolderToUse;

  await terraformClient.init(whatFolderToUse);
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
