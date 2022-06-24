//框架核心配置
import ColorUI from './MP-CU-main/mp-cu/main'
export var colorUI = new ColorUI({
      config: {
        theme: 'auto',
        main: 'blue',
        text: 1,
        footer: true,
        share: true,
        shareTitle: 'MP CU（ ColorUI3.x 原生小程序版）',
        homePath: '/pages/index/index',
   
      //   tabBar: [{
      //       title: '首页',
      //       icon: '/static/tab_icon/document.png',
      //       curIcon: '/static/tab_icon/document_cur.png',
      //       url: '/pages/index/index',
      //       type: 'nav'
      //   },
      //   {
      //       title: '模板',
      //       icon: '/static/tab_icon/tpl.png',
      //       curIcon: '/static/tab_icon/tpl_cur.png',
      //       url: '/pages/login/login',
      //       type: 'nav'
      //   },
      //  ],
    },
    data:{
      //全局data
      // serverPath:"http://127.0.0.1:8085/",
      // authorName:"邓亲优",
      // authorClass:"A1953",
      // authorSchool:"九江学院",
      // locationProvince:"",
      // locationCity:"请选择城市",
      // locationDistrict:"",
      // locationAddress:"",
      // locationAdcode:"",
      // loginUser:null,
      // contentType:{
      //   normal:{'Content-Type':'application/x-www-form-urlencoded'},
      //   json:{'Content-Type':'application/json'},
      //   media: {'Content-Type':'multipart/form-data'} 
      // },
      // //点击跳转登录之前的页面路径
      // loginBackRoute:"",
      // loginBackRouteType:"",//tab nav
    },
    methods:{
  //     //全局函数
  //      cuLog (message, ...optionalParams) {
  //          console.log(message, ...optionalParams)
  //      },
  //      //获取用户位置
  //     getSystemLocation:function(){
  //       //先判断用户是否授权获取地理位置
  //           let that = this;
  //           wx.getSetting({
  //               success(res) {
  //                 if (res.authSetting['scope.userLocation'] == false) {//如果没有授权地理位置
  //                   wx.openSetting({
  //                     success(res) {
  //                       res.authSetting = {//打开授权位置页面，让用户自己开启
  //                         "scope.userLocation": true
  //                       }
  //                     }
  //                   })
  //                 } else {//用户开启授权后可直接获取地理位置
  //                   wx.authorize({
  //                     scope: 'scope.userLocation',
  //                     success() {
  //                       //获取位置后相关操作
  //                       that.getLocation();
  //                     }
  //                   })
  //                 }
  //               }
  //             })
  //     },
  //     //获取位置后相关操作
  //     getLocation: function () {
  //       let that = this;
  //       wx.getLocation({
  //         type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
  //         success(res) {
  //           // console.log(res);
  //           that.locationDecode(res.longitude,res.latitude);  
  //         }
  //       })
  //     },   //获取位置后相关操作end
  //     //选择位置 start
  //    chooseLocation:function(){
  //      let that =this;
  //      wx.chooseLocation({
  //             success: function (res) {
  //               // 返回的res:name(地理名称）、address（详细地址，包括省市区相关信息，可根据需要进行拆分）、latitude（纬度）、longitude（经度）
  //               console.log(res);
  //               that.locationDecode(res.longitude,res.latitude);  
  //             },
  //           })
  //    },//选择位置 end
  //  //高德地图根据经纬度获取地点详情 start
  //    locationDecode:function(longtitude,latitude){
  //     let that =this;
  //     wx.request({
  //       url: 'https://restapi.amap.com/v3/geocode/regeo', 
  //       type:"get",
  //       data:{
  //         key:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
  //         location:longtitude+","+latitude
  //       },
  //       success(res){
  //         // console.log(res);
  //         var object=res.data.regeocode.addressComponent;
  //         var $newCuData=that.data.$cuData;
  //         console.log("ColorUIconfig.js:加了位置信息之前的$cudata",that.data.$cuData);
  //         $newCuData.locationProvince=object.province;

  //         typeof object.city =="string"?  $newCuData.locationCity=object.city : $newCuData.locationCity=object.province;
  //         $newCuData.locationAdcode=object.adcode;
  //         $newCuData.locationDistrict=object.district;
  //         $newCuData.locationAddress=res.data.regeocode.formatted_address;
  //         that.setData({
  //           $cuData:$newCuData
  //         });
  //         console.log(colorUI.data);
  //         colorUI.data.locationCity=object.city ;
  //         colorUI.data.locationAdcode=object.adcode;
  //         colorUI.data.locationDistrict=object.district;
  //         colorUI.data.locationAddress=res.data.regeocode.formatted_address;
  //         console.log("ColorUIconfig.js:加了位置信息之后的$cudata",that.data.$cuData);
  //       }
  //     })
  //    },//高德地图根据经纬度获取地点详情 end
  //    //判断是否登录 start
  //    judgeLogin:function(url,type){
  //      if (url==""){
  //        url="/pages/index/index"
  //      }
  //      if(type==""){
  //        type="tab";
  //      }
  //      let that =this;
  //      let $newCuData =that.data.$cuData;
  //      console.log("ColorUIconfig.js:判断是否登录之前",$newCuData);
  //      $newCuData.loginBackRoute=url;
  //      $newCuData.loginBackRouteType=type;
       
  //      that.setData({
  //       $cuData:$newCuData
  //      });
  //      console.log("ColorUIconfig.js:判断是否登录之后",that.data.$cuData);
  //     if(that.data.$cuData.loginUser==null){
  //       that.showDialog('未登录','发布需要登录，快去登录把',that.navTo,that.switchTab,{url:'/pages/login/login'},{url:'/pages/index/index'});
  //     }
  //    },   //判断是否登录 end
  
  //    //跳转 start
  //    navTo:function(param){
  //      let url;
  //      if (typeof param =="string"){
  //         url=param;
  //      }else{
  //        url=param.url;
  //      }
  //       wx.navigateTo({
  //         url: url,
  //       })
  //    }, //跳转 end
  //    //跳转到tabbar上 start
  //    switchTab:function(param){
    
  //       let url;
  //       if (typeof param =="string"){
  //         url=param;
  //       }else{
  //         url=param.url;
  //       }
  //       wx.switchTab({
  //         url: url,
  //       })
  //    },//跳转到tabbar上 end
  //    //显示对话框 start
  //    showDialog:function(title="提示",content="默认",okFunc,cancelFunc,okFuncParam={},cancelFuncParam={}){
  //      let that =this;
  //     that.$showDialog({
  //       title : title,
  //       content: content,
  //       success: res => {
  //           if(res.confirm){
  //             if (okFunc!=null){
  //               okFunc(okFuncParam);  
  //             }
  //           }else{
  //             if(cancelFunc!=null){
  //               cancelFunc(cancelFuncParam);
  //             }
  //           }
  //       }
  //     });
  //    }, //显示对话框 end
  //     //查看用户协议 start
  //     checkUserSettle(){
  //       let that=this;
  //       that.showDialog('沁柚网用户协定','本小程序还在开发阶段，很有可能结束开发，作者：九江学院A1953邓亲优',null,null,null,null);
  //     },   //查看用户协议 end
  //     //随机数start
  //     random(len){
  //       const charts = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];  
  //     var res = '';
  //     for (var i = 0; i < len; i++) {
  //         undefined
  //         var id = Math.ceil(Math.random() * 61);
  //         res += charts[id];
  //     }
  //     return res;
  //     },    //随机数end

    },

})