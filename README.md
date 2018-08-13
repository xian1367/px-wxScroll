# px-wxScroll<br>
1.微信小程序上拉加载下拉刷新组件<br>
2.官方自定义组件文档:https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/<br>
3.以pages/index为例,引入scroll，在json配置:<br>
  {
    "usingComponents": {
      "scroll": "/scroll/index"
    },
    "disableScroll": true
  }
在js<br>
  onLoad: function (options) {
      //获得scrolls组件
      this.scrolls = this.selectComponent("#scrolls")
  }
//disableScroll固定滚动区域
4.      配置:             默认          注释<br>
  (1)   deceleration      0.5          //滚动系数，越小滚动越快<br>
  (2)   height            50           //触发上拉下拉加载刷新的拖动距离，单位(px)<br>
  (3)   animation       spinner        //动画 有'circle'和'spinner'<br>
  (4)   scrollBar        true          //是否显示滚动条<br>
5.事件
  bind:pullDown  //下拉触发<br>
  bind:pullUp    //上拉触发<br>
  this.scrolls.pullDownEnd();     //下拉结束<br>
  this.scrolls.pullUpEnd();       //上拉结束<br>
  this.scrolls.noMore();          //上拉终止,无更多数据,不再触发pullUp<br>
  this.scrolls.scrollRestart();   //更新组件,可以再触发pullUp,重新计算滚动区域<br>
  this.scrolls.ScrollTo();        //滚动到指定位置负为向下滚动,任意大于0滚动到底部<br>
