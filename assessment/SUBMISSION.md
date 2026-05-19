# World Cup Betting Assessment — Submission

**Assessment contract:** `contracts/contracts/WorldCupBetting.sol`

---

## Test results

All assessment scenarios pass:

```bash
cd contracts
npm install --legacy-peer-deps
npx hardhat test test/WorldCupBetting.assessment.test.ts
```

**Result:** 9 passing (Scenarios A–I)

| Scenario | Status |
|----------|--------|
| A — 1X2 market create & resolve | Pass |
| B — Winner payout net of 2% fee, owner withdraws fees | Pass |
| C — Cannot resolve before `resolutionTime` | Pass |
| D — Only arbitrator resolves | Pass |
| E — No bets at/after resolution timestamp | Pass |
| F — Slippage (`_minShares`) guard | Pass |
| G — Secondary market: list, buy, buyer claims | Pass |
| H — ERC20 collateral lifecycle | Pass |
| I — Loser claims once for reputation; no double-claim | Pass |

Full suite (including `PredictionMarket` unit tests):

```bash
npx hardhat test
```

**Result:** 11 passing

---

## Approach and key decisions

### Architecture

`WorldCupBetting` is a self-contained prediction market:

- **Markets** — question, 2+ outcomes, resolution time, arbitrator, collateral (`address(0)` = ETH).
- **Bets** — stake on one outcome; shares from a pool-based AMM (`calculateShares`).
- **Resolution** — arbitrator sets winning outcome after `resolutionTime`.
- **Claims** — winners get pro-rata pool share minus 2% fee; losers call `claimWinnings` for reputation only.
- **Secondary market** — `listPosition` / `buyPosition` / `cancelListing` before resolution.

### Security

- `ReentrancyGuard` on value-transfer paths (`placeBet`, `claimWinnings`, `buyPosition`, `withdrawFees`).
- `Ownable` for `withdrawFees`; per-market arbitrator for `resolveMarket`.
- State updates before external calls (CEI).
- Revert strings match assessment tests (`Too early`, `Only arbitrator`, `Market closed`, `Slippage exceeded`, `Already claimed`).

### Fees (Scenario B)

2% of **gross winner payout** at claim time → `collectedFees[token]` → `withdrawFees` by owner.

### Ownership (Scenario G)

`buyPosition` updates `bet.bettor`; the buyer claims winnings after resolution.

---

## Full platform (frontend + `PredictionMarket`)

The repo also includes a Next.js frontend wired to `PredictionMarket.sol` (same API as the assessment contract).

### Local development

```bash
# Terminal 1
cd contracts && npx hardhat node

# Terminal 2
cd contracts && npm run deploy:local
# Copy addresses into .env.local (see .env.local.example)

# Terminal 3 (repo root)
cp .env.local.example .env.local   # edit addresses + WalletConnect ID
npm install
npm run dev
```

MetaMask: chain ID **31337**, RPC `http://127.0.0.1:8545`.

### Sepolia

```bash
cd contracts
# configure contracts/.env (SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY)
npm run deploy:sepolia
npm run copy-abis
```

Update root `.env.local` with Sepolia addresses and `NEXT_PUBLIC_CHAIN_ID=11155111`.

---

## Files

| File | Role |
|------|------|
| `contracts/contracts/WorldCupBetting.sol` | Assessment implementation |
| `contracts/contracts/PredictionMarket.sol` | Production contract (deployed by `deploy.ts`) |
| `contracts/contracts/ReputationSystem.sol` | Reputation scoring |
| `contracts/contracts/MockERC20.sol` | Test USDC |
| `contracts/test/WorldCupBetting.assessment.test.ts` | Scenarios A–I |
