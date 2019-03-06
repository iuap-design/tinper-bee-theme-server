const koaRouter = require('koa-router')
const router = new koaRouter();

const HomeController = require('./controller/home')

// 主入口-》路由分发 -》controller-》调用模板进行渲染，加载 service处理服务逻辑
module.exports = (app) => {
  router.post('/server/saveThemeColor', HomeController.index) 
  router.get('/server/Update', HomeController.update)
  router.get('/server/file', HomeController.file)
  router.get('/server/hello', HomeController.hello)
  router.post('/server/package', HomeController.cliBuildScss)
  router.post('/server/updateAll', HomeController.updateAll)

  // 注册路由中间件
  app.use(router.routes())
    .use(router.allowedMethods())
}