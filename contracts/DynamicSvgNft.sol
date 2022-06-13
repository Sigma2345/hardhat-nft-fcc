// Dynamic svg Nft
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0 ; 

import "@openzeppelin/contracts/token/ERC721/ERC721.sol" ; 
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";  
import "base64-sol/base64.sol";
contract DynamicSvgNft is ERC721 {

    //mint 
    //store SVG info somewhere
    //some logic to tell "show X image " or show y image 

    uint256 private s_tokenCounter ;
    string private i_lowImageURI ; 
    string private i_highImageURI ;
    string private constant base64EncodedSVGPrefix = "data:image/svg+xml;base64" ;
    AggregatorV3Interface internal immutable i_priceFeed ; 
    mapping (uint256=> int256) s_tokenIdToHighValue ; 


    event CreatedNFT(uint256 indexed tokenId, int256 highValue) ; 


    constructor(
        address priceFeedAdress , 
        string memory lowSvg ,
        string memory highSvg
    ) 
    ERC721("Dynamic SVG NFT", "DNS")
    {
        s_tokenCounter = 0 ;
        i_lowImageURI = svgToImageURI(lowSvg) ;
        i_highImageURI = svgToImageURI(highSvg) ; 
        i_priceFeed = AggregatorV3Interface(priceFeedAdress) ; 
    }

    function svgToImageURI(string memory svg) public pure returns (string memory){
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg)))) ; 
        return string(abi.encodePacked(base64EncodedSVGPrefix, svgBase64Encoded)) ;
    }

    function mintNft(int256 highValue) public{
        s_tokenIdToHighValue[s_tokenCounter] = highValue ; 
        _safeMint(msg.sender, s_tokenCounter); 
        emit CreatedNFT(s_tokenCounter, highValue); 
        s_tokenCounter++ ; 
    }

    function _baseURI() internal pure override returns (string memory){
        return "data:application/json;base64," ; 
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory){
        require(_exists(tokenId), "URI Query for non existent request"); 
        string memory imageURI = i_lowImageURI ;
        (,int256 price, , , ) = i_priceFeed.latestRoundData() ;
        if(price >= s_tokenIdToHighValue[tokenId]){
            imageURI = i_highImageURI ; 
        }  
        return string(
            abi.encodePacked(
                _baseURI(), 
                Base64.encode(
                    bytes(
                        abi.encodePacked('{"name":"',name(),'", "description":"An Nft that changes on the basis of chainlink feed",',
                        '"attributes": [{"trait_type": "coolness", "value":100}],','"image":"', 
                        imageURI, '"}')
                    )
                )
            )
        );        
    }

    function getLowSVG() public view returns(string memory){
        return i_lowImageURI ;
    }

    function getHighSVG() public view returns(string memory){
        return i_highImageURI ;
    }

    function getPriceFeed() public view returns(int256){
        (,int256 price, , , ) = i_priceFeed.latestRoundData() ;
        return  price ;
    }

    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter ; 
    }
    
}
