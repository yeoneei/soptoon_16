var express = require('express');
var router = express.Router();
var pool = require('../../config/dbConfig');
const crypto = require('crypto-promise');
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const util = require('../../module/utils'); 
const upload = require('../../config/multer');
const moment = require('moment');

/* GET home page. */
router.use('/like',require('./like'));
router.use('/main',require('./main'));

router.post('/', upload.single('thumb'), async(req,res)=>{
  const {title, author, category, like} = req.body;
  const thumb  = req.file.location;

  console.log(thumb);
  //널 처리 하기
  const webtoonInsertQuery = "INSERT INTO spotoon.webtoon (wt_title,wt_author, wt_thumbnail,wt_like,wt_category) VALUES (?,?,?,?,?)";
  let webtoonInsertResult;
  try{
    var connection = await pool.getConnection();
    webtoonInsertResult = await connection.query(webtoonInsertQuery,[title, author,thumb,like,category]);
  }catch(err){
      console.log(err);
      connection.rollback(()=>{});
      res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.WEBTOON_SAVE_FAILE));
  }finally{
      pool.releaseConnection(connection);
      res.status(200).send(util.successTrue(statusCode.OK,resMessage.WEBTOON_SAVE_SUCCESS, webtoonInsertResult));
  }
})

router.put('/:wt_idx', upload.single('thumb'), async(req,res)=>{
  const {title, author, category, like} = req.body;
  var thumb;
  if(req.file != undefined){
    thumb = req.file.location;
  }else{
    thumb = undefined;
  }
  console.log(thumb);
  const {wt_idx} = req.params;
  let getWebtoonResult;
  try{
    var connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const getWebtoonQuery = "SELECT * from spotoon.webtoon WHERE wt_idx = ?";
    getWebtoonResult = await connection.query(getWebtoonQuery,[wt_idx]);
    const re ={
      title : title || getWebtoonResult[0].wt_title,
      author : author || getWebtoonResult[0].wt_author,
      thumb : thumb || getWebtoonResult[0].wt_thumbnail,
      like : like || getWebtoonResult[0].wt_like,
      category : category || getWebtoonResult[0].wt_category,
    }
    console.log(re);
    const reviseWebttonQuery = "UPDATE spotoon.webtoon SET wt_title = ?, wt_author = ?, wt_thumbnail = ?, wt_like = ?, wt_category = ? WHERE wt_idx = ?";
    const reviseWebtoonResult = await connection.query(reviseWebttonQuery,[re.title,re.author,re.thumb,re.like, re.category,wt_idx]);
    await connection.commit();

  }catch(err){
    console.log(err);
    connection.rollback(()=>{});
    res.status(200).send(util.successFalse(statusCode.DB_ERROR,resMessage.WEBTOON_REVISE_FAILE));
  }finally{
    pool.releaseConnection(connection);
    res.status(200).send(util.successTrue(statusCode.OK,resMessage.WEBTOON_REVISE_SUCCESS,));
}
  
})

module.exports = router;
