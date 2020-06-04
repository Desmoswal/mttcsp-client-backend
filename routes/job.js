const express = require("express");
const multer = require('multer')
const router = express.Router();
const Job = require('../models/job');
const Language = require('../models/language');
const checkAuth = require('../middleware/check-auth')
//const gc = require('../helpers/google-cloud')

const {Storage} = require("@google-cloud/storage")
const util = require('util')

const gc = new Storage({
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
})
let bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.memoryStorage()

/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if(isValid){
            error = null;
        }
        cb(error, "./files");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name+'-'+Date.now()+"."+ext);
    }
})*/

router.get("", checkAuth, (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const jobQuery = Job.find({clientId: req.userData.userId});
    let fetchedJobs;

    if(pageSize && currentPage){
        jobQuery.skip(pageSize * (currentPage-1)).limit(pageSize);
    }
    jobQuery.then(documents => {
        fetchedJobs = documents;
        return Job.count({clientId: req.userData.userId});
    }).then(count => {
        res.status(200).json({
            message: "Jobs fetched successfully",
            jobs: fetchedJobs,
            maxJobs: count
        });
    }).catch(error => {
        res.status(500).json({
            message: error.message
        })
    });
  });

router.post('', checkAuth, multer({storage: storage}).array("file"), (req, res, next) => {
    console.log('POST RECEIVED')
    //console.log(req.files)
    const job = new Job({
        clientId: req.userData.userId,
        //folder: "empty",//publicUrl,//req.body.folder,
        sourceLang: req.body.sourceLang,
        reqLang: req.body.reqLang,
        status: "CREATED",//req.body.status,
        employeeId: '',
        creationDate: req.body.creationDate,
        startDate: '',
        completionDate: '',
        reviewBy: ''
    })

    const folder = job.id;
    job.folder = folder;

    req.files.forEach(file => {
        console.log(file.originalname)
        let publicUrl = '';
        const blob = gc.bucket(bucketName).file(folder+"/" + "original_" + file.originalname);
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
    
            console.log(publicUrl)
            
            })
        blobStream.end(file.buffer);
    })

    job.save().then(createdjob =>{
        res.status(201).json({
            message: "job created",
            job: {
                ...createdjob,
                id: createdjob._id
            }
        });
    }).catch(error => {
        res.status(500).json({
            message: error
        })
    });

});

router.delete('/:id',  (req, res) =>{
    Job.deleteOne({_id: req.params.id}).then(result =>{
        if(result.n > 0){
            res.status(200).json({message: 'job deleted'});
        } else {
            res.status(401).json({message: 'Not authorized'});
        }
    });
});

router.get('/languages', (req,res)=>{
    Language.find().then(languages => {
        res.status(200).json({
            languages: languages
        })
    }).catch(error => {
        res.status(500).json({
            message: error.message
        })
    })
})
/*
router.put('/:id', checkAuth, multer({storage: storage}).single("image"), (req, res) => {
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol +"://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
    }
    const job = new job({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    })
    job.updateOne({_id: req.params.id, creator: req.userData.userId}, job).then(result => {
        if(result.nModified > 0){
            res.status(200).json({message: 'Update successful'});
        } else {
            res.status(401).json({message: 'Not authorized'});
        }
        
    }).catch(error => {
        res.status(500).json({
            message: "Couldn't update job!"
        })
    })
});
*/

router.get('/:id', (req, res) => {
    Job.findById(req.params.id).then(job => {
        if(job) {
            res.status(200).json(job);
        }else{
            res.status(404).json({message: 'job not found'});
        }
    }).catch(error => {
        res.status(500).json({
            message: "Catching job failed"
        })
    })
})

module.exports = router