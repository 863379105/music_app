// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext=cloud.getWXContext()
  const result=await cloud.openapi.wxacode.getUnlimited({
    scene:wxContext.OPENID,
    //未发布不能跳转页面
    // page:"pages/blog/blog"
    lineColor:{
      'r':211,
      'g':60,
      'b':57
    },
    isHyaline:false
  })
  // console.log(result)

  //先将获得的结果中的buffer存入云存储当中
  const upload=await cloud.uploadFile({
    cloudPath:'qrcode/'+Date.now()+'-'+Math.random()*10000000+'.png',
    fileContent:result.buffer
  })
  console.log('上传成功')
  return upload.fileID
}