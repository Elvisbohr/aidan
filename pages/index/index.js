//获取应用实例
var app = getApp()
var amapFile = require('../../utils/amap-wx.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');

//index.js
Page({
    data: {
        mainHieght: '',  //商铺列表的高度
        city: '',
        citys: [],
        citysIndex: 0,  //测试用下拉框用
        pageNum: 1,
        autoplay: true,
        isMore: false,
        moreTit: '加载更多',
        isRequest: true,
        addtes: false,  //是否显示全部活动
    },
    onLoad: function (options) {
        console.log('onLoad')
        var that = this;
        that.getCoordinates(); //获取当前城市
        //获取手机信息(宽高等)
        wx.getSystemInfo({
            success: function (res) {
                console.log(res)
                that.setData({
                    appImg: app.globalData.adminAddressImg,
                    mainHieght: res.windowHeight - 250,
                });
                // console.log(that.data.mainHieght)
            }
        });

        that.orderList(); //广告轮播图


    },

    city: function (e) {
        console.log("暂未开发")
        //跳转至选择城市页面正在架设
        // wx.navigateTo({
        //   url: '../switchcity/switchcity',
        // });

    },
    //业务人员使用
    bindCitysChange: function (e) {
        var that = this;
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            citysIndex: e.detail.value,
            pageNum: 1,
            moreTit: '加载更多',
            city: that.data.citys[e.detail.value],

        })
        let data = {};
        data.lat = that.data.lat;
        data.lon = that.data.lon;
        data.keywords = that.data.searchTerm;
        data.openid = that.data.openId;
        data.city = that.data.citys[e.detail.value];
        console.log(data)
        that.getMerchantList(data)
    },
    // 获取当前城市位置与点击选取城市
    // 使用腾讯地图获取城市
    getCoordinates: function () {
        var that = this,
            // 实例化腾讯地图API核心类
            qqmapsdk = new QQMapWX({
                key: app.globalData.qqxcxKey // 必填
            }),
            data = {};

        //1、获取当前位置坐标
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                var data = {};
                //3、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
                console.log(res)
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: function (addressRes) {
                        var city = addressRes.result.address_component.city;
                        that.setData({
                            'city': city,
                            citys: [city, '测试'],
                        });
                        data.lat = res.latitude;
                        data.lon = res.longitude;
                        data.city = city;
                        data.keywords = that.data.searchTerm;
                        app.globalData.lat = res.latitude;
                        app.globalData.lon = res.longitude;
                        console.log(data);
                        that.isOpenid(data);
                    }
                });
                
                //成功回调
                that.setData({
                    lat: res.latitude,
                    lon: res.longitude,
                });
                

            },
            fail: function (info) {
                wx.showToast({
                    title: '网络错误',
                });
            }
        })

    },
    

    isOpenid: function (data) {
        console.log('判断openid是否存在');
        var that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                that.setData({
                    openId: res.data.openid
                });
                // app.globalData.openId = res.data.openid;
                data.openid = res.data.openid;
                data.city = data.city;
                console.log('测试城市');
                console.log(data);
                console.log(data.city);
                that.getMerchantList(data);
            },
            fail: function () {
            }
        })
    },
    //商铺列表接口
    getMerchantList: function (data) {
        console.log('商戶列表接口數據');
        var that = this;
        that.setData({
            isRequest: false
        });
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/fjshoplist',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                wx.hideLoading();
                //如果是下拉刷新的话使用
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
                console.log(res)
                //根据pageNum判断是从哪里调取接口(大于1为点击加载分页)
                if (that.data.pageNum > 1) {
                    if (res.data.data.list == null) {
                        that.setData({
                            moreTit: '暂无更多'
                        })
                    } else {
                        var merchants = that.data.merchants;
                        for (var i = 0; i < res.data.data.list.length; i++) {
                            merchants.push(res.data.data.list[i]);
                        }
                        for (var j = 0; j < merchants.length; j++) {
                            merchants[j].addtes = false;
                        }
                        that.setData({
                            pagesAll: res.data.data.pages,
                            merchants: merchants,
                            isRequest: true
                        })
                    }
                } else {
                    var merchants = res.data.data.list;
                    for (var j = 0; j < merchants.length; j++) {
                        merchants[j].addtes = false;
                    }
                    that.setData({
                        pagesAll: res.data.data.pages,
                        merchants: res.data.data.list,
                        isRequest: true
                    });
                }
                
            },

            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //搜索框搜索地址或店铺的值放入data里
    blurInput: function (e) {
        var that = this;
        console.log(e.detail.value)
        if (e.detail.value == undefined) {
            var searchTerm = ''
        } else {
            var searchTerm = e.detail.value
        }
        console.log(searchTerm)
        that.setData({
            searchTerm: searchTerm
        })
    },
    // 搜索完成后点击完成或者图标或者失去input焦点时获取data里值上传
    tapSearch: function () {
        var that = this,
            data = {};
        if (that.data.searchTerm == undefined) {
            that.setData({
                searchTerm: '',
            })
        };
        data.keywords = that.data.searchTerm;
        data.openId = that.data.openId;
        data.lat = that.data.lat;
        data.lon = that.data.lon;
        data.city = that.data.city;
        console.log('测试城市');
        console.log(that.data.city);
        //重置分页(加载更多)
        that.setData({
            pageNum: 1,
            moreTit: '加载更多'
        })
        this.getMerchantList(data);
    },
    // 搜索失去input焦点时获取data里值上传
    tapSearchs: function () {
        var that = this,
            data = {};
        if (that.data.searchTerm != "") {

            if (that.data.searchTerm == undefined) {
                that.setData({
                    searchTerm: '',
                });
            };
            data.keywords = that.data.searchTerm;
            data.openId = that.data.openId;
            data.lat = that.data.lat;
            data.lon = that.data.lon;
            data.city = that.data.city;
            console.log('测试城市');
            console.log(that.data.city);
            //重置分页(加载更多)
            that.setData({
                pageNum: 1,
                moreTit: '加载更多'
            })
            this.getMerchantList(data);
        };
    },
    onShow: function () {
        wx.setStorage({
            key: 'total',
            data: { count: 0, price: 0, list: [] },
        })

    },
    //跳转店铺
    shopnav: function (e) {
        var that = this;
        var merchants = that.data.merchants;    //获取data里的商铺接口数据
        var index = e.currentTarget.dataset.index;  //获取点击的是啊哪个个
        //点击店铺时调取接口判断当前是否营业     
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/isOpen',
            data: {
                shopId: merchants[index].id
            },
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('res')
                console.log(res)
                if (res.data.data) {
                    // console.log(merchants[index].isOpen == 1)

                    wx.navigateTo({
                        // url: '../menu/menu?id=' + merchants[index].id + '&name=' + merchants[index].shopName,
                        url: '../menu/menu?id=' + merchants[index].id + '&shopType=1',   //shopType来判断是通过什么途径进入的

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
    //首页广告图
    orderList: function () {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/queryAdvert',
            method: "GET",
            // header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('轮播')
                console.log(res.data.data)
                var bannerUrls = res.data.data;
                that.setData({
                    bannerUrls: bannerUrls,
                })
                console.log(bannerUrls)
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //加载更多接口
    loadMore: function () {
        var that = this,
            pageNum = that.data.pageNum,
            data = {};
        if (that.data.isRequest && (pageNum < that.data.pagesAll)) {
            pageNum += 1;
            data.openId = that.data.openId;
            data.lat = that.data.lat;
            data.lon = that.data.lon;
            data.city = that.data.city;
            data.keywords = that.data.searchTerm;
            data.pageNum = pageNum;
            that.setData({
                pageNum: pageNum,
            })
            console.log(data)
            if (that.data.moreTit != '暂无更多') {
                //判断如果为暂无更多的话不执行
                this.getMerchantList(data);
                if (pageNum === that.data.pagesAll) {
                    that.setData({
                        moreTit: '暂无更多',
                    })
                }
            }
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        var that = this;
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        wx.hideLoading();
        wx.hideToast();
        //刷新导入商铺接口
        var data = {};
        data.openid = that.data.openId;
        data.lat = that.data.lat;
        data.lon = that.data.lon;
        data.city = that.data.city;
        data.keywords = undefined;
        that.getMerchantList(data); //调取查询上去列表接口
        that.setData({    //重置商铺列表
            merchants: [],
            pageNum: 1,
            moreTit: '加载更多',
            searchTerm: '',
        })
    },
    //调取扫一扫api(跳转到商铺)
    sweep: function (res) {
        // 只允许从相机扫码
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                console.log("调取成功")
                console.log(res.path)
                let ss = res.path
                var reg2 = /([^?]+)$/;
                var bluefile = ss.match(reg2)[1];
                console.log(bluefile)
                wx.navigateTo({
                    url: '../menu/menu?' + bluefile
                })
            }
        })
    },
    addtes: function (e) {
        console.log(e.currentTarget.dataset.index)
        let that = this,
            merchants = that.data.merchants,
            i = e.currentTarget.dataset.index;
        merchants[i].addtes = !that.data.merchants[i].addtes
        this.setData({
            merchants: merchants
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
