// pages/blog-edit/blog-edit.js
//
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
let content = ''
let userInfo = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //输入文字个数
    wordsNum : 0,
    footBottom : 0,
    images : [],
    selectPhoto : true
  },

  //监听输入最大字数
  onInput(event){
    console.log(event)
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM){
       wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum : wordsNum
    })
    content = event.detail.value
  },
  onFoucs(event){
    this.setData({
      footBottom : event.detail.height
    })
  },
  onBlur(){
    this.setData({
      footBottom : 0
    })
  },
  //选择图片
  onChooseImage(){
    wx.chooseImage({
      count : MAX_IMG_NUM - this.data.images.length,
      sizeType : ['original' , 'compressed'],
      sourceType : ['album','camera'],
      success: (res) => {
        this.setData({
          images : this.data.images.concat(res.tempFilePaths)
        })
        let max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto : max <= 0 ? false : true
        })
      },
    })
  },
  //删除图片
  onDeleteImg(event){
    this.data.images.splice(event.target.dataset.index, 1)
    let max = MAX_IMG_NUM - this.data.images.length
    this.setData({
      images: this.data.images,
      selectPhoto: max <= 0 ? false : true
    })
  },
  //预览图片
  onPreviewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  //发布
  //数据->云数据库 
  //数据库：内容  图片FileID openID 昵称 头像 时间
  //图片（上传到云存储当中 真是存储时云文件FileID）fileID（云文件ID）
  //先把图片存到云存储当中
  //图片上传
  send(){
    if(content.trim() === ''){
      wx.showModal({
        title: '请输入内容',
        content : ''
      })
      return
    }
    wx.showLoading({
      title: '发布中',
    })
    //图片上传
    let promiseArr = []
    let fileIds = []
    for(let i = 0; i < this.data.images.length ; i++){
      let p = new Promise((resolve,reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath : 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath :  item, 
          success : (res) =>{
            //console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },fail : (err) =>{
            //console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    //
    Promise.all(promiseArr).then((res) =>{
      db.collection('blog').add({
        data: {
          //...表示取到userInfo里面的每一个属性
          ...userInfo,
          content,
          images: fileIds,
          //openid会自己传进去
          createTime: db.serverDate(), //服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        //返回博客列表 并刷新界面  
        wx.navigateBack()
        const pages = getCurrentPages()
        // console.log(pages)
        // 取到上一个页面
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      }).catch((err) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布失败',
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
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

  }
})