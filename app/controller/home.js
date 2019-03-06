const fs = require('fs');
var download = require('download-git-repo');
const spawn = require('cross-spawn');
const HomeService = require('../service/home')
const path = require('path');
const OSS = require('ali-oss');
const chalk = require('chalk');
const ora = require('ora');
const ossconfig = require('./config');
// var log4js = require('log4js');

var targetVersionUrl = process.cwd()+'/tinper-bee';
var targetUrl = process.cwd()+'/tinper-bee';
var oldCwd = process.cwd();
const tinperUrl = 'direct:https://github.com/iuap-design/tinper-bee.git';
const cookieId = "tinper-bee-theme";

// var ossconfig = {
//   accessKeyId: 'LTAIM7dqay3t13Wg',
//   accessKeySecret: 'JVvsSST3Vd9Zq0ikiakq9JiBDoDbrP',
//   bucket: 'iuap-design-cdn',
//   region: 'oss-cn-beijing',
// }

// log4js.configure({
//   appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//   categories: { default: { appenders: ['cheese'], level: 'error' } }
// });
// const logger = log4js.getLogger('cheese');
console.log(" ossconfig :",ossconfig);
let client = new OSS(ossconfig);

function getResult(){
  return {
    success: false,
    message: '',
    data: {},
  }
}

/**
 * 先下载模板工程
 */
async function getDownload(url,name){
  return new Promise(function(resolve, reject) {
    download(tinperUrl, 'tinper-bee', { clone: true },(err)=> {
        if (!err) {
            console.log(chalk.red(err))
            reject("Error");
          } else {
            console.log(chalk.green('Install NPM dependent packages,please wait.'));
            process.chdir(targetUrl);
            let args = ['install'].filter(function(e) {
                return e;
            }); 
            let proc = spawn('ynpm', args, {
              stdio: 'inherit'
            });
            proc.on('close', function(code) { 
              console.log(chalk.green('NPM package installed !'));
                if (code !== 0) {
                    console.error('`npm ' + args.join(' ') + '` failed');
                    reject(false);
                }else{
                  resolve(true);
                }
            });
        }
    })
  });
}



/**
 * 先下载模板工程
 */
async function getDownloadZip_bak(url,version){
  return new Promise(function(resolve, reject) {
    download("direct:"+url,"tinper-bee-"+version,(err)=> {
        console.log(err ? 'Error' : 'Success')
        if (err) {
            console.log(chalk.red(err))
            reject("Error");
          } else {
            console.log(chalk.green('Install YNPM dependent packages,please wait.'));
            process.chdir(targetVersionUrl);
            let args = ['install'].filter(function(e) {
                return e;
            });
            let proc = spawn('ynpm', args, {
              stdio: 'inherit'
            });
            proc.on('close', function(code) {
              console.log(chalk.green('YNPM package installed !'));
                if (code !== 0) {
                    console.error('`npm ' + args.join(' ') + '` failed');
                    reject(false);
                }else{
                  resolve(true);
                }
            });
        }
    })
  });
}

function getDownloadZip(url,version){
  process.chdir(oldCwd);
  download("direct:"+url,"tinper-bee-"+version,(err)=> {
      console.log(err ? 'Error' : 'Success')
      if (err) {
          console.log(chalk.red(err))
        } else {
          console.log(chalk.green('Install NPM dependent packages,please wait.'));
          process.chdir(targetVersionUrl);
          let args = ['install'].filter(function(e) {
              return e;
          });
          let proc = spawn('npm', args, {
            stdio: 'inherit'
          });
          proc.on('close', function(code) {
            console.log(chalk.green('YNPM package installed !'));
              if (code !== 0) {
                  console.error('`npm ' + args.join(' ') + '` failed');
              }else{
              }
          });
      }
  })
}


/**
 * 执行build命令 之前执行 node-sass
 * node-sass 的包冲突解决方案
 */
async function getBuildNodeSass(){
  return new Promise(function(resolve, reject) {

      let args = ['rebuild','node-sass'].filter(function(e) {
          return e;
      });
      let proc = spawn('npm', args, {
        stdio: 'inherit'
      });
      proc.on('close', function(code) { 
        if (code !== 0) { 
          reject(false);
        }else{
          resolve(true);
        }
      })
  });
}

/**
 * 执行build命令
 */
async function getBuild(){
  await getBuildNodeSass();
  return new Promise(function(resolve, reject) {
      let args = ['run','buildOnline'].filter(function(e) {
          return e;
      });
      let proc = spawn('npm', args, {
        stdio: 'inherit'
      });
      proc.on('close', function(code) { 
        if (code !== 0) {
          console.log(chalk.green(targetVersionUrl));
          console.log(chalk.green(' 🚫 Check that the minxin-themeColors. SCSS file is complete !'));
          console.log(chalk.green(' cd  '+targetVersionUrl+ ' npm run buildOnline'));
          reject(false);
        }else{
          resolve(true);
        }
      })
  });
}

