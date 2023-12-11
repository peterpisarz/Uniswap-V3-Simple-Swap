// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract SimpleSwap {
   ISwapRouter public immutable swapRouter;
   address public constant DAI = 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844; //mainnet 0x6B175474E89094C44Da98b954EedeAC495271d0F
   address public constant WETH9 = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6; //mainnet 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
   uint24 public constant feeTier = 3000;

   constructor(ISwapRouter _swapRouter) {
      swapRouter = _swapRouter;
   }

   function swapWETHForDai(uint256 amountIn) external returns (uint256 amountOut) {
      TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountIn);

      TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);

      uint256 minOut = 0;

      uint160 priceLimit = 0;

      ISwapRouter.ExactInputSingleParams memory params =
         ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH9,
            tokenOut: DAI,
            fee: feeTier,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: minOut,
            sqrtPriceLimitX96: priceLimit
         });

      amountOut = swapRouter.exactInputSingle(params);
   }
}
