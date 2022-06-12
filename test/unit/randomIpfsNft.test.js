//fulfillRandomWords

const {assert,  expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft",
        function () {
        
            let deployer, randomIpfsNft, vrfCoordinatorV2Mock
            let mintFee , user1
            
            beforeEach(async () => {
                let accounts = await ethers.getSigners()
                deployer = accounts[0]
                user1 = accounts[1]
                await deployments.fixture(["mocks", "randomipfs"])
                randomIpfsNft = await ethers.getContract(
                    "RandomIpfsNft",
                    deployer
                )
                vrfCoordinatorV2Mock = await ethers.getContract(
                    "VRFCoordinatorV2Mock", 
                    deployer
                )
                mintFee = await randomIpfsNft.getMintFee()
            })

            describe("requestNft",
                function () {
                    let randomIpfsConnectUser
                    beforeEach(async function () {
                        randomIpfsConnectUser  = 
                            await randomIpfsNft.connect(user1)
                    })

                    it("should not allow to mint for less than mintFee",
                        async function () {
                        
                            await expect(randomIpfsConnectUser.requestNft())
                            .to.be.revertedWith("RandomIpfsNft__NeedMoreETH")
                        })
                    
                    it("should add requester to mapping",
                        async function () {
                            const tx =
                                await randomIpfsConnectUser.requestNft(
                                    {
                                        value: mintFee
                                    }
                                )
                            const txReceipt = await tx.wait(1)
                            // console.log(txReceipt)
                            const requesterAddress = txReceipt.events[1].args.requester
                            await expect(requesterAddress).to.equal(user1.address)
                    })
                })
            
            describe("fulfillRandomWords",
                function () {
                    let randomIpfsConnectUser
                    beforeEach(
                        async function () {
                            randomIpfsConnectUser =
                                await randomIpfsNft.connect(user1)
                            
                        })
                    
                    it("should mint nft after random number returns",
                        async function () {
                        
                            try {
                                const tx = await randomIpfsConnectUser.requestNft({value: mintFee})    
                                const txReceipt = await tx.wait(1)

                                await vrfCoordinatorV2Mock.fulfillRandomWords(
                                    txReceipt.events[1].args.requestId,
                                    randomIpfsNft.address
                                )

                            } catch (e) {
                                console.log("ERROR IN FIRST TRY CATCH")
                                console.log(e) 
                            }

                            await new Promise(async (resolve, reject) => {
                                randomIpfsConnectUser.once("NftMinted",
                                    async () => {
                                        try {
                                            const tokenUri = await randomIpfsNft.tokenURI(0)
                                            const tokenCounter = await randomIpfsNft.getTokenCounter()
                                            assert.equal(tokenUri.toString().includes("ipfs://"), true)
                                            assert.equal(tokenCounter.toString(), "1")
                                            resolve()
                                        } catch (e) {
                                            console.log(e)
                                            reject()
                                        }
                                })
                        })

                    })



            })

    })
