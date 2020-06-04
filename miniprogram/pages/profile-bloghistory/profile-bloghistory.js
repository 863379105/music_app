// pages/profile-bloghistory/profile-bloghistory.js

const MAX_COUNT=10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListByOpenid()
  },
  _getListByOpenid(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        $url:'getListByOpenid',
        start:this.data.blogList.length,
        count:MAX_COUNT
      }
    }).then((res)=>{
      if (this.data.blogList.length == 0 && res.result.length==0){
        wx.showToast({
          title: '暂无博客噢',
          image: '/images/angry.png',
          duration: 2000
        })
        return
      }
      if (this.data.blogList.length != 0 && res.result.length == 0){
        wx.showToast({
          title: '无更多博客',
          duration: 2000
        })
        return
      }
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      console.log(this.data.blogList)
      
      wx.hideLoading()
    })
  },
  //页面跳转
  goComment(event){
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogid=' + event.target.dataset.blogid,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onShareAppMessage: function (event) {
    const blog=event.target.dataset.blog
    return{
      title:blog.content,
      path:`/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})