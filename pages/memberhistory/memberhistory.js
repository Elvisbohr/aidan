// pages/memberhistory/memberhistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfo = [];
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        userInfo = res.data;
        console.log(userInfo)
        that.setData({
          userInfo: userInfo,
        })
      }
    })
  },



  
})