// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract UniswapModule is IUniswapV3SwapCallback {
    using SafeERC20 for IERC20;
    
    // uniswap.v3.callback-slot - 1
    bytes32 internal constant CALLBACK_SLOT = 0x6ae0ded922d357ca7d0ce412e5fa8ffb0e0478fa5cd9868cb81a424686141252;
    
    function uniswapV3SwapCallback(int256 amount0, int256 amount1, bytes calldata data) external virtual {
        _processV3SwapCallback(amount0, amount1, data);
    }

    function _processV3SwapCallback(int256, int256, bytes calldata data) internal virtual {
        address pool;
        
        assembly {
            pool := tload(CALLBACK_SLOT)
        }

        require(msg.sender == pool);
        
        (address tokenIn, bool zeroForOne) = abi.decode(data, (address, bool));
        uint256 amount;
        
        assembly {
            amount := calldataload()
        }

        IERC20(tokenIn).safeTransfer(msg.sender, amount);
    }

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
            if sub(param.length, 0x140) {
                revert(0, 0)
            }
            
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

        address pool = IFactory(factory).getPool(tokenIn, tokenOut, fee);

        assembly ("memory-safe") {
            tstore(CALLBACK_SLOT, pool)
        }

        bool zeroForOne;
        
        assembly {
            zeroForOne := lt(tokenIn, tokenOut)
            sqrtPriceLimitX96 := sub(MAX_SQRT_RATIO, mul(zeroForOne, DELTA_SQRT_RATIO))
        }

        IUniswapV3(pool).swap(address(this), zeroForOne, amountSpecified, sqrtPriceLimitX96, abi.encode(tokenIn, zeroForOne));

        assembly ("memory-safe") {
            tstore(CALLBACK_SLOT, 0)
        }

        {
            if (slotSet != 0) {
                assembly {
                    tstore(slotSet, amountSpecified)
                }
            }
        }
    }
}
