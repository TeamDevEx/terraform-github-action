const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
} = require("./gcloud/storage");
const { getInput } = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const bucketName = "terraform-config-states";

const createResourcesProcess = async (
  bucketName,
  terraformDirPath,
  { repoName }
) => {
  await downloadFolder(bucketName, repoName);

  fs.cpSync(repoName, "old-state", { recursive: true });
  fs.cpSync(terraformDirPath, repoName, { recursive: true });

  await terraform.init(repoName);
  const planResponse = await terraform.plan("old-state", {
    autoApprove: true,
  });

  console.log(planResponse);

  const applyResponse = await terraform.apply("old-state", {
    autoApprove: true,
  });

  if (!(await doesBucketExist(bucketName))) await createBucket(bucketName);

  await uploadDirectory(bucketName, repoName);

  console.log(applyResponse);
};

const run = async () => {
  await createResourcesProcess(bucketName, terraformDirPath, {
    repoName: github.context.repo.repo,
  });
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   console.log(destroyResponse);
};

run();
