// pages/orderparticulars/orderparticulars.js
var app = getApp();
Page({
  data: {
    upmore:true,    //查看全部已点餐品
  },

  onLoad: function (options) {
    var that = this;
    var orderData = [];
    orderData.id = options.id;
    that.OrderDetail(orderData);
    wx.getStorage({   //从本地获取Opneid
      key: 'user',
      success: function (res) {
        console.log(res.data)
        that.setData({
          openid: res.data.openid
        })
      }
    });
  },
  //获取订单详情接口
  OrderDetail:function(data){
    var that =this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/getOrderDetail',
      data: data,
      method: "GET",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log('订单详情')
        console.log(res)
        var detail = res.data.data;
        //判断type为1,2赋值到data里为堂食外卖
        if (detail.order.type == 1){
          var ordertype = '堂食'
        }else if(detail.order.type == 2){
          var ordertype = '自取'
        } else if (detail.order.type == 3) {
            var ordertype = '外卖'
        }
        //判断他是否有优惠活动
        for (var i = 0; i < detail.order.preferentials.length; i++){          
          console.log(detail.order.preferentials[i])
          if (detail.order.preferentials[i].preferentialType == 1){
            that.setData({
              zk: detail.order.preferentials[i]
            })
          } else if (detail.order.preferentials[i].preferentialType == 2){
            that.setData({
              mj: detail.order.preferentials[i]
            })
          } else if (detail.order.preferentials[i].preferentialType == 4){
            that.setData({
              djp: detail.order.preferentials[i]
            })
          }
        }
        //判断订单状态
        if (detail.order.status == 1) {
          detail.order.msg = '待付款'
        } else if (detail.order.status == 2) {
          detail.order.msg = '待接单'
        } else if (detail.order.status == 3) {
          detail.order.msg = '待取餐'
        } else if (detail.order.status == 4) {
          detail.order.msg = '退款中'
        } else if (detail.order.status == 5) {
          detail.order.msg = '已退款'
        } else if (detail.order.status == 6) {
          detail.order.msg = '已完成'
        } else if (detail.order.status == 7) {
          detail.order.msg = '未接单完成'
        } else if (detail.order.status == 8) {
         detail.order.msg = '拒绝完成'
        }

        //判断他是否为预约单
        var how = new Date(detail.order.createTime);  //下单时间
        var today = new Date(detail.order.takeFoodtime);  //取餐时间
        // console.log(how);
        // console.log(today);
        // console.log("相差多少分钟：" + parseInt((today.getTime() - how.getTime()) / 1000 / 60));
        var gapTime = parseInt((today.getTime() - how.getTime()) / 1000 / 60);

        //把值赋到data里
        that.setData({
          detail: detail,
          ordertype: ordertype,
          isOrderTime: gapTime, //是否预约
        })
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    })
  },
  // 查看全部已点菜品
  upmore: function () {
    var that = this;
    that.setData({
      upmore: (!that.data.upmore)
    })
  },
  // 拨打电话
  call:function(){
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.detail.shop.shopPhone 
    })
  },
  // 跳转到地图页
  shopmap: function () {
    var that = this;
    // 经纬度应该是数字而不是字符串,把接到的数据转换为数值
    var lat = Number(that.data.detail.shop.latitude);
    var lon = Number(that.data.detail.shop.longitude);
    wx.openLocation({
      latitude: lat,
      longitude: lon,
      scale: 28
    })
  },
  //取消订单
  cancelOrder:function(){
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/closeOrder',
      data: {
        orderId:that.data.detail.order.id
      },
      method: "GET",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log("取消成功")
        console.log(res)
        wx.navigateBack({     //返回上一页
          delta: 1
        })
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    });
  },
  //重新支付订单
  payOrder:function(){
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/rePayOrder',
      data: {
        orderId: that.data.detail.order.id,
        openid: that.data.openid
      },
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log("重新支付")
        console.log(res)
        var obj = res.data.data;
        that.requestPayment(obj);   //重新支付接口
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    });
  },
  //申请支付
  requestPayment: function (obj) {
    var that = this;
    console.log(obj)
    wx.requestPayment({
      'timeStamp': obj.timeStamp,
      'nonceStr': obj.nonceStr,
      'package': obj.packagestr,
      'signType': obj.signType,
      'paySign': obj.paySign,
      'success': function (res) {
        //支付成功
        console.log(obj)
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });
        wx.redirectTo({     //返回上一页
          url: "../orderform/orderform"
        })
      },
      'fail': function (res) {
        console.log("支付失败");
        wx.showToast({
          title: '支付失败',
          icon: 'loading',
          duration: 2000
        });
      }
    })
  },
})