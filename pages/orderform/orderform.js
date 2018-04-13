// pages/orderform/orderform.js
var app = getApp();
Page({
  data: {
    ordertype: 'jd',  // "jd":待接单;wc:已完成;qc:已取餐;tkz:退款中;ytk:已退款;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      appImg: app.globalData.adminAddressImg,
    })
  },
  onShow: function () {
    var that = this,
      data = {};
    data.openid = app.globalData.openId;
    that.orderList(data);
  },
  orderList: function (data) {
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/myOrders',
      data: data,
      method: "GET",
      // header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data.data)

        var orderList = res.data.data;

        for (var i = 0; i < orderList.length; i++) {
          // "jd":待接单; wc: 已完成; qc: 已取餐; tkz: 退款中; ytk: 已退款;
          if (orderList[i].status == 1) {
            orderList[i].ordertype = 'qc';
            orderList[i].msg = '待付款'
          } else if (orderList[i].status == 2) {
            orderList[i].ordertype = 'jd';
            orderList[i].msg = '待接单'
          } else if (orderList[i].status == 3) {
            orderList[i].ordertype = 'jd';
            orderList[i].msg = '待取餐'
          } else if (orderList[i].status == 4) {
            orderList[i].ordertype = 'tkz';
            orderList[i].msg = '退款中'
          } else if (orderList[i].status == 5) {
            orderList[i].ordertype = 'ytk';
            orderList[i].msg = '已退款'
          } else if (orderList[i].status == 6) {
            orderList[i].ordertype = 'wc';
            orderList[i].msg = '已完成'
          } else if (orderList[i].status == 7) {
            orderList[i].ordertype = 'wc';
            orderList[i].msg = '未接单完成'
          } else if (orderList[i].status == 8) {
            orderList[i].ordertype = 'wc';
            orderList[i].msg = '拒绝完成'
          }
          // console.log(orderList[i].status)
        }
        that.setData({
          orderList: orderList,
        })
        console.log(orderList)
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    })
  },
  //删除订单
  onDel:function(e){
    console.log('删除订单')
    var that = this;
    wx.showModal({
      content: '订单删除后无法恢复',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var data = {};
          data.orderId = e.currentTarget.dataset.id;
          console.log(data)                    
          wx.request({
            url: app.globalData.adminAddress + '/applet_customer/deleteOrder',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
              data = {};
              data.openid = app.globalData.openId;
              that.orderList(data);
            },
            fail: function () {
              wx.showLoading('请求数据失败');
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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
      path: 'pages/orderform/orderform',
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