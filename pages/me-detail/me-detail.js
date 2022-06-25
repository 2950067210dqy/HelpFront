// pages/me-detail/me-detail.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    user:{
      id:0,
      username:"",
      password:"",
      name:"",
      phone:"",
      sex:"男",
      headimg:"",
      role:0,
      registertime:""
    },
      //验证码
      code:"",
      sysCode:"",
      check:false,
      isLoading:false,
       //是否要成为志愿者
        isVolun:false,
        volumentthink:"",
        option:{
          "color": [
            "#fc97af",
            "#87f7cf",
            "#f7f494",
            "#72ccff",
            "#f7c5a0",
            "#d4a4eb",
            "#d2f5a6",
            "#76f2f2"
        ],
        "backgroundColor": "#8799a3",
          "legend": {
            "data": ["平均评分"],
            "right":"20",
            "textStyle": {
              "fontSize":15,
              "borderRadius": 3,
              "color": "#fff",
              "padding": [3, 5]
            }
          },
          "radar": {
            "indicator": [{
              "max": 5,
              "name": "态度"
            }, {
              "max": 5,
              "name": "准时"
            }, {
              "max": 5,
              "name": "着装"
            }, {
              "max": 5,
              "name": "服务"
            }, {
              "max": 5,
              "name": "礼貌"
            }],
            "name": {
              "textStyle": {
                "fontSize":15,
                "borderRadius": 3,
                "color": "#fff",
                "padding": [3, 5]
              }
            }
          },
          "series": [{
            "data": [{
              "name": "平均评分",
              "value": [0, 0, 0, 0, 0]
            }],
            // "name": "预算 vs 开销（Budget vs spending）",
            "type": "radar"
          }],
          "title": {
            "text": "评分五维图",
            "textStyle": {
              "fontSize":19,
              "borderRadius": 3,
              "color": "#fff",
              "padding": [3, 5]
            }
          },
          "tooltip": {
            trigger: 'item', //item数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (value, index) {
              console.log(value);
              return "  "+value.name+"\n"+"态度："+value.value[0]+" 分\n"+"准时："+value.value[1]+" 分\n"+"着装："+value.value[2]+" 分\n"+"服务："+value.value[3]+" 分\n"+"礼貌："+value.value[4]+" 分";
            }
          }
        },
  },
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
    });
  },
  resubmitVolun(e){
    let that =this;
    let volunReviewInfo={
      id:null,
      userid:globalData.loginUser.id,
      reviewstatus:"正在审核",
      reviewcomment :"",
      volumentthink:globalData.loginUser.volunReviewInfo.volumentthink,
      createtime:null,
      updatetime:null
     };
     wx.cloud.callContainer({
       "config": {
         "env": app.globalData.env
       },
       "path": "/volunReviewInfo/set",
       "header": app.globalData.contentType.cloud,
       "method": "POST",
        data:volunReviewInfo,
        success(res){
          let data =res.data; 
          wx.showToast({
            title:data.message,
            duration:2000
          });
          wx.cloud.callContainer({
            "config": {
              "env": app.globalData.env
            },
            "path": "/volunReviewInfo/selectByUserId",
            "header": app.globalData.contentType.cloud_normal,
            "method": "POST",
             data:{
                userid:globalData.loginUser.id,
             },
             success(res){
                  let data =res.data;
                  console.log(data.message);
                  if(data.code ==200){
                    this.setData({
                      isVolun:false,
                    })
                    app.globalData.loginUser.volunReviewInfo = data.data;
                    globalData.loginUser.volunReviewInfo=data.data;
                    let message =this.data.volumentthink;
                    if(globalData.loginUser.volunReviewInfo.reviewcomment.trim()==""){
                      message="志愿者审核状态："+globalData.loginUser.volunReviewInfo.reviewstatus+"  "+"\n创建时间: "+globalData.loginUser.volunReviewInfo.createtime
                      +"\n状态更新时间："+globalData.loginUser.volunReviewInfo.updatetime+"\n审核回复：暂无";
                    }else{
                      message="志愿者审核状态："+globalData.loginUser.volunReviewInfo.reviewstatus+"  "+"\n创建时间: "+globalData.loginUser.volunReviewInfo.createtime
                      +"\n状态更新时间："+globalData.loginUser.volunReviewInfo.updatetime+"\n审核回复："+globalData.loginUser.volunReviewInfo.reviewcomment;
                    }
                    if(globalData.loginUser.volunReviewInfo.reviewstatus.trim()=="审核失败"){
                      this.setData({
                        isVolun:true,
                      })
                    }
                    this.setData({
                      volumentthink:message
                    })
                  }
             }
            });                             
        }
      })
  },
  updateSubmit(e){
    let that=this;
    that.setLoading(true);
    if(that.data.check){
      if(
        that.data.user.username.trim()==""
        || that.data.user.password.trim()==""||
        that.data.user.name.trim()==""||
        that.data.code.trim()==""
      ){
          wx.showToast({
            title: '输入框不能为空',
            duration:2000
          });
          that.setLoading(false);
      }else{
            if(that.data.code.trim().toLowerCase()!=that.data.sysCode.trim().toLowerCase()){
              wx.showToast({
                title: '验证码不正确',
                duration:2000
              });
              that.getRandom(6);
              that.setLoading(false);
            }else{
              //更新信息
              that.data.user.registertime="",
              wx.cloud.callContainer({
                "config": {
                  "env": app.globalData.env
                },
                "path": "/user/update",
                "header": app.globalData.contentType.cloud,
                "method": "POST",
                data:that.data.user,
                success:function(res){
                  let data =res.data;
                  wx.showToast({
                    title: data.message,
                    duration:5000,
                    success(res){
                      if(data.code==200){
                        globalData.loginUser=data.data;
                        let registertime=globalData.loginUser.registertime;
                        let registertime1=registertime.slice(0,10);
                        let registertime2=registertime.slice(11,19);
                        globalData.loginUser.registertime=registertime1+" "+registertime2;
                        wx.setStorageSync('loginUser',  globalData.loginUser);
      
                        that.setLoginUserData();
                        that.setData({
                          user:globalData.loginUser
                        });
                      }else{
                        that.getRandom(6);
                      }
                      that.setLoading(false);
                    }
                  })
              }
              });
              // wx.request({
              //   url:  globalData.serverPath+"user/update",
              //   data:that.data.user,
              //   method:"POST",
              //   dataType : "json",
              //   header:globalData.contentType.json,
              //   success:function(res){
              //       let data =res.data;
              //       wx.showToast({
              //         title: data.message,
              //         duration:5000,
              //         success(res){
              //           if(data.code==200){
              //             globalData.loginUser=data.data;
              //             let registertime=globalData.loginUser.registertime;
              //             let registertime1=registertime.slice(0,10);
              //             let registertime2=registertime.slice(11,19);
              //             globalData.loginUser.registertime=registertime1+" "+registertime2;
              //             wx.setStorageSync('loginUser',  globalData.loginUser);
        
              //             that.setLoginUserData();
              //             that.setData({
              //               user:globalData.loginUser
              //             });
              //           }else{
              //             that.getRandom(6);
              //           }
              //           that.setLoading(false);
              //         }
              //       })
              //   }
              // })
            }
          }
      }
    else{
      wx.showModal({
        title: '提示',
        content: '注册请勾选我已阅读用户协议,点击确定阅读协议',
        success (res) {
          
          if (res.confirm) {
            app.checkUserSettle(that);
            that.setData({
              check:true
            });
          } else if (res.cancel) {
           
          }
          that.setLoading(false);
        }
      });
  
    }

  },



  uploadHeadImg(e){
    
    let that =this;
    that.setLoading(true);
    this.$showDialog({
      title : "更换头像",
      content: "尊敬的"+globalData.loginUser.name+"用户，您是要怎样修改头像？",
      cancelText:"删除头像",
      confirmText:"从本地上传",
      success: res => {
          if(res.confirm){
            //本地上传
            wx.chooseImage({
              count: 1,
              sizeType: ['compressed'],
              sourceType:['album' ,'camera'],
              success:function(res){
                let tempFilePath=res.tempFilePaths;
                wx.cloud.uploadFile({
                  cloudPath: 'headimg/'+tempFilePath[0].slice(11)+'.png', // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
                  filePath: tempFilePath[0], // 微信本地文件，通过选择图片，聊天文件等接口获取
                  config: {
                    env: app.globalData.env // 需要替换成自己的微信云托管环境ID
                  },
                  success:function(res){
                
                    let data =res;
                    console.log(data);
                    if(data.statusCode==204){
                      wx.showToast({
                        title: "上传图片成功！",
                        duration:2000,
                      });
               
                      globalData.loginUser.headimg=data.fileID;
   
                      let registertime=globalData.loginUser.registertime;
                      let registertime1=registertime.slice(0,10);
                      let registertime2=registertime.slice(11,19);
                      globalData.loginUser.registertime=registertime1+" "+registertime2;
                      that.setLoginUserData();
                      wx.setStorageSync('loginUser', globalData.loginUser);
                      let userParam= globalData.loginUser;
                      userParam.registertime="";
                      //修改头像信息
                      wx.cloud.callContainer({
                        "config": {
                          "env": app.globalData.env
                        },
                        "path": "/user/updateHeadImg",
                        "header": app.globalData.contentType.cloud,
                        "method": "POST",
                        data:  userParam,
                        success(res){
                          let data= res.data;
                          console.log(res);
                          wx.showToast({
                            title: data.message,
                            duration:3000,
                          });
                          
                          if(data.code==200){
                            globalData.loginUser=data.data;
                            let registertime=globalData.loginUser.registertime;
                            let registertime1=registertime.slice(0,10);
                            let registertime2=registertime.slice(11,19);
                            globalData.loginUser.registertime=registertime1+" "+registertime2;
                            that.setLoginUserData();
                            that.setData({
                              user:globalData.loginUser
                            });
                            console.log(that.data.user);
                          }
                          that.setLoading(false);
                            
                         
                         
                      }
                      });
                    
                    }
                  
                  },
                  fail: err => {
                    console.error(err)
                  }
                });
                // wx.uploadFile({
                //   filePath:tempFilePath[0],
                //   url: globalData.serverPath+"file/upload",
                //   name:"file",
                //   header:globalData.contentType.media,
                //   formData:{},
                //   success:function(res){
                //     let data = JSON.parse(res.data);
                //     if(data.code==200){
                //       wx.showToast({
                //         title: data.message,
                //         duration:2000,
                //       });
                      
                //       globalData.loginUser.headimg=data.data;
                //       let registertime=globalData.loginUser.registertime;
                //       let registertime1=registertime.slice(0,10);
                //       let registertime2=registertime.slice(11,19);
                //       globalData.loginUser.registertime=registertime1+" "+registertime2;
                //       that.setLoginUserData();
                //       wx.setStorageSync('loginUser', globalData.loginUser);
                //       let userParam= globalData.loginUser;
                //       userParam.registertime="";
                //       //修改头像信息
                //       wx.cloud.callContainer({
                //         "config": {
                //           "env": app.globalData.env
                //         },
                //         "path": "/user/updateHeadImg",
                //         "header": app.globalData.contentType.cloud,
                //         "method": "POST",
                //         data:  userParam,
                //         success(res){
                //           let data= res.data;
                //           console.log(res);
                //           wx.showToast({
                //             title: data.message,
                //             duration:3000,
                //           });
                          
                //           if(data.code==200){
                //             globalData.loginUser=data.data;
                //             let registertime=globalData.loginUser.registertime;
                //             let registertime1=registertime.slice(0,10);
                //             let registertime2=registertime.slice(11,19);
                //             globalData.loginUser.registertime=registertime1+" "+registertime2;
                //             that.setLoginUserData();
                //             that.setData({
                //               user:globalData.loginUser
                //             });
                          
                //           }
                //           that.setLoading(false);
                            
                         
                         
                //       }
                //       });
                //       // wx.request({
                //       //   url: globalData.serverPath+"user/updateHeadImg",
                //       //   data:  userParam,
                //       //   dataType:"json",
                //       //   header:globalData.contentType.json,
                //       //   method:"POST",
                //       //   success(res){
                //       //       let data= res.data;
                //       //       console.log(res);
                //       //       wx.showToast({
                //       //         title: data.message,
                //       //         duration:3000,
                //       //       });
                            
                //       //       if(data.code==200){
                //       //         globalData.loginUser=data.data;
                //       //         let registertime=globalData.loginUser.registertime;
                //       //         let registertime1=registertime.slice(0,10);
                //       //         let registertime2=registertime.slice(11,19);
                //       //         globalData.loginUser.registertime=registertime1+" "+registertime2;
                //       //         that.setLoginUserData();
                //       //         that.setData({
                //       //           user:globalData.loginUser
                //       //         });
                            
                //       //       }
                //       //       that.setLoading(false);
                              
                           
                           
                //       //   }
                //       // });
                //     }
                  
                //   }
                // })
              }
            });
          }else{
            //删除头像
            globalData.loginUser.headimg="";
            that.setLoginUserData();
            wx.setStorageSync('loginUser', globalData.loginUser);
            that.data.user.registertime="",
            //修改头像信息
            wx.cloud.callContainer({
              "config": {
                "env": app.globalData.env
              },
              "path": "/user/updateHeadImg",
              "header": app.globalData.contentType.cloud,
              "method": "POST",
              data:that.data.user,
              success(res){
                let data= res.data;
                wx.showToast({
                  title: data.message,
                  duration:3000,
                  success(res){
                    if(data.code==200){
                      globalData.loginUser=data.data;
                      let registertime=globalData.loginUser.registertime;
                      let registertime1=registertime.slice(0,10);
                      let registertime2=registertime.slice(11,19);
                      globalData.loginUser.registertime=registertime1+" "+registertime2;
                      that.setLoginUserData();
                      that.setData({
                        user: globalData.loginUser
                      });
                    }
                    that.setLoading(false);
                  }
                })
               
            }
            });
            // wx.request({
            //   url: globalData.serverPath+"user/updateHeadImg",
            //   data:that.data.user,
            //   dataType:"json",
            //   header:globalData.contentType.json,
            //   method:"POST",
            //   success(res){
            //       let data= res.data;
            //       wx.showToast({
            //         title: data.message,
            //         duration:3000,
            //         success(res){
            //           if(data.code==200){
            //             globalData.loginUser=data.data;
            //             let registertime=globalData.loginUser.registertime;
            //             let registertime1=registertime.slice(0,10);
            //             let registertime2=registertime.slice(11,19);
            //             globalData.loginUser.registertime=registertime1+" "+registertime2;
            //             that.setLoginUserData();
            //             that.setData({
            //               user: globalData.loginUser
            //             });
            //           }
            //           that.setLoading(false);
            //         }
            //       })
                 
            //   }
            // });
          }
      }
    });
  
  },
    //退出登录
    navToLogout(){
      let that =this;
      this.setLoading(true);
      this.$showDialog({
        title : "退出登录",
        cancelText:"取消",
        confirmText:"确定",
        content: "尊敬的"+globalData.loginUser.name+"用户，确定要退出登录吗?",
        success: res => {
            if(res.confirm){
              globalData.loginUser=null;
              wx.removeStorageSync('loginUser');
              wx.clearStorageSync();
              app.closeWebsocket();
              app.switchTab("/pages/me/me");
            }else{
             
            }
            that.setLoading(false);
        }
      });
    },
    //加载动画值更改
    setLoading(isLoading){
      this.setData({
        isLoading:isLoading
      });
    },
   //查看协议
   checkUserSettle(){
    app.checkUserSettle(this);
  },
 //我已阅读协议
  checkChange(e) {
    this.setData({
        check: e.detail
    })
  },
   //性别radio
   SexRadioChange(e){
     
    let that =this;
    let newUser=that.data.user;
    e.detail ==1 ?   newUser.sex ="男":newUser.sex ="女";
    let sexIcon;
    e.detail ==1 ?   sexIcon="":sexIcon="fe";
    let sexColor;
    e.detail ==1 ?   sexColor="blue": sexColor="pink";
    that.setData({
      user:newUser,
      sexRadio:e.detail,
      sexIcon:sexIcon,
      sexColor:sexColor
  });
  // console.log(that.data.user);
},
updateUsername(e){
 let that=this;
 let newUser=that.data.user;
 newUser.username=e.detail.value.trim();
 that.setData({
  user:newUser
 });
},
updateName(e){
  let that=this;
  let newUser=that.data.user;
  newUser.name=e.detail.value.trim();
  that.setData({
   user:newUser
  });
},
updatePassword(e){
  let that=this;
  let newUser=that.data.user;
  newUser.password=e.detail.value.trim();
  that.setData({
   user:newUser
  });
},
updateRePassword(e){
  let that=this;
  let repassword=e.detail.value.trim();
  that.setData({
   repassword: repassword
  });
},
updatePhone(e){
  let that=this;
  let newUser=that.data.user;
  newUser.phone=e.detail.value.trim();
  that.setData({
   user:newUser
  });
},
updateCode(e){
  let that=this;
  let code=e.detail.value.trim();
  that.setData({
   code: code
  });
},
getRandom(len){
  if (typeof len !="number"){
    len=len.target.dataset.len;
  }
  let that =this;
  let code =app.random(len);
  that.setData({
    sysCode:code
  });
},
updateRole(e){
  
  let that =this;
  let newUser= that.data.user;
  e.detail?newUser.role=1:newUser.role=0;
  that.setData({
    user:newUser
  });
},
getRateByHelper(){
  let that =this;
  wx.cloud.callContainer({
    "config": {
      "env": app.globalData.env
    },
    "path": "/rateByHelper/selectByUserId",
    "header": app.globalData.contentType.cloud_normal,
    "method": "POST",
    data:{
      userid:that.data.loginUser.id
    },
    success(res){
      let data = res.data.data;
      if(data!=null){
        let oldoption=that.data.option;
        console.log(oldoption);
        oldoption.series[0].data[0].value=[data.rateByHelper.mannerrate/data.rateByHelper.humannum,data.rateByHelper.ontimerate/data.rateByHelper.humannum,data.rateByHelper.clotherate/data.rateByHelper.humannum,data.rateByHelper.serverate/data.rateByHelper.humannum,data.rateByHelper.politerate/data.rateByHelper.humannum];
        that.setData({isRate:true,option:oldoption});
        console.log(that.data);
      }else{
        wx.showToast({
          title: '新志愿者',
          duration:2000
        })
      }
    }
  });
},
clickMessage(e){
  let userid = Number(e.target.dataset.userid);
    app.clickMessage(userid);
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app =getApp();
    globalData=app.globalData;
    this.setLoginUserData();
    let that =this;
    app.globalData.messageCallback=(userid,name)=>{
      console.log(that.data);
      that.setData({
        userid:userid,
        show:true,
        msg:"您有来自  "+name+"  的消息！",
        duration:4000 
      });
    };

    if(this.data.loginUser.role==1){
      this.getRateByHelper();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // console.log(this.data.user);
    // console.log(globalData.loginUser);
   
    this.setData({
      
      user:{
        id:globalData.loginUser.id,
        username:globalData.loginUser.username,
        password:globalData.loginUser.password,
        name:globalData.loginUser.name,
        phone:globalData.loginUser.phone,
        sex:globalData.loginUser.sex,
        headimg:globalData.loginUser.headimg,
        role:globalData.loginUser.role,
        registertime:globalData.loginUser.registertime,
      },
    });
      if(globalData.loginUser.volunReviewInfo!=null){
        let message =this.data.volumentthink;
        if(globalData.loginUser.volunReviewInfo.reviewcomment.trim()==""){
          message="志愿者审核状态："+globalData.loginUser.volunReviewInfo.reviewstatus+"  "+"\n创建时间: "+globalData.loginUser.volunReviewInfo.createtime
          +"\n状态更新时间："+globalData.loginUser.volunReviewInfo.updatetime+"\n审核回复：暂无";
        }else{
          message="志愿者审核状态："+globalData.loginUser.volunReviewInfo.reviewstatus+"  "+"\n创建时间: "+globalData.loginUser.volunReviewInfo.createtime
          +"\n状态更新时间："+globalData.loginUser.volunReviewInfo.updatetime+"\n审核回复："+globalData.loginUser.volunReviewInfo.reviewcomment;
        }
        if(globalData.loginUser.volunReviewInfo.reviewstatus.trim()=="审核不通过"||globalData.loginUser.volunReviewInfo.reviewstatus.trim()=="取消审核"){
          this.setData({
            isVolun:true,
          })
        }
        this.setData({
          volumentthink:message
        })
      }
    
  

    this.getRandom(6);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})