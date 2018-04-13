var app = getApp()
// pages/settle/settle.js
Page({
    data: {
        upmore: true,    //查看全部已点餐品
        xl: false,      //下拉箭头
        circle: false,   //就餐方式
        cirImg: true,    //就餐方式
        outImg: true,    //就餐方式
        takeFoodtime: '',   //取餐时间
        discount: [],
        actIndex: 0,        //选中的优惠活动下标
        couIndex: 0,        //选中的代金券活动的下标
        waytachType: 1,        //上传接口(就餐类型 1堂食 2自取 3外卖)
        submit: true,      //判断点击提交订单
    },

    onLoad: function (options) {
        // console.log(options)
        var that = this;
        var shopName = app.globalData.shopName;     //从全局里取出店铺名
        var distribute = app.globalData.takeout.distribute;     //从全局里取出是否能外卖
        if (distribute == 1){                           //判断是否开启了外卖功能(1开启2未开启)
        var distributeMoney = app.globalData.takeout.distributeMoney;     //从全局里取出外卖费
        var distributeLeastmoney = app.globalData.takeout.distributeLeastmoney  //外卖起送价
        // console.log(shopName)
        that.setData({
            distributeMoney: distributeMoney,   //外卖费
            distributeLeastmoney: distributeLeastmoney, //起送费
        })
        }
        console.log(distributeMoney)
        
        //获取当前时间戳  
        var timestamp = Date.parse(new Date());
        that.setData({
            only: timestamp
        })
        timestamp = timestamp / 1000;
        //获取当前时间  
        var n = timestamp * 1000;
        var date = new Date(n);
        //时  
        var h = date.getHours();
        //分  
        var m = date.getMinutes();
        if (h >= 1 && h <= 9) {
            h = "0" + h;
        }
        if (m >= 0 && m <= 9) {
            m = "0" + m;
        }
        // console.log("当前时间：" + h + ":" + m);
        //获取日期
        var date = new Date(n);
        //年  
        var Y = date.getFullYear();
        //月  
        var Mon = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        //日  
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        // console.log("当前日期：" + Y + '/' + Mon + '/' + D);
        that.setData({
            takeFoodtime: h + ":" + m,
            takeFoodDay: Y + '/' + Mon + '/' + D,
            shopName: shopName,
            distribute: distribute,
        })
        //获取本地缓存里数据

        wx.getStorage({
            key: 'total',
            success: function (res) {
                var submitshop = res.data;
                // console.log(123123)
                // console.log(submitshop)

                // 算外卖费并往上传的数据里赋值
                var cnaheprice1 = 0,    //声明单个外卖费
                    cnaheprice2 = 0,
                    count = 0,  //声明总数量
                    count1 = 0,  //声明无规格数量
                    count2 = 0,  //声明有规格数量
                    count3 = 0,  //声明当前规格数量
                    wupriveMoney = 0, //无规格总价
                    yupriveMoney = 0, //有规格总价
                    allcnaheprice = 0,  //声明总外卖费用
                    wuitemprice = 0,  //什么无规格单价
                    yuitemprice = 0;  //什么有规格单价

                for (var i = 0; i < submitshop.list.length; i++) {  //循环列表累加

                    // 判断是否是有规格菜品              
                    if (submitshop.list[i].standard == undefined) {     //无规格的菜品

                        count1 = submitshop.list[i].count;         //无规格的数量
                        cnaheprice1 = submitshop.list[i].boxPrice;            //无规格的餐盒费 
                        wupriveMoney += count1 * cnaheprice1;   //无规格餐盒费总价
                        wuitemprice = submitshop.list[i].price  //无规格单价
                        submitshop.list[i].allfoodprice = (Number(wuitemprice) * Number(count1)).toFixed(2);  //单个菜品总价
                        // console.log("无规格")
                        // console.log(count1)
                        // console.log(wuitemprice)
                    } else {                                        //   有规格的菜品
                        for (var j = 0; j < submitshop.list[i].standard.length; j++) {
                            count2 += submitshop.list[i].standard[j].count;     //遍历出有规格的数量加起来(更改需求后暂时无用;)
                            count3 = submitshop.list[i].standard[j].count;     //遍历出当前规格的数量
                            cnaheprice2 = submitshop.list[i].boxPrice;      //有规格的餐盒费 
                            yuitemprice = submitshop.list[i].standard[j].specifications.price  //有规格单价              
                            submitshop.list[i].standard[j].allboxprice = (Number(cnaheprice2) * Number(count3)).toFixed(2);//单个菜品总餐盒费
                            submitshop.list[i].standard[j].allfoodprice = (Number(yuitemprice) * Number(count3)).toFixed(2);  //单个菜品总价
                            // console.log("有规格")
                            //  console.log(count3)
                            yupriveMoney += (Number(submitshop.list[i].standard[j].allboxprice));      //有规格的总餐盒费(未精确循环外精确) 
                            //  console.log(yupriveMoney)

                        }
                    }

                }
                yupriveMoney = yupriveMoney.toFixed(2);//在循环外面精确餐盒费小数点2位内
                console.log(yupriveMoney)
                var totals = submitshop.price
                // allcnaheprice = (count1 * cnaheprice1) + (count2 * cnaheprice2)     //总餐盒费
                // allcnaheprice = wupriveMoney + yupriveMoney;     //结果不精确未四舍五入
                allcnaheprice = (Number(wupriveMoney) + Number(yupriveMoney)).toFixed(2); //总餐盒费取两位
                that.setData({
                    allcnaheprice: allcnaheprice,
                    submitshop: submitshop,
                    totals: totals,   //接口上传需要的合计
                    shopid: options.shopId,

                });
                //使用用户优惠活动接口
                var actdata = {};
                actdata.openid = app.globalData.openId;
                actdata.shopId = options.shopId;
                actdata.total = submitshop.price
                that.upActivity(actdata);
            },
        });
        wx.getStorage({
            key: 'userInfo',
            success: function (res) {
                console.log(res.data)
                that.setData({
                    customerName: res.data.nickName
                })
            },
        });
        that.upPhone();
    },
    // 查看全部已点菜品
    upmore: function () {
        var that = this;
        that.setData({
            upmore: (!that.data.upmore),
        })
    },
    // 就餐方式(堂食还是外卖)
    waytach: function (e) {
        var that = this;
        var upActivity = that.data.upActivity;  //从接口获取订单总数据
        var types = e.currentTarget.dataset.types;  //获取点击的是那个
        if (types === 'DiningWay') {
            console.log('堂食')
            upActivity.payMoney = (Number(that.data.tsprice));
            var totals = (Number(that.data.submitshop.price)).toFixed(2)
            that.setData({
                circle: false,
                cirImg: true,
                outImg: true,
                upActivity: upActivity,
                totals: totals,   //合计价格
                waytachType: 1,     //上传接口(就餐类型 1堂食 2自取 3外卖)
            });
        } else if (types === 'invoice') {
            console.log('自取')
            upActivity.payMoney = that.data.wmprice;
            var totals = (Number(that.data.submitshop.price) + Number(that.data.allcnaheprice)).toFixed(2)
            that.setData({
                invoice: (!that.data.invoice),
                upActivity: upActivity,
                circle: true,
                cirImg: false,
                outImg: true,
                totals: totals,   //合计价格
                waytachType: 2,     //上传接口(就餐类型 1堂食 2自取 3外卖)
            });
        } else if (types === 'takeOut') {
            console.log('外卖')
            console.log(that.data.submitshop.price)
            console.log(that.data.distributeLeastmoney)
            var price = Number(that.data.submitshop.price).toFixed(2);
            var distributeLeastmoney = Number(that.data.distributeLeastmoney).toFixed(2);
            if (distributeLeastmoney > price) {
                wx.showToast({
                    title: '未到配送价格',
                    icon: 'loading',
                    duration: 2000
                });
            } else {               
                //调取收货地址接口
                this.getDeliveryAddress();
                upActivity.payMoney = that.data.wsprice;
                var totals = (Number(that.data.submitshop.price) + Number(that.data.allcnaheprice) + Number(that.data.distributeMoney)).toFixed(2)
                console.log(totals)
                that.setData({
                    invoice: (!that.data.invoice),
                    upActivity: upActivity,
                    circle: true,
                    cirImg: true,
                    outImg: false,
                    totals: totals,   //合计价格
                    waytachType: 3,     //上传接口(就餐类型 1堂食 2自取 3外卖)
                });
            }
        };
    },
    // 就餐时间
    bindTimeChange: function (e) {
        this.setData({
            takeFoodtime: e.detail.value
        })
    },
    //选择优惠活动
    bindActivityChange: function (e) {
        var that = this;
        var index = e.detail.value;
        var preferentialType = that.data.discount[index].preferentialType;  //折扣和满减选中项(传回接口)	
        // console.log('preferentialType')
        // console.log(e)
        // console.log(index)
        // console.log(preferentialType)
        that.setData({
            actIndex: e.detail.value
        })
        //使用用户优惠活动接口
        var actdata = {};
        actdata.openid = app.globalData.openId;     //用户openid
        actdata.shopId = that.data.shopid;          //商铺id
        actdata.total = that.data.submitshop.price; //订单总价
        actdata.discount_money_Type = preferentialType; //优惠活动当前选中项   
        if (that.data.tachcouId != null) {
            actdata.couponId = that.data.tachcouId;  //默认代金券id
        }
        that.upActivity(actdata);
    },
    //选择代金券
    bindCouponsChange: function (e) {
        var that = this;
        var index = e.detail.value;
        var couponId = this.data.coupons[index].id;
        // console.log(couponId)
        this.setData({
            couIndex: e.detail.value
        })
        //使用用户优惠活动接口
        var actdata = {};
        actdata.openid = app.globalData.openId;     //用户openid
        actdata.shopId = that.data.shopid;          //商铺id
        actdata.total = that.data.submitshop.price  //订单总价
        actdata.couponId = couponId         //代金券当前选中项    
        if (that.data.tachdisId != null) {
            actdata.discount_money_Type = that.data.tachdisId //默认优惠活动id
        }
        that.upActivity(actdata);
    },
    //获取用户优惠活动接口
    upActivity: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/calculateAmount',
            data: data,
            method: "GET",
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log(data.discount_money_Type == undefined)
                wx.hideLoading();
                // console.log(res.data.data)
                var discount = res.data.data.discount_moneyoff;      //从接口中取出优惠活动数组
                var coupons = res.data.data.coupons;                 //从数组中取出代金券数组
                var upActivity = res.data.data;
                var allcnaheprice = that.data.allcnaheprice;    //声明总餐盒费
                var distributeMoney = that.data.distributeMoney;    //声明外送费
                //堂食的总计(upActivity.payMoney为系统计算好的总价)
                var tsprice = (Number(upActivity.payMoney));         //堂食是总价         
                //自提的总计
                var wmprice = (Number(upActivity.payMoney) + Number(allcnaheprice)).toFixed(2);    //外卖的总价
                //外卖的总价
                var wsprice = (Number(upActivity.payMoney) + Number(allcnaheprice) + Number(distributeMoney)).toFixed(2);    //外卖的总价
                //判断就餐方式是堂食还是外卖,然后计算实付款并返回
                if (that.data.waytachType == 1) {
                    console.log('堂食');
                    upActivity.payMoney = tsprice;
                } else if (that.data.waytachType == 2) {
                    console.log('自取');
                    upActivity.payMoney = wmprice;
                } else if (that.data.waytachType == 3) {
                    console.log('外卖');
                    upActivity.payMoney = wsprice;
                }
                //判断如果是第一次进入则调用接口默认最优选项
                var tachdisId = upActivity.discount_moneyoff_seled  //优惠活动默认id
                var tachcouId = upActivity.coupons_seled  //代金券默认id
                if (data.discount_money_Type == undefined || data.couponId == undefined) {
                    // 初次调取优惠信息接口
                    //找接口返回的匹配id的下标
                    console.log('找到默认最优优惠选项')
                    var d = discount.findIndex(function (v) {
                        return v.preferentialType == tachdisId;
                    })
                    var actIndex = d;
                    var c = coupons.findIndex(function (v) {
                        return v.id == tachcouId;
                    })
                    var couIndex = c;
                    that.setData({
                        actIndex: actIndex,
                        couIndex: couIndex,
                        allcnaheprice: allcnaheprice,
                    })
                }
                var preferentials = [];     //声明要上传接口所用数组
                var actIndex = that.data.actIndex,
                    couIndex = that.data.couIndex;
                // console.log(discount[actIndex])     
                // console.log(discount[actIndex].id)     
                // console.log(coupons[couIndex])     
                // console.log(coupons[couIndex].preferentialType)
                if (discount[actIndex] != undefined) {
                    if (discount[actIndex].id != null) {
                        console.log("未选择活动无优惠")
                        preferentials.push(discount[actIndex])      //所选优惠数组
                    }
                }
                if (coupons[couIndex] != undefined) {
                    if (coupons[couIndex].preferentialType != null) {
                        console.log("未选择代金券无优惠")
                        preferentials.push(coupons[couIndex])       //所选代金券数组
                    }
                };
                console.log(preferentials)
                that.setData({
                    tachdisId: tachdisId,   //优惠活动默认id
                    tachcouId: tachcouId,   //代金券默认id
                    upActivity: upActivity,     //所有优惠数组 
                    discount: discount,         //优惠数组
                    coupons: coupons,           //代金券数组
                    tsprice: tsprice,           //堂食总金额
                    wmprice: wmprice,           //自取总金额
                    wsprice: wsprice,           //外带总金额
                    preferentials: preferentials, //声明要上传接口所用数组
                });
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
    },
    //验证手机号
    checkPhone: function (telphone) {
        if (!(/^1[34578]\d{9}$/.test(telphone))) {
            return false;
        };
        return true;
    },
    /**
    * 生命周期函数--监听页面初次渲染完成
    */
    onReady: function () {
    },
    // 选择地址
    chooseAddress: function () {
        let _this = this;
        app.chooseAddress({
            success: function (res) {
                _this.setData({
                    address: res,
                    telPhone: res.telNumber,
                });
            }
        })
    },
    /**
 * 获取收货地址
 */
    getDeliveryAddress: function () {
        var _this = this;
        app.judgeAddress({
            success: function (res) {
                _this.setData({
                    address: res,
                    telPhone: res.telNumber,
                });
            }
        })
    },
    // 提交订单
    submitOrder: function (e) {
        // console.log(e)
        var that = this;
        var result = this.checkPhone(e.detail.value.telphone);  //判断手机号是否正确
        var cirnum = e.detail.value.cirnum;     //填写的桌号
        var note = e.detail.value.note;         //填写备注
        var telphone = e.detail.value.telphone; //填写手机号
        var goods = [];     //声明需要上传的数组
        var submitshop = that.data.submitshop   //声明已购菜品总数组
        for (var i = 0; i < submitshop.list.length; i++) {  //循环列表累加
            // 判断是否是有规格菜品              
            if (submitshop.list[i].standard == undefined) {     //无规格的菜品    
                var upgoods = {}; //声明上传数组的对象                                                                    
                //无规格菜品压入接口数组
                upgoods.boxPrice = submitshop.list[i].boxPrice;       //餐盒费
                upgoods.goodsName = submitshop.list[i].name;       //菜品名称
                upgoods.goodsId = submitshop.list[i].id;     //菜品Id
                upgoods.num = submitshop.list[i].count;  //菜品数量
                // upgoods.price = submitshop.list[i].price;    //菜品单价
                upgoods.price = submitshop.list[i].allfoodprice;    //菜品单个总价
                goods.push(upgoods)
            } else {                                        //   有规格的菜品
                for (var j = 0; j < submitshop.list[i].standard.length; j++) {
                    console.log(j)
                    var upgoods = {}; //声明上传数组的对象
                    upgoods.boxPrice = submitshop.list[i].boxPrice; //餐盒费  
                    upgoods.goodsName = submitshop.list[i].name;       //菜品名称                    
                    upgoods.goodsFlavorId = submitshop.list[i].standard[j].flavors.id;   //菜品口味id
                    upgoods.goodsFlavorName = submitshop.list[i].standard[j].flavors.name;   //菜品口味名称
                    upgoods.goodsId = submitshop.list[i].id;    //菜品Id
                    upgoods.goodsSpecificationId = submitshop.list[i].standard[j].specifications.id; //菜品规格Id
                    upgoods.goodsSpecificationName = submitshop.list[i].standard[j].specifications.name; //菜品规格名称
                    upgoods.num = submitshop.list[i].standard[j].count;  //菜品数量
                    // upgoods.price = submitshop.list[i].standard[j].specifications.price //菜品单价.
                    upgoods.price = submitshop.list[i].standard[j].allfoodprice //菜品单个总价.
                    goods.push(upgoods)
                };

            }
            console.log(goods)
            that.setData({
                goods: goods,
            })
        };
        if (e.detail.value.telphone === "") {
            wx.showToast({
                title: '请填写手机号码',
                mask: true
            });
        } else if (!result) {
            wx.showToast({
                title: '手机号不正确',
                mask: true
            });
        } else if (that.data.waytachType == 3) {
            //若点击外卖时上传
            console.log('外卖上传')
            var submitData = {}; //声明上传接口数组
            submitData.comments = note;   //订单备注
            submitData.contactNumber = telphone;   //联系电话
            submitData.openid = app.globalData.openId; //用户openid
            submitData.payAmount = that.data.upActivity.payMoney;  //支付金额
            submitData.preferMoney = that.data.upActivity.preferential; //优惠金额
            submitData.shopId = that.data.shopid;  //商铺Id
            submitData.shopName = that.data.shopName; //店铺名称
            submitData.tableNum = cirnum;   //餐桌号
            submitData.takeFoodtime = that.data.takeFoodtime;    //取餐时间
            // submitData.total = that.data.submitshop.price;    //订单总额
            submitData.only = that.data.only;
            submitData.preferentials = that.data.preferentials;   //订单优惠列表
            submitData.type = that.data.waytachType;     //就餐方式
            submitData.boxAmount = that.data.allcnaheprice   // 总餐盒费
            submitData.total = (Number(that.data.totals)).toFixed(2);    //订单总额
            //外卖所用信息
            submitData.customerName = that.data.address.userName;    //该用户的微信名字
            submitData.orderProvince = that.data.address.provinceName;    //该用户的省
            submitData.orderCity = that.data.address.cityName;    //该用户的市
            submitData.orderCountry = that.data.address.countyName;    //该用户的区县
            submitData.orderAddress = that.data.address.detailInfo;    //该用户的详细地址
            submitData.distributeAmount = that.data.address.distributeAmount;    //该用户的外卖费
            submitData.goods = that.data.goods; //已点菜品数组

            // console.log(submitData)
            if (that.data.submit) {  //判断submit为true时提交表单(防止重复提交)
                wx.showLoading({
                    title: '正在提交',
                });
                if (that.data.address != undefined || that.data.address.length != 0 || that.data.address.length != null) {
                    that.upLoadMenu(submitData);
                    that.setData({
                        submit: false
                    })
                }

            }
        } else {
            //点击其他取餐方式
            console.log('普通上传')
            var submitData = {}; //声明上传接口数组
            submitData.comments = note;   //订单备注
            submitData.contactNumber = telphone;   //联系电话
            submitData.openid = app.globalData.openId; //用户openid
            submitData.payAmount = that.data.upActivity.payMoney;  //支付金额
            submitData.preferMoney = that.data.upActivity.preferential; //优惠金额
            submitData.shopId = that.data.shopid;  //商铺Id
            submitData.shopName = that.data.shopName; //店铺名称
            submitData.tableNum = cirnum;   //餐桌号
            submitData.takeFoodtime = that.data.takeFoodtime;    //取餐时间
            // submitData.total = that.data.submitshop.price;    //订单总额
            submitData.only = that.data.only;
            submitData.preferentials = that.data.preferentials;   //订单优惠列表
            submitData.type = that.data.waytachType;     //就餐方式
            if (that.data.waytachType == 1) {  //如果为堂食
                submitData.total = that.data.totals;    //订单总额                
            } else if (that.data.waytachType == 2) { //如果为自取
                submitData.boxAmount = that.data.allcnaheprice   // 总餐盒费
                submitData.total = (Number(that.data.totals)).toFixed(2);    //订单总额
            }
            //  else if (that.data.waytachType == 3) { //如果为外带
            //     submitData.boxAmount = that.data.allcnaheprice   // 总餐盒费
            //     submitData.deliveryFee = that.data.deliveryFee   // 外送费
            //     submitData.total = (Number(that.data.totals)).toFixed(2);    //订单总额
            // }
            submitData.customerName = that.data.customerName;    //该用户的微信名字
            submitData.goods = that.data.goods; //已点菜品数组
            // console.log(submitData)
            if (that.data.submit) {  //判断submit为true时提交表单(防止重复提交)
                wx.showLoading({
                    title: '正在提交',
                });
                that.upLoadMenu(submitData);
                that.setData({
                    submit: false
                })
            }
        }
    },
    //提交订单接口
    upLoadMenu: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/submitOrder',
            data: data,
            method: "POST",
            // header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('提交订单')
                console.log(res)
                console.log(res.data.data)
                if (res.data.status == 200) {
                    var obj = res.data.data
                    if (obj.return_code == "SUCCESS") {
                        console.log('提交成功')
                        that.requestPayment(obj)
                    } else {
                        wx.showToast({
                            title: '提交失败',
                        });
                    };
                    wx.hideLoading(); //关闭提示框
                    that.setData({    //重置提交按钮
                        // submit: true
                    })
                }else{
                    console.log('不够')
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        duration: 2000
                    })
                    wx.hideLoading(); //关闭提示框
                    that.setData({    //重置提交按钮
                        submit: true
                    })
                }
            },
            fail: function () {
                wx.showLoading('请求数据失败');
                console.log("请求数据失败")
            }
        })
    },
    //获取用户手机号接口
    upPhone: function (data) {
        var that = this;
        wx.request({
            url: app.globalData.adminAddress + '/applet_customer/getCustomerInfo',
            data: {
                openid: app.globalData.openId
            },
            method: "GET",
            // header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                console.log('获取用户信息')
                console.log(res.data)
                if (res.data.status == 200) {
                    var telPhone = res.data.data.phone
                    that.setData({
                        telPhone: telPhone
                    })
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        // icon: none,
                        duration: 2000
                    })
                }
            },
            fail: function () {
                wx.showLoading('请求数据失败');
            }
        })
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
                wx.redirectTo({
                    url: '../orderparticulars/orderparticulars?id=' + obj.orderId
                })
            },
            'fail': function (res) {
                console.log("支付失败");
                wx.showToast({
                    title: '支付失败',
                });
                wx.redirectTo({
                    url: '../orderparticulars/orderparticulars?id=' + obj.orderId
                })
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
})