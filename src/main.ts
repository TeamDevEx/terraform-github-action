import {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
} from "./gcloud";
import { allowAccessToExecutable, isEmptyDir, moveFiles, logger } from "./util";
import fs from "fs";
import { Terraform } from "./classes";
import { Storage } from "@google-cloud/storage";

interface ICommonMainArg {
  repoName: string;
  terraformDirPath: string;
  bucketName: string;
  oldStateFolder: string;
  toDestroy: string;
}

const main = async (
  cloudStorageClient: Storage,
  terraformClient: Terraform,
  {
    repoName,
    terraformDirPath,
    bucketName,
    oldStateFolder,
    toDestroy,
  }: ICommonMainArg
) => {
  const isDestroy = toDestroy === "true"; // what we get from getInput is not boolean it seems

  const isBucketExist = await doesBucketExist(cloudStorageClient, bucketName);

  logger(
    `Making tempory folders for applying terraform resources based in existing terraform state in cloud storage`
  );
  if (!isBucketExist) await createBucket(cloudStorageClient, bucketName);
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);
  if (!fs.existsSync(oldStateFolder)) fs.mkdirSync(oldStateFolder);
  logger(
    `Done making temporary folders for applying terraform resources based in existing terraform state in cloud storage`
  );

  await downloadFolder(cloudStorageClient, {
    directoryPath: repoName,
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
  const initResponse = terraformClient.init(whatFolderToUse);
  console.log(initResponse);
  logger(`Done initializing terraform files...`);

  logger(`Running terraform plan...`);
  const planResponse = !isDestroy
    ? terraformClient.plan(whatFolderToUse)
    : terraformClient.planDestroy(whatFolderToUse);
  console.log(planResponse);
  logger(`Done running terraform plan...`);

  logger(`Running terraform ${!isDestroy ? "apply" : "destroy"}...`);
  const applyResponse = !isDestroy
    ? terraformClient.apply(whatFolderToUse)
    : terraformClient.destroy(whatFolderToUse);
  console.log(applyResponse);
  logger(`Done running terraform ${!isDestroy ? "apply" : "destroy"}...`);

  if (!isOldStateEmpty && !isDestroy)
    fs.cpSync(oldStateFolder, repoName, { recursive: true });

  if (!isOldStateEmpty)
    await deleteDirectory(cloudStorageClient, {
      bucketName,
      directoryPath: repoName,
    });

  if (!isDestroy)
    await uploadDirectory(cloudStorageClient, {
      directoryPath: repoName,
      bucketName,
    });
};

export { main };
