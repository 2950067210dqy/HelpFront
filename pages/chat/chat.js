// chat.js
// let toast = require('../../utils/toast.js');
let chatInput = require('./modules/chat-input/chat-input');
var utils = require("../../utils/util");
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    //沟通用户的信息
    userId:14,
    user:null,
    wxchatLists: [],
    isPlayVoice:false,
    audio:null,
    friendHeadUrl: '',
    // textMessage: '',
    chatItems: [],
    scrollTopTimeStamp: 0,
    height: 0,  //屏幕高度
    chatHeight:0,//聊天屏幕高度
    normalDataTime:'',
  },
//item的所有单向信息
// {
//     dataTime: '',//当前时间
//     msg_type: '',//发送消息类型
//     userImgSrc: '',//用户头像
//     textMessage: '',//文字消息
//     voiceSrc: '',//录音的路径
//     voiceTime: 0,//录音的时长
//     sendImgSrc: '',//图片路径
//     type:1， //发送角色 1为自己 2为别人
//   }
setLoginUserData(){
  this.setData({
    loginUser:globalData.loginUser
  });
},
onShow(){
  app =getApp();
  globalData=app.globalData;
  this.setLoginUserData();

},
onUnload(){
  wx.setStorageSync(''+this.data.userId, this.data.wxchatLists);
},
webSocket(){
  let that =this;
  if(globalData.socketOpen){
    globalData.socket.onMessage(function (res) {
      if(res.data.trim()!="@live@"){
        that.setData({
          wxchatLists:wx.getStorageSync(''+that.data.userId)==""?[]:wx.getStorageSync(''+that.data.userId)
        });
      }
     
      // console.log('收到后端服务器内容：' + res.data);
      // let data =JSON.parse(res.data);
      // var list = that.data.wxchatLists;
      // list.push(data.message);
      // that.setData({
      //   wxchatLists:list  
      // });
    });
  }
},
getUserName(){
  let that =this;
  wx.cloud.callContainer({
    "config": {
      "env": app.globalData.env
    },
    "path": "/user/selectById",
    "header": app.globalData.contentType.cloud_normal,
    "method": "POST",
    data:{
      userid: that.data.userId 
    },
    success(res){
      let data= res.data;
      console.log(data.message);
      if(data.code==200){
        that.setData({
          user:data.data
        });
        wx.setNavigationBarTitle({
          title: '与'+ that.data.user.name+'聊天中'
      });
      }
    }
  })
  // wx.request({
  //   url: globalData.serverPath+"user/selectById",
  //   data:{
  //     userid: that.data.userId 
  //   },
  //   header:globalData.contentType.normal,
  //   method:"post",
  //   dataType:"json",
  //   success(res){
  //     let data= res.data;
  //     console.log(data.message);
  //     if(data.code==200){
  //       that.setData({
  //         user:data.data
  //       });
  //       wx.setNavigationBarTitle({
  //         title: '与'+ that.data.user.name+'聊天中'
  //     });
  //     }
  //   }
  // });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let _this = this;

    
    _this.setData({
      userId:options.userid
    });
    _this.webSocket();
    this.setData({
      wxchatLists:wx.getStorageSync(''+this.data.userId)==""?[]:wx.getStorageSync(''+this.data.userId)
    });
    //获取对方的名字
    _this.getUserName();
    _this.initData();
      //获取屏幕的高度
      wx.getSystemInfo({
        success(res) {
          _this.setData({
            height: wx.getSystemInfoSync().windowHeight,
            chatHeight: wx.getSystemInfoSync().windowHeight-55
          })
        }
      })
    },
    initData: function () {
      let that = this;
      let systemInfo = wx.getSystemInfoSync();
      chatInput.init(this, {
          systemInfo: systemInfo,
          minVoiceTime: 1,
          maxVoiceTime: 60,
          startTimeDown: 56,
          format: 'mp3',//aac/mp3
          sendButtonBgColor: 'mediumseagreen',
          sendButtonTextColor: 'white',
          extraArr: [{
              picName: 'choose_picture',
              description: '照片'
          }, {
              picName: 'take_photos',
              description: '拍摄'
          }],
          // tabbarHeigth: 48
      });

      that.setData({
        pageHeight: systemInfo.windowHeight,
        normalDataTime: utils.formatTime(new Date()),
      });
     
    
      that.textButton();
      that.extraButton();
      that.voiceButton();
  },
  textButton: function () {
    var that = this;
      chatInput.setTextMessageListener(function (e) {
        let content = e.detail.value;
        console.log(content);
        var list = that.data.wxchatLists;
        console.log(globalData);
        var temp = {
          userImgSrc: globalData.loginUser.headimg,
          textMessage: content,
          dataTime: utils.formatTime(new Date()),
          msg_type: 'text',
          type: 1
        };
        if(globalData.socketOpen){
         let data=JSON.stringify(
            {
              message:JSON.stringify(temp),
              touserid:that.data.userId,
              fromuserid:globalData.loginUser.id
            }
          );
         globalData.socket.send({
            data
          })
        }
        list.push(temp);
        that.setData({
          wxchatLists: list,
        });
        wx.setStorageSync(that.data.userId+'',list);
      });
    
  },
  voiceButton: function () {
    var that = this;
    chatInput.recordVoiceListener(function (res, duration) {
      let tempFilePath = res.tempFilePath;
      let vDuration = duration;
      console.log(tempFilePath);
      console.log(vDuration+"这是voice的时长");
      if(that.data.audioType){
        wx.cloud.uploadFile({
          cloudPath: 'audio/'+tempFilePath.slice(11), // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
          filePath: tempFilePath, // 微信本地文件，通过选择图片，聊天文件等接口获取
          config: {
            env: app.globalData.env // 需要替换成自己的微信云托管环境ID
          },
          success:function(res){
            console.log(res);
            let data = res;
            if(data.statusCode==204){             
              wx.showToast({
                title:"录音文件上传成功",
                duration:2000,
              });
              var list = that.data.wxchatLists;
              var temp = {
                userImgSrc:  globalData.loginUser.headimg,
                voiceSrc: data.fileID,
                voiceTime: vDuration,
                dataTime: utils.formatTime(new Date()),
                msg_type: 'voice',
                type: 1
              };
              if(globalData.socketOpen){
                let data=JSON.stringify(
                  {
                    message:JSON.stringify(temp),
                    touserid:that.data.userId,
                    fromuserid:globalData.loginUser.id
                  }
                );
                globalData.socket.send({
                  data
                })
              }
              list.push(temp);
              that.setData({
                wxchatLists: list,
                audioType:false
              });
              wx.setStorageSync(that.data.userId+'',list);
              
            
          }
                
          }
        });
      //   wx.uploadFile({
      //     filePath:tempFilePath,
      //     url: globalData.serverPath+"file/upload",
      //     name:"file",
      //     header:globalData.contentType.media,
      //     formData:{},
      //     success:function(res){
      //       let data = JSON.parse(res.data);
      //       if(data.code==200){             
      //         wx.showToast({
      //           title: data.message,
      //           duration:2000,
      //         });
      //         var list = that.data.wxchatLists;
      //         var temp = {
      //           userImgSrc:  globalData.loginUser.headimg,
      //           voiceSrc: data.data,
      //           voiceTime: vDuration,
      //           dataTime: utils.formatTime(new Date()),
      //           msg_type: 'voice',
      //           type: 1
      //         };
      //         if(globalData.socketOpen){
      //           let data=JSON.stringify(
      //             {
      //               message:JSON.stringify(temp),
      //               touserid:that.data.userId,
      //               fromuserid:globalData.loginUser.id
      //             }
      //           );
      //           wx.sendSocketMessage({
      //             data
      //           })
      //         }
      //         list.push(temp);
      //         that.setData({
      //           wxchatLists: list,
      //           audioType:false
      //         })
              
            
      //     }
                
      //     }
      // });   
      }
     
        
    });
    chatInput.setVoiceRecordStatusListener(function (status) {
        switch (status) {
            case chatInput.VRStatus.START://开始录音
                break;
            case chatInput.VRStatus.SUCCESS://录音成功
              that.setData({
                audioType:true
              });             
                break;
            case chatInput.VRStatus.CANCEL://取消录音
              that.setData({
                audioType:false
              });         
                break;
            case chatInput.VRStatus.SHORT://录音时长太短
              that.setData({
                audioType:false
              });
                break;
            case chatInput.VRStatus.UNAUTH://未授权录音功能

                break;
            case chatInput.VRStatus.FAIL://录音失败(已经授权了)
              that.setData({
                audioType:false
              });
                break;
        }
    })
  },
  extraButton: function () {
      let that = this;
      chatInput.clickExtraListener(function (e) {
          console.log(e);
          let itemIndex = parseInt(e.currentTarget.dataset.index);
          if (itemIndex === 2) {
              that.myFun();
              return;
          }
          wx.chooseImage({
              count: 1, // 默认9
              sizeType: ['compressed'],
              sourceType: itemIndex === 0 ? ['album'] : ['camera'],
              success: function (res) {
                let tempFilePath = res.tempFilePaths;
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
                        title: "图片上传成功",
                        duration:2000,
                      });
                      var list = that.data.wxchatLists;
                      var temp = {
                        dataTime: utils.formatTime(new Date()),
                        sendImgSrc:data.fileID,
                        msg_type: 'img',
                        userImgSrc: globalData.loginUser.headimg,
                        type: 1
                      };
                      if(globalData.socketOpen){
                        let data=JSON.stringify(
                           {
                             message:JSON.stringify(temp),
                             touserid:that.data.userId,
                             fromuserid:globalData.loginUser.id
                           }
                         );
                         globalData.socket.send({
                           data
                         })
                       }
                      list.push(temp);
                      that.setData({
                        wxchatLists: list,
                      });
                      wx.setStorageSync(that.data.userId+'',list);
                      
                    
                   }
                        
                  }
                });
              //   wx.uploadFile({
              //     filePath:tempFilePath[0],
              //     url: globalData.serverPath+"file/upload",
              //     name:"file",
              //     header:globalData.contentType.media,
              //     formData:{},
              //     success:function(res){
              //       let data = JSON.parse(res.data);
              //       if(data.code==200){
              //         wx.showToast({
              //           title: data.message,
              //           duration:2000,
              //         });
              //         var list = that.data.wxchatLists;
              //         var temp = {
              //           dataTime: utils.formatTime(new Date()),
              //           sendImgSrc:data.data,
              //           msg_type: 'img',
              //           userImgSrc: globalData.loginUser.headimg,
              //           type: 1
              //         };
              //         if(globalData.socketOpen){
              //           let data=JSON.stringify(
              //              {
              //                message:JSON.stringify(temp),
              //                touserid:that.data.userId,
              //                fromuserid:globalData.loginUser.id
              //              }
              //            );
              //            wx.sendSocketMessage({
              //              data
              //            })
              //          }
              //         list.push(temp);
              //         that.setData({
              //           wxchatLists: list,
              //         })
                      
                    
              //      }
                        
              //     }
              // });               
              }
          });
        
      });
      chatInput.setExtraButtonClickListener(function (dismiss) {
          console.log('Extra弹窗是否消息', dismiss);
      })
  },


  resetInputStatus: function () {
      chatInput.closeExtraView();
  },
  //播放录音
  playRecord: function (e) {
    let src =e.target.dataset.src;
    console.log(e);
    let _this = this;
    let  audio=_this.data.audio;
    //播放暂停功能
    if(audio==null){
      audio= wx.createInnerAudioContext();
      audio.src=globalData.serverPath+src; 
      _this.setData({
        audio
      });
      audio.play();
      wx.showLoading({
        title: '正在播放',
      })
      audio.onEnded(function(res){
        wx.hideLoading({
          success: (res) => {},
        });
        audio=null;
        _this.setData({
          audio:null
        });
      });
      audio.onError(function(res){
        wx.hideLoading({
          success: (res) => {},
        });
        wx.showToast({
          title: '录音文件已被删除',
          duration:1000
        })
        audio=null;
        _this.setData({
          audio:null
        });
      });
    }else{
      audio.stop();
      wx.hideLoading({
        success: (res) => {},
      });
      _this.setData({
        audio:null
      });
      audio.onError(function(res){
        wx.hideLoading({
          success: (res) => {},
        });
        wx.showToast({
          title: '录音文件已被删除',
          duration:1000
        })
        audio=null;
        _this.setData({
          audio:null
        });
      });
    }
  },
  //复制消息到剪贴板
  CopyInfo(e){
    let that =this;
    let info =e.target.dataset.msg;
    wx.setClipboardData({
      data:info ,
      success: function () {
        console.log(13);
      	// 添加下面的代码可以复写复制成功默认提示文本`内容已复制` 
        wx.showToast({
          title: '已经复制到剪贴板',
          duration: 3000
        })
        wx.getClipboardData({
          success: function (res) {
          }
        })
      }
    });
  },
  //删除单条消息
  delMsg: function (e) {
    var that = this;
    var magIdx = parseInt(e.currentTarget.dataset.index);
    var list = that.data.wxchatLists;

    wx.showModal({
      title: '提示',
      content: '确定删除此消息吗？',
      success: function (res) {
        if (res.confirm) {
          console.log(e);
          list.splice(magIdx, 1);
          that.setData({
            wxchatLists: list,
          });
          // wx.showToast({
          //   title: '删除成功',
          //   mask: true,
          //   icon: 'none',
          // })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    

    
  },
  //点击图片 预览大图
  seeBigImg: function (e) {
    var that = this;
    var idx  = parseInt(e.currentTarget.dataset.index);
    var src =globalData.serverPath+ that.data.wxchatLists[idx].sendImgSrc;
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src] // 需要预览的图片http链接列表
    })
  },

});