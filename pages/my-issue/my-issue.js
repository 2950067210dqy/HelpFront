
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
    //                 that.getAddressForLatiLongi(locations,page);
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
                   console.log(res);
                  let tableDatas=that.data.tableDatas;
                  let newNum=0;
                  let dataIndex=0;
                  for (let index = 0; index < tableDatas.length; index++) {
                    tableDatas[index].length=tableDatas[index].datas.length;
                    for (let index2 = 0; index2 < tableDatas[index].datas.length; index2++) {
                      newNum++;
                      if(newNum>((page-1)*20)&&newNum<=((page)*20)&&dataIndex< res.data.regeocodes.length){
                        // console.log(index,index2,dataIndex);
                        tableDatas[index].datas[index2].address= res.data.regeocodes[dataIndex].formatted_address;
                        dataIndex++;      
                      } 
                    }
                  }
                  console.log(tableDatas);
                  that.setData({
                    tableDatas,
                  });
                }
              });  
  },
  //完成码复制到剪贴板
  FinishCodeCopy(e){
    let that =this;
    let index = e.target.dataset.index;
    let index0 =  e.target.dataset.index0;
    let okcode =that.data.tableDatas[index0].datas[index].okcode;
    wx.setClipboardData({
      data: okcode,
      success: function () {
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
    })
  },
  //取消发布
  cancelThisByMe(e){
      let that =this;
      console.log(e);
      let helpInfoId=e.target.dataset.id;
      let index = e.target.dataset.index;
      let index0 =  e.target.dataset.index0;
      let loginUserId=that.data.loginUser.id;
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/setCancelByMe",
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
      //   url: globalData.serverPath+"helpinfo/setCancelByMe",
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      type:options.type,
      // getUrl:globalData.serverPath+"helpinfo/getAllIssue"+options.type
        getUrl:"/helpinfo/getAllIssue"+options.type
    });
    console.log(this.data);

    this.getHelpInfo();

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