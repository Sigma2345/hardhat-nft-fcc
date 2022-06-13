const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    //Basic NFT
    const basicNft = await ethers.getContract('BasicNFT', deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index ${(await BasicNft.getTokenCounter()).sub(1).toString()} has tokenURI : ${await basicNft.tokenURI(0)}`)


    //random ipfs nft
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) //5 minutes
        randomIpfsNft.once("NftMinted", async function () {
            resolve()
        })
        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee })
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

        if (network.config.chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFT index ${(await randomIpfsNft.getTokenCounter()).sub(1).toString()} has tokenURI : ${await randomIpfsNft.tokenURI(0)}`)

    //dynamic NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index ${(await dynamicSvgNft.getTokenCounter()).sub(1).toString()} token URI : ${await dynamicSvgNft.tokenURI(0)}`)

}

module.exports.tags = ["all", "mint"]
