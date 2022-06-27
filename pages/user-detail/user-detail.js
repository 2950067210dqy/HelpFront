// pages/user-detail/user-detail.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid:0,
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    user:null,
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
    //聊天
communication(e){
  let that =this;
   app.navTo("/pages/chat/chat?userid="+that.data.userid);
},
  getUser(){
    let that =this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/user/selectById",
      "header": app.globalData.contentType.cloud_normal,
      "method": "POST",
      data:{
        userid:that.data.userid
      },
      success(res){
        let data = res.data.data;
        if(res.data.code==200){
          that.setData({user:data});
          if( that.data.user.role==1){
            that.getRateByHelper();
          }
          console.log(that.data.user)
        }
        
      }
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
        userid:that.data.userid
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
  messageClose(e){
    this.setData({
      show:false,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that =this;
      this.setData({userid:Number(options.userid)});
      app.globalData.messageCallback=(userid,name)=>{
        console.log(that.data);
        that.setData({
          userid:userid,
          show:true,
          msg:"您有来自  "+name+"  的消息！",
          duration:2000 
        });
      };
      this.getUser();
     
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