/**
date: June 5, 2019
@Author: Ji yoon, Park
Title: Server architecture for getting user's data from AWS RDS database using MYSQL platform for login/ SOPT_24 Seminar6 homework
 */

var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const utils = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const responseMessage = require('../../module/responseMessage');
const db = require('../../module/pool');

//URL: url/user/signin (post)
router.post('/', async (req, res) => {
    if(!req.body.id||!req.body.password){
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST), responseMessage.NULL_VALUE);
    }else{
        const userInfo = {
            id: req.body.id,
            password: req.body.password,
            salt:null,
            hashedPassword: null
        }
        //hash the password
        //userInfo.salt 에 db에서 salt 값 꺼내와서 저장
        const selectSaltQuery='SELECT salt FROM user WHERE id=?';
        const selectSaltResult=await db.queryParam_Parse(selectSaltQuery,userInfo.id);
        if(!selectSaltResult){
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST), responseMessage.NULL_VALUE);
        }
        else{
            console.log('↓dbsalt: ');
            userInfo.salt=selectSaltResult[0].salt;
        }

        //hash 진행할 때 db salt 를 기준으로 req.password랑 hash 하기
        const hashed = await crypto.pbkdf2(userInfo.password, userInfo.salt, 1000, 32, 'SHA512');
        
        //db에서 hashedPassword 값 꺼내오기
        //query
        const selectQuery='SELECT hashed_password FROM user WHERE id=?';
        const selectResult = await db.queryParam_Parse(selectQuery,userInfo.id);
            
        console.log("↓ userInfo.hashedPw");
        console.log(hashed.toString('base64'));
            if(selectResult[0].hashed_password==hashed.toString('base64')){
                res.status(200).send(utils.successTrue(statusCode.OK, responseMessage.LOGIN_SUCCESS));
            }
            else{
                res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.LOGIN_FAIL));
        }
    }
});


module.exports = router;