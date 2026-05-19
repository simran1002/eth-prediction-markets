import { ethers, run, network } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const repAddress = await reputationSystem.getAddress();
  console.log("ReputationSystem deployed to:", repAddress);

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(repAddress);
  await predictionMarket.waitForDeployment();
  const marketAddress = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", marketAddress);

  await reputationSystem.setPredictionMarket(marketAddress);
  console.log("Connected contracts");

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Mock USDC", "USDC");
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  console.log("\n=== SAVE THESE ADDRESSES ===");
  console.log("NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=", marketAddress);
  console.log("NEXT_PUBLIC_REPUTATION_SYSTEM_ADDRESS=", repAddress);
  console.log("NEXT_PUBLIC_MOCK_USDC_ADDRESS=", usdcAddress);

  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying on Etherscan...");
    await verifyContract(repAddress, []);
    await verifyContract(marketAddress, [repAddress]);
    await verifyContract(usdcAddress, ["Mock USDC", "USDC"]);
    console.log("All contracts verified");
  }
}

async function verifyContract(address: string, constructorArguments: unknown[]) {
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log(`  Verified ${address}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Already Verified")) {
      console.log(`  Already verified: ${address}`);
    } else {
      console.warn(`  Verification failed for ${address}:`, message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
