/**
date: June 6, 2019
@Author: Ji yoon, Park
Title: Server architecture from AWS RDS database using MYSQL platform for COMMENTS / SOPT_24 Seminar6 homework
 */

var express = require('express');
var router = express.Router();
const async = require('async');
const crypto = require('crypto-promise');
const moment = require('moment');

const utils = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const responseMessage = require('../../module/responseMessage');
const db = require('../../module/pool');
const upload = require('../../config/multer');
const pool = require('../../config/dbConfig');

/* 1. Insert comments (댓글 등록)
URL: url/comments (POST)
Body : epi_idx, user_idx, cmt_thumbnail, cmt_txt
 */
router.post('/', upload.fields([{
    name: 'cmt_thumbnail'
}]), async (req, res, next) => {
    if (!req.body.epi_idx || !req.body.user_idx || !req.body.cmt_txt) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST), responseMessage.NULL_VALUE);
    } else {
        const cmtInfo = {
            epi_idx: req.body.epi_idx,
            user_idx: req.body.user_idx,
            cmt_thumbnail: null,
            cmt_txt: req.body.cmt_txt,
            cmt_time: null
        }

        //1) moment 모듈을 이용해 댓글 작성 시간 
        const cmt_time = moment().format('YYYY-MM-DD HH:mm:ss');
        cmtInfo.cmt_time = cmt_time;
        //console.log('↓cmtInfo.cmt_time : ');
        //console.log(cmtInfo.cmt_time);

        //2) thumbnail 사진 받아오기
        const cmt_thumbnail = req.files.cmt_thumbnail[0].location;
        cmtInfo.cmt_thumbnail = cmt_thumbnail;
        //console.log('↓cmtInfo.cmt_thumbnail : ');
        //console.log(cmtInfo.cmt_thumbnail);

        //3) db에 저장하기
        const cmtInsertQuery = 'INSERT INTO comments(epi_idx,user_idx,cmt_thumbnail,cmt_txt,cmt_time) VALUES (?,?,?,?,?)';
        const cmtInsertResult = await db.queryParam_Parse(cmtInsertQuery, [cmtInfo.epi_idx, cmtInfo.user_idx, cmtInfo.cmt_thumbnail, cmtInfo.cmt_txt, cmtInfo.cmt_time]);

        if (!cmtInsertResult) {
            res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.SAVE_FAIL));
        } else { //if success
            res.status(200).send(utils.successTrue(statusCode.OK, responseMessage.SAVE_SUCCESS));
        }


    }
});


/* 2. Insert comments (댓글 조회)
URL: url/comments/{epi_idx} (GET)
 */
router.get('/:epi_idx', async (req, res, next) => {

    const epi_idx = req.params.epi_idx;
    let selectcommentResult;
    //console.log('↓epi_idx : ');
    //console.log(epi_idx);
    try {
        var connection = await pool.getConnection();
        await connection.beginTransaction();
        const selectcommentQuery = 'SELECT cmt_idx,user_idx,cmt_thumbnail,cmt_txt,cmt_time FROM comments,episode  WHERE comments.epi_idx=?';
        selectcommentResult = await db.queryParam_Parse(selectcommentQuery, epi_idx);

    } catch (err) {
        console.log(err);
        connection.rollback(() => {});
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST), responseMessage.READ_FAIL);
    } finally {
        res.status(200).send(utils.successTrue(statusCode.OK), responseMessage.READ_SUCCESS);
        const resInfo = selectcommentResult;
        res.body = resInfo;
        console.log(selectcommentResult);
    }
});


/* 3. Insert comments (댓글 수정)
URL: url/comments/{cmt_idx} (PUT)
Body: cmt_txt,cmt_thumbnail
 */
router.put('/:cmt_idx', upload.single('cmt_thumbnail'), async (req, res, next) => {
    const cmt_idx = parseInt(req.params.cmt_idx);
    let revisedCommentsResult;


    const cmtInfo = {
        cmt_txt: req.body.cmt_txt,
        cmt_time: null,
        cmt_thumbnail: req.file.location
    }

    //1) moment 모듈을 이용해 댓글 수정 시간 기록 
    const cmt_time = moment().format('YYYY-MM-DD HH:mm:ss');
    cmtInfo.cmt_time = cmt_time;

    console.log('↓cmtInfo.cmt_time : ');
    console.log(cmtInfo.cmt_time);

    try {
        // var connection=await pool.getConnection();
        //await connection.beginTransaction();

        const revisedCommentsQuery = 'UPDATE comments SET cmt_txt=? ,cmt_time=?, cmt_thumbnail=? WHERE cmt_idx=?';
        revisedCommentsResult = await db.queryParam_Parse(revisedCommentsQuery, [cmtInfo.cmt_txt, cmtInfo.cmt_time, cmtInfo.cmt_thumbnail, cmt_idx]);

        // await connection.commit();
    } catch (err) {
        console.log(err);
        //connection.rollback(()=>{});
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR), responseMessage.SAVE_FAIL);
    } finally {
        // pool.releaseConnection(connection);
        res.status(200).send(utils.successFalse(statusCode.OK), responseMessage.SAVE_SUCCESS);
    }

});


/* 4. Delete comments (댓글 삭제)
URL: url/comments/{cmt_idx} (DELETE)
 */
router.delete('/:cmt_idx', async (req, res, next) => {
    const cmt_idx = parseInt(req.params.cmt_idx);
    let cmtdeleteQuery;

    try {
        cmtdeleteQuery = 'DELETE FROM comments WHERE cmt_idx=?';
        cmtdeleteResult = await db.queryParam_Parse(cmtdeleteQuery, cmt_idx);

        // await connection.commit();
    } catch (err) {
        console.log(err);
        //connection.rollback(()=>{});
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR), responseMessage.CMT_DELETE_FAIL);
    } finally {
        // pool.releaseConnection(connection);
        res.status(200).send(utils.successFalse(statusCode.OK), responseMessage.CMT_DELETE_SUCCESS);
    }

});


module.exports = router;