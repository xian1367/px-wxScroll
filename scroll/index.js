Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deceleration: {
      type: Number,
      value: 1,
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
    scrollbarHeight: 0,
    scrollbarY: 0,
    scrollbarShow: false,
    scrollType: 0,
    noMore: false,
    canOnePointMove: false
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
    touchMove: function (e) {
      if (e.changedTouches.length < 2 && this.data.canOnePointMove){
        var deltaY = this.data.deltaY;
        var vertex = this.data.vertex;
        var height = this.properties.height;
        var pageY = e.changedTouches[0].pageY;
        var move = pageY - this.data.pageStart;
        var pxScroll = this.data.pxScroll;
        var pxScrollWrapper = this.data.pxScrollWrapper;
        var tableHeight = pxScroll - this.data.pxScrollWrapper;
        var scrollType = this.data.scrollType;
        var noMore = this.data.noMore;
        if (deltaY < 0 && deltaY > -tableHeight) {
          move = move / this.properties.deceleration;
        } else {
          move = move * this.properties.deceleration / 10;
        }
        move = parseInt(deltaY + move);
        var scrollbarY = parseInt(pxScrollWrapper * (Math.abs(move) / pxScroll));
        if (move < -tableHeight) {
          if (move > (-tableHeight - height) && !noMore) {
            scrollType = 4;//上拉准备
          } else if (move < (-tableHeight - height) && !noMore) {
            scrollType = 5;//上拉完成
          }
          vertex = -tableHeight - height;
          if (pageY - this.data.pageY > 0 && move < -tableHeight) {
            vertex = (vertex + Math.abs(pageY - this.data.pageY));
            pageY = this.data.pageY;
          }
          this.setData({
            deltaY: move < vertex ? vertex : move,
            pageY: pageY,
            scrollType: scrollType,
            scrollbarY: scrollbarY,
            scrollbarShow: deltaY == move ? false : true
          })
        } else {
          if (move < height && move > 0) {
            scrollType = 1;//下拉准备
            scrollbarY = -scrollbarY;
          } else if (move > height) {
            scrollType = 2;//下拉完成
            scrollbarY = -scrollbarY;
          }
          if (pageY - this.data.pageY < 0 && move > 0) {
            vertex = (vertex - Math.abs(pageY - this.data.pageY));
            pageY = this.data.pageY;
          }
          this.setData({
            deltaY: move > vertex ? vertex : move,
            pageY: pageY,
            scrollType: scrollType,
            scrollbarY: scrollbarY,
            scrollbarShow: deltaY == move ? false : true
          })
        }
      }
    },
    touchStart: function (e) {
      if (e.changedTouches.length < 2) {
        var height = this.data.pxScrollWrapper / this.data.pxScroll * this.data.pxScrollWrapper;
        this.setData({
          canOnePointMove: true,
          pageStart: e.changedTouches[0].pageY,
          pageY: e.changedTouches[0].pageY,
          scrollbarHeight: parseInt(height)
        })
      }
    },
    touchChend: function (e) {
      var self = this;
      var scrollType = self.data.scrollType;
      var height = self.properties.height;
      var deltaY = self.properties.deltaY;
      var pxScrollWrapper = self.data.pxScrollWrapper;
      var tableHeight = self.data.pxScroll - pxScrollWrapper;
      var scrollbarY;
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
          pageStart: 0,
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
          pageStart: 0,
          deltaY: -tableHeight,
          scrollType: scrollType,
          scrollbarY: scrollbarY,
          canOnePointMove: false
        })
      }else{
        self.setData({
          pageStart: 0,
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
