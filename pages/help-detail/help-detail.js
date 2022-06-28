
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    adcode:"",
    id:0,
    tableData:{},
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
  messageClose(e){
    this.setData({
      show:false,
    });
  },
  navToUserDetail(e){
    app.navToUserDetail(e);
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
   //放大图片
   magnifyImage(e){
    let that =this;
    let indexFather =e.target.dataset.idFather;
    let indexChild =e.target.dataset.idChild;
    let imageUrl=that.data.tableData.images[indexChild];
    let urls =that.data.tableData.images;
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
          data:{helpInfoId,loginUserId,adcode:that.data.tableData.adcode},
          success(res){
            let data= res.data;
            wx.showToast({
              title: data.message,
              duration:500
            });
            if(data.code==200){
                if(data.data.id==helpInfoId){
                    let newTableData=that.data.tableData;
                    newTableData.helpUser=data.data.helperUser;
                    newTableData.state=data.data.state;
                    newTableData.updatetime=data.data.timestamp;
                    that.setData({
                      tableData:newTableData
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
      }
  },
  async getHelpInfo(){
    let that =this;
   await wx.cloud.callContainer({
      "config": {
        "env": globalData.env
      },
      "path": "/helpinfo/selectByIdAndAdcode",
      "header": globalData.contentType.cloud_normal,
      "method": "POST",
      data:{
        id:that.data.id,
        adcode:that.data.adcode
      },
     async success(res){
        let data= res.data;
        if(data.code==200){
          let newData =data.data;
          let tabledata =that.data.tableData;
          newData.address=tabledata.address;
          newData.detailLocation=tabledata.detailLocation;
          that.setData({
            tableData:newData 
          });

        }
      }
  });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app =getApp();
    globalData=app.globalData;
    this.setLoginUserData();
    this.setData({
      id:parseInt(options.id),
      adcode:options.adcode,
      tableData:{
        address:options.address,
        detailLocation:options.detailLocation
      }
    });
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
  onShow() {
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
        duration:2000 
      });
    };
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