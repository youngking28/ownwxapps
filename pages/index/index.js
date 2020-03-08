//index.js
//获取应用实例
const app = getApp()
const qiniuUploader = require("../../utils/qiniuUploader");
const empAction = require("../../utils/empAction");
// const preUrl = 'http://localhost:8777';
// const preUrl = 'http://118.190.1.80:8777'
const preUrl = 'https://www.youngking28.club/';
var uploadToken = 'aa';
var userInfoG = {};
var openid = '';
var empInfo = {};

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrl: '',
    isLoginBtnShow: true,
    isUploadBtnShow: false,
    empid: '',
    empName: '',
    bUploadSuccess: false,
    bUploading: false,
    bUploadFail: false
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //登陆员工信息
  empLogin: saveOpenid,
  //获取姓名 
  empNameIn: empNameIn,
  //获取工号
  empidIn: empidIn,
  //上传图片
  upload: upload,
  //询问订阅消息
  askSub: askSub,
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      userInfoG = app.globalData.userInfo
      console.log(userInfoG)
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        userInfoG = app.globalData.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    login(this);
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    console.log(app.globalData.userInfo)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  login: function () {
    wx.redirectTo({
      url: '../login/login'
    })
  }
})

// request post 请求
const postData = (url, param) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'POST',
      data: param,
      success(res) {
        console.log(res)
        resolve(res.data)
      },
      fail(err) {
        console.log(err)
        reject(err)
      }
    })
  })
}

//获取uploadtoken
function getUploadToken() {
  wx.request({
    url: preUrl + '/qiniu/getToken?pwd=sinopec',
    method: 'POST',
    success(res) {
      console.log('get token:');
      console.log(res)
      return res.data;
    },
    fail(res) {
      console.log('get token fail')
      console.log(res)
      return '';
    }
  })
};

//上传图片
async function upload() {
  console.log(app.globalData.userInfo)
  let tempFilePaths = 'temp'
  this.setData({
    motto: '上传图片'
  })
  const that = this
  uploadToken = await postData(preUrl + '/qiniu/getToken?pwd=sinopec', {});
  console.log('empInfo')
  console.log(this.empInfo)
  console.log('redeay sub')
  

  wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['camera'],
    success(res) {
      var now = new Date()
      // tempFilePath可以作为img标签的src属性显示图片
      tempFilePaths = res.tempFilePaths
      console.log(tempFilePaths)
      console.log(that)
      that.setData({
        motto: tempFilePaths
      })
      var filePath = tempFilePaths[0]
      console.log('uploadToken');
      console.log(uploadToken);
      // 交给七牛上传
      //显示等待
      that.setData({
        bUploading: true
      });
      qiniuUploader.upload(filePath, (res) => {
        // 每个文件上传成功后,处理相关的事情
        // 其中 info 是文件上传成功后，服务端返回的json，形式如
        // {
        //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
        //    "key": "gogopher.jpg"
        //  }
        // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
        that.setData({
          'imgUrl': 'http://' + res.imageURL,
          bUploadFail: false,
          bUploadSuccess: true,
          bUploading:false
        });
        setTimeout(function () {
          that.setData({
            bUploadSuccess: false
          });
        }, 2000);
        console.log('file url is: ' + res.fileUrl);
        console.log('img url is: ' + res.imageURL);
        console.log('empinfo in upload');
        console.log(empInfo)
        empAction.saveImg(empInfo.employeId, res.imageURL);
      }, (error) => {
        that.setData({
          bUploadFail: true,
          bUploadSuccess: false,
          bUploading: false
        });
        setTimeout(function () {
          that.setData({
            bUploadFail: false
          });
        }, 2000);
        console.log('error: ' + error);
      }, {
          region: 'ECN',
          domain: 'q6cak5rix.bkt.clouddn.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
          key: userInfoG.nickName + now.toLocaleDateString() + (Date.parse(now) * 0.001) + '.jpg', // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
          // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
          uptoken: uploadToken,
          // 由其他程序生成七牛 uptoken
        }, (res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        }, () => {
          // 取消上传
        }, () => {
          // `before` 上传前执行的操作
        }, (err) => {
          // `complete` 上传接受后执行的操作(无论成功还是失败都执行)
        });
    }
  })

};

function login(oParant) {
  var code = '';
  var that = oParant ? oParant : this;
  wx.login({
    success(res) {
      if (res.code) {
        code = res.code;
        console.log(res.code);
        wx.request({
          url: preUrl + '/getOpenId?code=' + code,
          method: 'POST',
          success(res) {
            console.log('get openid success!');
            openid = res.data.openid;
            app.globalData.openid = openid;
            console.log(openid);
            // console.log(res);
            wx.request({
              url: preUrl + '/emp/getByOpenid',
              data: {
                openid: openid
              },
              method: 'POST',
              success(res) {
                console.log('get empinfo suc:');
                // console.log(res)
                empInfo = res.data.data;
                if(empInfo == {} || empInfo == null){
                  that.setData({
                    isUploadBtnShow: false,
                    isLoginBtnShow: true,
                    motto: '请输入姓名及工号'
                  })
                  wx.redirectTo({
                    url: '../login/login'
                  })
                }else{
                  that.setData({
                    isUploadBtnShow: true,
                    isLoginBtnShow: false,
                    motto: 'emp exist'
                  });
                }
              },
              fail(res) {
                console.log('get empinfo fail')
                console.log(res)
                empInfo = '';
                that.setData({
                  isUploadBtnShow: false,
                  isLoginBtnShow: true,
                  motto: '请输入姓名及工号'
                })
                wx.redirectTo({
                  url: '../login/login'
                })
              }
            });
            console.log('empinfo now');
            console.log(empInfo);
          },
          fail(res) {
            console.log('get openid fail! :' + res.toString());
            that.setData({
              isUploadBtnShow: false,
              isLoginBtnShow: true,
              motto: '请输入姓名及工号'
            })
            wx.redirectTo({
              url: '../login/login'
            })
          }
        })
      } else {
        console.log('登录失败！' + res.errMsg);
        that.setData({
          isUploadBtnShow: false,
          isLoginBtnShow: true,
          motto: '请输入姓名及工号'
        })
        wx.redirectTo({
          url: '../login/login'
        })
      }
    }
  });
};

function askSub() {
  console.log('entern sub');
  wx.requestSubscribeMessage({
    tmplIds: ['Vua6rZBa3pYRYfwYdMxrvPKhGoE0un5VFzmaeom9eoU'],
    success(res) {
      console.log(res)
    },
    fail(res){
      console.log('sub fail');
      console.log(res)
    }
  })
};

function saveOpenid(){
  var empid = this.data.empid;
  var empName = this.data.empName;
  empAction.saveOpenid(empid, empName, openid);
  const that = this;
  wx.request({
    url: preUrl + '/emp/getByOpenid',
    data: {
      openid: openid
    },
    method: 'POST',
    success(res) {
      empInfo = res.data.data;
      if (empInfo == {} || empInfo == null){
        // that.data.isLoginInputShow = false;
        console.log('saveOpenid set data ok')
      }else{
        that.setData({
          isLoginBtnShow: false,
          motto: 'emp exist'
        })
      }
    },
    fail(res) {
      console.log('get empinfo fail')
      console.log(res)
      empInfo = '';
    }
  });
};

//获取用户输入的用户名
function empNameIn(e) {
  this.setData({
    empName: e.detail.value
  })
};
//获取用户输入的工号
function empidIn(e) {
  this.setData({
    empid: e.detail.value
  })
};
