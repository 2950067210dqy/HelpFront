
var app =getApp();
var globalData=app.globalData;
Page({
    data: {
        serverPath:globalData.serverPath,
        tabCur: 0,
        account: {
            phone: '',
            password: ''
        },
        login: {
            phone: '',
            code: ''
        },
        isLoading: false,
        wxisLoading: false,
        check: false,
        wxUser:{
          id:0,
          username:"",
          code:"",
          name:"",
          phone:"",
          sex:"",
          headimg:"",
          password:"",
          role:0,
          registertime:""
        },
        isRegister:false,
        isVolun:false,
        volumentthink:"",
        registerId:0,
    },
    //更改导航栏的选择索引值
    tabNavChange(e) {
      
        this.setData({
            tabCur: e.detail.index
        })
    },
    //我已阅读协议
    checkChange(e) {
        this.setData({
            check: e.detail
        })
    },
    //登录
    loginSubmit(e){
      let that =this;
      that.setData({
        isLoading:true
      });
      if(that.data.check){
        if((that.data.tabCur==0&&
          (that.data.account.phone.trim()==""
          || that.data.account.password.trim()=="")) ||
          (that.data.tabCur==1&&(that.data.login.phone.trim()==""
          || that.data.login.code.trim()==""))){
            wx.showToast({
              title: '输入框不能为空',
              duration:2000
            });
            that.setData({
              isLoading:false
            });
          }else{
            if(that.data.tabCur==1){
              //手机验证码登录
              wx.showToast({
                title: '还在开发中',
                duration:2000
              });
              that.setData({
                isLoading:false
              });
            }else{
              // 账号密码登录
              wx.cloud.callContainer({
                "config": {
                  "env": app.globalData.env
                },
                "path": "/user/login",
                "header": app.globalData.contentType.cloud_normal,
                "method": "POST",
                data:{
                  "phone":that.data.account.phone,
                  "password":that.data.account.password
                },
                success:function(res){
                  that.setData({
                    isLoading:false
                  });
                  let data =res. data;
                  console.log(data);
                  wx.showToast({
                    title: data.message,
                    duration:3000,
                    success(res){
                      if(data.code==200){  
                        globalData.loginUser=data.data.user;
                        globalData.loginUser.volunReviewInfo=data.data.volunReviewInfo;      
                        let registertime=globalData.loginUser.registertime;
                        let registertime1=registertime.slice(0,10);
                        let registertime2=registertime.slice(11,19);
                        globalData.loginUser.registertime=registertime1+" "+registertime2;
                        app.connectWebsocket();
                        wx.setStorageSync("loginUser", globalData.loginUser);
                         if(  globalData.loginBackRouteType==""){
                           globalData.loginBackRouteType="tab";
                         }
                             if(  globalData.loginBackRoute==""){
                               globalData.loginBackRoute="/pages/index/index";
                             }
                             
             
                             if(  globalData.loginBackRouteType=='tab'){
                                 app.switchTab(  globalData.loginBackRoute);
                             }else{
                               app.navTo(  globalData.loginBackRoute);
                             }
                            
                       }else{
                         that.setData({
                            account:{phone:"",password:""},
                            login:{phone:"",code:""},
                            check:false
                         });
                        
                       }
                 }
               });
              },
              error(res){
                that.setData({
                  isLoading:false
                });
              },
              fail(res){
                that.setData({
                  isLoading:false
                });
              }
              })
              // wx.request({
              //   url:globalData.serverPath+ "user/login",
              //   data:{
              //     "phone":that.data.account.phone,
              //     "password":that.data.account.password
              //   },
              //   dataType:"json",
              //   method:"POST",
              //   header:globalData.contentType.normal,
              //   success:function(res){
              //     that.setData({
              //       isLoading:false
              //     });
              //     let data =res. data;
              //     wx.showToast({
              //       title: data.message,
              //       duration:3000,
              //       success(res){
              //         if(data.code==200){  
              //           globalData.loginUser=data.data;
              //           app.connectWebsocket();
              //           let registertime=globalData.loginUser.registertime;
              //           let registertime1=registertime.slice(0,10);
              //           let registertime2=registertime.slice(11,19);
              //           globalData.loginUser.registertime=registertime1+" "+registertime2;
              //           wx.setStorageSync("loginUser", globalData.loginUser);
              //            if(  globalData.loginBackRouteType==""){
              //              globalData.loginBackRouteType="tab";
              //            }
              //                if(  globalData.loginBackRoute==""){
              //                  globalData.loginBackRoute="/pages/index/index";
              //                }
                             
             
              //                if(  globalData.loginBackRouteType=='tab'){
              //                    app.switchTab(  globalData.loginBackRoute);
              //                }else{
              //                  app.navTo(  globalData.loginBackRoute);
              //                }
                            
              //          }else{
              //            that.setData({
              //               account:{phone:"",password:""},
              //               login:{phone:"",code:""},
              //               check:false
              //            });
                        
              //          }
              //    }
              //  });
              // },
              // error(res){
              //   that.setData({
              //     isLoading:false
              //   });
              // },
              // fail(res){
              //   that.setData({
              //     isLoading:false
              //   });
              // }
              // }) ;
            }
          }
      }else{
            wx.showModal({
                      title: '提示',
                      content: '注册请勾选我已阅读用户协议,点击确定阅读协议',
                      success (res) {
                        that.setData({
                          isLoading:false
                        });
                        if (res.confirm) {
                          that.checkUserSettle();
                          that.setData({
                            check:true
                          });
                        
                        } else if (res.cancel) {
                        
                        }
                      }
                    });
      }
   
    },
    updateRole(e){
      let that =this;
      // let newUser= that.data.user;
      // e.detail?newUser.role=1:newUser.role=0;
    
      that.setData({
        isVolun:!that.data.isVolun
      });
    },
    updateMessage(e){
      let that =this;
      that.setData({
        volumentthink:e.detail.value.trim()
      })
    },
    setVolument(res){
          let that = this;
          this.setData({
            isRegister:false
          });
          let data =res.detail;
          if(data.confirm){
            if(that.data.isVolun){
              let volunReviewInfo={
               id:null,
               userid:that.data.registerId,
               reviewstatus:"正在审核",
               reviewcomment :"",
               volumentthink:that.data.volumentthink,
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
      
                  wx.cloud.callContainer({
                    "config": {
                      "env": app.globalData.env
                    },
                    "path": "/volunReviewInfo/selectByUserId",
                    "header": app.globalData.contentType.cloud_normal,
                    "method": "POST",
                     data:{
                        userid:that.data.registerId,
                     },
                     success(res){
                          let data =res.data;
                          console.log(data.message);
                          if(data.code ==200){
                            that.setData({
                              isLoading:false
                            });
                            app.globalData.loginUser.volunReviewInfo = data.data;
                            globalData.loginUser.volunReviewInfo=data.data;
                            app.connectWebsocket();
                            wx.setStorageSync("loginUser", globalData.loginUser);
                            if(  globalData.loginBackRouteType==""){
                              globalData.loginBackRouteType="tab";
                            }
                                if(  globalData.loginBackRoute==""){
                                  globalData.loginBackRoute="/pages/index/index";
                                }
                                
                
                                if(  globalData.loginBackRouteType=='tab'){
                                    app.switchTab(  globalData.loginBackRoute);
                                }else{
                                  app.navTo(  globalData.loginBackRoute);
                                }

                          }
                     },
                     error(res){
                      that.setData({
                        isLoading:false
                      });
                    },
                    fail(res){
                      that.setData({
                        isLoading:false
                      });
                    }
                    });   
                 }
                 ,
            error(res){
              that.setData({
                isLoading:false
              });
            },
            fail(res){
              that.setData({
                isLoading:false
              });
            }
               })
            }
          }
          if(data.cancel){
          
          }
    },
    //一键微信登录
   async wxloginSubmit(e){
     let that = this;
     that.setData({
      isLoading:true
    });
     await wx.getUserProfile({
        desc: '用于完善用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          let newUser = that.data.wxUser;
          newUser.headimg=res.userInfo.avatarUrl;
          newUser.name=res.userInfo.nickName;
          res.userInfo.gender==1?newUser.sex='男':newUser.sex='女';
          // console.log(res);
          wx.login({success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            // console.log(res);
            newUser.code=res.code;
            wx.cloud.callContainer({
              "config": {
                "env": app.globalData.env
              },
              "path": "/user/wxlogin",
            // wx.request({
            //   url: 'http://localhost:8085/user/wxlogin',
              "header": app.globalData.contentType.cloud,
              "method": "POST",
              data:newUser,
              success:function(res){
                that.setData({
                  isLoading:false
                });
                let data =res. data;
                console.log(data);
                wx.showToast({
                  title: data.message,
                  duration:3000,
                  success(res){
                    if(data.code==200){  
                      globalData.loginUser=data.data.user;
                      globalData.loginUser.volunReviewInfo=data.data.volunReviewInfo;      
                      app.globalData.loginUser=data.data.user;
                      app.globalData.loginUser.volunReviewInfo=data.data.volunReviewInfo; 
                      let registertime=globalData.loginUser.registertime;
                      let registertime1=registertime.slice(0,10);
                      let registertime2=registertime.slice(11,19);
                      globalData.loginUser.registertime=registertime1+" "+registertime2;
                      app.globalData.loginUser.registertime=registertime1+" "+registertime2;
                      that.setData({
                        registerId:globalData.loginUser.id
                      })
                      wx.setStorageSync("loginUser", globalData.loginUser);
                      if(data.message=="注册成功"){
                        that.setData({isRegister:true});
                      }else{                  
                        app.connectWebsocket();
                         if(  globalData.loginBackRouteType==""){
                           globalData.loginBackRouteType="tab";
                         }
                             if(  globalData.loginBackRoute==""){
                               globalData.loginBackRoute="/pages/index/index";
                             }
                             
             
                             if(  globalData.loginBackRouteType=='tab'){
                                 app.switchTab(  globalData.loginBackRoute);
                             }else{
                               app.navTo(  globalData.loginBackRoute);
                             }
                      }
                      
                          
                     }else{
                       that.setData({
                          account:{phone:"",password:""},
                          login:{phone:"",code:""},
                          check:false
                       });
                      
                     }
               }
             });
            },
            error(res){
              that.setData({
                isLoading:false
              });
            },
            fail(res){
              that.setData({
                isLoading:false
              });
            }
            })
          }
        })
        }
      })
 
    },
    //发送验证码
    SendNumCode(e){
      wx.showModal({
        title: '提示',
        content: '验证码还未开发中！！！',
        success (res) {
      
          if (res.confirm) {
         
          
          } else if (res.cancel) {
          
          }
        }
      });
    },
    //跳转注册页面
    navToRegister(){
      let that =this;
      app.navTo("/pages/register/register");
    },
    //跳转忘记密码页面
    navToForgetPasw(){
      let that =this;
      that.navTo("/pages/forget-pasw/forget-pasw");
    },
    updateAccountPhone(e){
      let that=this;
      let newAccount=that.data.account;
      newAccount.phone=e.detail.value.trim();
      that.setData({
       account:newAccount
      });
    },
    updateAccountPassword(e){
      let that=this;
      let newAccount=that.data.account;
      newAccount.password=e.detail.value.trim();
      that.setData({
       account:newAccount
      });
    },
    updateLoginPhone(e){
      let that=this;
      let newLogin=that.data.login;
      newLogin.phone=e.detail.value.trim();
      that.setData({
        login:newLogin
      });
    },
    updateLoginCode(e){
      let that=this;
      let newLogin=that.data.login;
      newLogin.code=e.detail.value.trim();
      that.setData({
        login:newLogin
      });
    },
    //查看协议
    checkUserSettle(){
      app.checkUserSettle(this);
    },
    onReady:function(){
   
    },
    onShow(){
      app =getApp();
      globalData=app.globalData;
     
    }
})
