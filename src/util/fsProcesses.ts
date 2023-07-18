import { promises } from "fs";
import path from "path";
import { promisify } from "util";
import fs from "fs";
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const isEmptyDir = async (path: fs.PathLike) => {
  try {
    const directory = await promises.opendir(path);
    const entry = await directory.read();
    await directory.close();

    return entry === null;
  } catch (error) {
    return false;
  }
};

async function* getFiles(directory = "."): AsyncGenerator<any, any, unknown> {
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

const moveFiles = async (oldFolder: string | undefined, newFolder: string) => {
  let filePathsParsed = [];
  let oldFilePaths = [];

  for await (const filePath of getFiles(oldFolder)) {
    try {
      filePathsParsed.push(path.parse(filePath));
      oldFilePaths.push(filePath);
    } catch (e) {
      console.error(e);
    }
  }

  const newFilePaths = filePathsParsed.map((f) => {
    const { root, base } = f;

    return path.join(root, newFolder, base);
  });

  for (let i = 0; i < oldFilePaths.length; i++) {
    fs.copyFileSync(oldFilePaths[i], newFilePaths[i]);
  }
};

export { isEmptyDir, moveFiles, getFiles };
