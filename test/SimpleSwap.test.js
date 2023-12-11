const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_DECIMALS = 18; 
const SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; 

const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function approve(address spender, uint256 amount) returns (bool)",
];

describe("SimpleSwap", function () {
  it("Should provide a caller with more DAI than they started with after a swap", async function () {
    
    /* Deploy the SimpleSwap contract */
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap")
    const simpleSwap = await SimpleSwap.deploy(SwapRouterAddress)
    await simpleSwap.deployed()
    console.log(simpleSwap.address)

    /* Connect to weth9 and wrap some eth  */
    const [signer] = await ethers.getSigners()
    console.log(signer)
    const weth = new ethers.Contract(WETH_ADDRESS, ercAbi, signer)
    await weth.deposit({ value: ethers.utils.parseEther("1.0") })
    
    /* Check Initial DAI Balance */ 
    const dai = new ethers.Contract(DAI_ADDRESS, ercAbi, signer)
    const result = await dai.balanceOf(signer.address)
    console.log(`Result: ${result.toString()}`)


    /* Approve the swapper contract to spend weth9 for me */
    const wethAmount = ethers.utils.parseEther("1.0");
    await weth.approve(simpleSwap.address, wethAmount)

    /* Execute the swap */
    await simpleSwap.swapWETHForDai(wethAmount) 
    
    /* Check DAI end balance */
    const finalDAIBalance = await dai.balanceOf(signer.address)
    console.log(`Final DAI Balance: ${Number(ethers.utils.formatUnits(finalDAIBalance, 'ether')).toFixed(6)}`)

    /* Test that we now have more DAI than when we started */
    expect(finalDAIBalance).to.be.gt(result, "DAI Balance should be greater after swap")

  });
});
