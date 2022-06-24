// pages/set/set.js
var app =getApp();
var globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
  },
  setLoginUserData(){
    this.setData({
      loginUser:globalData.loginUser
    });
  },
  navToLogin(){
    app.navTo("/pages/login/login");
  },
  //退出登录
  navToLogout(){

    this.$showDialog({
      title : "退出登录",
      cancelText:"取消",
      confirmText:"确定",
      content: "尊敬的"+globalData.loginUser.name+"用户，确定要退出登录吗?",
      success: res => {
          if(res.confirm){
            globalData.loginUser=null;
            app.closeWebsocket();
            wx.removeStorageSync('loginUser');
            wx.clearStorageSync();
            app.switchTab("/pages/me/me");
          }else{
           
          }
      }
    });
  },
  //查看协议
  checkUserSettle(){
    app.checkUserSettle(this);
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