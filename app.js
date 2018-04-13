//app.js
App({
    // 设置全局属性
    globalData: {
        total: {},
        adminAddress: "https://ad.djfy365.com/api",
        // adminAddress: "https://ad.kulizhi.com/api",
        // adminAddress:  "http://192.168.1.135:8080/api",

        adminAddressImg: "https://ad.djfy365.com",
        // adminAddressImg: "https://ad.kulizhi.com",
        // adminAddressImg: "http://192.168.1.135:8080",
        // appid: 'wx923af279b0388603',
        // secret: '81beb1a470654ec92ce7fc27f14009b5',
        mealTime: "",
        chooseMeal: "",//当前要查看的订单详情
        appid: "wx923af279b0388603",
        secret: "81beb1a470654ec92ce7fc27f14009b5",
        gdKey: "5441fba65213bf0d9a6c4b1c81b8cd1e",//高的地图key
        gdxcxKey: "8489da6764f20baa70182ed141893109",//高的地图小程序key
        // qqxcxKey: "Z56BZ-Q6CWG-K65QM-IFB67-JWYXK-OBFUF"//腾讯地图小程序key旧
        qqxcxKey: "LE4BZ-TUV66-YLCSW-ERGGG-5U3YK-WSBSC"//腾讯地图小程序key
    },

    onLaunch: function (res) {
        let that = this;
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.request({
                    url: 'https://ad.djfy365.com/api/client/info',
                    method: 'POST',
                    data: {
                        jsCode: res.code
                    },
                    header: { "content-type": 'application/x-www-form-urlencoded' },
                    success: res => {
                        // console.log('获取openid');
                        // console.log(res);
                        var user = res.data.data;
                        // console.log(res.data.data.openid);
                        wx.setStorageSync('user', user);//本地存储userID  
                        that.globalData.openId = res.data.data.openid   //全局储存openId
                        wx.getUserInfo({
                            success: function (res) {
                                // console.log('获取用户基本信息');
                                // console.log(res);
                                that.globalData.userInfo = res.userInfo;
                                wx.setStorage({
                                    key: 'userInfo',
                                    data: res.userInfo,
                                    success: function () {

                                    }
                                })
                            },
                            fail: function (res) {
                                // console.log('失败')
                                if (res.errMsg === "getUserInfo:fail auth deny") {

                                    wx.openSetting({
                                        success: (res) => {
                                            if (!res.authSetting['scope.userInfo']) {
                                                wx.navigateBack({
                                                    delta: 1,
                                                })
                                            } else {
                                                wx.getUserInfo({
                                                    success: function (res) {
                                                        that.globalData.userInfo = res.userInfo;
                                                        wx.setStorage({
                                                            key: 'userInfo',
                                                            data: res.userInfo,
                                                            success: function () {

                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                }
                            }

                        });
                    },
                    fail: function (res) {
                        console.log('openId获取失败')
                        console.log(res)
                    }
                })
            }
            

        });


        // 获取用户信息
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // console.log('asdjhasd')
                            // 可以将 res 发送给后台解码出 unionId

                            that.globalData.userInfo = res.userInfo;
                            wx.setStorage({
                                key: 'userInfo',
                                data: res.userInfo,
                                success: function () {

                                }
                            })


                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }

        })
        

    },
    // 判断是否有微信收货地址
    // 判断userInfo是否存在
    judgeAddress: function (options) {
        let _this = this;
        // 1.判断globalData中的address是否存在
        console.log(_this.globalData.address);
        if (_this.globalData.address && _this.globalData.address.telNumber) {
            console.log('全局')
            options.success(_this.globalData.address);
        } else {// 2.判断缓存中是否有address存在
            wx.getStorage({
                key: 'address',
                success: function (res) {
                    console.log('缓存')
                    _this.globalData.address = res.data;
                    options.success(_this.globalData.address);
                },
                fail: function () {
                    _this.getAddress(options);
                }
            })
        }
    },
    // 获取微信收货地址
    getAddress: function (options) {
        console.log('第一次');
        let _this = this;
        wx.chooseAddress({
            success: function (res) {
                console.log('成功');
                _this.globalData.address = res;
                wx.setStorage({
                    key: 'address',
                    data: res,
                    success: function () {
                        options.success(res);
                    }
                });
            },
            fail: function (res) {
                console.log('失败');
                wx.openSetting({
                    success: (res) => {
                        if (!res.authSetting['scope.address']) {
                            wx.navigateBack({
                                delta: 1,
                            })
                        } else {
                            console.log(res);
                            _this.chooseAddress(options);
                        }
                    }
                })
            }
        })
    },
    //调起用户编辑收货地址原生界面，并在编辑完成后返回用户选择的地址。
    chooseAddress: function (options) {
        let _this = this;
        wx.chooseAddress({
            success: function (res) {
                _this.globalData.address = res;
                wx.setStorage({
                    key: 'address',
                    data: res,
                    success: function () {
                        options.success(res);
                    }
                });
            }
        })
    },
})
