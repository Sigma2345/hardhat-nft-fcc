const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require('../utils/verify')
const fs = require('fs')

module.exports = async function ({
    getNamedAccounts,
    deployments
}) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let priceFeedAddress
    const chainId = network.config.chainId

    if (chainId == 31337) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        priceFeedAddress = ethUsdAggregator.address
    }
    else {
        priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }
    log('----------------------------------')
    const lowSvg = fs.readFileSync('./images/dynamicNft/frown.svg', {encoding: "utf8"})
    const highSvg = fs.readFileSync('./images/dynamicNft/happy.svg', {encoding: "utf8"})
    const _args = [priceFeedAddress, lowSvg, highSvg]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer, 
        args: _args, 
        log: true, 
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name)
        && process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, _args)
        log("Contract Verified")
        log('----------------------------------')
    }
}

module.exports.tags = ["all", "main", "dynamicsvg"]
