const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require('../utils/verify')

module.exports = async function ({
    getNamedAccounts,
    deployments
}) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log('------------------------------')
    const _args = []
    const basicNft = await deploy("BasicNFT", {
        from: deployer, 
        args: _args,
        log: true, 
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name)
        && process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(basicNft.address, _args)
        log("Contract Verified")
        log('----------------------------------')
    }
}


module.exports.tags = ["basicNft", "all", "main"]
