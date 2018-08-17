Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deceleration: {
      type: Number,
      value: 0.003,
    },
    height: {
      type: Number,
      value: 50,
    },
    animation: {
      type: String,
      value: 'spinner',//circle
    },
    scrollBar: {
      type: Boolean,
      value: true,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    deltaY: 0,
    pageY: 0,
    pageStart: 0,
    pxScroll: 0,
    pxScrollWrapper: 0,
    vertex: 200,
    startTime: 0,
    scrollbarHeight: 0,
    scrollbarY: 0,
    scrollbarShow: false,
    noMore: false,
    canOnePointMove: false,
    scrollType: 0
    //0滑动,1下拉准备,2下拉完成,3下拉执行
    //4上拉准备,5上拉完成,6上拉执行,7上拉加载无更多数据
  },
  ready: function(){
    var self = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.px-scroll-wrapper').boundingClientRect(function (res) {
      self.setData({
        pxScrollWrapper: res.height
      });
    }).exec();
    query.select('.px-scroll').boundingClientRect(function (res) {
      self.setData({
        pxScroll: res.height
      });
    }).exec();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    touchStart: function (e) {
      if (e.changedTouches.length < 2) {
        var height = this.data.pxScrollWrapper / this.data.pxScroll * this.data.pxScrollWrapper;
        var pageY = e.changedTouches[0].pageY;
        this.setData({
          startTime: new Date().getTime(),
          canOnePointMove: true,
          pageStart: pageY,
          pageY: pageY,
          scrollbarShow: true,
          scrollbarHeight: parseInt(height)
        })
      }
    },
    touchMove: function (e) {
      if (e.changedTouches.length < 2 && this.data.canOnePointMove){
        var deltaY = this.data.deltaY;
        var vertex = this.data.vertex;
        var height = this.properties.height;
        var pageY = e.changedTouches[0].pageY;
        var move = pageY - this.data.pageY;
        var pxScroll = this.data.pxScroll;
        var pxScrollWrapper = this.data.pxScrollWrapper;
        var tableHeight = pxScroll - this.data.pxScrollWrapper;
        var scrollType = this.data.scrollType;
        var noMore = this.data.noMore;
        var pageStart = this.data.pageStart;
        move = parseInt(deltaY + move);
        var scrollbarY = parseInt(pxScrollWrapper * (Math.abs(move) / pxScroll));
        if (move < -tableHeight) {
          if (move > (-tableHeight - height) && !noMore) {
            scrollType = 4;//上拉准备
          } else if (move < (-tableHeight - height) && !noMore) {
            scrollType = 5;//上拉完成
          }
          vertex = -tableHeight - vertex;
          this.setData({
            deltaY: move < vertex ? vertex : move,
            pageY: pageY,
            scrollType: scrollType,
            scrollbarY: scrollbarY
          })
        } else {
          if (move < height && move > 0) {
            scrollType = 1;//下拉准备
            scrollbarY = -scrollbarY;
          } else if (move > height) {
            scrollType = 2;//下拉完成
            scrollbarY = -scrollbarY;
          }
          this.setData({
            deltaY: move > vertex ? vertex : move,
            pageY: pageY,
            scrollType: scrollType,
            scrollbarY: scrollbarY
          })
        }
      }
    },
    touchChend: function (e) {
      var self = this;
      var scrollType = self.data.scrollType;
      var height = self.properties.height;
      var deltaY = self.data.deltaY;
      var pxScrollWrapper = self.data.pxScrollWrapper;
      var tableHeight = self.data.pxScroll - pxScrollWrapper;
      var time = new Date().getTime() - self.data.startTime;
      var scrollbarY;
      if (time < 500) {
        deltaY = deltaY + (e.changedTouches[0].pageY - self.data.pageStart) / self.properties.deceleration * (1 / time);
        deltaY = parseInt(deltaY)
      }
      if (deltaY > 0){
        if (scrollType == 2){
          tableHeight = height;
          scrollbarY = -height;
          scrollType = 3;//下拉执行
          self.pullDown();
        }else{
          tableHeight = 0;
          scrollbarY = 0;
        }
        self.setData({
          pageY: 0,
          startTime: 0,
          deltaY: tableHeight,
          scrollType: scrollType,
          scrollbarY: scrollbarY,
          canOnePointMove: false
        })
      } else if (deltaY < -tableHeight){
        if (scrollType == 5 && !this.data.noMore){
          tableHeight = tableHeight + height;
          scrollbarY = pxScrollWrapper - this.data.scrollbarHeight + height;
          scrollType = 6;//上拉执行;
          self.pullUp();
        }else{
          scrollbarY = pxScrollWrapper - this.data.scrollbarHeight;
        }
        self.setData({
          pageY: 0,
          startTime: 0,
          deltaY: -tableHeight,
          scrollType: scrollType,
          scrollbarY: scrollbarY,
          canOnePointMove: false
        })
      }else{
        self.setData({
          deltaY: deltaY,
          pageY: 0,
          startTime: 0,
          canOnePointMove: false
        })
      }
      setTimeout(function () {
        self.setData({
          scrollbarShow: false
        });
      }, 1000)
    },
    pullDown: function (obj) {
      this.triggerEvent("pullDown", {});
    },
    pullUp: function (obj) {
      this.triggerEvent("pullUp", {});
    },
    pullDownEnd: function (e) {
      var self = this;
      var query = wx.createSelectorQuery().in(self)
      query.select('.px-scroll').boundingClientRect(function (res) {
        self.setData({
          deltaY: 0,
          scrollType: 0,
          scrollbarY: 0,
          pxScroll: res.height
        });
      }).exec();
    },
    pullUpEnd: function (e) {
      var self = this;
      var pxScrollWrapper = self.data.pxScrollWrapper;
      var tableHeight = self.data.pxScroll - pxScrollWrapper;
      var query = wx.createSelectorQuery().in(self);
      query.select('.px-scroll').boundingClientRect(function (res) {
        self.setData({
          deltaY: -tableHeight,
          scrollType: 0,
          scrollbarY: pxScrollWrapper - self.data.scrollbarHeight,
          pxScroll: res.height - self.properties.height
        });
      }).exec();
    },
    noMore: function(){
      var self = this;
      var pxScrollWrapper = self.data.pxScrollWrapper;
      var tableHeight = self.data.pxScroll - pxScrollWrapper;
      var height = self.properties.height;
      var query = wx.createSelectorQuery().in(self);
      query.select('.px-scroll').boundingClientRect(function (res) {
        self.setData({
          deltaY: -tableHeight - height,
          scrollType: 0,
          noMore: true,
          scrollbarY: pxScrollWrapper - self.data.scrollbarHeight - height,
          pxScroll: res.height
        });
      }).exec();
    },
    scrollRestart: function(){
      var self = this;
      var pxScrollWrapper = self.data.pxScrollWrapper;
      var deltaY = self.data.deltaY;
      var query = wx.createSelectorQuery().in(self);
      var noMore = self.data.noMore;
      var height = self.properties.height;
      query.select('.px-scroll').boundingClientRect(function (res) {
        var tableHeight = -(res.height - pxScrollWrapper);
        if (noMore) tableHeight = tableHeight + height;
        self.setData({
          deltaY: deltaY <= tableHeight ? tableHeight : deltaY,
          scrollType: 0,
          noMore: false,
          scrollbarY: deltaY <= tableHeight ? (pxScrollWrapper - self.data.scrollbarHeight) : self.data.scrollbarY,
          pxScroll: noMore ? (res.height - height) : res.height
        });
      }).exec();
    },
    ScrollTo: function(y){
      var pxScroll = this.data.pxScroll;
      var pxScrollWrapper = this.data.pxScrollWrapper;
      var tableHeight = pxScroll - pxScrollWrapper;
      var scrollbarY = parseInt(pxScrollWrapper * (Math.abs(y) / pxScroll));
      if (y > 0 || y < -tableHeight){
        y = -tableHeight;
        scrollbarY = pxScrollWrapper - this.data.scrollbarHeight
      }
      this.setData({
        deltaY: y,
        scrollbarY: scrollbarY
      });
    }
  }
})
