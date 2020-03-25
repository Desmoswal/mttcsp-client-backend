const {Storage} = require("@google-cloud/storage")
const util = require('util')

const gc = new Storage({
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
})

gc.getBuckets().then(x => {
    console.log(x)
})
let bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME

exports.listFiles = async function () {
// Lists files in the bucket
const [files] = await gc.bucket(bucketName).getFiles();

console.log('Files:');
files.forEach(file => {
    console.log(file.name);
});
}


exports.uploadFile = async function(file, next){
    let publicUrl = '';
    const blob = gc.bucket(bucketName).file("mukogy/" + file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on("error", err => {
        next(err);
    });

    blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        publicUrl = util.format(
         `https://storage.googleapis.com/${bucketName}/${blob.name}`
        );
        //res.status(200).send(publicUrl);
        //console.log(publicUrl)
        return publicUrl
    });
    
    blobStream.end(file.buffer);
}

//uploadFile().catch(console.error);
// [END storage_upload_file]

