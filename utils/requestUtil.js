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

module.exports = {
  post: postData
}