// pages/register/register.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      serverPath:globalData.serverPath,
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
      //阅读协议check
      check: false,
      //性别radio
      sexRadio:1,
      //性别图标
      sexIcon:"",
      //性别颜色
      sexColor:"blue",
      //重新输入密码
      repassword:"",
      //是否要成为志愿者
      isVolun:false,
      volumentthink:""
  },
  registerSubmit(e){
    let that=this;
    if(that.data.check){
      if(
        that.data.user.username.trim()==""
        || that.data.user.password.trim()==""||
        that.data.repassword.trim()==""||
        that.data.user.name.trim()==""||
        that.data.code.trim()==""||(that.data.isVolun&&that.data.volumentthink.trim()=="")
      ){
          wx.showToast({
            title: '输入框不能为空',
            duration:2000
          })
      }else{
          if(that.data.repassword.trim()!= that.data.user.password.trim()){
            wx.showToast({
              title: '两次密码不一致',
              duration:2000
            });
            that.getRandom(6);
          }else{
            if(that.data.code.trim().toLowerCase()!=that.data.sysCode.trim().toLowerCase()){
              wx.showToast({
                title: '验证码不正确',
                duration:2000
              });
              that.getRandom(6);
            }else{
              wx.cloud.callContainer({
                "config": {
                  "env": app.globalData.env
                },
                "path": "/user/register",
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
                        if(that.data.isVolun){
                          let volunReviewInfo={
                           id:null,
                           userid:data.data.id,
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
                               let data =res.data;                              
                               console.log(data.message);
                               app.navTo("/pages/login/login");
                             }
                           })
                        }
                        
                      }else{
                        that.setData({
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
                          //阅读协议check
                          check: false,
                          //性别radio
                          sexRadio:1,
                          //性别图标
                          sexIcon:"",
                          //性别颜色
                          sexColor:"blue",
                          //重新输入密码
                          repassword:"",
                          //是否要成为志愿者
                          isVolun:false,
                          volumentthink:""
                        });
                        that.getRandom(6);
                      }
                    }
                  })
              }
              });
          
              // wx.request({
              //   url:  globalData.serverPath+"user/register",
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
              //             app.navTo("/pages/login/login")
              //           }else{
              //             that.setData({
              //               user:{
              //                 id:0,
              //                 username:"",
              //                 password:"",
              //                 name:"",
              //                 phone:"",
              //                 sex:"男",
              //                 headimg:"",
              //                 role:0,
              //                 registertime:""
              //               },
              //               //验证码
              //               code:"",
              //               sysCode:"",
              //               //阅读协议check
              //               check: false,
              //               //性别radio
              //               sexRadio:1,
              //               //性别图标
              //               sexIcon:"",
              //               //性别颜色
              //               sexColor:"blue",
              //               //重新输入密码
              //               repassword:"",
              //             });
              //             that.getRandom(6);
              //           }
              //         }
              //       })
              //   }
              // })
            }
          }
      }
  
    }else{
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
        }
      });
  
    }

  },
  uploadHeadImg(e){
    let that =this;
      wx.chooseImage({
        sizeType: ['compressed'],
        sourceType:['album' ,'camera'],
        count: 1,
        success:function(res){
          let tempFilePath=res.tempFilePaths;
          wx.cloud.uploadFile({
            cloudPath: 'headimg/'+tempFilePath[0].slice(11)+'.png', // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
            filePath: tempFilePath[0], // 微信本地文件，通过选择图片，聊天文件等接口获取
            config: {
              env: app.globalData.env // 需要替换成自己的微信云托管环境ID
            },
            success:function(res){
              let data = res;
              if(data.statusCode==204){
                wx.showToast({
                  title:"上传头像成功",
                  duration:2000,
                });
                let newUser=that.data.user;
                newUser.headimg=data.fileID;
                that.setData({
                  user:newUser
                });
              }
            
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
          //       let newUser=that.data.user;
          //       newUser.headimg=data.data;
          //       that.setData({
          //         user:newUser
          //       });
          //     }
            
          //   }
          // })
        }
      })
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
    console.log(that.data.user);
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that =this;
    that.getRandom(6);
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(){
    app =getApp();
    globalData=app.globalData;

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