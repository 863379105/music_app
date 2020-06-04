// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let isMoving = false//解决拖拽进度条与timeupdata冲突问题
let currentSec = -1 //当前播放的秒数

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame : Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime : '00:00',
      totalTime : '00:00'
    },
    movableDis : 0,
    progress : 0
  },
  //组件生命周期函数
  lifetimes: {
    ready() {
      //console.log(this.properties.isSame)
      // if(this.properties.isSame && this.data.showTime.totalTime=='00:00'){
      //   this._setTime()
      // }
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //拖动进度条事件函数
    _onChange(event){
      //console.log(event)
      if(event.detail.source === "touch"){
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }

    },
    //松开进度条事件函数
    _onTouchEnd(){
      const currentTimeFmt = this._dataFormat(Math.floor(backgroundAudioManager.currentTime))
      
      this.setData({
        progress : this.data.progress,
        movableDis : this.data.movableDis,
        ['showTime.currentTime'] : currentTimeFmt.min + ':' + currentTimeFmt.min
      })
      //设置音乐进度
      backgroundAudioManager.seek(backgroundAudioManager.duration * this.data.progress / 100)
      isMoving = false
    },
    //获得movableAreaWidth、movableViewWidth的宽度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        //console.log(movableAreaWidth, movableViewWidth)
      })
    },
    //绑定音乐播放监听
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        //console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        //console.log('onCanplay')
        //console.log(backgroundAudioManager.duration)
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      //监听进度更新事件
      backgroundAudioManager.onTimeUpdate(() => {
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const sec = currentTime.toString().split('.')[0]
          //每播放一秒将当前显示的一播放时间更新 提高小程序的效率
          if (sec != currentSec) {
            const currentTimeFormat = this._dataFormat(currentTime)
            //给movableDis设置值
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
            })
            currentSec = sec
            //console.log(this.data.showTime.currentTime)
            //联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          } 
        }   
      })
      //监听音乐播放结束事件
      backgroundAudioManager.onEnded(() => {
        //console.log('onEnded')
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
      })
    },
    _setTime(){
      const duration = backgroundAudioManager.duration  
      const durationFmt = this._dataFormat(duration)
      console.log(durationFmt.min)
      this.setData({
        ['showTime.totalTime'] : durationFmt.min + ':' + durationFmt.sec,
      })
      //console.log(this.data.showTime)
    },
    // 格式化时间
    _dataFormat(sec){
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min' : this._parseZero(min),
        'sec' : this._parseZero(sec)
      }
    },
    //补零函数
    _parseZero(sec){
      return sec < 10 ? '0' + sec : sec
    }
  }
})
