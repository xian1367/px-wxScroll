//index.js
var arrData = [];
for(var i=0;i<=5;i++){
  arrData[i] = i;
}
Page({
  data: {
    arr: arrData
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得citys组件
    this.scrolls = this.selectComponent("#scrolls")
  },
  _pullUp:function(){
    var self = this;
    setTimeout(function () {
      if (self.data.arr.length > 10){
        self.scrolls.noMore();
      }else{
        self.setData({
          arr: self.data.arr.concat(arrData)
        });
        self.scrolls.pullUpEnd();
      }
    }, 1500)
  },
  _pullDown: function (){
    var self = this;
    setTimeout(function () {
      self.setData({
        arr: self.data.arr.concat(arrData)
      });
      self.scrolls.pullDownEnd();
    }, 1500)
  }
})
