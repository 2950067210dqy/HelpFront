// pages/issue/issue.js
var app =getApp();
var globalData=app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    helpinfo:{
        adcode:globalData.locationAdcode,
        latitude:globalData.latitude,
        longitude:globalData.longitude,
        detailLocation:"",
        message:"",
        title:"",
        images:"",
        state:0,
        userid:globalData.loginUser!=null?globalData.loginUser.id:0,
        helpid:0,
        okcode:"",
        createtime:"",
        updatetime:"",
        type:0,
        emergency:0
    },
    typeNums:[],
    typeIndex:null,
    emergencyNums:[],
    emergencyIndex:null,
    imageNums:[],
    isMagnitifyImage:false,
    magnitifyImageUrl:"",
     //用户定位
     locationAddress:globalData.locationAddress,
     locationProvince:globalData.locationProvince,
     locationCity:globalData.locationCity,
     locationDistrict:globalData.locationDistrict,
     locationAdcode:globalData.locationAdcode,
     //输入地址  用户发布的信息选择的地址
     isNewLocationAddress:false,
     LocationAddress:globalData.locationAddress,
     newLocationAddress:"",
     adcode:globalData.locationAdcode,
     latitude:0,
     longitude:0,
      //验证码
      code:"",
      sysCode:"",
   
      check:false,
      isLoading:false,
  },
  //类别picker change
  typeChange: function (e) {
    let newhelpinfo=this.data.helpinfo;
    newhelpinfo.type=this.data.typeNums[e.detail.value].id;
    this.setData({
      helpinfo: newhelpinfo,
      typeIndex:e.detail.value
    });
  },
  //紧急程度picker change
  emergencyChange: function (e) {
    let newhelpinfo=this.data.helpinfo;
    newhelpinfo.emergency=this.data.emergencyNums[e.detail.value].id;
    this.setData({
      helpinfo: newhelpinfo,
      emergencyIndex:e.detail.value
    });
  },
  setLoginUser(){
    this.setData({
      loginUser:globalData.loginUser,
    })
  },
  setLocationData(){
    globalData=getApp().globalData;
    let newhelpinfo=this.data.helpinfo;
    newhelpinfo.adcode=globalData.locationAdcode;
    newhelpinfo.latitude=globalData.latitude;
    newhelpinfo.longitude=globalData.longitude;
    this.setData({
      locationAddress:globalData.locationAddress,
      locationProvince:globalData.locationProvince,
      locationCity:globalData.locationCity,
      locationDistrict:globalData.locationDistrict,
      locationAdcode:globalData.locationAdcode,
      helpInfo:newhelpinfo,
      LocationAddress:globalData.locationAddress,
      adcode:globalData.locationAdcode,
      latitude:globalData.latitude,
      longitude:globalData.longitude
    });
  },
  //取得类别数组
  getTypeNums(){
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
              let newtypeNums=that.data.typeNums;
              newtypeNums=data.datas[0];
              that.setData({
                typeNums:newtypeNums
              });
            }
          }
        });
    }
    })
    // wx.request({
    //   url: globalData.serverPath+"type/getType",
    //   data:globalData.loginUser,
    //   dataType:"json",
    //   method:"post",
    //   header:globalData.contentType.json,
    //   success(res){
    //       let data =res.data;
    //       wx.showToast({
    //         title: data.message,
    //         duration:500,
    //         success(res){
    //           if(data.code==200){
    //             let newtypeNums=that.data.typeNums;
    //             newtypeNums=data.datas[0];
    //             that.setData({
    //               typeNums:newtypeNums
    //             });
    //           }
    //         }
    //       });
    //   }
    // });
  },
  //取得紧急程度数组
  getEmergencyNums(){
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
              let newemergencyNums=that.data.emergencyNums;
              newemergencyNums=data.datas[0];
              that.setData({
                emergencyNums:newemergencyNums
              });
            }
          }
        });
    }
    })
    // wx.request({
    //   url: globalData.serverPath+"emergency/getEmergency",
    //   data:globalData.loginUser,
    //   dataType:"json",
    //   method:"post",
    //   header:globalData.contentType.json,
    //   success(res){
    //       let data =res.data;
    //       wx.showToast({
    //         title: data.message,
    //         duration:500,
    //         success(res){
    //           if(data.code==200){
    //             let newemergencyNums=that.data.emergencyNums;
    //             newemergencyNums=data.datas[0];
    //             that.setData({
    //               emergencyNums:newemergencyNums
    //             });
    //           }
    //         }
    //       });
    //   }
    // });
  },
  //取消上传图片
  unloadImage(e){
    let that =this;
    let index =e.target.dataset.id;
    let newImageNums=that.data.imageNums;
    newImageNums=app.removeByIndex( newImageNums,index);
    that.setData({
      imageNums:newImageNums
    });
  },
  //放大图片
  magnifyImage(e){
    let that =this;
    //阻止点击事件冒泡
    let type=e.target.dataset.type;
    if(type=="father"){
       let index =e.target.dataset.id;
       let imageUrl=that.data.imageNums[index];
       that.setData({
         magnitifyImageUrl:imageUrl,
         isMagnitifyImage:true
       });
    }
  },
  //成功放大图片
  magnifyImageSuccess(res){
    let that=this;
    if(res.detail.cancel){
      that.setData({
        isMagnitifyImage:false
      });
    }
  },
  //上传图片
  uploadImage(e){
    let that =this;
       //本地上传
       wx.chooseImage({
        sizeType: ['compressed'],
        sourceType:['album' ,'camera'],
        count: 9,
        success:function(res){
          let tempFilePaths=res.tempFilePaths;
          for (let index = 0; index < tempFilePaths.length; index++) {
            const  tempFilePath =  tempFilePaths[index];
            wx.cloud.uploadFile({
              cloudPath: 'helpimg/'+tempFilePath.slice(11)+'.png', // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
              filePath: tempFilePath, // 微信本地文件，通过选择图片，聊天文件等接口获取
              config: {
                env: app.globalData.env // 需要替换成自己的微信云托管环境ID
              },
              success:function(res){
                let data = res;
                if(data.statusCode==204){
                  wx.showToast({
                    title: "图片上传成功！",
                    duration:500,
                  });
                  let newImageUrl=data.fileID;
                  let newImageNums=that.data.imageNums;
                  newImageNums.push(newImageUrl);
                  that.setData({
                    imageNums:newImageNums
                  });
                     
                }
              }      
            });
            // wx.uploadFile({
            //   filePath:tempFilePath,
            //     url: globalData.serverPath+"file/upload",
            //     name:"file",
            //     header:globalData.contentType.media,
            //     formData:{},
            //     success:function(res){
            //       let data = JSON.parse(res.data);
            //       if(data.code==200){
            //         wx.showToast({
            //           title: data.message,
            //           duration:500,
            //         });
            //         let newImageUrl=data.data;
            //         let newImageNums=that.data.imageNums;
            //         newImageNums.push(newImageUrl);
            //         that.setData({
            //           imageNums:newImageNums
            //         });
                       
            //       }
            //     }        
            //   });
          }
        }
      });
  },
  //提交发布
  issueSubmit(e){
    let that =this;
    that.setLoading(true);
    let helpInfo=that.data.helpinfo;
    if(
      helpInfo.emergency==0||
      helpInfo.type==0||
      helpInfo.title.trim()==""||
      helpInfo.message.trim()==""||
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
        helpInfo.images=that.handleImageNums();    
         console.log( helpInfo);
        let setHelpInfoVO=  {
          helpInfo:helpInfo,
          user:that.data.loginUser
        }; 
        wx.cloud.callContainer({
          "config": {
            "env": app.globalData.env
          },
          "path": "/helpinfo/setHelpInfo",
          "header": app.globalData.contentType.cloud,
          "method": "POST",
          data:setHelpInfoVO,
          success(res){
            let data=res.data;
            wx.showToast({
              title: data.message,
              duration:2000,
              success(res){
                if(data.code==200){
                    that.setData({
                      helpinfo:{
                        latitude:globalData.latitude,
                        longitude:globalData.longitude,
                        detailLocation:"",
                        adcode:globalData.locationAdcode,
                        message:"",
                        title:"",
                        images:"",
                        state:0,
                        userid:globalData.loginUser!=null?globalData.loginUser.id:0,
                        helpid:0,
                        okcode:"",
                        createtime:"",
                        updatetime:"",
                        type:0,
                        emergency:0
                       },
                       imageNums:[],
                       typeIndex:null,
                       emergencyIndex:null,
                       code:""
                    });
                }
                that.getRandom(6);
                that.setLoading(false);
              }
            });  
          },
          error(res){
            that.setLoading(false);
          },
          fail(res){
            that.setLoading(false);
          }
        })
        // wx.request({
        //   url: globalData.serverPath+"helpinfo/setHelpInfo",
        //   data:setHelpInfoVO,
        //   dataType:"json",
        //   method:"POST",
        //   header:globalData.contentType.json,
        //   success(res){
        //     let data=res.data;
        //     wx.showToast({
        //       title: data.message,
        //       duration:2000,
        //       success(res){
        //         if(data.code==200){
        //             that.setData({
        //               helpinfo:{
        //                 latitude:globalData.latitude,
        //                 longitude:globalData.longitude,
        //                 detailLocation:"",
        //                 adcode:globalData.locationAdcode,
        //                 message:"",
        //                 title:"",
        //                 images:"",
        //                 state:0,
        //                 userid:globalData.loginUser!=null?globalData.loginUser.id:0,
        //                 helpid:0,
        //                 okcode:"",
        //                 createtime:"",
        //                 updatetime:"",
        //                 type:0,
        //                 emergency:0
        //                },
        //                imageNums:[],
        //                typeIndex:null,
        //                emergencyIndex:null,
        //                code:""
        //             });
        //         }
        //         that.getRandom(6);
        //         that.setLoading(false);
        //       }
        //     });  
        //   },
        //   error(res){
        //     that.setLoading(false);
        //   },
        //   fail(res){
        //     that.setLoading(false);
        //   }
        // })
      }
    }
      // console.log(this.data.helpinfo);
  },
