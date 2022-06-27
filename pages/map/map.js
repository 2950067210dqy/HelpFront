
var app =getApp();
var globalData=app.globalData;
const promisic = function (func) {
  return function (params = {}) {
    return new Promise((resolve, reject) => {
      const args = Object.assign(params, {
        success: (res) => {
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        }
      });
      func(args);
    });
  };
};

class Http {
    // 同步Http请求
    static async asyncRequest(url, method, data,header, backMethod) {
        let res = await promisic(wx.request)({
            url: url,
            method: method,
            header:header,
            data: data,
        })
        backMethod(res)
    }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    centerLocation:{
      latitude:0,
      longitude:0
    },
    markerss:[
      {
        id:-1,
        iconPath:"../../static/dqy/point.png",
        width:20,
        height:30,
        label:{
          content:globalData.locationProvince+globalData.locationCity+globalData. locationDistrict,
          color:"#000000",
          padding:10,
          bgColor:'#eeeeee',
          fontSize:13,
          textAlign:'center',
          borderWidth:1
        },
      }
    ],
    ifshow:false,
     //放大图片
     isMagnitifyImage:false,
     magnitifyImageUrl:"",
     //当前定位行政区域边界
     polyline:{
      points:[],
      // width:5,
      strokeWidth:5,
      // color:"#E54D42"
      strokeColor:"#1cbbb4",
      fillColor:'#1cbbb433'
     },
     polylines:[],
    serverPath:globalData.serverPath,
    loginUser:globalData.loginUser,
    // 地图默认值setting
     setting : {
       latitude:globalData.latitude,
       longitude:globalData.longitude,
      skew: 0,
      rotate: 0,
      showLocation: true,

      showScale: true,
      subKey: '',
      layerStyle: 1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: true,
      showCompass: true,
      enable3D:true,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
      // markers:[]
    },

  },
  navToUserDetail(e){
    app.navToUserDetail(e);
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
   
    let newSetting =this.data.setting;
    newSetting.latitude=globalData.latitude;
    newSetting.longitude=globalData.longitude;
    let newmarkerss= this.data.markerss;
    newmarkerss[0].longitude=globalData.longitude;
    newmarkerss[0].latitude=globalData.latitude;
    this.setData({
      loginUser:globalData.loginUser,
      setting:newSetting,
      markerss:newmarkerss,
      centerLocation:{
        longitude:globalData.longitude,
        latitude:globalData.latitude
      }
    });
    this.getCityBorderByAdcode();
    this.getAll();
    let setting = this.data.setting;
    setting.longitude=globalData.longitude;
    setting.latitude=globalData.latitude;
    this.setData({
      setting
    });
  },
  //监听地图视野变化
  regionChange(e){
    console.log(e);
    if(e.type=="end"&&e.causedBy=="drag"){
      let centerLocation=e.detail.centerLocation;
      let newmarkerss= this.data.markerss;
      newmarkerss[0].longitude=centerLocation.longitude;
      newmarkerss[0].latitude=centerLocation.latitude;
      this.setData({
        markerss:newmarkerss,
        centerLocation:{
          longitude:centerLocation.longitude,
          latitude:centerLocation.latitude
        }
      });
      let that =this;
    wx.request({
    url: 'https://restapi.amap.com/v3/geocode/regeo', 
    type:"get",
    data:{
      key:globalData.gaodeKey,
      location:centerLocation.longitude+","+centerLocation.latitude
    },
    success(res){
      // console.log(res);
      var object=res.data.regeocode.addressComponent;
      if(globalData.locationAdcode!=object.adcode){
        globalData.locationAdcode=object.adcode;
        globalData.locationProvince=object.province;
        typeof object.city =="string"? globalData.locationCity=object.city : globalData.locationCity=object.province;
        globalData.locationDistrict=object.district;
        that.refreshMap();
      }
    
    }
    })
    }
  },
  //获取行政区域边界
 async getCityBorderByAdcode(){
   let that =this;
  await  Http.asyncRequest(
    'https://restapi.amap.com/v3/config/district',
    "get", 
    {
          key:globalData.gaodeKey,
          keywords:globalData.locationAdcode,
          extensions:"all"
    },
    globalData.contentType.normal,
    res=>{
      if(res.data.infocode=="10000"){
        let datas =res.data.districts;
        let polylines=[];
        for (let index = 0; index < datas.length; index++) {
         
          let datapolylines=datas[index].polyline;
          let polylinesArrayZones =datapolylines.split("|");
          for (let index1 = 0; index1 < polylinesArrayZones.length; index1++) {
              //解决地址引用 只需要值引用
            let polyline=JSON.parse(JSON.stringify(that.data.polyline));
            let points=[];
            let polylinesArray=polylinesArrayZones[index1].split(";");
            for (let index2 = 0; index2 < polylinesArray.length; index2++) {
                let temptArray=polylinesArray[index2].split(",");
                if(Object.is(+(temptArray[1]), NaN)){
                  console.log(index2+"数据出问题了");
                  
                }
                if(Object.is(+(temptArray[0]), NaN)){
                  console.log(index2+"数据出问题了")
                }
                let location = {
                  latitude:+(temptArray[1]),
                  longitude:+(temptArray[0])
                }
                points.push(location);
            }
            polyline.points=points;
            polylines.push(polyline)  
          }  
        }
        that.setData({
          polylines:polylines
        });  
        console.log(that.data.polylines);
       
      }
    }
  );
  },
