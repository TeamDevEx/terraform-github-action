const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  isFolderEmpty,
} = require("./gcloud/storage");
const { getInput } = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { logger } = require("./util/logger");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const bucketName = "terraform-config-states";

const createResourcesProcess = async (
  bucketName,
  terraformDirPath,
  { repoName }
) => {
  if (!(await doesBucketExist(bucketName))) await createBucket(bucketName);
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);

  await downloadFolder(bucketName, repoName);

  fs.cpSync(terraformDirPath, repoName, { recursive: true });

  const isFolderEmptyInBucket = await isFolderEmpty(bucketName, "old-state");
  logger(`isFolderEmptyInBucket: ${isFolderEmptyInBucket}`);
  const whatFolderToUse = isFolderEmptyInBucket ? repoName : "old-state";

  await terraform.init(whatFolderToUse);
  const planResponse = await terraform.plan(whatFolderToUse, {
    autoApprove: true,
  });

  logger(planResponse);

  const applyResponse = await terraform.apply(whatFolderToUse, {
    autoApprove: true,
  });

  await uploadDirectory(bucketName, repoName);

  logger(applyResponse);
};

const run = async () => {
  await createResourcesProcess(bucketName, terraformDirPath, {
    repoName: github.context.repo.repo,
  });
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   logger(destroyResponse);
};

run();
