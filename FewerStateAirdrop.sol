// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract FewerStateAirdrop is ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_NULLIFIER = 131071;
    IERC20 public token;
    bytes32 public root;
    uint256[512] public bitmapNullifiers;

    error InvalidProof();
    error TooLargeNullifier(uint256 nullifier);
    error NullifierExisted(uint256 nullifier);

    event Claimed(address indexed recipient, uint256 indexed amount);

    struct Claimer {
        address recipient;
        uint256 amount;
    }

    constructor (IERC20 _token, bytes32 _root) {
        token = _token;
        root = _root;
    }

    function claim(Claimer[100] calldata claimer, bytes32[] calldata proof, uint256 nullifier) external nonReentrant {
        // revert if nullifier is greater than MAX_NULLIFIER
        if (nullifier > MAX_NULLIFIER) revert TooLargeNullifier(nullifier);

        // revert if the given nullifier exists
        if (_isNullifierExist(nullifier)) revert NullifierExisted(nullifier);

        // revert if proof is invalid
        if (!MerkleProof.verify(proof, root, _hashLeaf(claimer, nullifier))) revert InvalidProof();

        // mark that the nullifier already exists.
        _markNullifierExist(nullifier);

        // make payments to recipients on the list
        _cashout(claimer);
    }

    function _hashLeaf(Claimer[100] calldata claimer, uint256 nullifier) private pure returns (bytes32 leaf) {
        bytes32 batchHash = keccak256(abi.encode(claimer));
        leaf = keccak256(abi.encodePacked(batchHash, nullifier));
    }

    function _isNullifierExist(uint256 nullifier) private view returns (bool isExist) {
        uint256 bitmapNullifier = bitmapNullifiers[nullifier >> 8];
        isExist = (bitmapNullifier & (1 << (uint256(uint8(nullifier))))) != 0;
    }

    function _markNullifierExist(uint256 nullifier) private {
        uint256 bitmapNullifier = bitmapNullifiers[nullifier >> 8];
        bitmapNullifiers[nullifier >> 8] = bitmapNullifier | (1 << (uint256(uint8(nullifier))));
    }

    function _cashout(Claimer[100] calldata claimer) private {
        for (uint256 i = 0 ; i < 100 ; ) {
            token.safeTransfer(claimer[i].recipient, claimer[i].amount);
            emit Claimed(claimer[i].recipient, claimer[i].amount);
            unchecked { ++i; }
        }
    }
}
