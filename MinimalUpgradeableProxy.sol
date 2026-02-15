// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

contract MinimalUpgradeableProxy {
    bytes32 private constant PROXY_SLOT = 0x881d0b73263d45454e7a85c9f11c3c8199fe13320d9c33bb995d0d9558fd7295;

    constructor(address proxy) payable {
        assembly {
            sstore(PROXY_SLOT, proxy)
        }
    }

    fallback() external payable {
        assembly {
            let proxy := sload(PROXY_SLOT)
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas(), proxy, 0, calldatasize(), 0, 0)
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
