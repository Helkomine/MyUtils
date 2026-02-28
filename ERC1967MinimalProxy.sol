// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract ERC1967MinimalProxy {
    // bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
    bytes32 private constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    constructor(address implementation) payable {
        assembly {
            sstore(IMPLEMENTATION_SLOT, implementation)
        }
    }

    fallback() external payable {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas(), sload(IMPLEMENTATION_SLOT), 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch success
            case 0 {
                revert(0, returndatasize()) 
            }
            default { 
                return(0, returndatasize()) 
            }
        }
    }
}
