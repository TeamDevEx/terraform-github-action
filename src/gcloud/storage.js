const { Storage, TransferManager } = require("@google-cloud/storage");

// Creates a client
const storage = new Storage();

const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

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

async function uploadDirectory(bucketName, directoryPath) {
  const bucket = storage.bucket(bucketName);
  let successfulUploads = 0;

  for await (const filePath of getFiles(directoryPath)) {
    try {
      const dirName = path.dirname(directoryPath);
      const destination = path.relative(dirName, filePath);

      await bucket.upload(filePath, { destination });

      console.log(`Successfully uploaded: ${filePath}`);
      successfulUploads++;
    } catch (e) {
      console.error(`Error uploading ${filePath}:`, e);
    }
  }

  console.log(
    `${successfulUploads} files uploaded to ${bucketName} successfully.`
  );
}

async function doesBucketExist(bucketName) {
  const [buckets] = await storage.getBuckets();

  const isThereExistingBucket = buckets.find((bucket) => {
    return bucketName === bucket.name;
  });

  return !!isThereExistingBucket;
}

async function createBucket(bucketName) {
  const [bucket] = await storage.createBucket(bucketName, {
    location: "US",
    storageClass: "STANDARD",
  });

  console.log(`Bucket ${bucket.name} created.`);
}

async function downloadFolder(bucketName, folderName) {
  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ prefix: folderName });

  files.forEach(async (file) => {
    if (!fs.existsSync(path.parse(file.name).dir))
      fs.mkdirSync(path.parse(file.name).dir, { recursive: true });

    const dirPath = path.parse(file.name).dir.split("/");
    dirPath[0] = "old-state";

    await storage
      .bucket(bucketName)
      .file(file.name)
      .download({
        destination: path.join(dirPath.join("/"), path.basename(file.name)),
      });
    console.log(`gs://${bucketName}/${file.name} downloaded to ${file.name}.`);
  });
}

const isBucketEmpty = async (bucketName, folderName) => {
  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ prefix: folderName });

  if (files.length === 0) return true;

  return false;
};

module.exports = {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  isBucketEmpty,
};
