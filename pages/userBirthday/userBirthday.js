// pages/userBirthday/userBirthday.js
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
        var that = this;
        that.setData({
            userBirthday: options.birthday,
            userId: options.id
        });
        console.log(options.birthday)
        // 获取用户生日如果没有显示文字
        if (options.userBirthday == "") {
            console.log('未设置生日')
            that.setData({
                userBirthday: '请设置您的生日',
            })
        } else {
            that.setData({
                userBirthday: options.userBirthday,
            })
        }

    },
    // 设置生日加入接口
    bindBirthday: function (e) {
        var that = this;
        app.globalData.personal.birthday = e.detail.value;
        // console.log(app.globalData.personal)
        var data = {};
        data.id = that.data.userId;
        data.updateType = 'birthday';
        data.updateContent = e.detail.value;
        this.setData({
            userBirthday: e.detail.value
        })
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
                app.globalData.personal.birthday = data.updateContent
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },

})