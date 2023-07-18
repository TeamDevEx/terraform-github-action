import { loadClients } from "./load-dependencies";
import {
  BUCKET_NAME as bucketName,
  OLD_STATE_FOLDER as oldStateFolder,
} from "./constant";
import { main } from "./main";
import { loadWorkflowVariables } from "./load-dependencies";

const { terraform: terraformClient, storage: cloudStorageClient } =
  loadClients();

const { terraformDirPath, toDestroy, repoName } = loadWorkflowVariables();

const run = async () => {
  await main(cloudStorageClient, terraformClient, {
    repoName,
    terraformDirPath,
    bucketName,
    oldStateFolder,
    toDestroy,
  });
};

run();
