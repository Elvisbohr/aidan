// pages/userPhone/userPhone.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  onLoad: function (options) {
    console.log(options.userPhone)
    var that = this;
    var userId = options.id;
    if (options.userPhone == ''){
      that.setData({
        userPhone: '',
        userId: userId,
      })
    }else{
      that.setData({
        userPhone: options.userPhone,
        userId: userId,
      })
    }
    
  },
  userPhone: function (e) {
    var that = this;
    // console.log(e)
    var userPhone = e.detail.value;
    that.setData({
      userPhone: userPhone,
    })
    var data = {};
    data.id = that.data.userId;
    data.updateType = 'phone';
    data.updateContent = e.detail.value;
    that.updata(data);
  },
  clear: function () {  //清空输入空内容
    var that = this;
    var userPhone = that.data.userPhone;
    that.setData({
      userPhone: ''
    })
  },
  updata: function (data) {
    //   console.log('123123')
      wx.request({
          url: app.globalData.adminAddress + '/applet_customer/updateCustomerInfo',
          data: data,
          method: "POST",
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              wx.hideLoading();
              console.log(res)
              app.globalData.personal.phone = data.updateContent
          },
          fail: function () {
              wx.showLoading('请求数据失败');
          }
      })
  },
})