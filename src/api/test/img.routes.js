import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
const uuidv4 = require('uuid/v4');
const test = express.Router();
// User model
//let User = require('../models/User');
import Test from '../../models/imgTest';
const DIR = './uploads/';
const fs = require('fs');
/*
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});*/
fs.readdir(DIR, (error) => {
    if (error) {
        console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync(DIR);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});



test.post('/upload-images', upload.array('imgCollection', 6), (req, res, next) => {
    console.log("test.post('/upload-images' called");
    const reqFiles = [];
    const url = req.protocol + '://' + req.get('host');
    console.log(url, '***');
    for (var i = 0; i < req.files.length; i++) {
        reqFiles.push(url + '/uploads/' + req.files[i].filename)
    }

    const user = new Test({
        _id: new mongoose.Types.ObjectId(),
        imgCollection: reqFiles
    });

    user.save().then(result => {
        res.status(201).json({
            message: "Done upload!",
            userCreated: {
                _id: result._id,
                imgCollection: result.imgCollection
            }
        })
    }).catch(err => {
        console.log(err),
            res.status(500).json({
                error: err
            });
    })
});

test.get("/", (req, res, next) => {
    Test.find().then(data => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data
        });
    });
});

export default test;