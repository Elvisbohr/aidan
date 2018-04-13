// pages/register/register.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: 'agree' }
    ],
    agree:true,
    verifyInfo: '获取验证码',
    verifynum: '',
    isdisable: false,   
    popup:false,        //弹框
  },
  num: function (e) {
    this.setData({
      num: e.detail.value,
    })
  },
  pos: function (e) {
    this.setData({
      pos: e.detail.value,
    })
  },
  verification:function(e){
    this.setData({
        verification: e.detail.value,
    })
  },
  checkboxChange: function (e) {
    var that = this;
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == "agree"){
      that.setData({
        agree : true,
      })
    }else{
      that.setData({
        agree: false,
      })
    };
  },
  binding:function(e){
    var that = this;
   
    if (that.data.agree == true){
        if (that.data.verifynum == that.data.verification){
        var data = {};
        data.telphone = that.data.num;
        data.password = that.data.pos;
        data.openid = that.data.openId;       
        that.bound(data);        
      } else {
        wx.showToast({
          title: '验证码不正确',
          icon: 'loading',
          duration: 2000
        })
      } ;
    }   
  },
  bound:function(data){
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/app/merchantBindWeixin',
      data: data,
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.status == 500){
          wx.showToast({
            title: res.data.msg,
            icon: 'loading',
            duration: 2000
          })
        } else if(res.data.status == 200){
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          });
          wx.reLaunch({
            url: '../index/index'
          })
        } 
        that.setData({
          num: '',
          pos: '',
          topos:'',
        })
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'user',
      success: function (res) {
        that.setData({
          openId: res.data.openid
        });
      }
    });
  },
  // 获取验证码
  verify: function () {
      var that = this
      var count = 60;
      var re = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
      if (!re.test(that.data.num)) {
          wx.showModal({
              title: "请输入正确的手机号"
          });
          return false;
      } else {
          if (that.data.isdisable == false) {
              // 上传页面
              wx.request({
                  url: app.globalData.adminAddress + '/telphoneCode',
                  method: "POST",
                  header: { 'content-type': 'application/x-www-form-urlencoded' },
                  data: {
                      tel: that.data.num
                  },
                  success: function (res) {
                      wx.showToast({
                          title: '发送成功',
                          mask: true
                      });
                    //   console.log('uzm')

                      that.setData({
                          verifynum: res.data.data
                      })
                      console.log(that.data.verifynum)
                  }
              })
              var timer = setInterval(function () {
                  count--;
                  if (count >= 1) {
                      that.setData({
                          verifyInfo: count + 's'
                      })
                  } else {
                      that.setData({
                          verifyInfo: '获取验证码'
                      })
                      clearInterval(timer);
                      that.data.isdisable = false;
                  }
              }, 1000);
              that.data.isdisable = true;
          }
      }
  },
  popup:function(){
    // console.log('显示弹框')
    this.setData({
        popup: true,
    })
  },
  popupColse:function(){
      this.setData({
          popup:false, 
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})