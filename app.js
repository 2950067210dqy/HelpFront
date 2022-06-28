// app.js
import {ColorUI} from './ColorUIconfig'
import * as ec from './utils/echarts.min';
const comp = requirePlugin('echarts');
// 设置自行引入的 echarts 依赖库
comp.echarts = ec;
App({
  ColorUI,
  onLaunch() {
    let that =this;
   wx.cloud.init({
    env:that.globalData.env
   });
   console.log("微信云托管已连接");
   console.log('小程序启动echarts', comp.echarts.version);

  //   // 展示本地存储能力
  //   const logs = wx.getStorageSync('logs') || []
  //   logs.unshift(Date.now())
  //   wx.setStorageSync('logs', logs)

  //   // 登录
  //   wx.login({
  //     success: res => {
  //       // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //     }
  //   })
  },
  // onShow(){
  //   if(this.globalData.loginUser!=null){
  //     this.connectWebsocket();
  //   }
  // },
  // onHide(){
  //   if(this.globalData.loginUser!=null){
  //     this.closeWebsocket()
  //   }
 
  // },
 
  globalData: {
      //云托管后台环境变量
      env:"prod-5g2xgg2tab0a4b18",
      //高德地图key
      gaodeKey:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
      //腾讯地图key
      txMapKey:"TQ3BZ-54P6W-GWDRA-OZA7L-CBEEE-FOFOW",
      //全局data
        serverPath:"",
      // serverSocket:"",
      // serverPath:"http://127.0.0.1:8085/",
      // serverSocket:"ws://127.0.0.1:8085/",
      // serverPath:"https://114.119.185.255:8085/",
      // serverSocket:"wss://114.119.185.255:8085/",
      // serverPath:"https://www.dengqinyou.cn/",
      // serverSocket:"wss://www.dengqinyou.cn/",
      // serverPath:"https://help-1983300-1309898995.ap-shanghai.run.tcloudbase.com/",
      serverSocket:"wss://help-1983300-1309898995.ap-shanghai.run.tcloudbase.com/",
      socketOpen:false,
      socket:null,
      authorName:"邓亲优",
      authorClass:"A1953",
      authorSchool:"九江学院",
      locationProvince:"",
      locationCity:"请选择城市",
      locationDistrict:"",
      locationAddress:"",
      locationAdcode:"",
      longitude:0,
      latitude:0,
      loginUser:null,
      contentType:{
        normal:{'Content-Type':'application/x-www-form-urlencoded'},
        json:{'Content-Type':'application/json'},
        media: {'Content-Type':'multipart/form-data'},
        cloud:{'Content-Type':'application/json', "X-WX-SERVICE": "help"},
        cloud_normal:{'Content-Type':'application/x-www-form-urlencoded', "X-WX-SERVICE": "help"} ,
        cloud_media:{'Content-Type':'multipart/form-data', "X-WX-SERVICE": "help"} 
      },
      //点击跳转登录之前的页面路径
      loginBackRoute:"",
      loginBackRouteType:"",//tab nav

      heart_jump: false, //websocket 心跳状态
      ws_heart: 0, // ws心跳定时器
      continuous_link: null,     //websocket持续连接的定时器
      lockReconnect:false,

      //消息提示callback
      messageCallback:function(){}
  },

    

   //获取用户位置
  getSystemLocation:function(page){
    //先判断用户是否授权获取地理位置
        let that = this;
        wx.getSetting({
            success(res) {
              if (res.authSetting['scope.userLocation'] == false) {//如果没有授权地理位置
                wx.openSetting({
                  success(res) {
                    res.authSetting = {//打开授权位置页面，让用户自己开启
                      "scope.userLocation": true
                    }
                  }
                })
              } else {//用户开启授权后可直接获取地理位置
                wx.authorize({
                  scope: 'scope.userLocation',
                  success() {
                    //获取位置后相关操作
                    that.getLocation(page);
                  }
                })
              }
            }
          })
  },
  //获取位置后相关操作
  getLocation: function (page) {
    let that = this;
    // that.chooseLocation(page);
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success(res) {
        // console.log(res);
        that.locationDecode(page,res.longitude,res.latitude);  
      }
    })
  },   //获取位置后相关操作end
  //选择位置 start
 chooseLocation:function(page){
   page.setData({
     isChooseLocation:true
   });
   let that =this;
   wx.chooseLocation({
          success: function (res) {
            // 返回的res:name(地理名称）、address（详细地址，包括省市区相关信息，可根据需要进行拆分）、latitude（纬度）、longitude（经度）
            console.log(res);
        
            that.locationDecode(page,res.longitude,res.latitude);  
          },
        })
 },//选择位置 end