//加载动画值更改
setLoading(isLoading){
  this.setData({
    isLoading:isLoading
  });
},

//点击求助人地区
inputLocation(){
  // console.log(this.data);
  this.setData({
    isNewLocationAddress:true,
    newLocationAddress:this.data.LocationAddress
  });
},
//点击求助人地区modal
inputLocationModal(res){
  let that = this;
  this.setData({
    isNewLocationAddress:false
  });
  let data =res.detail;
  if(data.confirm){

    let newHelpInfo =that.data.helpinfo;
    newHelpInfo.adcode=that.data.adcode;
    newHelpInfo.latitude=that.data.latitude;
    newHelpInfo.longitude=that.data.longitude; 
    that.setData({
        helpinfo:newHelpInfo,
        LocationAddress:that.data.newLocationAddress
    });
    console.log(that.data.helpinfo);
  }
  if(data.cancel){
    this.setData({
      newLocationAddress:""
    });
  }
},
  //选择位置 start
  chooseLocation:function(){
    let that =this;
    wx.chooseLocation({
           success: function (res) {
            // console.log(res);
            // let address=res.address+res.name;
            let latitude=res.latitude;
            let longitude=res.longitude;
             // 返回的res:name(地理名称）、address（详细地址，包括省市区相关信息，可根据需要进行拆分）、latitude（纬度）、longitude（经度）
             wx.request({
              url: 'https://restapi.amap.com/v3/geocode/regeo', 
              type:"get",
              data:{
                key:globalData.gaodeKey,
                location:longitude+","+latitude
              },
              success(res){          
                that.setData({
                    adcode:res.data.regeocode.addressComponent.adcode,
                    latitude,
                    longitude,
                    newLocationAddress:res.data.regeocode.formatted_address
                });
                // console.log(that.data.helpinfo);
              }
            });
           },
         })
  },//选择位置 end
