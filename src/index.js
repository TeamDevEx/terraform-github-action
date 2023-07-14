const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const { Storage, TransferManager } = require("@google-cloud/storage");
const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
  isBucketEmpty,
} = require("./gcloud/storage");
// const { getInput } = require("@actions/core");
// const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// const terraformDirPath = getInput("terraform_dir_path", { required: true });
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

  if (await isBucketEmpty(bucketName, repoName)) await terraform.init(repoName);
    const planResponse = await terraform.plan("old-state", {
      autoApprove: true,
    });

    console.log(planResponse);

    const applyResponse = await terraform.apply("old-state", {
      autoApprove: true,
    });

    await uploadDirectory(bucketName, repoName);

    console.log(applyResponse);
};

const run = async () => {
  await createResourcesProcess(bucketName, "../terraform", {
    repoName: "sample-repo-to-use-gh-action",
  });
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   console.log(destroyResponse);
};

run();
