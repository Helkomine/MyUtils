// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '../v2/IUniswapV2Pair.sol';
import '../v2/IUniswapV2Factory.sol';
import '../factories/FactoriesPacked.sol';

abstract contract UniswapV2Module {
    function _balanceOf(IERC20 token, address viewer) internal virtual returns (uint256) {
        return token.balanceOf(viewer);
    }

    function _skim(bytes calldata param) internal virtual {
        // command
        IUniswapV2Pair pool;
        assembly {
            pool := calldataload(add(param.offset, 0x20))
        }

        pool.skim(address(this));
    }
    
    function _v2SwapExactIn(bytes calldata param) internal virtual {
        // command
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

        uint256 beforeBalanceOut = _balanceOf(IERC20(tokenOut), address(this));

        address pool;
        {
            bytes memory factories = FactoriesPacked.FACTORIES_PACKED;

            address factory;
            assembly {
                factory := shr(96, mload(add(mul(factoryId, 20), add(factories, 32))))
            }

            pool = IUniswapV2Factory(factory).getPair(tokenIn, tokenOut);
            if (pool == address(0)) revert();
        }

        uint256 amount0;
        uint256 amount1;
        {
            bool zeroForOne = tokenOut < tokenIn;
            uint256 balanceIn = _balanceOf(IERC20(tokenIn), pool);
            IUniswapV2Pair(pool).getReserves();
            assembly {
                let pointer := mload(0x40)

                returndatacopy(pointer, shl(5, zeroForOne), 32)
                let reserveIn := mload(pointer)

                let amountIn := sub(balanceIn, reserveIn)
                if lt(balanceIn, amountIn) {
                    revert(0, 0)
                }

                let reserveOut
                
                amountIn := mul(amountIn, 997)
                let amountOut := div(mul(amountIn, reserveOut), add(amountIn, mul(reserveIn, 1000)))
            }
        }

        IUniswapV2Pair(pool).swap(amount0, amount1, address(this), new bytes(0));

        uint256 afterBalanceOut = _balanceOf(IERC20(tokenOut), address(this));

        uint256 delta = afterBalanceOut - beforeBalanceOut;

        // assert
        require(delta >= amountOutMin);

        {
            if (slotSet != 0) {
                assembly {
                    tstore(slotSet, delta)
                }
            }
        }
    }
}