//验证码
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
  updateCode(e){
    let that=this;
    let code=e.detail.value.trim();
    that.setData({
     code: code
    });
  },
  updateTitle(e){
    let that =this;
    let newHelpInfo=that.data.helpinfo;
    newHelpInfo.title=e.detail.value.trim();
    that.setData({
      helpinfo:newHelpInfo
    });
  },
  updateMessage(e){
    let that =this;
    let newHelpInfo=that.data.helpinfo;
    newHelpInfo.message=e.detail.value.trim();
    that.setData({
      helpinfo:newHelpInfo
    });
  },
  updateNewLocation(e){
    let that =this;
    that.setData({
     newLocationAddress:e.detail.value.trim()
    });
  },
  updateDetailLocation(e){
    let that =this;
    let newHelpInfo=that.data.helpinfo;
    newHelpInfo.detailLocation=e.detail.value.trim();
    that.setData({
      helpinfo:newHelpInfo
    });
  },
  //处理相关图片上传至参数 
  handleImageNums(){
    let that =this;
    let imageNums=that.data.imageNums;
    let images="";
    if(imageNums.length==0){
      return images;
    }
    for (let index = 0; index < imageNums.length; index++) {
      const image = imageNums[index];
      if(index==imageNums.length-1){
        images=images+image;
      }else{
        images=images+image+",";
      }
    }
    return images;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  clickMessage(e){
    let userid = Number(e.target.dataset.userid);
      app.clickMessage(userid);
  },
  messageClose(e){
    this.setData({
      show:false,
    });
  },
  messageClose(e){
    this.setData({
      show:false,
    });
  },
  onLoad(options) {
    this.setLocationData();
    let that = this;
   
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
    app =getApp();
    globalData=app.globalData;
    let that =this;
    app.judgeLogin(that,"/pages/issue/issue","tab");
    this.setLoginUser();
  
    if(that.data.loginUser!=null){
      this.getTypeNums();
      this.getEmergencyNums();
      this.getRandom(6);
      let newhelpinfo=this.data.helpinfo;
    newhelpinfo.userid=globalData.loginUser.id;
    this.setData({helpinfo:newhelpinfo});
    app.globalData.messageCallback=(userid,name)=>{
      console.log(that);
      that.setData({
        userid:userid,
        show:true,
        msg:"您有来自  "+name+"  的消息！",
        duration:2000 
      });
    };
    }
  
  
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