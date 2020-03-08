// const preUrl = 'http://localhost:8777';
// const preUrl = 'http://118.190.1.80:8777'
const preUrl = 'https://www.youngking28.club/';


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
      console.log(res);
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
    url: preUrl + '/emp/saveImg',
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

//员工首次登陆，录入openid
function saveOpenid(empid, empName, empOpenid) {
  wx.request({
    url: preUrl + '/emp/updateOpenid',
    data: {
      empid: empid,
      openid: empOpenid,
      emp_name: empName
    },
    method: 'POST',
    success(res) {
      console.log('saveOpenid success:');
      console.log(res);
    },
    fail(res) {
      console.log('saveOpenid fail');
      console.log(res);
    }
  })
};

module.exports = {
  getEmpInfo: getEmpInfo,
  saveImg: saveImg,
  saveOpenid: saveOpenid,
}