// index.js
// 获取应用实例
var app =getApp();
var globalData=app.globalData;

Page({
  data: {
    serverPath:globalData.serverPath,
    tableDatas:null,
    tablePage:null,
    //定位
    locationAddress:globalData.locationAddress,
    locationProvince:globalData.locationProvince,
    locationCity:globalData.locationCity,
    locationDistrict:globalData.locationDistrict,
    locationAdcode:globalData.locationAdcode,
    loginUser:globalData.loginUser,
    //当前页
    currentPage:1,
    //下拉刷新
    isRefresh:false,
    //是否点击选择位置 要不然会同时和onshow一起获取helpinfo
    isChooseLocation:false,
    //搜索
    searchText:"",
    //状态下拉框
    stateItems:[{message:"筛选状态"}],
    selectorState:"筛选状态",
    state:0,
    //紧急程度下拉框
    emerItems:[{message:"筛选紧急"}],
    selectorEmer:"筛选紧急",
    emergency:0,
    //类别下拉框
    typeItems:[{message:"筛选类别"}],
    selectorType:"筛选类别",
    type:0,
    //时间下拉框
    fromdate:"选择日期",
    fromtime:"选择时间",
    fromeTime:"",
    todate:"选择日期",
    totime:"选择时间",
    toTime:"",
    //升序
    descOrAsc:"desc",
  },
  navToUserDetail(e){
    app.navToUserDetail(e);
  },
  //跳转登录
  navToLogin(){
    globalData.loginBackRoute="/pages/index/index";
    globalData.loginBackRouteType="tab";
    app.navTo("/pages/login/login");
  },
  //跳转到我的页面
  switchToMe(){
    app.switchTab("/pages/me/me");
  },
  chooseLocation(){
    app.chooseLocation(this);
  },
  setLocationData(){
    app =getApp();
    globalData=getApp().globalData;
    this.setData({
      locationAddress:globalData.locationAddress,
      locationProvince:globalData.locationProvince,
      locationCity:globalData.locationCity,
      locationDistrict:globalData.locationDistrict,
      locationAdcode:globalData.locationAdcode,
    });
  },
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
    });
  },
  //路线规划
  routePlan(e){
    console.log(e);
    let plugin = requirePlugin('routePlan');
    let key = globalData.txMapKey;  //使用在腾讯位置服务申请的key
    let referer = '农村帮帮帮小程序';   //调用插件的app的名称
    let endPoint = JSON.stringify({  //终点
    'name': e.currentTarget.dataset.address,
    'latitude': parseFloat(e.currentTarget.dataset.latitude),
    'longitude':parseFloat(e.currentTarget.dataset.longitude)
     });
    wx.navigateTo({
        url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
    });
  },
  //升序降序
  todescOrAsc(){
    if(this.data.descOrAsc=="desc"){
      this.setData({
          descOrAsc:"asc"
      });
    }else{
      this.setData({
        descOrAsc:"desc"
      });
    }
    this.refreshDataHandle();
    this.getHelpInfo();
  },
  //清空时间
  removeTime(){
    this.setData({
      fromdate:"选择日期",
      todate:"选择日期",
      fromtime:"选择时间",
      totime:"选择时间",
      fromTime:"",
      toTime:""
    })
    this.refreshDataHandle();
    this.getHelpInfo();
  },
  //确定时间区域选择
  okTime(){
      if(this.data.fromdate=="选择日期"||
      this.data.todate=="选择日期"||
      this.data.fromtime=="选择时间"||
      this.data.totime=="选择时间"
      ){
        wx.showToast({
          title: '选择时间',
          duration:2000
        });
        return;
      }
      let that =this;
      this.setData({
        fromTime:that.data.fromdate+" "+that.data.fromtime,
        toTime:that.data.todate+" "+that.data.totime,
      });
      this.refreshDataHandle();
      this.getHelpInfo();
  },
  //默认选页面
  toDefault(){
      this.setData({
        type:0,
        selectorType:"筛选类别",
        emergency:0,
        selectorEmer:"筛选紧急",
        state:0,
        selectorState:"筛选状态",
        descOrAsc:"desc",
      });
      this.removeTime();
  },
  //日期下拉列表
  fromtimeChange(e){
    var value = e.detail.value;//获得选择的时间
    this.setData({fromtime:value}); //将用户选择的值更新赋予给time
  },
  fromdateChange(e){
    console.log(e);
    var value = e.detail.value;//获得选择的日期
    this.setData({fromdate:value}); //将用户选择的值更新赋予给date
  },
  totimeChange(e){
    var value = e.detail.value;//获得选择的时间
    this.setData({totime:value}); //将用户选择的值更新赋予给time
  },
  todateChange(e){
    var value = e.detail.value;//获得选择的日期
    this.setData({todate:value}); //将用户选择的值更新赋予给date
  },
  //状态下拉列表
  selectorStateChange(e){
    var i = e.detail.value;//获得数组下标
    var value =this.data.stateItems[i].message;//获得选项的值
    let that =this;
    if(value!="筛选状态"){
      this.setData({
        state:that.data.stateItems[i].id
      });  
    }else{
      this.setData({
        state:0
      });
    }
    this.refreshDataHandle();
    this.getHelpInfo();
    this.setData({
      selectorState:value//将用户选择的值更新赋予给selector
    });
  },
   //紧急程度下拉列表
   selectorEmerChange(e){
    var i = e.detail.value;//获得数组下标
    var value =this.data.emerItems[i].message;//获得选项的值
    let that =this;
    if(value!="筛选紧急"){
      this.setData({
        emergency:that.data.emerItems[i].id
      });
    }else{
      this.setData({
        emergency:0
      });
    }
    this.refreshDataHandle();
      this.getHelpInfo();
    this.setData({
      selectorEmer:value//将用户选择的值更新赋予给selector
    });
  },
   //类别下拉列表
   selectorTypeChange(e){
    var i = e.detail.value;//获得数组下标
    var value =this.data.typeItems[i].message;//获得选项的值
    let that =this;
    if(value!="筛选类别"){
      this.setData({
        type:that.data.typeItems[i].id
      });
    }else{
      this.setData({
        type:0
      });
    }
    this.refreshDataHandle();
    this.getHelpInfo();
    this.setData({
      selectorType:value//将用户选择的值更新赋予给selector
    });
  },
  //获得搜索栏的搜索词
  getSearchText(e){
    console.log(e.detail);
    let searchText =e.detail.trim();
    this.setData({
      searchText
    });
  },
  //搜索
  searchHelp(e){
    console.log(e.detail);
    let searchText;
    if(e.detail==undefined){
      searchText ="";
    }else{
      searchText =e.detail.trim();
    }
    this.setData({
      searchText
    });
    this.refreshDataHandle();
    this.getHelpInfo();
  },


  //获取求助信息
  getHelpInfo(type){
    // console.log(type+"调用了我");
    wx.showLoading({
      title: this.data.isRefresh?'刷新中':'加载中',
    });
    let that =this;
   
    wx.cloud.callContainer({
      config: {
        env:app.globalData.env, // 微信云托管的环境ID
      },
      path: '/helpinfo/get', // 填入业务自定义路径和参数，根目录，就是 / 
      method: 'POST', // 按照自己的业务开发，选择对应的方法
      header:app.globalData.contentType.cloud_normal,
      data:{currentPage:that.data.currentPage<=1?1:that.data.currentPage,
        adcode:globalData.locationAdcode,
        searchText:that.data.searchText,
        type:that.data.type,
        emergency:that.data.emergency,
        state:that.data.state,
        fromTime:that.data.fromTime,
        toTime:that.data.toTime,
        descOrAsc:that.data.descOrAsc,
      },
        success(res){
          setTimeout(function () {
            wx.hideLoading({
              success: (res) => {},
            });
          }, 200);
          
          let data =res.data;
          console.log(data.message);
          if(data.code==200){
            //将经纬度转换成位置 高德地图
            let locations="";
            for (let index = 0; index < data.data.datas.length; index++) {
              if(index==data.data.datas.length-1){
                locations=locations+data.data.datas[index].longitude+","+ data.data.datas[index].latitude;
              }else{
                locations=locations+data.data.datas[index].longitude+","+ data.data.datas[index].latitude+"|";
              }      
            }
              wx.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo', 
                type:"get",
                data:{
                  key:globalData.gaodeKey,
                  location: locations,
                  batch:true
                },
                success(res){ 
                  // console.log(locations);
                  //  console.log(res);
                  for (let index = 0; index < data.data.datas.length; index++) {
                    data.data.datas[index].address= res.data.regeocodes[index].formatted_address;          
                  }
                  let newTableDatas=that.data.tableDatas;
                  if(newTableDatas!=null){
                    for (let index = 0; index < data.data.datas.length; index++) {
                      newTableDatas.push(data.data.datas[index]);          
                    }
                  }else{
                    newTableDatas=data.data.datas;
                  }
                  that.setData({
                      tableDatas:newTableDatas,
                      tablePage:data.data.pageUtil,
                      isChooseLocation:false
                    });
                    // console.log("发送请求得到的数据",that.data.tableDatas);
                  if(that.data.isRefresh){
                    setTimeout(function () {
                      wx.showToast({
                          title: '刷新成功',
                          icon: 'none',
                          duration: 1000
                      });
                      wx.hideNavigationBarLoading(); //完成navbar停止加载
                      wx.stopPullDownRefresh(); //停止下拉刷新
                      that.setData({
                        isRefresh:false
                      });
                  }, 1000);
                }   
                }
              });  
            }else{
              that.setData({
                isChooseLocation:false
              });
              that.refreshDataHandle();
              setTimeout(function () {
                wx.showToast({
                    title: data.message,
                    icon: 'none',
                    duration: 1000
                });
                wx.hideNavigationBarLoading(); //完成navbar停止加载
                wx.stopPullDownRefresh(); //停止下拉刷新
                that.setData({
                  isRefresh:false
                });
               }, 1000);
            }
        },
        fail(res){
          that.setData({
            isChooseLocation:false
          });
          setTimeout(function () {
            wx.hideLoading({
              success: (res) => {},
            });
          }, 200);
          if(that.data.isRefresh){
            setTimeout(function () {
              wx.showToast({
                  title: res,
                  icon: 'none',
                  duration: 1000
              });
              wx.hideNavigationBarLoading(); //完成navbar停止加载
              wx.stopPullDownRefresh(); //停止下拉刷新
              that.setData({
                isRefresh:false
              });
          }, 1000);
          }   
        },
        error(e){
          that.setData({
            isChooseLocation:false
          });
            setTimeout(function () {
              wx.showToast({
                  title: data.message,
                  icon: 'none',
                  duration: 1000
              });
              wx.hideNavigationBarLoading(); //完成navbar停止加载
              wx.stopPullDownRefresh(); //停止下拉刷新
              that.setData({
                isRefresh:false
              });
          }, 1000);
            
        }
    });
  
    // wx.request({
    //   url: globalData.serverPath+"helpinfo/get",
    //   method:"post",
    //   data:{currentPage:that.data.currentPage<=1?1:that.data.currentPage,
    //     adcode:globalData.locationAdcode},
    //   dataType:"json",
    //   header:globalData.contentType.normal,
    //   success(res){
    //     setTimeout(function () {
    //       wx.hideLoading({
    //         success: (res) => {},
    //       });
    //     }, 200);
        
    //     let data =res.data;
    //     console.log(data.message);
    //     if(data.code==200){
    //       //将经纬度转换成位置 高德地图
    //       let locations="";
    //       for (let index = 0; index < data.data.datas.length; index++) {
    //         if(index==data.data.datas.length-1){
    //           locations=locations+data.data.datas[index].longitude+","+ data.data.datas[index].latitude;
    //         }else{
    //           locations=locations+data.data.datas[index].longitude+","+ data.data.datas[index].latitude+"|";
    //         }      
    //       }
    //         wx.request({
    //           url: 'https://restapi.amap.com/v3/geocode/regeo', 
    //           type:"get",
    //           data:{
    //             key:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
    //             location: locations,
    //             batch:true
    //           },
    //           success(res){ 
    //             // console.log(locations);
    //             //  console.log(res);
    //             for (let index = 0; index < data.data.datas.length; index++) {
    //               data.data.datas[index].address= res.data.regeocodes[index].formatted_address;          
    //             }
    //             let newTableDatas=that.data.tableDatas;
    //             if(newTableDatas!=null){
    //               for (let index = 0; index < data.data.datas.length; index++) {
    //                 newTableDatas.push(data.data.datas[index]);          
    //               }
    //             }else{
    //               newTableDatas=data.data.datas;
    //             }
    //             that.setData({
    //                 tableDatas:newTableDatas,
    //                 tablePage:data.data.pageUtil,
    //                 isChooseLocation:false
    //               });
    //               // console.log("发送请求得到的数据",that.data);
    //             if(that.data.isRefresh){
    //               setTimeout(function () {
    //                 wx.showToast({
    //                     title: '刷新成功',
    //                     icon: 'none',
    //                     duration: 1000
    //                 });
    //                 wx.hideNavigationBarLoading(); //完成navbar停止加载
    //                 wx.stopPullDownRefresh(); //停止下拉刷新
    //                 that.setData({
    //                   isRefresh:false
    //                 });
    //             }, 1000);
    //           }   
    //           }
    //         });  
    //       }else{
    //         that.setData({
    //           isChooseLocation:false
    //         });
    //         that.refreshDataHandle();
    //         setTimeout(function () {
    //           wx.showToast({
    //               title: data.message,
    //               icon: 'none',
    //               duration: 1000
    //           });
    //           wx.hideNavigationBarLoading(); //完成navbar停止加载
    //           wx.stopPullDownRefresh(); //停止下拉刷新
    //           that.setData({
    //             isRefresh:false
    //           });
    //          }, 1000);
    //       }
    //   },
    //   fail(res){
    //     that.setData({
    //       isChooseLocation:false
    //     });
    //     setTimeout(function () {
    //       wx.hideLoading({
    //         success: (res) => {},
    //       });
    //     }, 200);
    //     if(that.data.isRefresh){
    //       setTimeout(function () {
    //         wx.showToast({
    //             title: data.message,
    //             icon: 'none',
    //             duration: 1000
    //         });
    //         wx.hideNavigationBarLoading(); //完成navbar停止加载
    //         wx.stopPullDownRefresh(); //停止下拉刷新
    //         that.setData({
    //           isRefresh:false
    //         });
    //     }, 1000);
    //     }   
    //   },
    //   error(e){
    //     that.setData({
    //       isChooseLocation:false
    //     });
    //       setTimeout(function () {
    //         wx.showToast({
    //             title: data.message,
    //             icon: 'none',
    //             duration: 1000
    //         });
    //         wx.hideNavigationBarLoading(); //完成navbar停止加载
    //         wx.stopPullDownRefresh(); //停止下拉刷新
    //         that.setData({
    //           isRefresh:false
    //         });
    //     }, 1000);
          
    //   }
    // })
  },
  //触底
  onReachBottom: function () {
   
    if(this.data.currentPage<this.data.tablePage.pageNums){
      console.log("this.data.currentPage",this.data.currentPage);
      console.log("this.data.tablePage.currentPage",this.data.tablePage.currentPage);
      this.setData({
        //改变页码
        currentPage: this.data.currentPage+1,
        });
        // console.log(this.data.currentPage);
        this.getHelpInfo();
    } 
  },
  //下拉刷新
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
      //获取用户位置
      app.getSystemLocation(this);
    this.refreshDataHandle();
    this.getHelpInfo();
  },
  //刷新数据 将当前获取数据置空操作
  refreshDataHandle(){
    wx.showNavigationBarLoading() //在标题栏中显示加载圈圈
    this.setData({
        currentPage: 1,
        tableDatas:null,
        tablePage:null,
        isRefresh:true
    }); //重置页码
  
  },
  //放大图片
  magnifyImage(e){
    let that =this;
    let indexFather =e.target.dataset.idFather;
    let indexChild =e.target.dataset.idChild;
    let imageUrl=that.data.tableDatas[indexFather].images[indexChild];
    let urls =that.data.tableDatas[indexFather].images;
    for (let index = 0; index <  urls.length; index++) {
      urls[index]=globalData.serverPath+urls[index];
    }
    wx.previewImage({
      current:globalData.serverPath+imageUrl, // 当前显示图片的http链接
      urls:urls // 需要预览的图片http链接列表
    })
  },
   
  //志愿者点击帮助按钮
  helpThis(e){
      let that =this;
      let userid=e.target.dataset.userid;
      if(userid==globalData.loginUser.id){
        wx.showToast({
          title: '不能自己帮自己！',
          duration:2000
        });
      }else{
        let helpInfoId=e.target.dataset.id;
        let index = e.target.dataset.index;
        let loginUserId=that.data.loginUser.id;
        wx.cloud.callContainer({
          "config": {
            "env": app.globalData.env
          },
          "path": "/helpinfo/setHelp",
          "header": app.globalData.contentType.cloud_normal,
          "method": "POST",
          data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index].adcode},
          success(res){
            let data= res.data;
            wx.showToast({
              title: data.message,
              duration:500
            });
            if(data.code==200){
                if(data.data.id==helpInfoId){
                    let newTableDatas=that.data.tableDatas;
                    newTableDatas[index].helpUser=data.data.helperUser;
                    newTableDatas[index].state=data.data.state;
                    newTableDatas[index].updatetime=data.data.timestamp;
                    that.setData({
                      tableDatas:newTableDatas
                    });
                }else{
                  wx.showToast({
                    title:'信息id校验不正确',
                    duration:2000
                  });
                }
            }
          }
        })
        // wx.request({
        //   url: globalData.serverPath+"helpinfo/setHelp",
        //   data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index].adcode},
        //   method:"POST",
        //   header:globalData.contentType.normal,
        //   success(res){
        //     let data= res.data;
        //     wx.showToast({
        //       title: data.message,
        //       duration:500
        //     });
        //     if(data.code==200){
        //         if(data.data.id==helpInfoId){
        //             let newTableDatas=that.data.tableDatas;
        //             newTableDatas[index].helpUser=data.data.helperUser;
        //             newTableDatas[index].state=data.data.state;
        //             newTableDatas[index].updatetime=data.data.timestamp;
        //             that.setData({
        //               tableDatas:newTableDatas
        //             });
        //         }else{
        //           wx.showToast({
        //             title:'信息id校验不正确',
        //             duration:2000
        //           });
        //         }
        //     }
        //   }
        // });
      }
  },
  getState(){
    let that=this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/state/getState",
      "header": app.globalData.contentType.cloud,
      "method": "POST",
      // data:globalData.loginUser,
      success(res){
        let data =res.data;
        wx.showToast({
          title: data.message,
          duration:500,
          success(res){
            if(data.code==200){
              let stateNums=data.datas[0];
              that.setData({
                stateItems:that.data.stateItems.concat(stateNums)
              });
            }
          }
        });
    }
    })
  },
  getType(){
    let that=this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/type/getType",
      "header": app.globalData.contentType.cloud,
      "method": "POST",
      // data:globalData.loginUser,
      success(res){
        let data =res.data;
        wx.showToast({
          title: data.message,
          duration:500,
          success(res){
            if(data.code==200){
              let newtypeNums=data.datas[0];
              that.setData({
                typeItems:that.data.typeItems.concat(newtypeNums)
              });
            }
          }
        });
    }
    })
  },
  getEmer(){
    let that=this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/emergency/getEmergency",
      "header": app.globalData.contentType.cloud,
      "method": "POST",
      // data:globalData.loginUser,
      success(res){
        let data =res.data;
        wx.showToast({
          title: data.message,
          duration:500,
          success(res){
            if(data.code==200){
              let newemergencyNums=data.datas[0];
              that.setData({
                emerItems:that.data.emerItems.concat(newemergencyNums)
              });
            }
          }
        });
    }
    })
  },
  clickMessage(e){
    let userid = Number(e.target.dataset.userid);
      app.clickMessage(userid);
  },
  messageClose(e){
    console.log(123);
    this.setData({
      show:false,
    });
  },
  onLoad() {
    wx.showLoading({
      title: this.data.isRefresh?'刷新中':'加载中',
    });
    app =getApp();
    globalData=app.globalData;
    // console.log("onreadyready的globalData",globalData);
    // console.log("onshow",this.data);
   
    this.setLocationData();
    this.setLoginUserData();
     //获取用户位置
    app.getSystemLocation(this);
    //获取状态 类别 紧急程度
    this.getState();
    this.getType();
    this.getEmer();
    //获取数据
    this.refreshDataHandle();
    if(this.data.locationAdcode!=""&&!this.data.isChooseLocation){
      this.refreshDataHandle();//重新刷新数据置空操作
      this.getHelpInfo("onshow");
    }
  },
  onReady(){
   
   
  },
  onShow(){
    app =getApp();
    globalData=app.globalData;
    // console.log("onreadyready的globalData",globalData);
    // console.log("onshow",this.data);
    this.setLocationData();
    this.setLoginUserData();
    let that =this;
    if(that.data.loginUser!=null){
    app.globalData.messageCallback=(userid,name)=>{
      console.log(that.data);
      that.setData({
        userid:userid,
        show:true,
        msg:"您有来自  "+name+"  的消息！",
        duration:2000 
      });
    };
  }
    // this.refreshDataHandle();
    // if(this.data.locationAdcode!=""&&!this.data.isChooseLocation){
    //   this.refreshDataHandle();//重新刷新数据置空操作
    //   this.getHelpInfo("onshow");
    // }
   
  },


  
  
})