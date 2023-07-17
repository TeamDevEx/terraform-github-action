const {
  doesBucketExist,
  downloadFolder,
  deleteDirectory,
} = require("../gcloud/storage");
const { isEmptyDir, moveFiles } = require("../util/fsProcesses");
const fs = require("fs");
const { logger } = require("../util/logger");
const { allowAccessToExecutable } = require("../util/chmod");

const destroyProcess = async (
  cloudStorageClient,
  terraformClient,
  { repoName, terraformDirPath, bucketName, oldStateFolder }
) => {
  logger(
    `Making tempory folders for applying terraform resources based in existing terraform state in cloud storage`
  );
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);
  if (!fs.existsSync(oldStateFolder)) fs.mkdirSync(oldStateFolder);
  logger(
    `Done making tempory folders for applying terraform resources based in existing terraform state in cloud storage`
  );

  await downloadFolder(cloudStorageClient, {
    folderName: repoName,
    bucketName,
  });

  fs.cpSync(terraformDirPath, repoName, { recursive: true });

  const isOldStateEmpty = await isEmptyDir(oldStateFolder);
  logger(`Is the old-state directory empty: ${isOldStateEmpty}`);
  const whatFolderToUse = isOldStateEmpty ? repoName : oldStateFolder;

  logger(`Does old-state exists?: ${fs.existsSync(oldStateFolder)}`);

  if (!isOldStateEmpty) await allowAccessToExecutable(oldStateFolder);

  await moveFiles(terraformDirPath, oldStateFolder);

  logger(`Initializing terraform files...`);
  const initResponse = await terraformClient.init(whatFolderToUse);
  console.log(initResponse);
  logger(`Done initializing terraform files...`);

  logger(`Running terraform plan...`);
  const planResponse = await terraformClient.plan(whatFolderToUse, {
    autoApprove: true,
  });
  console.log(planResponse);
  logger(`Done running terraform plan...`);

  await terraformClient.destroy(whatFolderToUse, {
    autoApprove: true,
  });

  await deleteDirectory(cloudStorageClient, {
    bucketName,
    folderName: repoName,
  });
};

module.exports = { destroyProcess };
