// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract ERC7229Proxy {
    // keccak256(abi.encode(uint256(keccak256("erc7229.proxy.implementation")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant IMPLEMENTATION_SLOT = 0x571b02ca7aebc754e10140b3ef397ce5bab4701ec2fc4aa59de50ca8613f9200;

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
