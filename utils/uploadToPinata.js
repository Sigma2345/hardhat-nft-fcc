require('dotenv').config()
const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')
// const pinata = pinataSDK(
//     process.env.PINATA_API_KEY,
//     process.env.PINATA_API_SECRET_KEY
// )

// pinata.testAuthentication().then((result) => {
//     //handle successful authentication here
//     console.log(result);
// }).catch((err) => {
//     //handle error here
//     console.log(err);
// });

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    for(fileindex in files){
        const readableStreamForFiles
            = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        
        try {
            
        } catch (err) {
            
        }
    }
}

module.exports = {
    storeImages 
}
