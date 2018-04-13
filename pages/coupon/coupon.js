// pages/coupon/coupon.js
var app = getApp();
Page({
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this;
    var myCouponsData = [];
     myCouponsData.openid = app.globalData.openId;
     that.myCoupons(myCouponsData);
     that.setData({
       appImg: app.globalData.adminAddressImg,
     })
  },
  myCoupons:function(data){
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/myCoupons',
      data: data,
      method: "GET",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log('查看可用代金券')
        console.log(res)
        var myCoupons = res.data.data;
        for(var i = 0; i< myCoupons.length;i++){
          if (myCoupons[i].shopImg == "") {
            console.log('没有商铺图片')
            myCoupons[i].shopImg = "../../images/shopmode.png"
          }
        }
        that.setData({
          myCoupons:res.data.data,          
        })
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    })
  },
  // 点击代金券跳转到商铺
  shopnav: function (e) {
    var that = this;
    var myCoupons = that.data.myCoupons;    //获取data里的商铺接口数据
    var index = e.currentTarget.dataset.index;  //获取点击的是啊哪个个
    if (myCoupons[index].isOpen == 1) { //判断如果是营业中则跳转页面
      wx.navigateTo({
        url: '../menu/menu?id=' + myCoupons[index].shopId + '&name=' + myCoupons[index].shopName,

      })
    } else if (merchants[index].isOpen == 2) {   //状态为休息中弹出提示框
      wx.showToast({
        title: '暂未营业',
        icon: 'loading',
        duration: 3000
      })
    }
  },
  // 转发
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '爱点自助点餐',
      path: 'pages/coupon/coupon',
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