//高德地图根据经纬度获取地点详情 start
 locationDecode:function(page,longitude,latitude){
  let that =this;
  wx.request({
    url: 'https://restapi.amap.com/v3/geocode/regeo', 
    type:"get",
    data:{
      key:that.globalData.gaodeKey,
      location:longitude+","+latitude
    },
    success(res){
      // console.log(res);
      var object=res.data.regeocode.addressComponent;

      that.globalData.locationProvince=object.province;

      typeof object.city =="string"? that.globalData.locationCity=object.city : that.globalData.locationCity=object.province;
      that.globalData.latitude=latitude;
      that.globalData.longitude=longitude;
      that.globalData.locationAdcode=object.adcode;
      that.globalData.locationDistrict=object.district;
      that.globalData.locationAddress=res.data.regeocode.formatted_address;
      page.setLocationData();
      page.refreshDataHandle();//重新刷新数据置空操作
      // console.log("获取位置之后:");
      page.getHelpInfo();//获取数据
    }
  })
 },//高德地图根据经纬度获取地点详情 end

 //判断是否登录 start
 judgeLogin:function(page,url,type){
   if (url==""){
     url="/pages/index/index"
   }
   if(type==""){
     type="tab";
   }
   let that =this;
   that.globalData.loginBackRoute=url;
   that.globalData.loginBackRouteType=type;
  //  wx.clearStorageSync();
  
  if( that.globalData.loginUser==null||wx.getStorageSync("loginUser")==""){
    that.showDialog(page,'未登录','发布需要登录，快去登录把',that.navTo,that.switchTab,{url:'/pages/login/login'},{url:'/pages/index/index'});
  }
 },   //判断是否登录 end

 //跳转 start
 navTo:function(param){
   let url;
   if (typeof param =="string"){
      url=param;
   }else{
     url=param.url;
   }
    wx.navigateTo({
      url: url,
    })
 }, //跳转 end
 //跳转到tabbar上 start
 switchTab:function(param){

    let url;
    if (typeof param =="string"){
      url=param;
    }else{
      url=param.url;
    }
    wx.switchTab({
      url: url,
    })
 },//跳转到tabbar上 end
 //显示对话框 start
 showDialog:function(page,title="提示",content="默认",okFunc,cancelFunc,okFuncParam={},cancelFuncParam={}){
   let that =this;
  page.$showDialog({
    title : title,
    content: content,
    cancelText:"取消",
    confirmText:"确定",
    noNav:true,
    success: res => {
        if(res.confirm){
          if (okFunc!=null){
            okFunc(okFuncParam);  
          }
        }else{
          if(cancelFunc!=null){
            cancelFunc(cancelFuncParam);
          }
        }
    }
  });
 }, //显示对话框 end
  //查看用户协议 start
  checkUserSettle(page){
    let that=this;
    that.showDialog(page,'沁柚网用户协定','本小程序还在开发阶段，很有可能结束开发，作者：'+that.globalData.authorSchool+that.globalData.authorClass+that.globalData.authorName);
  
  },   //查看用户协议 end
  //随机数start
  random(len){
    const charts = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];  
  var res = '';
  for (var i = 0; i < len; i++) {
      undefined
      var id = Math.ceil(Math.random() * 61);
      res += charts[id];
  }
  return res;
  },    //随机数end
  //数组根据下标删除元素 start
  removeByIndex(array,index){
    function remove(arr,index){
      return arr.slice(0,index).concat(arr.slice(index+1,arr.length))    
    }  
    if(array&&array.length!=0)
      array=remove(array,index);
    return array;
  },  //数组根据下标删除元素 end
  //连接websocket start
  async connectWebsocket(){
    var that = this;
    console.log("将要连接后端服务器。");
    console.log("connect",that.globalData.socketOpen);
    if(that.globalData.loginUser!=null&&!that.globalData.socketOpen){
      let url = encodeURI("/websocket"+"?"+"user="+that.globalData.loginUser.id+"@@@"+that.globalData.loginUser.name+"@@@"+that.globalData.loginUser.headimg+"@@@"+that.globalData.loginUser.sex);
      console.log(url);
       const socket = await wx.cloud.connectContainer({
            config: {
              env: that.globalData.env,  // 微信云托管的环境ID
            },
            service: 'help',        // 服务名
            path:  url ,          // 不填默认根目录,
          });
          that.globalData.socket=socket.socketTask;
        console.log(socket);
      // wx.connectSocket({
      //   url,
      // });
      // that.globalData.socketOpen=true;
      that.globalData.socket.onOpen(function (res) {
        console.log("连接后台服务器成功。");
        that.globalData.socketOpen=true;

        that.globalData.heart_jump = true; // 心跳状态打开
        that.heart();
        // 再次清除防止重复请求
        clearInterval(that.globalData.continuous_link);
      });
      that.webSocket();
    }
  },//连接websocket end
  //重新连接websocket start
  async reconnectWebsocket(){
    var that = this;
    console.log("将要重新连接后端服务器。");
    console.log("connect",that.globalData.socketOpen);
    if (that.globalData.lockReconnect) return;
    that.globalData.lockReconnect = true;
    that.globalData.socketOpen=false;
    that.globalData.socket=null;
    // 先清除定时器
    clearInterval(that.globalData.continuous_link);

    that.globalData.continuous_link = setInterval(function () {
      //没连接上会一直重连，设置延迟避免请求过多
      that.globalData.lockReconnect = false;
      that.connectWebsocket();
      console.log("重启中...");
    }, 10*1000);
    
  },//重新连接websocket end
  //关闭websocket start
  closeWebsocket(){
    let that =this;
    console.log("close",that.globalData.socketOpen);
    if( that.globalData.socketOpen){
      console.log("close",that.globalData.socket);
      that.globalData.socket.close();
      that.globalData.socket.onClose(function(res){
        console.log("关闭连接后台服务器");
        that.globalData.socketOpen=false;
        if (that.heart_jump) {
          that.close_heart();
          that.globalData.heart_jump = false;
        }
      });
      // wx.closeSocket();
     
    }
  },  //关闭websocket end
  // 接受服务端websocket消息 start
  webSocket(){
    let that =this;
    // if(that.globalData.socketOpen){
      that.globalData.socket.onError(function(res){
        console.log("WebSocket发生错误");
        if (that.globalData.heart_jump) {
          that.close_heart();
          that.globalData.heart_jump = false;
        }
        that.reconnectWebsocket();
        console.log("WebSocket发生错误");
      });
      that.globalData.socket.onMessage(function (res) {
        console.log('收到后端服务器内容：' + res.data);
        if(res.data.trim()!="@live@"){
   
          console.log("收到用户发来的消息"+res.data);
          let data =JSON.parse(res.data);
          let userid=data.fromuserid;
         
          let wxmessageList=wx.getStorageSync(userid+'');
          if (wxmessageList==''){
              wxmessageList=[];
          }
          wxmessageList.push(data.message);
          wx.setStorageSync(userid+'',wxmessageList);
          //获取用户名
          wx.cloud.callContainer({
            "config": {
              "env": that.globalData.env
            },
            "path": "/user/selectById",
            "header": that.globalData.contentType.cloud_normal,
            "method": "POST",
            data:{
              userid:userid
            },
            success(res){
              let data= res.data;
              if(data.code==200){
                // 全局socket接收消息的方法回调
                that.globalData.messageCallback(userid,data.data.name);
              }
            }
        });
        }   
      });  
    // }
  },// 接受服务端websocket消息 end
  //websocket 心跳机制  start
  heart(){
    let that = this;
    this.globalData.ws_heart = setInterval(() => {
      console.log( "websocket心跳中...");
      let message= "@live@";
      that.globalData.socket.send({data:"@live@"});
    }, 30 * 1000);
  },//websocket 心跳机制  end
   //websocket 关闭心跳机制  start
  close_heart(){
    console.log("ws心跳结束");
    clearInterval( this.globalData.ws_heart);
    this.globalData.ws_heart = null;
  }, //websocket 关闭心跳机制  end
  //跳转到用户信息页面 start
  navToUserDetail(e){
    console.log(e);
    wx.navigateTo({
      url: "/pages/user-detail/user-detail?userid="+e.target.dataset.userid,
    })
  },  //跳转到用户信息页面 end
  //点击消息提示框 start
  clickMessage(userid){
    console.log("成功",userid);
    wx.navigateTo({
      url: '/pages/chat/chat?userid='+userid,
    })
  },  //点击消息提示框 end
})
