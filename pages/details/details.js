// pages/details/details.js
var app = getApp();
Page({
  data: {
    userInfo: {
       userImg: '' ,  //用户头像(如果没有用本地的)
       userName: '' ,   //用户姓名
    },  //获取本地缓存的用户信息
   
  },


  onLoad: function (options) {
    this.setData({
      appImg: app.globalData.adminAddressImg,
    })
  },
  onShow:function(){
      var that = this;
      var userInfo = app.globalData.personal;
      console.log(userInfo)
      if (userInfo.headImg == '') {   //如果为空的话用默认微信头像
          console.log('用户未修改头像')
          wx.getStorage({
              key: 'userInfo',
              success: function (res) {
                  var stotageInfo = res.data;
                  userInfo.headImg = stotageInfo.avatarUrl;
                  userInfo.name = stotageInfo.nickName;
                  // console.log(userInfo)
                  that.setData({
                      userInfo: userInfo,
                  })
              }
          });
      } else {
          console.log('用户修改过头像')  //如果修改过请求接口
          userInfo.headImg = userInfo.headImg
          that.setData({
              userInfo: userInfo,
          })
      };
      console.log(userInfo)
      if (userInfo.birthday == null){
        userInfo.birthday = "请设置您的生日";        
      }
      if(userInfo.phone == null){
        userInfo.phone = "请设置您的手机号";
      }
      that.setData({
        userInfo: userInfo,
      })
  },
  
  UpuserImg1: function () {   // 点击上传头像
    var that = this;
    var userInfo = that.data.userInfo;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
         userInfo.userImg = res.tempFilePaths
        that.setData({
          userInfo: userInfo
        })
      }
    })
  },
  // 上传图片时
  UpuserImg: function () {
    var that = this;
    // let imgurl = that.data.shopInfo.imgurl;
    var userInfo = that.data.userInfo;
    let imgurl = userInfo.headImg;
    // console.log('reeee')
    // console.log(imgurl)
    wx.chooseImage({
      count: 1,
      success: function (res) {
        imgurl = res.tempFilePaths[0];
        console.log('imgurl')
        console.log(imgurl)
        // 当前页展示图片
        that.setData({
          // imgurl: res.tempFilePaths[0]
          userInfo: userInfo          
        });
        //  上传到服务器端
        wx.uploadFile({
            // url: app.globalData.adminAddress + '/picupload',
            url: app.globalData.adminAddress + '/headupload',
          filePath: res.tempFilePaths[0],
          name: 'upload',
          formData: {
            'imgtype': 'head'
          },
          success: function (res) {
            console.log('res1')
            console.log(JSON.parse(res.data))
            var files = JSON.parse(res.data);
            var userInfo = that.data.userInfo; //先获取data里的userInfo(不能直接给数组里面的赋值)
            userInfo.headImg = files.data[0];  //给shopinfo里的imgurl赋值
            console.log(files.data[0])

            that.setData({                  //修改data里的值
              userInfo: userInfo
            });
            // 调取修改个人信息接口
            var imgData = {};
            imgData.id = userInfo.id;
            imgData.updateType = 'headImg' ; 
            imgData.updateContent = userInfo.headImg; 
            that.updata(imgData);
          }
        })

      },
    })
  },
  updata: function (data) {
    var that = this;
    wx.request({
      url: app.globalData.adminAddress + '/applet_customer/updateCustomerInfo',
      data: data,
      method: "POST",
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        var userInfo = that.data.userInfo; //先获取data里的userInfo(不能直接给数组里面的赋值)
        userInfo.headImg = that.data.appImg + data.updateContent
        that.setData({
          userInfo: userInfo,
        })
        app.globalData.personal = data.userInfo
      },
      fail: function () {
        wx.showLoading('请求数据失败');
      }
    })
  },
  // 获取用户信息接口
  // mine: function (data) {
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.adminAddress + '/applet_customer/getCustomerInfo',
  //     data: data,
  //     method: "GET",
  //     // header: { 'content-type': 'application/x-www-form-urlencoded' },
  //     success: function (res) {
  //       wx.hideLoading();
  //       console.log(res);
  //       var userInfo = that.data.userInfo;  //获取
  //       wx.getStorage({   //本地数据
  //         key: 'userInfo',
  //         success: function (res) {
  //           var stotageInfo = res.data;
  //           userInfo.userImg = stotageInfo.avatarUrl;
  //           userInfo.userName = stotageInfo.nickName;
  //           // console.log(userInfo)
           
  //         }
  //       });
  //       var personal = res.data.data  //声明获取到的数据
  //       if (personal.headImg == "" || personal.headImg == undefined) {   //判断如果没有用户头像,用微信头像
  //         personal.headImg = userInfo.userImg
  //       } if (personal.name == '' || personal.name == undefined) {      //判断如果没有用户姓名,用微信姓名
  //         personal.name = userInfo.userName
  //       }
  //       that.setData({
  //         userInfo: res.data.data,
  //       });
  //     },
  //     fail: function () {
  //       wx.showLoading('请求数据失败');
  //     }
  //   })
  // }
  // 转发
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '爱点自助点餐',
      path: 'pages/details/details',
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