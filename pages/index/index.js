//index.js
//获取应用实例
const app = getApp()
// watermark.js

Page({
  attached() {
    // 在组件实例进入页面节点树时执行
    // this.drowsyUserinfo()
    this.setData({
      watermarkText: 'Fiona'
    })
  },
  data: {
    addShow: false, //添加输入面板是否显示
    inputFocus: false,//是否选中
    addText: '',//新增内容
    todoTabId: 'tab1',//tab选中
    totalCount: 9,//总数据
    pageSize: 15,//显示行数
    pageNum: 2,//页码
    todoDtBind: [],//绑定的数据集合
    todoList: [],//数据集合(所有的)
    delBtnWidth: 60, //删除按钮宽度
    finishBtnWidth: 80, //删除按钮宽度
    startX: "", //触摸开始滑动的位置
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
    
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: 'pages/logs/logs'
    })
  },


  /**
   * 页面上拉触底事件
   */
  onReachBottom: function() {
    if (this.data.todoList.length <= this.data.totalCount) {
      let vNum = this.data.pageNum + 1;
      this.setData({
        pageNum: vNum
      })
      // this.getBindDtInfo("正在加载中");
      this.setBindDtInfo(this.data.todoTabId);
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'none',
        duration: 2000
      })
    }
  },
  /**
   * 通过时间戳获取时间表达式
   */
  getStrDate: function(vTime) {
    var res = /^\d+$/;
    if (!res.test(vTime)) {
      return vTime;
    }
    var date = new Date(vTime * 1000);
    var Y = date.getFullYear(); //年
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); //月
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); //日
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(); //时
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(); //分
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(); //秒
    var strDate = Y + "/" + M + "/" + D + " " + h + ":" + m + ":" + s;
    return strDate;
  },
  /**
   * 添加按钮事件
   */
  addDivShow: function() {
    this.setData({
      addShow: true,
      inputFocus: true
    });
  },
  //输入内容绑定至数据,实时触发的!
  bindAddText: function(e) {
    this.setData({
      addText: e.detail.value
    })
  },
  //确定新增按钮事件
  addTodo: function() {
    if (this.data.inputValue != '') {
      //调用API向本地缓存存入数据
      let allsearch = wx.getStorageSync('searchData') || []
      allsearch.push(this.data.inputValue)
      wx.setStorageSync('searchData', allsearch)
 
      this.setData({
        searchData: allsearch
      })
      console.log(allsearch)
    } 
    //异步接口    
    wx.setStorage({
      key: 'key1',
      data: 'todoList',
      success:function(){
          console.log("写入value1成功！")     
      },fail:function(){
          console.log("写入value1失败！")     
      }
    })


    //同步接口 只有1执行成功才会执行2或3
    try{
      wx.setStorageSync("key", "todoList")      //1
      console.log("写入value2成功！")          //2
    }catch(e){
      console.log("写入value2失败！")         //3
    }


    var content = this.data.addText;
    if (content.trim() == "") {
      wx.showToast({
        title: '添加的内容信息不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var dtInfo = this.data.todoList;
    var objAdd = {
      id: dtInfo.length + 1,
      content: content,
      addTime: this.getStrDate(Date.parse(new Date()) / 1000),
      state: 2,
      txtStyle: ''
    }
    dtInfo.unshift(objAdd);
    var count = this.data.totalCount + 1;
    this.setData({
      todoList: dtInfo,
      totalCount: count,
      addShow: false,
      inputFocus: false,
      addText: ''
    });
    this.setBindDtInfo(this.data.todoTabId)
  },
  //字清空按钮事件
  cancelTodo: function() {
    this.setData({
      addShow: false,
      inputFocus: false,
      addText: ''
    });
  },
  //设置绑定数据集合
  setBindDtInfo: function(vTabId) {
    var dtInfo = [];
    if (vTabId == "tab1"||vTabId == "tab") {
      dtInfo = this.data.todoList;
    } else if (vTabId == "tab2") {
      for (var i = 0; i < this.data.todoList.length; i++) {
        if (this.data.todoList[i].state == 1) {
          dtInfo.push(this.data.todoList[i]);
        }
      }
    } else {
      for (var i = 0; i < this.data.todoList.length; i++) {
        if (this.data.todoList[i].state == 2) {
          dtInfo.push(this.data.todoList[i]);
        }
      }
    }
    this.setData({
      todoDtBind: dtInfo,
      todoTabId: vTabId
    });
  },
  /**
   * 全部,已完成,未完成,详情
   */
  onChangeSelect: function(e) {
    var dtInfo = this.data.todoList;
    dtInfo.forEach(function(item) {
      item.txtStyle = "";
    })
    var self = this;
    var id = e.currentTarget.dataset.id;
    this.setBindDtInfo(id);
  },
  // 滑动开始
  touchStart: function(e) {
    var dtInfo = this.data.todoDtBind;
    dtInfo.forEach(function(item) {
      item.txtStyle = "";
    })
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX,
        todoDtBind: dtInfo
      });
    }
  },
  //滑动
  touchMove: function(e) {
    if (e.touches.length == 1) {
      //移动时水平方向位置
      var moveX = e.touches[0].clientX;
      var dValueX = this.data.startX - moveX; //差值:手指点击开始的X坐标位置减去移动的水平位置坐标
      var operBtnWidth = this.data.delBtnWidth;
      var state = e.currentTarget.dataset.state;
      if (state == 2) {
        operBtnWidth = this.data.delBtnWidth + this.data.finishBtnWidth;
      }
      var txtStyle = "";
      //没有移动或者向右滑动不进行处理
      if (dValueX == 0 || dValueX < 0) {
        txtStyle = "left:0px";
      } else {
        txtStyle = "left:-" + dValueX + "px";
      }
      if (dValueX >= operBtnWidth) {
        //文本移动的最大距离
        txtStyle = "left:-" + operBtnWidth + "px";
      }
      var index = e.currentTarget.dataset.index;
      var dtInfo = this.data.todoDtBind;
      dtInfo[index].txtStyle = txtStyle;
      this.setData({
        todoDtBind: dtInfo
      })
    }
  },
  //滑动结束
  touchEnd: function(e) {
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var dValueX = this.data.startX - endX;
      var operBtnWidth = this.data.delBtnWidth;
      var state = e.currentTarget.dataset.state;
      if (state == 2) {
        operBtnWidth = this.data.delBtnWidth + this.data.finishBtnWidth;
      }
      var txtStyle = ""
      if (dValueX > operBtnWidth / 2) {
        txtStyle = "left:-" + operBtnWidth + "px";
      } else {
        txtStyle = "left:0px"
      }
      var index = e.currentTarget.dataset.index;
      var dtInfo = this.data.todoDtBind;
      dtInfo[index].txtStyle = txtStyle;
      this.setData({
        todoDtBind: dtInfo
      })
    }
  },
  //标记完成
  finishItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var dtInfo = this.data.todoDtBind;
    dtInfo[index].state = 1;
    dtInfo[index].txtStyle = "left:0px";
    this.setData({
      todoDtBind: dtInfo
    })
    this.setBindDtInfo(this.data.todoTabId);
    wx.showToast({
      title: '已完成成功',
      icon: 'success',
      duration: 2000
    })
  },
  //删除按钮事件
  delItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var dtInfo = this.data.todoDtBind;
    var dtInfoList = this.data.todoList;
    var removeIndex = -1;
    for (var i = 0; i < dtInfoList.length; i++) {
      if (dtInfoList[i].id == dtInfo[index].id) {
        removeIndex = i;
      }
    }
    dtInfoList.splice(removeIndex, 1);
    var count = this.data.totalCount - 1;
    this.setData({
      todoList: dtInfoList,
      totalCount: count
    })
    this.setBindDtInfo(this.data.todoTabId);
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000
    })
  },
  onLoad: function () {
    //获取缓存数据，更新初始数据
    let allsearch = wx.getStorageSync('searchData')
    this.setData({
      searchData: allsearch
    })
  },
  onLoad: function() {
    let allsearch = wx.getStorageSync('searchData')
    this.setData({
      searchData: allsearch
    })
    
        //异步接口    
        wx.getStorage({
          key: 'key1',
          success: function (res) {
            // 异步接口在success回调才能拿到返回值
            var todoList = res.data
          },
          fail: function () {
            console.log('读取key1失败')
          }
    
        })
    
    
        //同步接口
        try {
          // 同步接口立即返回值
          var todoList = wx.getStorageSync('key2')
        } catch (e) {
          console.log('读取key2失败')
        }
    
    try{
      wx.setStorageSync('key', 'todoList')
      console.log('写入value成功')
    }catch (e) {
      console.log('写入value发生错误')
    }
    

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
  
})