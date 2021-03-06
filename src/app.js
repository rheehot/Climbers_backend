require('dotenv').config();
const express=require('express');
const cors = require('cors');
const cookieParser=require('cookie-parser');
const morgan=require('morgan');
const path=require('path');
const session=require('express-session');
//const flash=require('connect-flash');
//const passport=require('passport');

//const {sequelize}=require('./models');
//const passportConfig=require('./passport');
const mongoose = require("mongoose");

import api from './api';
import jwtMiddleware from './lib/jwtMiddleware';
const { MONGO_URI }=process.env;
mongoose
    .connect(MONGO_URI, {useNewUrlParser: true, useFindAndModify: false})
    .then(()=>{
        console.log('Connected to MongoDB');
        //createFakeData();
    })
    .catch(e=>{
        console.error(e);
    });


const app=express();
//sequelize.sync();
//passportConfig(passport);

app.set('port', process.env.PORT || 8001);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', express.static(path.join(__dirname, '/../build')));
app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(jwtMiddleware);

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
//app.use(flash());
//app.use(passport.initialize());
//app.use(passport.session());

// CORS 설정
app.use(cors());

app.use('/api', api);

app.use('/', express.static(path.join(__dirname, 'build')));

app.use( (req, res)=> {
    //not found 이고, 주소가 /api 로 시작하지 않는 경우
    //if(res.status === 404 && req.path.indexOf('/api') !== 0){
    if(res.status === 404 || req.path.indexOf('/api') !== 0){
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

app.use((req, res, next)=>{
    const err=new Error('Not Found');
    err.status=404;
    next(err);
});


app.use((err, req, res)=>{
    res.locals.message=err.message;
    res.locals.error=req.app.get('env')==='development' ? err: {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중');
});