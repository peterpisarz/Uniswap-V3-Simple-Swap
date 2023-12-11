const { ethers } = require("ethers")
const hre = require("hardhat")
require("dotenv").config()

const DAI_ADDRESS = "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844"; //Goerli Dai
const WETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; //Goerli WETH

const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const API = process.env.ALCHEMY_API_GOERLI
const privateKey = process.env.PRIVATE_KEY
const contractAddress = "0x141Bb545ce20fAE95F02fc43EdB6851e83773620"
const artifacts = require("./artifacts/contracts/SimpleSwap.sol/SimpleSwap.json")
let provider
const amountIn = ethers.utils.parseEther(".01")

provider = new ethers.providers.WebSocketProvider(`wss://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_GOERLI}`)

// provider = new ethers.providers.JsonRpcProvider(`ws://127.0.0.1:8545/`)

const wallet = new ethers.Wallet(privateKey, provider)

//Get SimpleSwap Contract
const contract = new ethers.Contract(contractAddress, artifacts.abi, wallet)

//Get WETH and DAI contracts globally
const weth = new ethers.Contract(WETH_ADDRESS, ercAbi, wallet)
const dai = new ethers.Contract(DAI_ADDRESS, ercAbi, wallet)

const main = async () => {
	try {
		// await weth.withdraw({ value: balanceOf(wallet.address) })
		console.log(`Starting Balances for wallet, ${wallet.address}`)
		await getWalletBalance()

		console.log(`Converting ${amountIn} to WETH...`)
		await depositWETH(amountIn)

		console.log(`Swapping ${amountIn} WETH for DAI...`)
	  await weth.approve(contract.address, amountIn)
		const tx = await contract.swapWETHForDai(amountIn)
		let receipt = await tx.wait()

		if (receipt.status === 1) {
        	console.log("Transaction successful!\n");
    	} else {
        	console.log("Transaction failed!\n");
        	return
    	}

		console.log(`Getting final balances...`)
		await getWalletBalance()

		console.log("Holy Shit! It's a cat!")
	} catch (error) {
		console.log("This shit ain't gon' work\n", error)
	}
}

const depositWETH = async (_amount) => {
	const beforeBalance = await weth.balanceOf(wallet.address)
  let tx = await weth.deposit({ value: (_amount.toString()) })
  await tx.wait()
  const balanceAfter = await weth.balanceOf(wallet.address)
  console.log(`WETH before: \t${beforeBalance}`)
  console.log(`WETH now: \t${balanceAfter}\n`)
}

const getWalletBalance = async() => {
  let DAIBalance = await dai.balanceOf(wallet.address)
	let WETHBalance = await weth.balanceOf(wallet.address)
	let ETHbalance = await provider.getBalance(wallet.address)
	console.log(`ETH:  ${ETHbalance}`)
	console.log(`WETH: ${WETHBalance}`)
	console.log(`DAI:  ${DAIBalance}\n`)
}

const withdrawWETH = async () => {
	const withdrawlAmount = await weth.balanceOf(wallet.address)
	console.log(withdrawlAmount)
	let tx = await weth.withdraw({ value: (withdrawlAmount.toString())})
}



main()