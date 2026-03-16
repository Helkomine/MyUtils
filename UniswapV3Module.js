// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract UniswapModule is IUniswapV3SwapCallback {
    function uniswapV3SwapCallback(int256, int256, bytes calldata data) external {}

    function _v3SwapExactIn(bytes calldata param) internal virtual {
        uint256 factoryId;
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
        uint8 slotGet;
        uint8 slotSet;

        assembly ("memory-safe") {
            factoryId := calldataload(add(param.offset, 0x20))
            tokenIn := calldataload(add(param.offset, 0x40))
            tokenOut := calldataload(add(param.offset, 0x60))
            fee := calldataload(add(param.offset, 0x80))
            recipient := calldataload(add(param.offset, 0xa0))
            amountSpecified := calldataload(add(param.offset, 0xc0))
            sqrtPriceLimitX96 := calldataload(add(param.offset, 0xe0))
            slotGet := calldataload(add(param.offset, 0x100))
            slotSet := calldataload(add(param.offset, 0x120))
        }

        {
            if (slotGet != 0) {
                assembly ("memory-safe") {
                    amountSpecified := tload(slotGet)
                }
            }
        }

        address factory;
        bytes memory factories = Constants.FACTORIES_PACKED;

        assembly ("memory-safe") {
            factory := shr(
                           96, 
                           mload(
                               add(
                                   mul(
                                       factoryId, 
                                       20
                                   ), 
                                   add(
                                       factories, 
                                       0x20
                                   )
                               )
                           )
                       )
        }

        assembly ("memory-safe") {
            
        }
    }
}
