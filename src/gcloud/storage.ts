import fs from "fs";
import path from "path";
import { logger } from "../util/logger";
import { getFiles } from "../util/fsProcesses";
import { Storage } from "@google-cloud/storage";

interface ICommonCloudStorageArgs {
  directoryPath: string;
  bucketName: string;
}

async function uploadDirectory(
  cloudStorageClient: Storage,
  { directoryPath, bucketName }: ICommonCloudStorageArgs
) {
  logger(`Uploading tf config state to cloud storge bucket`);
  const bucketInstance = cloudStorageClient.bucket(bucketName);
  let successfulUploads = 0;

  for await (const filePath of getFiles(directoryPath)) {
    try {
      const dirName = path.dirname(directoryPath);
      const destination = path.relative(dirName, filePath);

      if (!(path.parse(filePath).ext === ".tf"))
        await bucketInstance.upload(filePath, { destination });

      logger(`Successfully uploaded: ${filePath}`);
      successfulUploads++;
    } catch (e) {
      console.error(`Error uploading ${filePath}:`, e);
    }
  }

  logger(`${successfulUploads} files uploaded to ${bucketName} successfully.`);
}

async function doesBucketExist(
  cloudStorageClient: Storage,
  bucketName: string
) {
  logger(`Checking if bucket exists`);
  const [buckets] = await cloudStorageClient.getBuckets();

  const isThereExistingBucket = buckets.find((bucket) => {
    return bucketName === bucket.name;
  });

  return !!isThereExistingBucket;
}

async function createBucket(cloudStorageClient: Storage, bucketName: string) {
  logger(`Creating bucket: ${bucketName}`);
  const [bucket] = await cloudStorageClient.createBucket(bucketName, {
    location: "US",
    storageClass: "STANDARD",
  });

  logger(`Bucket ${bucket.name} created.`);
}

async function downloadFolder(
  cloudStorageClient: Storage,
  { directoryPath, bucketName }: ICommonCloudStorageArgs
) {
  logger(
    `Downloading folder for tf config states for this repository: ${directoryPath}`
  );
  const bucketInstance = cloudStorageClient.bucket(bucketName);
  const [files] = await bucketInstance.getFiles({ prefix: directoryPath });

  for (const file of files) {
    const dirPath = path.parse(file.name).dir.split("/");
    dirPath[0] = "old-state";

    const newDirPath = dirPath.join("/");
    const newFilePath = newDirPath + "/" + path.basename(file.name);

    if (!fs.existsSync(newDirPath))
      fs.mkdirSync(newDirPath, { recursive: true });

    await bucketInstance.file(file.name).download({
      destination: path.join(newFilePath),
    });

    logger(`gs://${bucketName}/${file.name} downloaded to ${newFilePath}.`);
  }
}

async function deleteDirectory(
  cloudStorageClient: Storage,
  { bucketName, directoryPath }: ICommonCloudStorageArgs
) {
  logger(`Deleting tf config state in cloud storge bucket: ${bucketName}`);
  const bucketInstance = cloudStorageClient.bucket(bucketName);

  const [files] = await bucketInstance.getFiles();

  const dirFiles = files.filter((f) =>
    f.metadata.id.includes(directoryPath + "/")
  );

  for (const dirFile of dirFiles) {
    await dirFile.delete();
    logger(`Deleted ${dirFile.name}`);
  }

  logger(
    `Done with directory deletion for ${directoryPath} in cloud bucket ${bucketName}`
  );
}

export {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
};
