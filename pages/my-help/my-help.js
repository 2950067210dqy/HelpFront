
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    type:0,
    getUrl:'',
    tableDatas:[],
    //放大图片
    isMagnitifyImage:false,
    magnitifyImageUrl:"",
    //点击取消帮助
    isCancel:false,
    okcode:'',

  },
  navToUserDetail(e){
    app.navToUserDetail(e);
  },
  //获取信息
  getHelpInfo(){
    let that =this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": that.data.getUrl,
      "header": app.globalData.contentType.cloud_normal,
      "method": "POST",
      data:{
        userid:globalData.loginUser.id
      },
      success(res){
        let data=res.data;
        console.log(data.message);
        if( data.code==200){
            that.setData({
              tableDatas:that.data.tableDatas.concat(data.datas[0])
            });
            //将经纬度转换成位置 高德地图
            let locations="";
            let num=0;
            let page=1;
            for (let index = 0; index < data.datas[0].length; index++) {
              const element0 = data.datas[0][index];
              for (let index2 = 0; index2 < element0.datas.length; index2++) {
                num++;
                const element1 = element0.datas[index2];
                locations=locations+element1.longitude+","+ element1.latitude+"|";
                if(num%20==0){
                  num=0;
                  that.getAddressForLatiLongi(locations,page);
                  page++;
                  locations="";
              
                }                    
              }  
            }
            if(num<20){
              console.log(20);
                that.getAddressForLatiLongi(locations,page)
            }
                  
        }
        else{
              that.setData({
                isChooseLocation:false
              });
              // that.refreshDataHandle();
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
        }
    });
    // wx.request({
    //   url: that.data.getUrl,
    //   data:{
    //     userid:globalData.loginUser.id
    //   },
    //   dataType:'json',
    //   method:"POST",
    //   header:globalData.contentType.normal,
    //   success(res){
    //       let data=res.data;
    //       console.log(data.message);
    //       if( data.code==200){
    //           that.setData({
    //             tableDatas:that.data.tableDatas.concat(data.datas[0])
    //           });
    //           //将经纬度转换成位置 高德地图
    //           let locations="";
    //           let num=0;
    //           let page=1;
    //           for (let index = 0; index < data.datas[0].length; index++) {
    //             const element0 = data.datas[0][index];
    //             for (let index2 = 0; index2 < element0.datas.length; index2++) {
    //               num++;
    //               const element1 = element0.datas[index2];
    //               locations=locations+element1.longitude+","+ element1.latitude+"|";
    //               if(num%20==0){
    //                 num=0;
    //                 that.getAddressForLatiLongi(lcoations,page);
    //                 page++;
    //                 locations="";
                
    //               }                    
    //             }  
    //           }
    //           if(num<20){
    //             console.log(20);
    //               that.getAddressForLatiLongi(locations,page)
    //           }
                    
    //       }
    //       else{
    //             that.setData({
    //               isChooseLocation:false
    //             });
    //             that.refreshDataHandle();
    //             setTimeout(function () {
    //               wx.showToast({
    //                   title: data.message,
    //                   icon: 'none',
    //                   duration: 1000
    //               });
    //               wx.hideNavigationBarLoading(); //完成navbar停止加载
    //               wx.stopPullDownRefresh(); //停止下拉刷新
    //               that.setData({
    //                 isRefresh:false
    //               });
    //              }, 1000);
    //       }      
    //       }
    //   } 
    // )
  },
  //将经纬度转换成位置 高德地图
  getAddressForLatiLongi(locations,page){
    let that =this;
          wx.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo', 
                type:"get",
                data:{
                  key:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
                  location: locations,
                  batch:true
                },
                success(res){ 
                  // console.log(locations);
                  //  console.log(res);
                  let tableDatas=that.data.tableDatas;
                  let newNum=0;
                  let dataIndex=0;
                  for (let index = 0; index < tableDatas.length; index++) {
                    tableDatas[index].length=tableDatas[index].datas.length;
                    for (let index2 = 0; index2 < tableDatas[index].datas.length; index2++) {
                      newNum++;
                      if(newNum>((page-1)*20)&&newNum<=((page)*20)&&dataIndex< res.data.regeocodes.length){
                        tableDatas[index].datas[index2].address= res.data.regeocodes[dataIndex].formatted_address;
                        dataIndex++;      
                      } 
                    }
                  }
                  // console.log(tableDatas);
                  that.setData({
                    tableDatas,
                  });
                  console.log(that.data.tableDatas);
                }
              });  
  },
  //评分
