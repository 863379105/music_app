// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist : {
      type : Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId : -1
  },
  pageLifetimes : {
    show(){
      this.setData({
        playingId : parseInt(app.getPlayMusicId()) 
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset
      const musicId = event.currentTarget.dataset.musicid
      this.setData({
        playingId : musicId
      })
      //console.log(event.currentTarget.dataset.musicid)
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicId}&index=${ds.index}`,
      })
    }
  }
})
