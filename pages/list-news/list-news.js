//index.js
var arrData = [];
for (var i = 0; i < 5; i++) {
  var arr1 = [];
  for (var x = 0; x <= 5; x++) {
    arr1[x] = x
  }
  arrData[i] = arr1;
}
Page({
  data: {
    channel: ['a', 'b','c','d','e'],
    arr: arrData,
    current: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得scrolls组件
    var self = this;
    self.scrolls = [];
    this.data.channel.forEach(function (e,index) {
      self.scrolls[index] = self.selectComponent(".scrolls" + index)
    });
  },
  bindChange: function(e){
    this.setData({
      current: e.detail.current
    });
  },
  bindTap: function (e) {
    this.setData({
      current: e.target.dataset.index
    });
  },
  _pullUp: function () {
    var self = this;
    setTimeout(function () {
      var array = [];
      for (var i = 0; i <= 5; i++) {
        array[i] = i;
      }
      var current = self.data.current
      arrData[current] = arrData[current].concat(array);
      self.setData({
        arr: arrData
      });
      self.scrolls[current].pullUpEnd();
    }, 1500)
  },
  _pullDown: function () {
    var self = this;
    setTimeout(function () {
      var array = [];
      for (var i = 0; i <= 5; i++) {
        array[i] = i;
      }
      var current = self.data.current
      arrData[current] = arrData[current].concat(array);
      self.setData({
        arr: arrData
      });
      self.scrolls[current].pullDownEnd();
    }, 1500)
  }
})
