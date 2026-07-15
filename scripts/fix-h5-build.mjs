import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const indexPath = fileURLToPath(new URL("../dist/client/index.html", import.meta.url));
const html = await readFile(indexPath, "utf8");
const fixedHtml = html.replaceAll("/./assets/", "./assets/");

if (fixedHtml === html) {
  console.log("[h5-build] Asset paths already use relative URLs.");
} else {
  await writeFile(indexPath, fixedHtml, "utf8");
  console.log("[h5-build] Rewrote SPA shell asset URLs for H5+ local loading.");
}
