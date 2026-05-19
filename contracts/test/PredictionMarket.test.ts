import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PredictionMarket", function () {
  let predictionMarket: any;
  let reputationSystem: any;
  let owner: any, user1: any, user2: any, arbitrator: any;

  beforeEach(async function () {
    [owner, user1, user2, arbitrator] = await ethers.getSigners();

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy(
      await reputationSystem.getAddress()
    );
    await predictionMarket.waitForDeployment();

    await reputationSystem.setPredictionMarket(
      await predictionMarket.getAddress()
    );
  });

  it("Should create a market", async function () {
    const futureTime = (await time.latest()) + 86400;

    await predictionMarket.createMarket(
      "Will BTC reach $100k?",
      "Resolves YES if Bitcoin reaches $100,000",
      ["Yes", "No"],
      futureTime,
      arbitrator.address,
      ethers.ZeroAddress
    );

    expect(await predictionMarket.marketCount()).to.equal(1);
  });

  it("Should place a bet and claim winnings", async function () {
    const futureTime = (await time.latest()) + 86400;

    await predictionMarket.createMarket(
      "Will BTC reach $100k?",
      "Resolves YES if Bitcoin reaches $100,000",
      ["Yes", "No"],
      futureTime,
      arbitrator.address,
      ethers.ZeroAddress
    );

    const betAmount = ethers.parseEther("0.1");
    await predictionMarket
      .connect(user1)
      .placeBet(1, 0, betAmount, 0, { value: betAmount }); // Added minShares = 0

    await time.increase(86401);
    await predictionMarket.connect(arbitrator).resolveMarket(1, 0);

    const balanceBefore = await ethers.provider.getBalance(user1.address);
    await predictionMarket.connect(user1).claimWinnings(1);
    const balanceAfter = await ethers.provider.getBalance(user1.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
