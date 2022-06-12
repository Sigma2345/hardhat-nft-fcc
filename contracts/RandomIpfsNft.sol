// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7 ;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

error RandomIpfsNft__NeedMoreETH() ; 
error RandomIpfsNft__RangeOutOfBounds() ; 
error RandomIpfsNft__TransferFailed() ; 

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //when we trigger mint NFt , call chainlink VRF for random number
    //using that number , will get random nft
    //pug , shiba inu , st.bernard

    //pug super rare
    //shiba inu sort of rare
    // st.bernard common

    //users have to pay to mint an nft
    //owner of contract can withdraw

    //mapping request ids to msg.sender so that when chainlink keepers call func then 
    // nft sent to requesting client

    //type declaration
    enum Breed{
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }


    VRFCoordinatorV2Interface private immutable i_VRFCoordinatorV2 ; 
    uint64 private immutable i_subscriptionId ; 
    bytes32 private immutable i_gasLane; 
    uint32 private immutable i_callBackGasLimit ; 
    uint16 private constant REQUEST_CONFIRMATIONS = 3 ; 
    uint32 private constant NUM_WORDS = 1 ; 

    //VRF helpers
    mapping(uint256 => address) s_requestIdToSender ; 

    //NFT variables
    uint256 private s_tokenCounter ;
    uint256 internal constant MAX_CHANCE_VALUE = 100 ; 
    string [] internal s_dogTokenURIs ; 
    uint256 internal immutable i_mintFee ; 

    //events
    event NftRequested(
        uint256 requestId, 
        address requester
    );

    event NftMinted(
        Breed dogBreed,
        address minter
    ); 


    constructor(
        address _VRFCoordinatorV2,
        uint64 subscriptionId , 
        bytes32 gasLane, 
        uint32 callBackGasLimit,
        string[3] memory dogTokenURIs, 
        uint256 mintFee
        ) VRFConsumerBaseV2(_VRFCoordinatorV2)
        ERC721("Random IPFS NFT", "RIN"){
        i_VRFCoordinatorV2 = VRFCoordinatorV2Interface(_VRFCoordinatorV2) ;
        i_subscriptionId =  subscriptionId ; 
        i_gasLane = gasLane ; 
        i_callBackGasLimit = callBackGasLimit ;  
        s_tokenCounter = 0 ;
        s_dogTokenURIs = dogTokenURIs ;  
        i_mintFee = mintFee ; 
    }

    function requestNft()public payable returns(uint256 requestId){
        
        if(msg.value < i_mintFee){
            revert RandomIpfsNft__NeedMoreETH(); 
        }

        requestId = i_VRFCoordinatorV2.requestRandomWords(
            i_gasLane ,
            i_subscriptionId, 
            REQUEST_CONFIRMATIONS, 
            i_callBackGasLimit ,
            NUM_WORDS
        ); 
        s_requestIdToSender[requestId] = msg.sender ; 
        emit NftRequested(requestId, msg.sender) ;
    }

    function withdraw() public onlyOwner   {
        uint256 amount = address(this).balance ; 
        (bool success, ) = payable(msg.sender).call{value: amount}("") ;

        if(!success){
            revert RandomIpfsNft__TransferFailed() ; 
        }
    }



    function fulfillRandomWords(
        uint256 requestId ,
        uint256[] memory randomWords
    )
    internal override {
        address dogOwner = s_requestIdToSender[requestId] ;
        uint256 newTokenId = s_tokenCounter ;  
        uint256 moddedRng = randomWords[0]%MAX_CHANCE_VALUE ; 
        Breed dogBreed = getBreedFromModdedRng(moddedRng) ; 
        s_tokenCounter = s_tokenCounter + 1 ; 
        _safeMint(dogOwner, newTokenId) ; 
        _setTokenURI(newTokenId, s_dogTokenURIs[uint256(dogBreed)]); 
        emit NftMinted(dogBreed, dogOwner); 
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns(Breed){
        uint256[3] memory chanceArray = getChanceArray(); 
        for(uint256 i = 0 ; i < chanceArray.length ; i++ ){
            if(moddedRng < chanceArray[i]){
                return Breed(i) ;
            }
        }  
        revert RandomIpfsNft__RangeOutOfBounds() ; 
    }

    function getChanceArray() public pure returns(uint256[3] memory){
        return [10, 30, MAX_CHANCE_VALUE] ; 
    }

    function getMintFee() public view returns(uint256){
        return i_mintFee ; 
    }

    function getDogTokenUri(uint256 index) public view returns(string memory){
        return s_dogTokenURIs[index] ; 
    }

    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter ; 
    }

    function get_requester(uint256 requestId) public view returns(address){
        return s_requestIdToSender[requestId] ; 
    }
}
