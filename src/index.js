const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const github = require("@actions/github");
const {getInput} = require('@actions/core')

const octokit = github.getOctokit();
// const owner = github.context.repo.owner
// const repo = github.context.repo.repo
const terraformDirPath = getInput('terraform_dir_path')

// const terraformFile = octokit.rest.repos.getContent({
//     owner,
//     repo,
//     path: terraformDirPath 
// })

terraform.init(terraformDirPath);
