// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const rp = require('request-promise')
//歌单开放API
const URL = 'http://musicapi.xiecheng.live/personalized'
//定义playlistCollection，简化代码
const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 100//数据库每次向API请求的最大数据条数

// 云函数入口函数
exports.main = async (event, context) => {
  //const list = await playlistCollection.get()
  //获取当前数据库歌单
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total/MAX_LIMIT)
  const tasks = []//promise任务集合
  for(let i = 0 ;i < batchTimes;i++){
    //分次数取数据，每次对应一个promise任务
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list={
    data : []
  }
  if(tasks.length > 0){
    list = (await Promise.all(tasks)).reduce((acc,cur) =>{ //执行完所有任务之后进行累加将数据赋值给list
      return {
        //acc代表之前数组的值 cur表示当前遍历的值 将两个值用concat方法拼接
        data : acc.data.concat(cur.data)
      }
    })
  }
  //完成获取当前服务器端最新歌单信息 
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  //将当前数据库歌单与或许到的新歌单进行合并去重，避免重复插入
  const newData = []
  for(let i = 0; i < playlist.length; i++){
    let flag = true//标识变量
    for(let j = 0; j < list.data.length; j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }
  //获取歌单插入云数据库，云数据库需要一条一条插入，需要循环遍历数组插入
  for(let i = 0;i < newData.length;i++){
    await db.collection('playlist').add({
      data:{
        ...newData[i],
        creatTime:db.serverDate()
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.error('插入失败')
    })
  }
  return newData.length
} 