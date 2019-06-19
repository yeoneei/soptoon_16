var express = require('express');
var router = express.Router();

const db = require('../../module/pool');
const upload = require('../../config/multer');
const moment = require('moment');
const defaultRes = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage')

router.get('/:wtIdx', async (req, res) => {

    const getEpisodesListQuery = `SELECT * FROM episode WHERE wt_idx = ${req.params.wtIdx} ORDER BY epi_written_time DESC`;
    const getEpisodesListResult = await db.queryParam_None(getEpisodesListQuery);
    //쿼리문의 결과가 실패이면 null을 반환한다

    if (!getEpisodesListResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.GET_EPISODE_LIST_FAIL));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.GET_EPISODE_LIST_SUCCESS, getEpisodesListResult));
    }
})

router.post('/', upload.fields([{ name: 'thumb' }, { name: 'cuts' }]), async (req, res)=> {

    const postEpisodesQuery = `INSERT INTO episode (wt_idx, epi_title, epi_thumb, epi_view_count, epi_written_time) VALUES (?,?,?,0,?)`;
    const postEpisodesResult = await db.queryParam_Arr(postEpisodesQuery, [req.body.wtIdx, req.body.epiTitle, req.files.thumb[0].location, moment().format('YYYY-MM-DD HH:mm:ss')]);

    if(!postEpisodesResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EPISODE_FAIL));
    } else {

    const postCutQuery = `INSERT INTO cut (epi_idx, cut) VALUES (?, ?)`;


    for(let i = 0; i<req.files.cuts.length;i++){
        const postCutResult = await db.queryParam_Arr(postCutQuery, [postEpisodesResult.insertId, req.files.cuts[i].location]);

        if(!postCutResult){
            console.log("Fail cut upload" + (i+1));    
        } else {
            console.log("Success cut upload" + (i+1));  
        }
    }

    
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_EPISODE_SUCCESS));
    }
})

router.delete('/:epiIdx', async(req, res)=>{

    const deleteEpisodeQuery = `DELETE FROM episode WHERE epi_idx = ${req.params.epiIdx}`;
    const deleteEpisodeResult = await db.queryParam_None(deleteEpisodeQuery);

    if(!deleteEpisodeResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DELETE_EPISODE_FAIL));
    }else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.DELETE_EPISODE_SUCCESS));
    }

})

router.get('/selectedEpi/:epiIdx', async(req, res)=>{
    const getCutsQuery = `SELECT * FROM cut WHERE epi_idx = ${req.params.epiIdx}`;
    const getCutsResult = await db.queryParam_None(getCutsQuery);

    if(!getCutsResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.GET_EPISODE_CUTS_FAIL));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK,resMessage.GET_EPISODE_CUTS_SUCCESS, getCutsResult));
    }
})


module.exports = router;