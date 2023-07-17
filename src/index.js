const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const {
  uploadDirectory,
  doesBucketExist,
  createBucket,
  downloadFolder,
} = require("./gcloud/storage");
const { isEmptyDir } = require("./util/fsProcesses");
const { getInput } = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { logger } = require("./util/logger");

const terraformDirPath = getInput("terraform_dir_path", { required: true });
const bucketName = "terraform-config-states";
const oldStateFolder = "old-state";

const createResourcesProcess = async (
  bucketName,
  terraformDirPath,
  { repoName }
) => {
  if (!(await doesBucketExist(bucketName))) await createBucket(bucketName);
  if (!fs.existsSync(repoName)) fs.mkdirSync(repoName);
  if (!fs.existsSync(oldStateFolder)) fs.mkdirSync(oldStateFolder);

  await downloadFolder(bucketName, repoName);

  fs.cpSync(terraformDirPath, repoName, { recursive: true });

  const isOldStateEmpty = await isEmptyDir(oldStateFolder);
  logger(`isOldStateEmpty: ${isOldStateEmpty}`);
  const whatFolderToUse = isOldStateEmpty ? repoName : oldStateFolder;

  const absolutePathForTerraformProcesses = path.join(
    __dirname,
    whatFolderToUse
  );

  await terraform.init(absolutePathForTerraformProcesses);
  const planResponse = await terraform.plan(absolutePathForTerraformProcesses, {
    autoApprove: true,
  });

  logger(planResponse);

  const applyResponse = await terraform.apply(
    absolutePathForTerraformProcesses,
    {
      autoApprove: true,
    }
  );

  if (!isOldStateEmpty)
    fs.cpSync(oldStateFolder, repoName, { recursive: true });

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
