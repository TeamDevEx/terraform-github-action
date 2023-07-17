const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const { logger } = require("../util/logger");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function* getFiles(directory = ".") {
  for (const file of await readdir(directory)) {
    const fullPath = path.join(directory, file);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      yield* getFiles(fullPath);
    }

    if (stats.isFile()) {
      yield fullPath;
    }
  }
}

async function uploadDirectory(
  cloudStorageClient,
  { directoryPath, bucketName }
) {
  logger(`Uploading tf config state to cloud storge bucket`);
  const bucketInstance = cloudStorageClient.bucket(bucketName);
  let successfulUploads = 0;

  for await (const filePath of getFiles(directoryPath)) {
    try {
      const dirName = path.dirname(directoryPath);
      const destination = path.relative(dirName, filePath);

      await bucketInstance.upload(filePath, { destination });

      logger(`Successfully uploaded: ${filePath}`);
      successfulUploads++;
    } catch (e) {
      console.error(`Error uploading ${filePath}:`, e);
    }
  }

  logger(`${successfulUploads} files uploaded to ${bucketName} successfully.`);
}

async function doesBucketExist(bucketName) {
  logger(`Checking if bucket exists`);
  const [buckets] = await cloudStorageClient.getBuckets();

  const isThereExistingBucket = buckets.find((bucket) => {
    return bucketName === bucket.name;
  });

  return !!isThereExistingBucket;
}

async function createBucket(bucketName) {
  logger(`Creating bucket: ${bucketName}`);
  const [bucket] = await cloudStorageClient.createBucket(bucketName, {
    location: "US",
    storageClass: "STANDARD",
  });

  logger(`Bucket ${bucket.name} created.`);
}

async function downloadFolder(cloudStorgae, { folderName, bucketName }) {
  logger(
    `Downloading folder for tf config states for this repository: ${folderName}`
  );
  const bucketInstance = cloudStorgae.bucket(bucketName);
  const [files] = await bucketInstance.getFiles({ prefix: folderName });

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

async function deleteDirectory(cloudStorageClient, { bucketName, folderName }) {
  logger(`Deleting tf config state to cloud storge bucket`);
  const bucketInstance = cloudStorageClient.bucket(bucketName);

  const [files] = await bucketInstance.getFiles();

  const dirFiles = files.filter((f) =>
    f.metadata.id.includes(folderName + "/")
  );

  if (files.length === 0) return true;

  for (const dirFile of dirFiles) {
    await dirFile.delete();
    logger(`deleted ${dirFile.name}`);
  }
}

module.exports = {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  deleteDirectory,
};
