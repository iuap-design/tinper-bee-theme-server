var Koa = require('koa')
// var cors = require('koa2-cors');
var router = require('./router')
var middleware = require('./middleware')
var bodyParser = require('koa-bodyparser')

var app = new Koa()

// app.use(cors({ 
//     origin: function (ctx) {
//         return "*";
//     }, 
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: true, // 当设置成允许请求携带cookie时，需要保证"Access-Control-Allow-Origin"是服务器有的域名，而不能是"*";
//     allowMethods: ['GET', 'POST', 'DELETE'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }));

// 配置ctx.body解析中间件
app.use(bodyParser())

const port = process.env.port || 3001
console.log('0000',port);
router(app)
middleware(app)

app.listen(port, () => {
    console.log('服务运行成功,端口:'+port);
})