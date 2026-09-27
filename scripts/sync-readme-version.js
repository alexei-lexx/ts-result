import { readFileSync, writeFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");
const updatedReadme = readme.replace(
  /ts-result#v[\d.]+/,
  `ts-result#v${packageJson.version}`,
);

writeFileSync("README.md", updatedReadme);
