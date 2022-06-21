const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
// 2021년 이후로 설치한 프로젝트는 body-parser 라이브러리가 express에 기본 포함되어 있어
// 따로 npm 설치필요가 없다.
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: true}));

app.listen(8080, function(){
    console.log('listening on 8080')
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

app.post('/add', function(req, res){
    res.send('전송완료');
    console.log(req.body.title);
    console.log(req.body.date);
});