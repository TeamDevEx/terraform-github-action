import { getInput } from "@actions/core";
import * as github from "@actions/github";

const loadWorkflowVariables = () => {
  const terraformDirPath = getInput("terraform_dir_path", { required: true });
  const toDestroy = getInput("to_destroy");
  const repoName = github.context.repo.repo;
  return { terraformDirPath, toDestroy, repoName };
};

export { loadWorkflowVariables };
