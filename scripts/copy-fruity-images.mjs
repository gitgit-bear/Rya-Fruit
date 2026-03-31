import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "fruity_auntie_pages_1_to_4_all_jpg");
const destDir = path.join(root, "client", "dist", "fruity_auntie_pages_1_to_4_all_jpg");

async function copyDirectory(source, target) {
  const entries = await fs.readdir(source, { withFileTypes: true });
  await fs.mkdir(target, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const dstPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, dstPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, dstPath);
    }
  }
}

async function main() {
  await fs.rm(destDir, { recursive: true, force: true });
  await fs.mkdir(destDir, { recursive: true });
  await copyDirectory(srcDir, destDir);
  console.log(`Copied fruity images -> ${destDir}`);
}

main().catch((err) => {
  console.error("Failed to copy fruity images:", err);
  process.exit(1);
});
