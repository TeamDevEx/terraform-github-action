const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
} = require("../gcloud/storage");
const { isEmptyDir } = require("../util/fsProcesses");
const fs = require("fs");
const { logger } = require("../util/logger");
const { allowAccessToExecutable } = require("../util/chmod");

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

  logger(`does old-state exists?: ${fs.existsSync(oldStateFolder)}`);

  if (!isOldStateEmpty) await allowAccessToExecutable(oldStateFolder);

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
