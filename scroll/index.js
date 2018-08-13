Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deceleration: {
      type: Number,
      value: 0.5,
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
      value: true,//circle
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
    noMore: false
    //0滑动,1下拉准备,2下拉完成,3下拉执行
    //4上拉准备,5上拉完成,6上拉执行,7上拉加载无更多数据
  },
  ready: function(){
    var self = this;
    var query = wx.createSelectorQuery().in(this)
    query.select('.px-scroll-wrapper').boundingClientRect(function (res) {
      self.setData({
        pxScrollWrapper: res.height
      });
    }).exec();
    this.calculationHeight();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    calculationHeight: function () {
      var self = this;
      var query = wx.createSelectorQuery().in(this)
      query.select('.px-scroll').boundingClientRect(function (res) {
        self.setData({
          pxScroll: res.height
        });
      }).exec();
    },
    touchMove: function (e) {
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
      if (deltaY < 0 && deltaY > -tableHeight){
        move = move / this.properties.deceleration;
      }else{
        move = move * this.properties.deceleration / 10;
      }
      move = parseInt(deltaY + move);
      var scrollbarY = parseInt(pxScrollWrapper * (Math.abs(move) / pxScroll));
      if (move < -tableHeight){
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
          scrollbarY: scrollbarY
        })
      }else{
        if (move < height && move > 0){
          scrollType = 1;//下拉准备
          scrollbarY = -scrollbarY;
        } else if (move > height){
          scrollType = 2;//下拉完成
          scrollbarY = -scrollbarY;
        }
        if (pageY - this.data.pageY < 0 && move > 0){
          vertex = (vertex - Math.abs(pageY - this.data.pageY));
          pageY = this.data.pageY;
        }
        this.setData({
          deltaY: move > vertex ? vertex : move,
          pageY: pageY,
          scrollType: scrollType,
          scrollbarY: scrollbarY
        })
      }
    },
    touchStart: function (e) {
      var height = this.data.pxScrollWrapper / this.data.pxScroll * this.data.pxScrollWrapper;
      this.setData({
        pageStart: e.changedTouches[0].pageY,
        pageY: e.changedTouches[0].pageY,
        scrollbarHeight: parseInt(height),
        scrollbarShow: true
      })
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
          scrollbarY: scrollbarY
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
          scrollbarY: scrollbarY
        })
      }else{
        self.setData({
          pageStart: 0
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
      this.setData({
        deltaY: 0,
        scrollType: 0,
        scrollbarY: 0
      });
      this.calculationHeight();
    },
    pullUpEnd: function (e) {
      var pxScrollWrapper = this.data.pxScrollWrapper;
      var tableHeight = this.data.pxScroll - pxScrollWrapper;
      this.setData({
        deltaY: -tableHeight,
        scrollType: 0,
        scrollbarY: pxScrollWrapper - this.data.scrollbarHeight
      }, () => {
        this.calculationHeight();
      });
    },
    noMore: function(){
      var pxScrollWrapper = this.data.pxScrollWrapper;
      var tableHeight = this.data.pxScroll - pxScrollWrapper;
      var height = this.properties.height;
      this.setData({
        deltaY: -tableHeight - height,
        scrollType: 0,
        noMore: true,
        scrollbarY: pxScrollWrapper - this.data.scrollbarHeight - height
      }, () => {
        this.calculationHeight();
      });
    },
    scrollRestart: function(){

    }
  }
})