calloutClick(params) {
  console.log(params);
  let that =this;
  let loginUser =globalData.loginUser;
  let markerId=params.markerId;
  // let setting =that.data.setting;
  let markers =that.data.markerss;
  let marker =markers[markerId];
  let  itemList= [];
  console.log( marker.tabledata.images.length);
  console.log( marker.tabledata.images);
  console.log( marker.tabledata.images[0]);
  if(marker.tabledata.images[0]!=""){
    itemList.push("查看图片");
  }
  if((loginUser!=null&&loginUser.role==1)&&(marker.tabledata.helpUser==null&&marker.tabledata.state.id==1)){
      itemList.push("帮助该发布");
  }
  itemList.push("导航");
  wx.showActionSheet({
    itemList,
    itemColor:"#3380e8",
    success(res){
      let type =res.tapIndex;
      if(type ==0){
        if(marker.tabledata.images[0]!=''){
          let urls=[];
          for (let index = 0; index <  marker.tabledata.images.length; index++) {
            const element =  marker.tabledata.images[index];
            element=globalData.serverPath+element;
            urls.push(element);
          }
            wx.previewImage({
              urls,
            })
        }else  if((loginUser!=null&&loginUser.role==1)&&(marker.tabledata.helpUser==null&&marker.tabledata.state.id==1)){
          that.helpThis(marker.tabledata.user.id,marker.tabledata.id,markerId);
        }else{
          that.routePlan(marker.title,marker.latitude,marker.longitude);
        }
        
      }else if(type==1){
        if((loginUser!=null&&loginUser.role==1)&&(marker.tabledata.helpUser==null&&marker.tabledata.state.id==1)){
          that.helpThis(marker.tabledata.user.id,marker.tabledata.id,markerId);
        }else{
          that.routePlan(marker.title,marker.latitude,marker.longitude);
        }
      }
    }
  })
},
 //路线规划
 routePlan(addre,latitude,longitude){
  let plugin = requirePlugin('routePlan');
  let key = globalData.txMapKey;  //使用在腾讯位置服务申请的key
  let referer = '农村帮帮帮小程序';   //调用插件的app的名称
  let endPoint = JSON.stringify({  //终点
  'name':addre,
  'latitude': parseFloat(latitude),
  'longitude':parseFloat(longitude)
   });
  wx.navigateTo({
      url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
  });
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  refreshMap(e){
    let that = this;
    this.setData({
      polylines:[],
      markerss:[ {
        id:-1,
        iconPath:"../../static/dqy/point.png",
        width:20,
        height:30,
        label:{
          content:globalData.locationProvince+globalData.locationCity+globalData. locationDistrict,
          color:"#000000",
          padding:10,
          bgColor:'#eeeeee',
          fontSize:13,
          textAlign:'center',
          borderWidth:1
        },
        latitude:that.data.centerLocation.latitude,
        longitude:that.data.centerLocation.longitude
      }]
    });
    this.getCityBorderByAdcode();
    this.getAll();
  },
  async getAll(){
    wx.showLoading({
      title: '加载中',
    });
   let that =this;
   await wx.cloud.callContainer({
    "config": {
      "env": app.globalData.env
    },
    "path": "/helpinfo/selectByAdcode",
    "header": app.globalData.contentType.cloud_normal,
    data:{
      adcode:globalData.locationAdcode
    },
    "method": "POST",
    async success(res){
      let data= res.data;
      console.log(data.message);
      // wx.showToast({
      //   title: data.message,
      //   duration:2000
      // });
      if(data.code==200){

      that.setData({markerss:[
        {
          id:-1,
          iconPath:"../../static/dqy/point.png",
          width:20,
          height:30,
          label:{
            content:globalData.locationProvince+globalData.locationCity+globalData. locationDistrict,
            color:"#000000",
            padding:10,
            bgColor:'#eeeeee',
            fontSize:13,
            textAlign:'center',
            borderWidth:1
          },
          latitude:that.data.centerLocation.latitude,
          longitude:that.data.centerLocation.longitude
        }
      ]});
      let markers = that.data.markerss;






       //将经纬度转换成位置 高德地图
       let locations="";
       let num=0;
       let page=1;
       let elements=[];
       for(let index =0;index < data.datas[0].length;index++){
          let  element = data.datas[0][index];
          num++;
          if(num==20||index==data.datas[0].length-1){
            locations=locations+element.longitude+","+ element.latitude;
          }else{
            locations=locations+element.longitude+","+ element.latitude+"|";
          }
        
          element.id=index+1;
          elements.push(element);
     
          if(num%20==0){

            num=0;
            await that.getAddressForLatiLongi(locations,page,markers,elements);
            elements=[];
            page++;
            locations="";
        
          }                    
         
       }
       if(num<20){
        console.log(20);
         await that.getAddressForLatiLongi(locations,page, markers,elements);
      }




      //  for (let index = 0; index < data.datas[0].length; index++) {
      //    let element = data. datas[0][index];
      //   await  Http.asyncRequest(
      //     'https://restapi.amap.com/v3/geocode/regeo',
      //     "get", 
      //     {
      //           key:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
      //           location:element.longitude+","+element.latitude,
      //     },
      //     globalData.contentType.normal,
      //     res=>{
      //       let marker = {};
      //           marker.tabledata=element;
      //           marker.longitude=element.longitude;
      //           marker.latitude=element.latitude;
      //           marker.id=index;
      //           marker.title=res.data.regeocode.formatted_address;
      //           let  customCallout={//自定义气泡
      //             display:"BYCLICK",//显示方式，可选值BYCLICK ALWAYS
      //             anchorX:0,//横向偏移
      //             anchorY:0,
      //          };
      //          marker.customCallout=customCallout;
      //         //   let label ={
      //         //     content:"👜求助信息： "+element.title,
      //         //     anchorY:20,
      //         //     textAlign:"center",
      //         //     bgColor:"#1cbbb4",
      //         //     borderColor:"#000000",
      //         //     padding:10,
      //         //     color:"#ffffff",
      //         //     borderRadius:15,
      //         //     fontSize:17
      //         //   };
      //         // marker.label=label;
      //          markers.push(marker);
      //         //  let setting = that.data.setting;
      //         //  setting.markers=markers;
      //          console.log("发送请求得到的数据",that.data);
                
      //     }
      //   );
      //   // await wx.request({
      //   //   url: 'https://restapi.amap.com/v3/geocode/regeo', 
      //   //   type:"get",
      //   //   data:{
      //   //     key:"07d47b8c7f9bec5d1ec5eda4ac3e73f5",
      //   //     location:element.longitude+","+element.latitude,
      //   //   },
      //   //   async success(res){ 
      //   //     let marker = {};
      //   //     marker.tabledata=element;
      //   //     marker.longitude=element.longitude;
      //   //     marker.latitude=element.latitude;
      //   //     marker.id=index;
      //   //     marker.title=res.data.regeocode.formatted_address;
      //   //     let  customCallout={//自定义气泡
      //   //       display:"BYCLICK",//显示方式，可选值BYCLICK ALWAYS
      //   //       anchorX:0,//横向偏移
      //   //       anchorY:0,
      //   //    };
      //   //    marker.customCallout=customCallout;
      //   //   //   let label ={
      //   //   //     content:"👜求助信息： "+element.title,
      //   //   //     anchorY:20,
      //   //   //     textAlign:"center",
      //   //   //     bgColor:"#1cbbb4",
      //   //   //     borderColor:"#000000",
      //   //   //     padding:10,
      //   //   //     color:"#ffffff",
      //   //   //     borderRadius:15,
      //   //   //     fontSize:17
      //   //   //   };
      //   //   // marker.label=label;
      //   //    markers.push(marker);
          
      //   //    console.log("发送请求得到的数据",that.data);
      //   //    that.setData({
      //   //     markerss:markers,
      //   //      ifshow:true
      //   //    });
      //   //   }
      //   // });  
       
  
      //  }
          that.setData({
            markerss:markers,
             ifshow:true
           });
           setTimeout(function () {
            wx.hideLoading({
              success: (res) => {},
            });
          }, 200);
      }else{
        if(data.message=="查询数据为空"){
          setTimeout(function () {
            wx.hideLoading({
              success: (res) => {},
            });
          }, 200);
        }
      }

      
    }
  })
 },
   //将经纬度转换成位置 高德地图
   async getAddressForLatiLongi(locations,page,markers,elements){
    await  Http.asyncRequest(
    'https://restapi.amap.com/v3/geocode/regeo',
    "get", 
    {
          key:globalData.gaodeKey,
          location:locations,
          batch:true
    },
    globalData.contentType.normal,
    res=>{
      for (let index = 0; index < elements.length; index++) {
        let element = elements[index];
        let marker = {};
          marker.tabledata=element;
          marker.longitude=element.longitude;
          marker.latitude=element.latitude;
          marker.id=element.id;
          marker.title= res.data.regeocodes[index].formatted_address;
          let  customCallout={//自定义气泡
            display:"BYCLICK",//显示方式，可选值BYCLICK ALWAYS
            anchorX:0,//横向偏移
            anchorY:0,
         };
         marker.customCallout=customCallout;
         markers.push(marker);
        //  console.log("发送请求得到的数据",marker);
        //  console.log("id:",element.id);
      }   
    }
  );
 },
  onShow(){
    let that =this;
    app =getApp();
    globalData=app.globalData;
    this.setData({
      loginUser:globalData.loginUser
    });
    if(that.data.loginUser!=null){
    app.globalData.messageCallback=(userid,name)=>{
      console.log(that.data);
      that.setData({
        userid:userid,
        show:true,
        msg:"您有来自  "+name+"  的消息！",
        duration:2000 
      });
    };
  }
    if(that.data.longitude==0||that.data.latitude==0){
         //获取用户位置
       app.getSystemLocation(this);
       app =getApp();
       globalData=app.globalData;
       let newSetting =this.data.setting;
       newSetting.latitude=globalData.latitude;
       newSetting.longitude=globalData.longitude;
       this.setData({
         setting:newSetting,
       });
    }
   
  },

//志愿者点击帮助按钮
helpThis(userid,helpInfoId,index){
    let that =this;
  
    if(userid==globalData.loginUser.id){
      wx.showToast({
        title: '不能自己帮自己！',
        duration:2000
      });
    }else{
      let loginUserId=that.data.loginUser.id;
      wx.cloud.callContainer({
        "config": {
          "env": app.globalData.env
        },
        "path": "/helpinfo/setHelp",
        "header": app.globalData.contentType.cloud_normal,
        "method": "POST",
        data:{helpInfoId,loginUserId,adcode:that.data.markerss[index].tabledata.adcode},
        success(res){
          let data= res.data;
          wx.showToast({
            title: data.message,
            duration:500
          });
          if(data.code==200){
              if(data.data.id==helpInfoId){
                  let markers =that.data.markerss;
                 markers[index].tabledata.helpUser=data.data.helperUser;
                 markers[index].tabledata.state=data.data.state;
                  markers[index].tabledata.updatetime=data.data.timestamp;
                  that.setData({
                    markerss:markers
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
      // wx.request({
      //   url: globalData.serverPath+"helpinfo/setHelp",
      //   data:{helpInfoId,loginUserId,adcode:that.data.setting.markers[index].tabledata.adcode},
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
      //             let setting =that.data.setting;
      //             setting.markers[index].tabledata.helpUser=data.data.helperUser;
      //             setting.markers[index].tabledata.state=data.data.state;
      //             setting.markers[index].tabledata.updatetime=data.data.timestamp;
      //             that.setData({
      //               setting
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