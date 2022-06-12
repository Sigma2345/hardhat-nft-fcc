const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require('../utils/verify')
const { storeImages, storeTokenUriMetadata } = require('../utils/uploadToPinata')

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "", 
    image: "",
    attributes: {
        trait_type: "Cuteness", 
        value: 100
    }, 
}

let tokenUris =
    [
        'ipfs://QmS4PCF2yTBxM723HuBQxk8ZXZzPKr8GcspYxn39xWeAk6',
        'ipfs://Qmf57mX6ZLKEGCxFPmEzs1aZcV9KUV3MEsKjnBbZGC96cc',
        'ipfs://QmV1SJowR9W6ZgaoVdfYJU6YBNcCPL5MQ6WEpP84ohpbYt'
    ]

const FUND_AMOUNT = ethers.utils.parseEther("10")

module.exports = async function ({
    getNamedAccounts,
    deployments
}) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    //get Ipfs hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 1.with our own Ipfs node-> refer to docs
    // 2. pinata
    // nft.storage
    
    let vrfCoordinatorV2Address, subscriptionId

    if (chainId === 31337) {
        //get mocks 
        const VRFCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        // log('Coordinator Mocks Received')
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait()
        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId 
    }
    log('------------------------------------------------------------')
    // await storeImages(imagesLocation)
    const _args =
        [
            vrfCoordinatorV2Address, 
            subscriptionId,
            networkConfig[chainId].gasLane,
            networkConfig[chainId].callbackGasLimit,
            tokenUris,
            networkConfig[chainId].mintFee
        ]
    
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: _args,
        log: true, 
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("-------------------------------------------------------")

    if (!developmentChains.includes(network.name)
        && process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(randomIpfsNft.address, _args)
        log("Contract Verified")
        log('----------------------------------')
    }
}

async function handleTokenUris() {
    tokenUris = []

    //store image in IPFS
    //store metadata in IPFS
    const {responses: imageUploadResponses, files} = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        //create metadata 
        //upload metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}....`)

        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded !!!! They are:")
    console.log(tokenUris)
    return tokenUris 
}

module.exports.tags = ["all", "randomipfs", "main"]
