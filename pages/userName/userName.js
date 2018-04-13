// pages/userName/userName.js
var app = getApp();
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
        console.log(options)
        var that = this;
        that.setData({
            userName: options.userName,
            userId: options.id
        });

    },
    userName: function (e) {
        var that = this;
        // console.log(e)
        var userName = e.detail.value;
        that.setData({
            userName: userName,
        })
        // console.log(that.data.userName)
        wx.showLoading({
            title: '加载中',
        })
        app.globalData.personal.name = e.detail.value;
        console.log(app.globalData.personal)
        var data = {};
        data.id = that.data.userId;
        data.updateType = 'name';
        data.updateContent = e.detail.value;
        that.updata(data);
    },
    updata: function (data) {
        console.log('123123')
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/updateCustomerInfo',
            data: data,
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                wx.hideLoading();
                console.log(res)
                app.globalData.personal.name = data.updateContent
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    clear: function () {  //清空输入空内容
        var that = this;
        var userName = that.data.userName;
        that.setData({
            userName: ''
        })
    },



})