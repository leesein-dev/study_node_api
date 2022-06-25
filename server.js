// import { mongodbUrl } from './mongodb_data.js';

const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
// 2021년 이후로 설치한 프로젝트는 body-parser 라이브러리가 express에 기본 포함되어 있어
// 따로 npm 설치필요가 없다.
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: true}));

// 몽고 DB 연결
const MongoClient = require('mongodb').MongoClient;
const DB_URL = require('./mongodb_data.js').mongodbUrl;

// ejs 라이브러리 사용 선언
app.set('view engine', 'ejs');

// 저장할 데이터 변수
let db;
// mongodb 패스워드에 @가 들어가는 경우 %40으로 수정할 것
MongoClient.connect(DB_URL, function(err, client){

    if (err) {
        return console.log(err);
    }

    // db 폴더명
    db = client.db('todoapp');

    app.listen(8080, function(){
        console.log('listening on 8080')
    });

    // db 폴더 안 collection에 Object 자료형으로 저장
    app.post('/add', function(req, res){
        
        db.collection('counter').findOne({name : '총 게시물 갯수'}, function(err, result) {
            let totalPostCnt = result.totalPosts;
            db.collection('post').insertOne({_id: totalPostCnt + 1, 제목 : req.body.title, 날짜 : req.body.date}, function(err, result) {
                console.log('저장완료');
                            // update operator : $set (값 변경), $inc (값 증가) 등등...
            db.collection('counter').updateOne({name : '총 게시물 갯수'}, {$inc : {totalPosts : 1}}, function(err, result) {
                if (err) {
                    console.log(err);
                }
            });
            });
        });

        res.send('전송완료');
    });

    app.get('/list', function(req, res){
        db.collection('post').find().toArray(function(err, result){
            res.render('list.ejs', { posts : result });
        });
        // db.collection('post').find().toArray(function(err, result){
        //     res.jsonp(result);
        // });
        
    });

});

app.get('/pet', function(req, res){
    res.send('펫용품을 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', function(req, res){
    res.send('뷰티용품 사세요.');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
})
