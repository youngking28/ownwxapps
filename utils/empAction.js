const preUrl = 'http://localhost:8777';

//获取员工信息
function getEmpInfo(openid) {
  wx.request({
    url: preUrl + '/emp/getByOpenid',
    data: {
      openid: openid
    },
    method: 'POST',
    success(res) {
      console.log('get empinfo:');
      console.log(res)
      return res.data;
    },
    fail(res) {
      console.log('get empinfo fail')
      console.log(res)
      return '';
    }
  })
};

//存图片
function saveImg(empid, imgUrl) {
  wx.request({
    url: preUrl + '/emp/getByOpenid',
    data: {
      empid: empid,
      imgUrl: imgUrl
    },
    method: 'POST',
    success(res) {
      console.log('save img success:');
      console.log(res)
      return res.data;
    },
    fail(res) {
      console.log('save img fail')
      console.log(res)
      return '';
    }
  })
};

module.exports = {
  getEmpInfo: getEmpInfo,
  saveImg: saveImg,
}