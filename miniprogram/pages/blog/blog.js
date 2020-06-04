// pages/blog/blog.js
let keyWord=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow : false,
    blogList : [],
  },

  //发布函数
  onPublish(){
    //判断用户是否授权
    wx.getSetting({
      success : (res) => {
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success : (res) =>{
              this.onLoginSuccess({
                detail : res.userInfo
              })
            }
          })
        }else{
          this.setData({
            modalShow : true
          })
        }
      }
    })
  },
  onLoginSuccess(event){
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail(){
    wx.showModal({
      title:'授权失败'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },
  //加载博客列表
  _loadBlogList(start = 0){
    wx.showLoading({
      title: '加载中',
      mask : true
    })
    wx.cloud.callFunction({
      name : 'blog',
      data : {
        keyWord,
        $url : 'list',
        start : start,
        count : 10,
      }
    }).then((res) =>{
      this.setData({
        blogList : this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
    
  },
  //博客列表详情页
  goComment(event){
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogid=' + event.target.dataset.blogid,
    })
  },
  //搜索
  onSearch(event){
    keyWord=event.detail.keyWord
    this.setData({
      blogList:[]
    })
    this._loadBlogList(0)
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
    this.setData({
      blogList : []
    })
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList( this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})