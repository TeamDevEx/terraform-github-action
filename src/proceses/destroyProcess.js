const {
  doesBucketExist,
  downloadFolder,
  deleteDirectory,
} = require("../gcloud/storage");
const { isEmptyDir } = require("../util/fsProcesses");
const fs = require("fs");
const { logger } = require("../util/logger");
const { allowAccessToExecutable } = require("../util/chmod");

const destroyProcess = async (
  cloudStorageClient,
  terraformClient,
  { repoName, terraformDirPath, bucketName, oldStateFolder }
) => {
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

  await allowAccessToExecutable(oldStateFolder);

  const initResponse = await terraformClient.init(whatFolderToUse);
  console.log(initResponse);
  const planResponse = await terraformClient.plan(whatFolderToUse, {
    autoApprove: true,
  });

  console.log(planResponse);

  await terraformClient.destroy(whatFolderToUse, {
    autoApprove: true,
  });

  const deleteResponse = await deleteDirectory(cloudStorageClient, {
    bucketName,
    folderName: repoName,
  });

  console.log(deleteResponse);
};

module.exports = { destroyProcess };
