import * as fs from "fs";
import * as path from "path";

const artifactsDir = path.join(__dirname, "../artifacts/contracts");
const abisDir = path.join(__dirname, "../../lib/contracts/abis");

const contracts = [
  "PredictionMarket.sol/PredictionMarket.json",
  "ReputationSystem.sol/ReputationSystem.json",
  "MockERC20.sol/MockERC20.json",
];

function main() {
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  for (const artifactPath of contracts) {
    const src = path.join(artifactsDir, artifactPath);
    const filename = path.basename(artifactPath);
    const dest = path.join(abisDir, filename);

    if (!fs.existsSync(src)) {
      console.error(`Missing artifact: ${src}. Run 'npx hardhat compile' first.`);
      process.exit(1);
    }

    fs.copyFileSync(src, dest);
    console.log(`Copied ${filename}`);
  }

  console.log("\nABIs synced to lib/contracts/abis/");
}

main();
