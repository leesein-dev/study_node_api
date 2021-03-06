// import { mongodbUrl } from './mongodb_data.js';

const express = require('express');
const app = express();
app.use(express.urlencoded({
    extended: true
}));
// 2021년 이후로 설치한 프로젝트는 body-parser 라이브러리가 express에 기본 포함되어 있어
// 따로 npm 설치필요가 없다.
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: true}));

// 몽고 DB 연결
const MongoClient = require('mongodb').MongoClient;
const DB_URL = require('./mongodb_data.js').mongodbUrl;

// HTML From에서 PUT, DELETE 사용하기
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// ejs 라이브러리 사용 선언
app.set('view engine', 'ejs');

// CSS 파일 사용 선언
app.use('/public', express.static('public'));

// 저장할 데이터 변수
let db;
// mongodb 패스워드에 @가 들어가는 경우 %40으로 수정할 것
MongoClient.connect(DB_URL, function (err, client) {

    if (err) {
        return console.log(err);
    }

    // db 폴더명
    db = client.db('todoapp');

    app.listen(8080, function () {
        console.log('listening on 8080')
    });

    // db 폴더 안 collection에 Object 자료형으로 저장
    app.post('/add', function (req, res) {

        db.collection('counter').findOne({
            name: '총 게시물 갯수'
        }, function (err, result) {
            let totalPostCnt = result.totalPosts;
            db.collection('post').insertOne({
                _id: totalPostCnt + 1,
                title: req.body.title,
                date: req.body.date,
                content: req.body.content,
            }, function (err, result) {
                console.log('저장완료');
                // update operator : $set (값 변경), $inc (값 증가) 등등...
                db.collection('counter').updateOne({
                    name: '총 게시물 갯수'
                }, {
                    $inc: {
                        totalPosts: 1
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });

        res.send('전송완료');
    });

    app.get('/list', function (req, res) {
        db.collection('post').find().toArray(function (err, result) {
            res.render('list.ejs', {
                posts: result
            });
        });
    });

    // URL parameter
    app.get('/detail/:id', function (req, res) {
        db.collection('post').findOne({
            _id: parseInt(req.params.id)
        }, function (err, result) {
            if (result == null) {
                console.log(err);
            }
            res.render('detail.ejs', {
                data: result
            });
        });
    });

    app.delete('/delete', function (req, res) {
        // int 값이 아닌 string 갑이 들어가 있으므로, 형변환 필요!
        // 서버랑 통신할 때 자료형 확인 필수!
        req.body._id = parseInt(req.body._id);
        db.collection('post').deleteOne(req.body, function (err, result) {
            console.log('삭제 완료');
            // 클라이언트에게 응답 보내기
            res.status(200).send({
                message: '성공했습니다'
            });
        });
    });

    app.get('/edit/:id', function (req, res) {
        db.collection('post').findOne({
            _id: parseInt(req.params.id)
        }, function (err, result) {
            if (result == null) {
                console.log(err);
            }
            res.render('edit.ejs', {
                data: result,
            })
        })
    })

    app.put('/edit', function (req, res) {
        // 첫번째 파라미터 수정할 게시글
        // 두번째 파라미터 수정할 데이터
        // 세번째 파라미터 콜백함수
        db.collection('post').updateOne({
            _id: parseInt(req.body.id),
        }, {
            $set: {
                title: req.body.title,
                date: req.body.date,
                content: req.body.content,
            }
        }, function (err, result) {
            // 다른 페이지로 이동
            res.redirect(`/detail/${req.body.id}`);
        })
    })

});

app.get('/', function (req, res) {
    res.render('index.ejs');
    // res.sendFile(__dirname + '/index.ejs');
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
    // res.sendFile(__dirname + '/write.ejs');
})

// 요청에 응답하는 여러가지 방밥
// app.get('/temp', function (req, res) {
//     res.status(200).send('success');
//     res.sendFile('/uploads/logo.png');
//     res.render('list.ejs', {
//         posts: 1
//     });
//     res.status(200).json({
//         'age': 28
//     });
// });