const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
} = require("./gcloud");
const {
  allowAccessToExecutable,
  isEmptyDir,
  moveFiles,
  logger,
} = require("./util");
const fs = require("fs");

const main = async (
  cloudStorageClient,
  terraformClient,
  { repoName, terraformDirPath, bucketName, oldStateFolder, toDestroy }
) => {
  const isDestroy = toDestroy === "true"; // what we get from getInput is not boolean it seems

  const isBucketExist = await doesBucketExist(cloudStorageClient, {
    bucketName,
  });

  logger(
    `Making tempory folders for applying terraform resources based in existing terraform state in cloud storage`
  );
  if (!isBucketExist) await createBucket(cloudStorageClient, { bucketName });
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);
  if (!fs.existsSync(oldStateFolder)) fs.mkdirSync(oldStateFolder);
  logger(
    `Done making temporary folders for applying terraform resources based in existing terraform state in cloud storage`
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
  const planResponse = !isDestroy
    ? await terraformClient.plan(whatFolderToUse, {
        autoApprove: true,
      })
    : await terraformClient.planDestroy(whatFolderToUse, {
        autoApprove: true,
      });
  console.log(planResponse);
  logger(`Done running terraform plan...`);

  logger(`Running terraform ${!isDestroy ? "apply" : "destroy"}...`);
  const applyResponse = !isDestroy
    ? await terraformClient.apply(whatFolderToUse, {
        autoApprove: true,
      })
    : await terraformClient.destroy(whatFolderToUse, {
        autoApprove: true,
      });
  console.log(applyResponse);
  logger(`Done running terraform ${!isDestroy ? "apply" : "destroy"}...`);

  if (!isOldStateEmpty && !isDestroy)
    fs.cpSync(oldStateFolder, repoName, { recursive: true });

  if (!isOldStateEmpty)
    await deleteDirectory(cloudStorageClient, {
      bucketName,
      folderName: repoName,
    });

  if (!isDestroy)
    await uploadDirectory(cloudStorageClient, {
      directoryPath: repoName,
      bucketName,
    });
};

module.exports = { main };
