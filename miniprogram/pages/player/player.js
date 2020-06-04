// pages/player/player.js

let musiclist = []//从storage中取到歌曲信息
let nowPlayingIndex = 0//初始化当前正在播放歌曲的index
const backgroundAudioManager = wx.getBackgroundAudioManager()//获取全局背景音乐管理器
const app  = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    picUrl : '',
    isPlaying : false,//初始化播放状态，开始是不播放
    isLyricShow : false,//初始化歌词显示
    lyric : '暂无歌词',
    isSame : false//判断点击的是否是同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

  //封装当前歌曲信息
  _loadMusicDetail(musicId){
    if(musicId == app.getPlayMusicId()){
      this.setData({
        isSame : true
      })
    }else(
      this.setData({
        isSame : false
      })
    )
    if(!this.data.isSame){
      backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    //console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      picUrl : music.al.picUrl,
      isPlaying : false,
      lyric : '暂无歌词'
    })
    //设置全局musicId
    app.setPlayMusicId(musicId)
    //console.log(this.data.picUrl)
    wx.cloud.callFunction({
      name : 'music',
      data : {
        $url : 'musicUrl',
        musicId : musicId,
      }
    }).then((res) =>{
      console.log(res.data)
      let result = JSON.parse(res.result)
      if(result.data[0].url == null){
        wx.showToast({
          title:"当前无权限播放"
        })
        return
      }
      if(!this.data.isSame){
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
        //保存播放历史
        this.savePlayHistory()
      }
      
      wx.hideLoading()
      this.setData({
        isPlaying : true
      })
    })
    //加载歌词
    wx.cloud.callFunction({
      name : 'music',
      data : {
        $url : 'lyric',
        musicId : musicId
      }
    }).then((res) =>{
      //console.log(res.result)
      let lyric = '暂无歌词'
      const lrc = JSON.parse(res.result).lrc
      //console.log("1" + lrc)
      if(lrc){
        lyric = lrc.lyric
        this.setData({
          lyric : lyric
        })
      }
      //console.log(this.data.lyric)
      // if(res.result.uncollected){
      //   let lyric = '暂无歌词'
      // }else{
      //   const lrc = JSON.parse(res.result.lrc)
      //   lyric = lrc.lyric
      //   this.setData({
      //        lyric : lyric
      //     })
      // }
      //console.log(this.data.lyric)
    })
  },
  //播放暂停函数
  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying : !this.data.isPlaying
    })
  },
  //上一首
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  //下一首
  onNext(){
     nowPlayingIndex++
     if(nowPlayingIndex  == musiclist.length){
       nowPlayingIndex = 0
     }
     this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  //控制歌词显示
  onChangeLyricShow(){
    this.setData({
      isLyricShow : !this.data.isLyricShow
    })
  },
  
  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay(){
    this.setData({
      isPlaying : true
    })
  },
  onPause(){
    this.setData({
      isPlaying : false
    })
  },
  
  //保存播放历史
  savePlayHistory(){
    const music=musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history=wx.getStorageSync(openid)
    let bHave=false
    for(let i = 0;i < history.length;i++){
      if(history[i].id == music.id){
        bHave = true
        break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
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