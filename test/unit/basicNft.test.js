const { ConsoleErrorListener } = require('antlr4/error/ErrorListener')
const { assert, expect } = require('chai')
const { deployments, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')


!developmentChains.includes(network.name)
    ?describe.skip
    :describe("basicNft",
    function () {
    
        let deployer, basicNft

        beforeEach(async function () {
            const { deploy, log } = deployments
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["basicNft"])
            basicNft = await ethers.getContract('BasicNFT')

        })

        describe("constructor", function () {
            
            it("should set token token counter as 0", async function () {
                console.log("1")
                const tokenCounter = await basicNft.getTokenCounter()
                console.log("2")
                assert.equal(tokenCounter.toString(), "0")
            })
        })

        describe("total functionality", function () {
            it('should allow users to mintNFT and update properly',
                async function () {
                    const txResponse = await basicNft.mintNft()
                    await txResponse.wait(1)
                    const tokenURI = await basicNft.tokenURI(0)
                    const tokenCounter = await basicNft.getTokenCounter()

                    expect(tokenCounter.toString()).to.equal("1")
                    expect(await basicNft.TOKEN_URI()).to.equal(tokenURI)
            })
        })
})