/**
 * 生成themeColor 主题
 * @param {*} data 
 * $color-primary: $palette-blue-600 !default; //主色
 * $color-primary-dark: $palette-blue-800 !default;
 * $color-primary-light: $palette-blue-400 !default;
 * $color-accent: $palette-green-600 !default;
* $color-accent-dark: $palette-green-800 !default;
* $color-accent-light: $palette-green-400 !default;
 */
async function getThemeColor(data){
  // console.log("getThemeColor parameter data  ",data);
  return new Promise(function(resolve, reject) {
  if(!data){
    console.log(chalk.red(" this function parameter error ! ",data));
    reject(false);
  }
  let ThemeColorTemplate =  " @import 'minxin-colors'; \n\n";
  let file = targetVersionUrl+"/node_modules/tinper-bee-core/scss/minxin-themeColors.scss";

  for (let key in data){
    ThemeColorTemplate += "$" + key + ": ";
    if(getKeyStrBoole("family",key)){//family
      ThemeColorTemplate += '"'+data[key]+'"';
    } else if(getKeyStrBoole("size",key)){
      ThemeColorTemplate +=  data[key]+"px";
    }else if(getKeyStrBoole("$",data[key])){
      ThemeColorTemplate += data[key];
    }else{
      ThemeColorTemplate += data[key];

      // if(getKeyStrBoole("#",data[key])){
      //   ThemeColorTemplate += data[key];
      // }else{
      //   ThemeColorTemplate += "#" + data[key];
      // }
    }
    if(!getKeyStrBoole("default",key)){
      ThemeColorTemplate += " !default";
    }
    ThemeColorTemplate += " ; \n\n";
  }
  fs.writeFile(file,ThemeColorTemplate,err=>{
      if(err){
        console.log(" getThemeColor 写入失败 ");
        reject(false);
      }else{
        console.log(" getThemeColor 写入成功 ");
        resolve(true);
      }
    })
  }); 
}

function getKeyStrBoole(key,str){
  if(str.indexOf(key) != -1 ){
    return true;
  }
  return false;
}

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
  try{
      fs.accessSync(path,fs.F_OK);
  }catch(e){
      return false;
  }
  return true;
}

/**
 * 上传文件到CDN上
 * "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/theme/tinper-bee.css"
 */
async function getCDN(_ctx){
  return new Promise(function(resolve, reject) {
      let fileName = getUUId(_ctx)+".css";
      client.put('static/tinper-bee/theme/'+fileName,targetVersionUrl+"/assets/tinper-bee.css").then(data=>{
        resolve({url:data.url,name:fileName});
      }).catch(function (err) {
        console.error('error: %j', err);
        reject(false);
      });
  });
}

function getOver(){
  console.log(chalk.green('********************************************'));
  console.log(chalk.green(''));
  console.log(chalk.green('-----👌👌👌👌👌-----'));
  console.log(chalk.green(''));
  console.log(chalk.green('********************************************'));
}

function getUUId(_ctx){
  let _cookie = _ctx.cookies && _ctx.cookies.get(cookieId),
  da = new Date(),id = '';
  if(!_cookie){
    id = "tinper-bee-"+da.getFullYear() + da.getMonth() + da.getDay() + da.getTime();
    _ctx.cookies.set(cookieId,id,{httpOnly: false});
  }else{
    id = _cookie;
  }
  return id;
}

// async function getCDN(_ctx){
//   return new Promise(function(resolve, reject) {
//     // let url = "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/theme/tinper-bee.css";
//     let url = "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/theme/tinper-bee.css";
//     var data = fs.readFileSync(url);
    
//       client.put('static/tinper-bee/theme/'+fileName,targetUrl+"/assets/tinper-bee.css").then(data=>{
//         resolve({url:data.url,name:fileName});
//       }).catch(function (err) {
//         console.error('error: %j', err);
//         reject(false);
//       });
//   });
// }



