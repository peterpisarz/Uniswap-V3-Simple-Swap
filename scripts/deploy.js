// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

//Mainnet, Goerli, Arbitrum, Optimism, Polygon Address per https://docs.uniswap.org/contracts/v3/reference/deployments
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

async function main() {
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap")

  const simpleSwap = await SimpleSwap.deploy(swapRouterAddress)

  await simpleSwap.deployed()

  console.log(`SimpleSwap contract deployed to ${simpleSwap.address} on ${hre.network.config.chainId}`)

  const WAIT_BLOCK_CONFIRMATIONS = 6;
  await simpleSwap.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

  console.log(`Verifying contract on Etherscan...`);

  await run(`verify:verify`, {
    address: simpleSwap.address,
    constructorArguments: [swapRouterAddress],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
