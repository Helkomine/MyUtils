// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract ERC7229Proxy {
    bytes32 private constant PROXY_SLOT = 0x881d0b73263d45454e7a85c9f11c3c8199fe13320d9c33bb995d0d9558fd7295;

    constructor(address implementation) payable {
        assembly {
            sstore(PROXY_SLOT, implementation)
        }
    }

    fallback() external payable {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas(), sload(PROXY_SLOT), 0, calldatasize(), 0, 0)
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
