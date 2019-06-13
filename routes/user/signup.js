/**
date: June 5, 2019
@Author: Ji yoon, Park
Title: Create a server & post the user's data to the AWS RDS database using MYSQL platform for signup/ SOPT_24 Seminar6 homework
 */

var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const utils = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const responseMessage = require('../../module/responseMessage');
const db = require('../../module/pool');

//URL: url/user/signup (post)
router.post('/', async (req, res) => {
    if(!req.body.id || !req.body.password || !req.body.name || !req.body.nickname){
        console.log(req.body.password);
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
    }
    else{
        const userInfo={
            id:req.body.id,
            password:req.body.password,
            name:req.body.name,
            nickname:req.body.nickname,
            salt:null
        }

        //Hash the password
        const salt = await crypto.randomBytes(32);
        userInfo.salt = salt.toString('base64')
        const hashedPassword = await crypto.pbkdf2(userInfo.password, userInfo.salt, 1000, 32, 'SHA512');
        userInfo.password = hashedPassword.toString('base64');
        
        
        /*db에 저장 하기 전에 출력을 먼저 해보자
            console.log("id: " , userInfo.id);
            console.log("name: " , userInfo.name);
            console.log("password: " , userInfo.password);
            console.log("nickname: " , userInfo.salt);
            console.log("hashedPassword: " ,userInfo.hashedPassword);*/

        //query 
        console.log('↓ userInfo.salt');
        console.log(userInfo.salt);

        const insertQuery = 'INSERT INTO user(id,name,nickname,hashed_password,salt) VALUES(?,?,?,?,?)';
        const insertResult = await db.queryParam_Parse(insertQuery, [userInfo.id, userInfo.name, userInfo.nickname,userInfo.password,userInfo.salt]);

        if(!insertResult){
            res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.NO_USER));
            
        }
        else{
            res.status(200).send(utils.successTrue(statusCode.OK, responseMessage.CREATED_USER));
            
        }
    }
});

module.exports = router;