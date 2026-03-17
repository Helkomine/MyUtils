// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

abstract contract UniswapV2Module {
    function _balanceOf(IERC20 token, address viewer) internal virtual returns (uint256) {
        uint256 balance;
        assembly {
          
        }
        
        return balance;
    }
    
    function _v2SwapExactIn(bytes calldata param) internal virtual {
        // bytes2 command
        uint256 factoryId;
        address tokenIn;
        address tokenOut;
        uint256 amountOutMin;
        uint8 slotSet;

        assembly {
            factoryId := calldataload(add(param.offset, 0x20))
            tokenIn := calldataload(add(param.offset, 0x40))
            tokenOut := calldataload(add(param.offset, 0x60))
            amountOutMin := calldataload(add(param.offset, 0x80))
            slotSet := calldataload(add(param.offset, 0xa0))
        }

        address pool;
        {
            address factory;
            bytes memory factories = FACTORIES_PACKED;

            assembly {
                factory := shr(
                    mload(
                        add(
                            mul(
                                factoryId,
                                20
                            ),
                            add(
                                data,
                                32
                            )
                        )
                    )
                )
            }

            pool = IUniswapFactory(factory).getPair(tokenIn, tokenOut);
            if (pool == address(0)) revert();
        }

        uint256 amount0;
        uint256 amount1;
        {
            bool oneForZero = tokenOut < tokenIn;
            uint256 balanceIn = _balanceOf(tokenIn, pool);
            uint256 reserveIn;
            IUniswapV2(pool).getReserves();
            assembly {
                let pointer := mload(0x40)
                returndatacopy(pointer, 0, 64)
                reserveIn := mload(add(pointer, shl(5, oneForZero)))
                let amountIn := sub(balanceIn, reserveIn)
                if lt(balanceIn, amountIn) {
                    revert(0, 0)
                }
                
                
            }
        }

        IUniswap(pool).swap(amount0, amount1, address(this), new bytes(0));

        if (amount0 > 0) require(amount0 >= amountOutMin);
        if (amount1 > 0) require(amount1 >= amountOutMin);
    }
}
