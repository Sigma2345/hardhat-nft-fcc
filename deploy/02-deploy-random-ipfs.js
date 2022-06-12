const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require('../utils/verify')
const { storeImages } = require('../utils/uploadToPinata')

const imagesLocation = "./images/randomNft"

module.exports = async function ({
    getNamedAccounts,
    deployments
}) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris
    //get Ipfs hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 1.with our own Ipfs node-> refer to docs
    // 2. pinata
    // nft.storage
    
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        //get mocks 
        const VRFCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscirption()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId 
    }
    log('------------------------------------------------------------')
    const _args = 
        [
            vrfCoordinatorV2Address, 
            subscriptionId,
            networkConfig[chainId]["gasLane"],
            networkConfig[chainId]["callBackGasLimit"],
         //token URIs
            networkConfig[chainId].mintFee
    ]
}

async function handleTokenUris() {
    tokenUris = []

    //store image in IPFS
    //store metadata in IPFS



    return tokenUris 
}

module.exports.tags = ["all", "randomipfs", "main"]