module.exports = {
    index: async(ctx, next) => {
     let result = getResult();
     if(!ctx.request.body){
       console.log("sorry,body is not defined !! ");
       result.success = false;
       ctx.body = result;
       return;
     }
     let {theme,type,version} = ctx.request.body;
     targetVersionUrl = (targetUrl+"-"+version);
     console.log(" request parent ",ctx.request.body);
     if(await getThemeColor(theme)){
      console.log(chalk.green('Build the tinper-bee ...'));
      process.chdir(targetVersionUrl);
      if(await getBuild()){//build成功
        console.log(chalk.green('Uploading tinper-bee.css CDN ...'));
        let data = await getCDN(ctx);
        if(data){
          console.log(chalk.green('-----👌👌👌👌👌-----'));
          result.success = true;
          result.data = data;
        }
      }
    } 
    ctx.body = result;
    },
    cliBuildScss: async(ctx, next) => {
      console.log("---cliBuildScss---- ");
      let result = getResult();
      if(!ctx.request.body){
        console.log("sorry,body is not defined !! ");
        result.success = false;
        ctx.body = result;
        return;
      }
      let {theme,type,version} = ctx.request.body;
      targetVersionUrl = (targetUrl+"-"+version);
      if(!fsExistsSync(targetVersionUrl+"/package.json")){
        let mess = " server tinper-beee-"+version+" is not defined , Please execute tinper-theme update ! ";
        console.log(mess);
        result.success = false;
        result.message = mess;
        result.data = null;
        ctx.body = result;  
        return;
      }
      console.log(" request parent ",ctx.request.body);
      if(await getThemeColor(theme)){
        console.log(chalk.green('Build the tinper-bee ...'));
        process.chdir(targetVersionUrl);
        if(await getBuild()){//build成功
          console.log(chalk.green('Uploading tinper-bee.css CDN ...'));
          let data = await getCDN(ctx);
          if(data){
            console.log(chalk.green('-----👌👌👌👌👌-----'));
            result.success = true;
            result.data = data;
          }
        }
      }
      ctx.body = result;  
    },
    update: async(ctx, next) => {
      console.log("download... ");
      let result = getResult();
      result.success = false;
      if(await getDownload(tinperUrl, 'tinper-bee')){
        console.log("download project success !");
        result.success = true;
      }
      ctx.response.body = result;
    },
    updateAll: async(ctx, next) => {
      let result = getResult();
      result.success = false; 
      let {version} = ctx.request.body;
      version.forEach((_version)=>{
        targetVersionUrl = (targetUrl+"-"+_version);
        if(!fsExistsSync(targetVersionUrl+"/package.json")){
          console.log(" tinper-bee "+_version+" server is not defined , download... ");
          getTinperBeeVersion(_version);
        }else{
          result.success = true; 
          console.log(" tinper-bee "+_version+" server is OK ! ");
        } 
      })
      // targetVersionUrl = (targetUrl+"-"+version);
      // if(!fsExistsSync(targetVersionUrl+"/package.json")){
      //   console.log(" tinper-bee "+version+" server is not defined ! ");
      // }else{
      //   result.success = true; 
      //   console.log(" tinper-bee "+version+" server is OK ! ");
      //   // version.forEach((_version)=>{
      //   //   getTinperBeeVersion(_version);
      //   // })
      // }
      ctx.response.body = result;
    },

    file: async(ctx, next) => {
      console.log("file... ");
      url = "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/theme/config.css";
      // let {url} = ctx.request.body;
      let result = getResult();
      result.success = false;
      if(await getFileCss()){
        console.log("download project success !");
        result.success = true;
      }
      ctx.response.body = result;
    },
    hello: async(ctx, next) => {
      console.log(" -----update---- ");
      let result = getResult();
      ctx.response.body = result;
    },
    register: async(ctx, next) => {
        let {
          name,
          password
        } = ctx.request.body
        let data = await HomeService.register(name, password)
        ctx.response.body = data
      }
  }

  // https://registry.npmjs.org/tinper-bee/-/tinper-bee-1.6.10.tgz
  // let packageUrl = "https://registry.npmjs.org/tinper-bee/-/";
  let packageUrl = "https://github.com/iuap-design/tinper-bee/archive/"

   function getTinperBeeVersion(version){
    // let url = packageUrl + "tinper-bee-" + version + ".tgz";
    let url = packageUrl + version + ".zip";
    console.log("dowloand url : ",url);
    if(getDownloadZip(url,version)){
      console.log("download project success !");
    }
  }

  // if(await getDownload()){
    //   console.log(chalk.green('Modifying the theme ...'));
    //   if(await getThemeColor(theme)){
    //     console.log(chalk.green('Build the tinper-bee ...'));
    //     if(await getBuild()){//build成功
    //       console.log(chalk.green('Uploading tinper-bee.css CDN ...'));
    //       let data = await getCDN(ctx);
    //       if(data){
    //         console.log(chalk.green('-----👌👌👌👌👌-----'));
    //         result.success = true;
    //         result.data.name = data.name;
    //         result.data.url = _getTinperBuildUrl = data.url;
    //       }
    //     }
    //   }
    // }

    // result.success = true;
    // result.data.name = "tinper-bee-2019021547517402358";
    // result.data.url = "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/theme/tinper-bee-2019021547517402358.css";