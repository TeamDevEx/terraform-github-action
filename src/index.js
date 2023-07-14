const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const github = require("@actions/github");
const { getInput } = require("@actions/core");

// const octokit = github.getOctokit();
// const owner = github.context.repo.owner
// const repo = github.context.repo.repo
const terraformDirPath = getInput("terraform_dir_path", { required: true });

// const terraformFile = octokit.rest.repos.getContent({
//     owner,
//     repo,
//     path: terraformDirPath
// })

const run = async () => {
  await terraform.init(terraformDirPath);
  const planResponse = await terraform.plan(terraformDirPath, {
    autoApprove: true,
  });

  console.log(planResponse);

  const applyResponse = await terraform.apply(terraformDirPath, {
    autoApprove: true,
  });

  console.log(applyResponse);

//   const destroyResponse = await terraform.destroy(terraformDirPath, {
//     autoApprove: true,
//   });

//   console.log(destroyResponse);
  
};

run();
