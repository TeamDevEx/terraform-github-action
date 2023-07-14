const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
} = require("./gcloud/storage");
const { getInput } = require("@actions/core");
const github = require("@actions/github");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const bucketName = "terraform-config-state-" + github.context.repo.repo;

const createResourcesProcess = async (terraformDirPath, bucketName) => {
  await terraform.init(terraformDirPath);
  const planResponse = await terraform.plan(terraformDirPath, {
    autoApprove: true,
  });

  console.log(planResponse);

  const applyResponse = await terraform.apply(terraformDirPath, {
    autoApprove: true,
  });

  if (!(await doesBucketExist(bucketName))) await createBucket(bucketName)

  await uploadDirectory(bucketName, terraformDirPath)

  console.log(applyResponse);
};

const run = async () => {
  await createResourcesProcess(terraformDirPath, bucketName);
  //   const destroyResponse = await terraform.destroy(terraformDirPath, {
  //     autoApprove: true,
  //   });
  //   console.log(destroyResponse);
};

run();
