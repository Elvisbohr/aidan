// pages/menu/menu.js
var app = getApp();
// import menus from '../resources/json/menus.js';
Page({
    data: {
        attention: 0,  //判断他是否收藏(0未关注1已关注)
        // coupon: '',   //代金券活动
        // manjian: '满100减1000', //满减活动
        tabs: ["点餐", "商家"],
        activeIndex: "0",
        sliderOffset: 0,
        sliderLeft: 0,
        jieshao: true,         //店铺介绍是否全部显示
        privilege: false,    //商铺活动
        xl: false,     //下拉显示全部活动
        indicatorDots: true,
        vertical: false,
        autoplay: false,
        interval: 3000,
        duration: 1200,
        'menus': '',
        selectedMenuId: 0,
        curIndex: 0,
        total: {
            count: 0,
            price: 0,
            list: []
        },
        cartTab: false,
        chitR: true,   //判断是否有代金券
        chitMain: false,   //显示领取代金券页面 
        specShade: false,   //是否显示规格页面
        specifications: {},//当前选择的规格      
        flavors: {},//当前选择的口味
        shopActivity: false,     //店铺活动详情
        //关于无缝滚动参数
        bchange: 2,//变化值，可自定义设置
        bspeed: 186,//速度，可自定义设置
        direction: "vertical", //  horizontal=水平 vertical=垂直  ，可设置
        horizontal_dire: "left",// direction: "horizontal" 有效，   left =左    right =右，可设置
        vertical_dire: "bottom",// direction: "vertical" 有效，   top =上    bottom =下，可设置
        strs: [],//滚动内容，可自定义设置
        clonestr: [],//无缝衔接容器
        bw: 0,//容器宽度
        bh: 0,//容器高度
        bl: 15,//容器位置 left
        bt: 0//容器位置 top
    },
    onLoad: function (options) {
        var that = this;
        // 获取商铺基本信息接口
        console.log(options)
        var takeid = [];
        takeid.id = options.id;
        //获取用户头像,外卖费用等
        that.takeOut(takeid);
        var data = [];
        data.shopId = options.id;

        // 获取商户信息
        that.shopInfo(data);
        that.setData({
            appImg: app.globalData.adminAddressImg,
            shopId: options.id,
        });
        //判断店铺是否已收藏接口
        var isData = [];
        isData.shopId = options.id;
        isData.openid = app.globalData.openId;
        that.isCollect(isData)
        wx.getSystemInfo({  //获取手机信息(宽高等)
            success: function (res) {
                // console.log(res)
                that.setData({
                    menuhieght: res.windowHeight - 174,
                });
                // console.log(that.data.menuhieght)
            }
        });
        //判断是否有优惠活动
        var activityData = [];
        activityData.shopId = options.id;
        that.isActivity(activityData);
        //获取菜品列表
        var menuData = [];
        menuData.shopId = options.id;
        that.menuLsit(menuData)

        // that.setData({
        //     shopName: options.name
        // })
        //查询是否有代金券
        var queryChitData = []; //声明查询代金券接口需要传回data数据  
        queryChitData.shopId = options.id // 商铺Id
        queryChitData.openid = app.globalData.openId; //openid
        that.queryChit(queryChitData) //查询代金券接口
        //载入数据时显示正在加载
        wx.showLoading({
            title: '正在加载',
        });
    },
    //点击后改变收藏状态
    attention: function () {
        var that = this;
        var atten = that.data.attention;  //获取当前收藏状态(0未关注1已关注)
        var msg = '';   //提示词
        // 获取需要传回接口的参数
        var data = [];
        // console.log(that.data)
        if (atten == 0) {
            atten = 1;
            msg = '收藏成功'
            data.openid = app.globalData.openId;    //用户openId
            data.shopId = that.data.shopId;     //商户Id
            that.shopCollect(data);     //调用收藏接口
        } else {
            atten = 0;
            msg = '取消成功';
            data.id = that.data.collectId;     //商户Id
            that.deleteCollect(data)
        }
        wx.showToast({
            title: msg,
            icon: 'success',
            duration: 2000
        })
        that.setData({
            attention: atten,
        })
    },
    //点击选择规格按钮显示选规格弹框
    selectGg: function (e) {
        var that = this;
        var menus = this.data.menus;        //获取菜品列表
        var curIndex = this.data.selectedMenuId;    //获取他是属于哪个分类的
        var index = e.currentTarget.dataset     //获取该菜品的食物id
        var dish = menus[curIndex].goodses.find(function (v) {
            return v.id == index.cid
        })
        // console.log(menus)
        // console.log(curIndex)
        // console.log(dish)

        var selectSpec = []
        selectSpec = dish
        that.setData({
            selectSpec: selectSpec,
            specShade: true,
            istasteId: '',
            isspecId: '',
        })
    },
    //点击规格
    spec: function (e) { //点击获取选到的规格
        var that = this;
        var num = e.currentTarget.dataset.index;  //获取点击的是那个规格

        var selectSpec = that.data.selectSpec;    //获取菜品数组
        var spec = selectSpec.specifications;    //获取菜品规格数组

        var specifications = this.data.specifications;
        specifications = spec[num];

        for (var i = 0; i < spec.length; i++) {   //循环这个数组把所有都变成false
            spec[i].isspec = false;
        }
        spec[num].isspec = true;  //把点击的这个改为true

        var isspecname = spec[num].name;  //声明点击的这个名字
        var isspecId = spec[num].id;  //声明点击的这个名字

        that.setData({      //赋值
            specifications: specifications,
            selectSpec: selectSpec,
            isspecname: isspecname,
            isspecId: isspecId,
            isPic: spec[num].price
        })
    },
    //点击口味
    taste: function (e) {
        var that = this;
        var num = e.currentTarget.dataset.index;  //获取点击的是那个规格
        var selectSpec = that.data.selectSpec;    //获取菜品数组        
        var taste = selectSpec.flavors;    //获取规格数组

        var flavors = this.data.flavors;
        flavors = taste[num];

        for (var i = 0; i < taste.length; i++) {   //循环这个数组把所有都变成false
            taste[i].istaste = false;
        }
        taste[num].istaste = true;  //把点击的这个改为true
        selectSpec.tasteId = taste[num].id;  //获取口味id
        var istastename = taste[num].name  //声明点击的这个名字
        //判断如果没有规格只有口味
        var isnone = that.data.selectSpec.specifications
        if (isnone.length == 0) {
            that.setData({
                isPic: that.data.selectSpec.price, //单价
                selectSpec: selectSpec,
                flavors: flavors,
                istastename: istastename,
                istasteId: taste[num].id
            })
        } else {
            that.setData({      //赋值
                selectSpec: selectSpec,
                flavors: flavors,
                istastename: istastename,
                istasteId: taste[num].id
            })
        }
    },

    //点击规格内的加入购物车
    shopcar: function () {
        var that = this;
        var total = this.data.total;

        //2.整理数组
        var upShopCar = {};         //规格选好后整体数组
        upShopCar.id = that.data.selectSpec.id;   //菜品Id
        upShopCar.name = that.data.selectSpec.name;    //菜品名称
        upShopCar.boxPrice = that.data.selectSpec.boxPrice;   //菜品餐盒费
        upShopCar.price = that.data.isPic;//单价
        var flavors = this.data.flavors;//口味
        var specifications = this.data.specifications;//声明规格
        console.log(specifications.price)
        // if (specifications.price == undefined){   //判断是否是只选择规格
        //   console.log("规格只选择口味")
        //   specifications = {};
        //   specifications.price= that.data.isPic;      
        //   that.setData({
        //     specifications: specifications
        //   })
        // }else{
        //   console.log("已选择规格")      
        // }
        var str = this.data.isspecname + "," + this.data.istastename;//规格和口味的中文字符串
        var idStr = this.data.isspecId + "," + this.data.istasteId;//规格和口味的id字符串

        //2.压入当前选择商品
        var totalGood = total.list.find(function (v) {
            return v.id == upShopCar.id;
        });
        // console.log(this.data.isspecname === undefined)
        //判断规格和口味是否都选择

        console.log("123123123")
        console.log(that.data.selectSpec.specifications.length)
        console.log(that.data.selectSpec.flavors.length)
        if (that.data.selectSpec.specifications.length > 0 && that.data.selectSpec.flavors.length > 0) {
            console.log(that.data.isspecname)
            console.log(that.data.istastename)
            if (that.data.isspecname === "" || that.data.isspecname === undefined) {
                wx.showToast({
                    title: '请选择规格',
                    icon: 'loading',
                    duration: 800
                })
            } else if (that.data.istastename === "" || that.data.istastename === undefined) {
                wx.showToast({
                    title: '请选择口味',
                    icon: 'loading',
                    duration: 800
                })
            } else {
                //1.总个数递增,总价钱增
                total.count += 1;
                total.price = (Number(total.price) + Number(this.data.isPic)).toFixed(2);
                console.log(total.price)
                if (!totalGood) {
                    //当前选择的餐品之前没有选择过
                    upShopCar.standard = [];
                    upShopCar.standard.push({
                        flavors: flavors,
                        specifications: specifications,
                        count: 1,
                        str: str,
                        idStr: idStr
                    });
                    total.list.push(upShopCar);
                } else {
                    //当前餐品已经选择过,判断当前同种规格的是否选择过
                    var standard = totalGood.standard.find(function (v) {
                        return v.idStr == idStr;
                    });
                    if (!standard) {
                        //同种规格的已选择过
                        totalGood.standard.push({
                            flavors: flavors,
                            count: 1,
                            specifications: specifications,
                            str: str,
                            idStr: idStr
                        });
                    } else {
                        standard.count += 1;
                    }
                }

                that.setData({
                    total: total,
                    specShade: false,
                    flavors: {},
                    specifications: {},
                    istastename: '',
                    isspecname: '',
                    // istasteId: undefined,
                    // isspecId: undefined,
                    isPic: 0
                });
            }
        } else {
            if (that.data.isspecname === "" || that.data.isspecname === undefined) {
                if (specifications.price == undefined) {   //判断是否是只选择规格
                    console.log("规格只选择口味")
                    specifications = {};
                    specifications.price = that.data.isPic;
                    that.setData({
                        specifications: specifications
                    })
                };
            };
            //判断是否有选中项
            console.log('that.data.isPic')
            console.log(that.data.isPic)
            if (that.data.isPic == undefined || that.data.isPic == 0) {
                wx.showToast({
                    title: '请选择',
                    icon: 'loading',
                    duration: 800
                });
                that.setData({
                    flavors: {},
                    specifications: {},
                    istastename: '',
                    isspecname: '',
                    isPic: 0
                });
            } else {
                //1.总个数递增,总价钱增
                total.count += 1;
                total.price = (Number(total.price) + Number(this.data.isPic)).toFixed(2);
                console.log(total.price)
                if (!totalGood) {
                    //当前选择的餐品之前没有选择过
                    upShopCar.standard = [];
                    upShopCar.standard.push({
                        flavors: flavors,
                        specifications: specifications,
                        count: 1,
                        str: str,
                        idStr: idStr
                    });
                    total.list.push(upShopCar);
                } else {
                    //当前餐品已经选择过,判断当前同种规格的是否选择过
                    var standard = totalGood.standard.find(function (v) {
                        return v.idStr == idStr;
                    });
                    if (!standard) {
                        //同种规格的已选择过
                        totalGood.standard.push({
                            flavors: flavors,
                            count: 1,
                            specifications: specifications,
                            str: str,
                            idStr: idStr
                        });
                    } else {
                        standard.count += 1;
                    }
                }

                that.setData({
                    total: total,
                    specShade: false,
                    flavors: {},
                    specifications: {},
                    istastename: '',
                    isspecname: '',
                    isPic: 0
                });
            }
        }

    },
    //x选规格关闭按钮
    specOff: function () {
        this.setData({
            specShade: false,
            istastename: '',
            isspecname: '',
            flavors: {},
            specifications: {},
            isPic: 0
        })
    },

    // 点击显示全图
    patImg: function (e) {
        var that = this;
        var imgtype = e.currentTarget.dataset.img;  //判断点击的是那个资质照片
        console.log(imgtype)
        if (imgtype == "businessLicenseImg") {
            if (that.data.shopInfo.businessLicenseImg != "" && that.data.shopInfo.businessLicenseImg != undefined) {
                console.log('商户有上传图片');
                var img = that.data.appImg + that.data.shopInfo.businessLicenseImg; //
                var imgs = img.split();
                console.log(imgs)
                wx.previewImage({
                    urls: imgs
                })
            }
        } else if (imgtype == "licenceImg") {
            if (that.data.shopInfo.licenceImg != "" && that.data.shopInfo.licenceImg != undefined) {
                console.log('商户有上传图片');
                var img = that.data.appImg + that.data.shopInfo.licenceImg; //
                var imgs = img.split();
                console.log(imgs)
                wx.previewImage({
                    urls: imgs
                })
            }
        }

    },
    //显示全部优惠活动
    prompt: function () {
        var that = this;
        that.setData({
            privilege: (!that.data.privilege),
            xl: (!that.data.xl),
        })
    },
    // 点击事件Tab
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    selectMenu: function (event) {  //点击商品分类列表
        let data = event.currentTarget.dataset;
        // console.log(data)
        var that = this,
            menus = that.data.menus;
        for (var i = 0; i < menus.length; i++) {
            if (i === parseInt(data.id)) {
                menus[i].curClass = "on";
            } else {
                menus[i].curClass = "";
            }
        }
        that.setData({
            selectedMenuId: data.id,
            menus: menus
        });

    },
    addCount: function (event) {
        let that = this;
        // menus列表个数递增
        var dataset = event.currentTarget.dataset;  //获取点击的data-的信息 id fid

        console.log("dataset");
        console.log(dataset);
        // total总个数增,总额增
        let total = this.data.total;
        total.count += 1;
        let menus = this.data.menus;        //获取菜品列表
        let curIndex = this.data.selectedMenuId;    //获取他是属于哪个分类的
        let dish = menus[curIndex].goodses.find(function (v) {
            return v.id == dataset.cid
        })
        if (dish) {
            if (dish != undefined) {    //判读如果是有规格的菜品
                dish.count += 1;    //同步加1
            }
            that.setData({
                'menus': menus
            });
        }
        var idStr = dataset.idStr;
        var good = total.list.find(function (v) {
            return v.id == dataset.cid;
        })

        if (good) {
            //分有规格和无规格
            if (good.standard) {
                var g = good.standard.find(function (v) {
                    return v.idStr == idStr;
                })
                g.count += 1;
                total.price = (Number(total.price) + Number(g.specifications.price)).toFixed(2);
            } else {
                good.count += 1;
                total.price = (Number(total.price) + Number(good.price)).toFixed(2);
            }
        } else {
            //无规格
            dish.count = 1;
            total.list.push(dish)
            total.price = (Number(total.price) + Number(dish.price)).toFixed(2);
        }

        console.log("good");
        console.log(good);
        //判断total是否有菜品
        let cartTab = this.data.cartTab;
        let carshop = this.data.carshop;
        if (total.count <= 0) {
            carshop = true;
        } else {
            carshop = false;
        }
        this.setData({
            'carshop': carshop,
            'total': total
        });
    },
    minusCount: function (event) {
        // menus列表个数递减
        var dataset = event.currentTarget.dataset;
        let total = this.data.total;
        total.count -= 1;
        console.log(dataset)
        //判断如果数量未负,则返回上一页
        if (total.count < 0) {
            console.log("非法操作");
            wx.showToast({
                title: '非法操作',
                icon: 'loading',
                duration: 1500
            });
            setTimeout(function () {
                wx.navigateBack({ delta: 1 })
            }, 1500)
        }
        let menus = this.data.menus;        //获取菜品列表
        let curIndex = this.data.selectedMenuId;    //获取他是属于哪个分类的
        let dish = menus[curIndex].goodses.find(function (v) {
            return v.id == dataset.cid
        })
        if (dish) {
            if (dish != undefined) {    //判读如果是有规格的菜品
                dish.count -= 1;    //同步减1
            }
            this.setData({
                'menus': menus
            });
        }

        var idStr = dataset.idStr;
        var good = total.list.find(function (v) {   //查找和当前点击的匹配Id的
            return v.id == dataset.cid;
        });

        if (good) {
            //分有规格和无规格
            //有规格
            if (good.standard) {
                var g = good.standard.find(function (v) {
                    return v.idStr == idStr;
                })
                g.count -= 1;
                console.log(good.standard.findIndex(function (v) {

                    return v.idStr == idStr;

                }))

                if (g.count < 1) {
                    var i = good.standard.findIndex(function (v) {
                        console.log('删除数组中单个数组')
                        return v.idStr == idStr;
                    })
                    console.log(i)
                    good.standard.splice(i, 1);
                    //点击的这个数组剩余的长度
                    console.log('good.standard.length')
                    console.log(good.standard.length)
                    if (good.standard.length < 1) { //判断如果整个点击的数组数量少于0删除整个数组
                        console.log('删除整个数组')
                        var i = total.list.findIndex(function (v) {
                            return v.id == dataset.cid;
                        })
                        // console.log(i)
                        total.list.splice(i, 1);
                    }
                }
                total.price = (Number(total.price) - Number(g.specifications.price)).toFixed(2);
            } else {
                console.log('无规格')
                good.count -= 1;    //匹配项是数量减一
                total.price = (Number(total.price) - Number(good.price)).toFixed(2);    //总钱数减
                if (good.count < 1) {       //判读如果数量少于一删除掉数组里的该字段
                    var i = total.list.findIndex(function (v) {
                        return v.id == dataset.cid;
                    })
                    total.list.splice(i, 1);
                }
            }
        } else {
            //无规格
            console.log('else无规格')
            dish.count = 1;
            total.list.push(dish)
            total.price = (Number(total.price) - Number(dish.price)).toFixed(2);
        };

        console.log("good");
        console.log(good);
        //判断total是否有菜品
        let cartTab = this.data.cartTab;
        let carshop = this.data.carshop;
        if (total.count <= 0) {
            carshop = true;
        } else {
            carshop = false;
        }
        this.setData({
            'carshop': carshop,
            'total': total
        });
    },
    cartshopbtn: function () {
        var that = this;
        that.setData({
            shop: true,
            carshop: true,
        })
    },
    shopbtn: function () {
        var that = this;
        that.setData({
            shop: false,
            carshop: false,
        })
    },
    menuok: function () {
        var that = this;
        if (that.data.total.price == 0) {
            wx.showToast({
                title: '请先选择菜品',
                icon: 'loading',
                duration: 800
            })
        } else {
            wx.setStorage({
                key: 'total',
                data: that.data.total,
                success: function () {
                    wx.navigateTo({
                        url: '../settle/settle?shopId=' + that.data.shopId,
                    })
                }
            })
        }
    },
    onShow: function () { //进入结算中心后返回调取数据
        var that = this;
        wx.getStorage({
            key: 'total',
            //判断toatl的count的值,如果小于零的话就清空数据
            success: function (res) {
                if (res.data.count > 0) {
                    console.log('购物车有菜品');
                    if (res.data.list.length > 0) {
                        that.setData({
                            cartTab: true,
                            shop: false
                        })
                    }
                    that.setData({
                        total: res.data
                    });
                } else {
                    console.log('购物车无菜品');
                    that.emptyShopingCar();
                }
            },
        })
    },
    // 店铺介绍显示全部
    jiesao: function () {
        var that = this;
        that.setData({
            jieshao: (!that.data.jieshao)
        })
    },
    // 跳转到地图页
    shopmap: function () {
        var that = this;
        // 经纬度应该是数字而不是字符串,把接到的数据转换为数值
        var lat = Number(that.data.shopInfo.latitude);
        var lon = Number(that.data.shopInfo.longitude);
        // console.log(lat)
        // console.log(lon)
        wx.openLocation({
            latitude: lat,
            longitude: lon,
            scale: 28
        })
    },
    //点击代金券打开领取页面
    chitMoney: function () {
        var that = this;
        if (that.data.chitR == true) {
            that.setData({
                // chitR: false,
                chitMain: true
            })
        }
    },
    //点击关闭领取代金券页面
    error: function () {
        var that = this;
        // console.log(111)
        that.setData({
            chitMain: false,
        })
    },
    //点击确认按钮之后是代金券变灰
    shitbut: function () {
        var that = this;
        var grabCouponsData = [];
        grabCouponsData.couponId = that.data.queryChit.id;
        grabCouponsData.openid = app.globalData.openId;
        that.grabCoupons(grabCouponsData)
        that.setData({
            chitR: false,
            chitMain: false,
        })
    },
    //   获取接口信息(商铺基本信息)
    shopInfo: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getMerchantInfo',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                // console.log(res.data.data)
                var shopInfo = res.data.data;
                if (shopInfo.introduction == null) {
                    shopInfo.introduction = "暂无店铺介绍";
                }
                if (shopInfo.notice == null || shopInfo.notice == "") {
                    shopInfo.notice = "用餐高峰请提前点餐，谢谢！";
                }
                // that.data.total.push(distributeAmount)
                that.setData({
                    shopInfo: shopInfo,
                })
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })

    },
    //判断店铺是否已收藏接口
    isCollect: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/checkIsShopCollect',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                if (res.data.data == null) {
                    console.log('该用户为游客')
                    that.setData({
                        attention: 0,
                    })
                } else {
                    console.log('判断店铺是否已收藏接口')
                    console.log(res.data.data.isCollect)
                    if (res.data.data.isCollect == "true") {
                        console.log('已收藏')
                        that.setData({
                            isCollect: res.data.data.isCollect,
                            collectId: res.data.data.collectId,
                            attention: 1,
                        });
                        // console.log(that.data)
                    } else if (res.data.data.isCollect == "false") {
                        console.log('未收藏')
                        that.setData({
                            isCollect: res.data.data.isCollect,
                            attention: 0,
                        })
                    }
                };
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })

    },
    //   获取接口信息(点击收藏)
    shopCollect: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/collectShop',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                // console.log('点击收藏')
                // console.log(res)
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })

    },
    //   获取接口信息(删除收藏)
    deleteCollect: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/deleteCollectShop',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                // console.log('删除成功')
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //获取接口信息(是否有活动)
    isActivity: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getShopPreferentials',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('判断是否有优惠活动')
                console.log(res.data.data)
                var activityIndex = res.data.data.num;  //获取共有几个活动
                var shopImg = res.data.data.shopImg //获取商铺头像
                let strs = []   //声明所有活动数组
                // if (shopImg == null) { //判断是否有图片,没有给默认图片
                //   shopImg = '../../images/shopmode.png'
                // }
                // console.log(activityIndex)
                that.setData({
                    activityIndex: activityIndex,
                    shopImg: shopImg,
                })
                //判断该店是否有{{代金券}}活动
                if (res.data.data.coupon == '' || res.data.data.coupon == undefined) {
                    that.setData({
                        iscoupon: false,
                    })
                } else {
                    strs.push(res.data.data.coupon)
                    that.setData({
                        coupon: res.data.data.coupon,
                        iscoupon: true,
                    })
                }
                //判断该店是否有{{满减}}活动
                if (res.data.data.moneyoff == '' || res.data.data.moneyoff == undefined) {
                    that.setData({
                        ismoneyoff: false,
                    })
                } else {
                    strs.push(res.data.data.moneyoff)
                    that.setData({
                        moneyoff: res.data.data.moneyoff,
                        ismoneyoff: true,
                    })
                }
                //判断该店是否有{{折扣}}活动
                if (res.data.data.discount == '' || res.data.data.discount == undefined) {
                    that.setData({
                        isdiscount: false,
                    })
                } else {
                    strs.push(res.data.data.discount)
                    that.setData({
                        discount: res.data.data.discount,
                        isdiscount: true,
                    })
                };
                console.log('strs')
                console.log(strs)
                that.setData({
                    strs: strs,
                });
                //使用无缝滚动函数
                that.seamlessscrolling();
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //查询菜品接口
    menuLsit: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getGoodsList',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                //隐藏消息提示窗口
                wx.hideLoading();
                // console.log('菜品接口')
                // console.log(res)
                // 先把餐单里的数量变为0
                let menusdata = res.data.data;
                console.log('menusdata');
                console.log(menusdata);
                if (menusdata.length == 0) {
                    console.log('商家暂未上传菜品');
                } else {
                    for (var i = 0; i < menusdata.length; i++) {
                        for (var j = 0; j < menusdata[i].goodses.length; j++) {
                            menusdata[i].goodses[j].count = 0;      //给数组加上数量
                            // console.log(j)
                            // console.log(menusdata);
                            //判断如果传回来的price(金额)为0的话
                            // console.log(menusdata[i].goodses[j].price)
                            if (menusdata[i].goodses[j].specifications.length != 0) {
                                // console.log('为有规格菜品')
                                menusdata[i].goodses[j].price = menusdata[i].goodses[j].specifications[0].price
                            }
                        }
                    }
                    //给第一个菜品分类加上On类名
                    menusdata[0].curClass = "on";
                }

                that.setData({
                    menus: menusdata,
                });
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //拨打电话
    callUp: function () {
        var that = this;
        var shopInfo = that.data.shopInfo;
        var phone = shopInfo.telphone
        wx.makePhoneCall({
            phoneNumber: phone //仅为示例，并非真实的电话号码
        })
    },

    //查询是否有代金券
    queryChit: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getShopCoupon',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                // console.log('查询代金券')
                // console.log(res)

                if (res.data.data == null) {
                    isQueryChit: false;
                    that.setData({
                        isQueryChit: false  //判断他是否有代金券
                    })
                } else {
                    isQueryChit: true;
                    that.setData({
                        queryChit: res.data.data, //声明代金券数组
                        isQueryChit: true  //判断他是否有代金券
                    })
                }

            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //抢券接口
    grabCoupons: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/grabCoupons',
            data: data,
            method: "POST",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                // console.log('抢券')
                // console.log(res)
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //清空购物车接口
    emptyShopingCar: function () {
        var that = this,
            menusdata = that.data.menus;
        for (var i = 0; i < menusdata.length; i++) {
            for (var j = 0; j < menusdata[i].goodses.length; j++) {
                menusdata[i].goodses[j].count = 0;      //给数组加上数量
            }
        };
        that.setData({
            menus: menusdata,
            total: {
                count: 0,
                price: 0,
                list: []
            },
        })
    },
    //获取店铺名称与外卖费
    takeOut: function (data) {
        var that = this;

        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getShopInfoById',
            data: data,
            method: "GET",
            success: function (res) {
                //获取店名存入全局
                app.globalData.shopName = res.data.data.shopName;
                //动态设置当前页面的标题
                wx.setNavigationBarTitle({
                    title: res.data.data.shopName
                })
                var takeout = {};
                takeout.shopName = res.data.data.shopName;    //店铺名称
                takeout.distribute = res.data.data.distribute;    //是否开启外卖功能(1开启2未开启)
                if (res.data.data.distribute == 1) {
                    takeout.distributeLeastmoney = res.data.data.distributeLeastmoney;  //外卖起送金额
                    takeout.distributeMoney = res.data.data.distributeMoney;    //外卖配送费
                    if (takeout.distributeLeastmoney == null) {
                        takeout.distributeLeastmoney = 0
                    };
                    if (takeout.distributeMoney == null) {
                        takeout.distributeMoney = 0
                    };
                };
                console.log('takeout')
                console.log(res.data.data)
                that.setData({
                    takeout: takeout,
                })
                app.globalData.takeout = takeout;
                wx.setStorage({
                    key: 'takeout',
                    data: takeout,
                    success: function () {
                        console.log('配送存入成功')
                    }
                })

            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    // 点击活动查看详细(弹框)
    shopActivity: function () {
        let that = this;
        that.setData({
            shopActivity: true,
        });
    },
    // 关闭活动详请
    closer: function () {
        let that = this;
        that.setData({
            shopActivity: false,
        })
    },
    // 转发
    onShareAppMessage: function (res) {
        var that = this,
            shopid = that.data.shopId,
            shopname = that.data.shopName;
        if (res.from === 'menu') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '爱点自助点餐',
            path: 'pages/menu/menu?id=' + shopid + '&name=' + shopname,
            imageUrl: "/images/message.png",
            success: function (res) {
                // 转发成功
                // console.log(res)
            }
        };
    },
    //无缝滚动函数
    seamlessscrolling: function () {
        var that = this;
        //复制容器
        var clonestr = [];
        console.log('123123123')
        console.log(this.data.strs)
        for (var i = 0; i < this.data.strs.length; i++) {
            clonestr.push(this.data.strs[i]);
        };
        for (var i = 0; i < this.data.strs.length; i++) {
            clonestr.push(this.data.strs[i]);
        };
        //console.log(clonestr);
        that.setData({ clonestr: clonestr })
        //容器设置 获取设备宽度（可自定义处理）
        wx.getSystemInfo({
            success: function (res) {
                //console.log(res.windowWidth)
                //console.log(res.windowHeight)
                that.setData({ bw: res.windowWidth, bh: 20 })
            }
        })
        //动画
        var anima = setInterval(function () {
            if (that.data.direction == "horizontal") {//水平
                if (that.data.bl - that.data.bchange <= -that.data.bw * that.data.strs.length) {
                    that.setData({ bl: 0 })
                } else {
                    that.setData({ bl: that.data.bl - that.data.bchange })
                };
            } else if (that.data.direction == "vertical") {//垂直
                if (that.data.bt - that.data.bchange <= -that.data.bh * that.data.strs.length) {
                    that.setData({ bt: 0 })
                } else {
                    that.setData({ bt: that.data.bt - that.data.bchange })
                };
            };
        }, that.data.bspeed)

    },
})