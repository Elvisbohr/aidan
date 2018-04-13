// pages/collect/collect.js
var app = getApp();
var initdata = function (that) {
    var collect = that.data.collect
    for (var i = 0; i < collect.length; i++) {
        collect[i].txtStyle = ""
    }
    that.setData({ collect: collect })
}
Page({
    data: {
        delBtnWidth: 180,//删除按钮宽度单位（rpx） 
    },

    onLoad: function (options) {
        var that = this;
        that.initEleWidth();
        that.setData({
            appImg: app.globalData.adminAddressImg,
        })
    },
    onShow: function () {
        var that = this,
            data = {};
        data.openid = app.globalData.openId
        data.lat = app.globalData.lat
        data.lon = app.globalData.lon
        console.log(data)
        // this.initEleWidth();
        this.collectShop(data);
        // 清空total(本地购物车缓存)的数据
        wx.setStorage({
            key: 'total',
            data: { count: 0, price: 0, list: [] },
        })
    },
    //获取元素自适应后的实际宽度  
    getEleWidth: function (w) {
        var real = 0;
        try {
            var res = wx.getSystemInfoSync().windowWidth;
            var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应  
            // console.log(scale);  
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error  
        }
    },
    initEleWidth: function () {
        var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    //点击删除按钮事件  
    delItem: function (e) {
        console.log(e)
        var that = this
        var index = e.currentTarget.dataset.index;
        wx.showModal({
            title: '提示',
            content: '是否删除？',
            success: function (res) {
                console.log('删除')
                console.log(res)
                console.log(index)
                if (res.confirm) {
                    //获取列表中要删除项的下标  

                    var collect = that.data.collect;
                    console.log(collect[index].id)
                    var data = [];
                    data.id = collect[index].id;
                    console.log(data)
                    that.deleteCollect(data);
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 2000
                    })
                    //移除列表中下标为index的项  
                    collect.splice(index, 1);
                    //更新列表的状态  
                    that.setData({
                        collect: collect
                    });

                } else {
                    initdata(that)
                }
            }
        })

    },
    //点击跳转商铺
    shopnav: function (e) {
        var txtStyle = "";
        console.log(e)
        var id = e.currentTarget.dataset.id;
        // var name = e.currentTarget.dataset.name;
        // wx.navigateTo({
        //     url: '../menu/menu?id=' + id,
        //     success: function (res) {

        //     }
        // })
        //点击店铺时调取接口判断当前是否营业     
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/isOpen',
            data: {
                shopId: id
            },
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('res')
                console.log(res)
                if (res.data.data) {
                    wx.navigateTo({
                        url: '../menu/menu?id=' + id,
                    })
                } else {
                    console.log(2)
                    wx.showToast({
                        title: '暂未营业',
                        icon: 'loading',
                        duration: 2000
                    })
                }
            },
            fail: function () {
                wx.showLoading('判断当前是否营业失败');
            }
        })
    },
    //   收藏店铺接口
    collectShop: function (data) {
        var that = this;
        wx.getStorage({
            key: 'userLocation',
            success: function (res) {
                console.log(res.data)
            }
        })
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/myShopCollectList',
            data: data,
            method: "GET",
            // header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                wx.hideLoading();

                that.setData({
                    collect: res.data.data,
                });
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    deleteCollect: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/deleteCollectShop',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('删除成功')
            },
            fail: function () {
                wx.showLoading('请求数据失败');
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
    },
    // 转发
    // onShareAppMessage: function (res) {
    //     if (res.from === 'menu') {
    //         // 来自页面内转发按钮
    //         console.log(res.target)
    //     }
    //     return {
    //         title: '爱点自助点餐',
    //         path: 'pages/index/index',
    //         imageUrl: "/images/message.png",
    //         success: function (res) {
    //             // 转发成功
    //             // console.log(res)
    //         },
    //         fail: function (res) {
    //             // 转发失败
    //         }
    //     }
    // },
})