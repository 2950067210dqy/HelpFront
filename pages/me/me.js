// pages/me/me.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    myIssueEachNum:{
      myIssueBy1:0,
      myIssueBy2:0,
      myIssueBy3:0,
      myIssueBy4:0,
    },
    myHelpEachNum:{
      myHelpBy2:0,
      myHelpBy3:0,
      myHelpBy4:0,
    }
 
  },
  getMyIssueEachNum(){
      let that =this;
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/getMyIssueEachNum",
        "header": app.globalData.contentType.cloud_normal,
        "method": "POST",
        data:{
          userid:globalData.loginUser.id
        },
        success(res){
          console.log(res);
          let data =res.data;
          console.log(data.message);
          if(data.code ==200){
              let myIssueEachNum=that.data.myIssueEachNum;
              myIssueEachNum=data.data;
              that.setData({
                myIssueEachNum
              });
          }
        }
      });   
    
      
      // wx.request({
      //   url: globalData.serverPath+"helpinfo/getMyIssueEachNum",
      //   data:{
      //     userid:globalData.loginUser.id
      //   },
      //   method:"POST",
      //   header:globalData.contentType.normal,
      //   dataType:'json',
      //   success(res){
      //     console.log(res);
      //     let data =res.data;
      //     console.log(data.message);
      //     if(data.code ==200){
      //         let myIssueEachNum=that.data.myIssueEachNum;
      //         myIssueEachNum=data.data;
      //         that.setData({
      //           myIssueEachNum
      //         });
      //     }
      //   }
      // })
  },
   getMyHelpEachNum(){
    let that =this;
     wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/helpinfo/getMyHelpEachNum",
      "header": app.globalData.contentType.cloud_normal,
      "method": "POST",
      data:{
        helperid:globalData.loginUser.id
      },
      success(res){
        console.log(res);
        let data =res.data;
        console.log(data.message);
        if(data.code ==200){
            let myHelpEachNum=that.data.myHelpEachNum;
            myHelpEachNum=data.data;
            that.setData({
              myHelpEachNum
            });
        }
      }
    });
   
  
    // wx.request({
    //   url: globalData.serverPath+"helpinfo/getMyHelpEachNum",
    //   data:{
    //     helperid:globalData.loginUser.id
    //   },
    //   method:"POST",
    //   header:globalData.contentType.normal,
    //   dataType:'json',
    //   success(res){
    //     console.log(res);
    //     let data =res.data;
    //     console.log(data.message);
    //     if(data.code ==200){
    //         let myHelpEachNum=that.data.myHelpEachNum;
    //         myHelpEachNum=data.data;
    //         that.setData({
    //           myHelpEachNum
    //         });
    //     }
    //   }
    // })
},
   //跳转到我的发布
  navToMyIssue(e){
    let type =e.currentTarget.dataset.type;
    app.navTo("/pages/my-issue/my-issue?type="+type);
  },
  //跳转到我的帮忙
  navToMyHelp(e){
    let type =e.currentTarget.dataset.type;
    app.navTo("/pages/my-help/my-help?type="+type);
  },
  //跳转登录
  navToLogin(){
    globalData.loginBackRoute="/pages/me/me";
    globalData.loginBackRouteType="tab";
    app.navTo("/pages/login/login");
  },
  //跳转到我的页面
  navToMeDetail(){
    app.navTo("/pages/me-detail/me-detail");
  },
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
    });
  },
  tapToUrl(e){
    switch (e.target.dataset.urlType) {
      case "nav":
        app.navTo(e.target.dataset.url);
        break;
      case "tab":
        break;
      default:
        break;
    }
    console.log(e);
  },
  clickMessage(e){
    let userid = Number(e.target.dataset.userid);
      app.clickMessage(userid);
  },
  messageClose(e){
    this.setData({
      show:false,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
   
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
    if(globalData.loginUser!=null){
      let that =this;
      app.globalData.messageCallback=(userid,name)=>{
        console.log(that.data);
        that.setData({
          userid:userid,
          show:true,
          msg:"您有来自  "+name+"  的消息！",
          duration:2000 
        });
      };
      this.getMyIssueEachNum();
      if(globalData.loginUser.role==1){
        this.getMyHelpEachNum();
      }
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