rate(e){
  let that =this;
  let adcode = e.target.dataset.adcode;
  let helpInfoId=e.target.dataset.id;
  let index = e.target.dataset.index;
  let index0 =  e.target.dataset.index0;
  let helperid=that.data.loginUser.id ;
  let userId=e.target.dataset.userid;
  app.navTo("/pages/rate/rate?userid="+userId+"&helperid="+helperid+"&helpinfoid="+helpInfoId+"&adcode="+adcode+"&type=myhelp");
},
  //取消帮忙
  cancelThisByHelper(e){
      let that =this;
      let helpInfoId=e.target.dataset.id;
      let index = e.target.dataset.index;
      let index0 =  e.target.dataset.index0;
      let loginUserId=that.data.loginUser.id;
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/setCancelByHelper",
        "header": app.globalData.contentType.cloud_normal,
        "method": "POST",
        data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
        success(res){
          let data= res.data;
          wx.showToast({
            title: data.message,
            duration:500
          });
          if(data.code==200){
              if(data.data.id==helpInfoId){
                  let newTableDatas=that.data.tableDatas;
                  newTableDatas[index0].datas[index].helpUser=null;
                  newTableDatas[index0].datas[index].state=data.data.state;
                  newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
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
      });
      // wx.request({
      //   url: globalData.serverPath+"helpinfo/setCancelByHelper",
      //   data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
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
      //             newTableDatas[index0].datas[index].helpUser=null;
      //             newTableDatas[index0].datas[index].state=data.data.state;
      //             newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
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
      let index0 =  e.target.dataset.index0;
      let helpInfoId=e.target.dataset.id;
      let index = e.target.dataset.index;
      let loginUserId=that.data.loginUser.id;
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/setCancelByHelper",
        "header": app.globalData.contentType.cloud_normal,
        "method": "POST",
        data:{
          userid: that.data.userId 
        },
      });   
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/setHelp",
        "header": app.globalData.contentType.cloud_normal,
        "method": "POST",
        data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
        success(res){
          let data= res.data;
          wx.showToast({
            title: data.message,
            duration:500
          });
          if(data.code==200){
              if(data.data.id==helpInfoId){
                  let newTableDatas=that.data.tableDatas;
                  newTableDatas[index0].datas[index].helpUser=data.data.helperUser;
                  newTableDatas[index0].datas[index].state=data.data.state;
                  newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
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
      });
      // wx.request({
      //   url: globalData.serverPath+"helpinfo/setHelp",
      //   data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
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
      //             newTableDatas[index0].datas[index].helpUser=data.data.helperUser;
      //             newTableDatas[index0].datas[index].state=data.data.state;
      //             newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
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
//完成帮助
finishThisByHelper(e){
     let that =this;
      that.setData({
        isCancel:true
      })

     
},
updateokcodeModal(e){
  let that = this;
  let data =e.detail;
  let helpInfoId=e.target.dataset.id;
  let index = e.target.dataset.index;
  let index0 =  e.target.dataset.index0;
  let userid= e.target.dataset.userid;
  let loginUserId=that.data.loginUser.id;
  if(data.confirm){
    if(that.data.okcode.trim()!=''){
          wx.cloud.callContainer({
            "config": {
              "env": app.globalData.env
            },
            "path": "/helpinfo/selectOkcode",
            "header": app.globalData.contentType.cloud_normal,
            "method": "POST",
            data:{
              okcode:that.data.okcode,
              helpinfoid:helpInfoId,
              adcode:that.data.tableDatas[index0].datas[index].adcode
          },
          success(res){
            let data=res.data;
            wx.showToast({
              title: data.message,
              duration:500
            });
            if(data.code==200){
              wx.cloud.callContainer({
                "config": {
                  "env": app.globalData.env
                },
                "path": "/helpinfo/setFinishByHelper",
                "header": app.globalData.contentType.cloud_normal,
                "method": "POST",
                data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
                success(res){
                  let data= res.data;
                  wx.showToast({
                    title: data.message,
                    duration:500
                  });
                  if(data.code==200){
                      if(data.data.id==helpInfoId){
                          let newTableDatas=that.data.tableDatas;
                          newTableDatas[index0].datas[index].state=data.data.state;
                          newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
                          that.setData({
                            tableDatas:newTableDatas,
                            okcode:'',
                            isCancel:false
                          });
                      }else{            
                        this.setData({
                          okcode:'',
                          isCancel:false
                        }); 
                      }
                  }
                }
              });
              // wx.request({
              //   url: globalData.serverPath+"helpinfo/setFinishByHelper",
              //   data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
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
              //             newTableDatas[index0].datas[index].state=data.data.state;
              //             newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
              //             that.setData({
              //               tableDatas:newTableDatas,
              //               okcode:'',
              //               isCancel:false
              //             });
              //         }else{            
              //           this.setData({
              //             okcode:'',
              //             isCancel:false
              //           }); 
              //         }
              //     }
              //   }
              // });
            }else{
              that.setData({
                okcode:'',
                isCancel:false
              }); 
            }
          }
          });
          // wx.request({
          //   url: globalData.serverPath+"helpinfo/selectOkcode",
          //   data:{
          //       okcode:that.data.okcode,
          //       helpinfoid:helpInfoId,
          //       adcode:that.data.tableDatas[index0].datas[index].adcode
          //   },
          //   method:"POST",
          //   dataType:"json",
          //   header:globalData.contentType.normal,
          //   success(res){
          //     let data=res.data;
          //     wx.showToast({
          //       title: data.message,
          //       duration:500
          //     });
          //     if(data.code==200){
          //       wx.request({
          //         url: globalData.serverPath+"helpinfo/setFinishByHelper",
          //         data:{helpInfoId,loginUserId,adcode:that.data.tableDatas[index0].datas[index].adcode},
          //         method:"POST",
          //         header:globalData.contentType.normal,
          //         success(res){
          //           let data= res.data;
          //           wx.showToast({
          //             title: data.message,
          //             duration:500
          //           });
          //           if(data.code==200){
          //               if(data.data.id==helpInfoId){
          //                   let newTableDatas=that.data.tableDatas;
          //                   newTableDatas[index0].datas[index].state=data.data.state;
          //                   newTableDatas[index0].datas[index].updatetime=data.data.timestamp;
          //                   that.setData({
          //                     tableDatas:newTableDatas,
          //                     okcode:'',
          //                     isCancel:false
          //                   });
          //               }else{            
          //                 this.setData({
          //                   okcode:'',
          //                   isCancel:false
          //                 }); 
          //               }
          //           }
          //         }
          //       });
          //     }else{
          //       this.setData({
          //         okcode:'',
          //         isCancel:false
          //       }); 
          //     }
          //   }
          // })
    }else{
      wx.showToast({
        title: '输入不能为空',
        duration:1000
      })
    }
   
   
  }
  if(data.cancel){ 
    this.setData({
    okcode:'',
    isCancel:false
  }); 
}
 
},
updateokcode(e){
  let that=this;
  let okcode=e.detail.value.trim();
  that.setData({
    okcode
  });
},
//聊天
communication(e){
  let that =this;
  let helpInfoId=e.target.dataset.id;
  let index = e.target.dataset.index;
  let index0 =  e.target.dataset.index0;
  let userid= e.target.dataset.userid;
  let loginUserId=that.data.loginUser.id;
   app.navTo("/pages/chat/chat?userid="+userid);
},
  //放大图片
  magnifyImage(e){
    console.log(e);
    let that =this;
    let indexFather =e.target.dataset.idfather;
    let indexChild =e.target.dataset.idchild;
    let indexGrandFather=e.target.dataset.idgrandfather;
    let imageUrl=that.data.tableDatas[indexGrandFather].datas[indexFather].images[indexChild];
    that.setData({
      magnitifyImageUrl:imageUrl,
      isMagnitifyImage:true
    });
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
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
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
    this.setData({
      type:options.type,
      // getUrl:globalData.serverPath+"helpinfo/getAllHelp"+options.type
      getUrl:"/helpinfo/getAllHelp"+options.type
    });
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

    this.getHelpInfo();
    // this.connectWebSocket();
  },
  onUnload: function () {
    // wx.closeSocket();
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
    this.setLoginUserData();
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