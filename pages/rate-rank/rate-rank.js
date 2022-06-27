// pages/rate-rank/rate-rank.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    rates:[],
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
            "fontSize":13,
            "borderRadius": 3,
            "color": "#fff",
            
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
    options:[],
  },
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
    });
  },
    navToUserDetail(e){
    app.navToUserDetail(e);
  },
  //获取所有的评分数据
  getRateByHelperDatas(){
    let that =this;
    wx.cloud.callContainer({
      "config": {
        "env": app.globalData.env
      },
      "path": "/rateByHelper/select",
      "header": app.globalData.contentType.cloud_normal,
      "method": "POST",
      success(res){
        let datas = res.data.datas[0];
        wx.showToast({
          title: res.data.message,
          duration:2000
        });
        if(res.data.code==200){
          let oldoptions=that.data.options;
          console.log(datas);
          for (let index = 0; index < datas.length; index++) {
            if(index<3){
               //tofixed 保留小数点位数 但是返回的是string 类型 +(String) 可以将string转换成Number
              oldoptions[index].series[0].data[0].value=[
                +((datas[index].rateByHelper.mannerrate/datas[index].rateByHelper.humannum).toFixed(2)),
                +((datas[index].rateByHelper.ontimerate/datas[index].rateByHelper.humannum).toFixed(2)),
                +((datas[index].rateByHelper.clotherate/datas[index].rateByHelper.humannum).toFixed(2)),
                +((datas[index].rateByHelper.serverate/datas[index].rateByHelper.humannum).toFixed(2)),
                +((datas[index].rateByHelper.politerate/datas[index].rateByHelper.humannum).toFixed(2))
              ];
            }
           
          }
          that.setData({
            rates:datas,
            options:oldoptions
          });
          console.log(that.data);
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
    app =getApp();
    globalData=app.globalData;
    this.setLoginUserData();
    let option1= new Object();
    let option2= new Object();
    let option3= new Object();
    //解决地址引用 只需要值引用
    option1=JSON.parse(JSON.stringify(that.data.option));
    option2=JSON.parse(JSON.stringify(that.data.option));
    option3=JSON.parse(JSON.stringify(that.data.option));
    option1.tooltip.formatter= function (value, index) {
      console.log(value);
      return "  "+value.name+"\n"+"态度："+value.value[0]+" 分\n"+"准时："+value.value[1]+" 分\n"+"着装："+value.value[2]+" 分\n"+"服务："+value.value[3]+" 分\n"+"礼貌："+value.value[4]+" 分";
    };
    option2.tooltip.formatter= function (value, index) {
      console.log(value);
      return "  "+value.name+"\n"+"态度："+value.value[0]+" 分\n"+"准时："+value.value[1]+" 分\n"+"着装："+value.value[2]+" 分\n"+"服务："+value.value[3]+" 分\n"+"礼貌："+value.value[4]+" 分";
    };
    option3.tooltip.formatter= function (value, index) {
      console.log(value);
      return "  "+value.name+"\n"+"态度："+value.value[0]+" 分\n"+"准时："+value.value[1]+" 分\n"+"着装："+value.value[2]+" 分\n"+"服务："+value.value[3]+" 分\n"+"礼貌："+value.value[4]+" 分";
    };
    this.setData({
      options:[option1,option2,option3]
    });
    app.globalData.messageCallback=(userid,name)=>{
      console.log(that.data);
      that.setData({
        userid:userid,
        show:true,
        msg:"您有来自  "+name+"  的消息！",
        duration:2000 
      });
    };
    this.getRateByHelperDatas();

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