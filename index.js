require('dotenv/config')

const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express()
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '')
    }
})

const upload = multer({storage}).single('image')

app.post('/upload', upload, (req, res) => {

    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer
    }

    s3.upload(params, (error, data) => {
        if(error){
            res.status(500).send(error)
        }

        res.status(200).send(data)
    })
});

app.delete('/', (req, res) => {
    console.log('req.body', req.body);
    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.key // key is the name of the image/object NOT the whole url
        // https://bucket-name.s3.amazonaws.com/8dd3b4a3-0337-4a3f-9a18-1a06e8dd0756.jpg
      }, function (err, data){
          if (err) return res.json(err);
          return res.json(data);
      });
});

app.listen(port, () => {
    console.log(`Server is up at ${port}`)
});