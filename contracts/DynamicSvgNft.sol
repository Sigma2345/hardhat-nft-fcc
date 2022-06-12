// Dynamic svg Nft
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0 ; 

import "@openzeppelin/contracts/token/ERC721/ERC721.sol" ; 

contract DynamicSvgNft is ERC721 {

    //mint 
    //store SVG info somewhere
    //some logic to tell "show X image " or show y image 

    uint256 private s_tokenCounter ;

    constructor() ERC721("Dynamic SVG NFT", "DNS"){
        s_tokenCounter = 0 ;
    }

    function mintNft() public{
        _safeMint(msg.sender, s_tokenCounter); 
        s_tokenCounter += 1 ; 
    }

}
