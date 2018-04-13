// pages/mine/mine.js
var app = getApp();
Page({
  data: {
    userInfo:[], //个人信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      appImg: app.globalData.adminAddressImg,
    })
  },
  onShow:function(){
    var that = this;
    var userInfo = [];
    wx.getStorage({
        key: 'userInfo',
        success: function (res) {
            userInfo = res.data;
            // console.log(userInfo)
            that.setData({
                userInfo: userInfo,
            })
            var data = {};
            data.openid = app.globalData.openId;
            // data.headImg = userInfo.avatarUrl;
            data.name = userInfo.nickName;
            console.log(data);
            that.mine(data);
            
        },
        fail:function(){
          wx.showToast({
            title: '请接受微信授权',
            icon: 'loading',
            duration: 2000
          })
        }

    });
  },
  mine:function(data){
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/getCustomerInfo',
      data: data,
      method: "GET",
      // header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        var personal = res.data.data  //声明获取到的数据
        if (personal == null ||personal.headImg == "" || personal.headImg == undefined){   //判断如果没有用户头像,用微信头像
          // var personal = {}
          personal.headImg = that.data.userInfo.avatarUrl 
        } else {
          personal.headImg = app.globalData.adminAddressImg + personal.headImg
        } 
        if (personal.name == null ||personal.name == '' || personal.name == undefined) {      //判断如果没有用户姓名,用微信姓名
          personal.name = data.name          
        }
        // that.setData({
        //   personal: res.data.data,
        // });
        app.globalData.personal = personal;
        that.setData({
          personal: app.globalData.personal,
        });
        
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    })
  },
  //客服中心
  service:function(){
    wx.makePhoneCall({
      phoneNumber: '0351-7332978' 
    })
  },
  // 转发
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '爱点自助点餐',
      path: 'pages/index/index',
      imageUrl: "/images/message.png",
      success: function (res) {
        // 转发成功
        // console.log(res)
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})