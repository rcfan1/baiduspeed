/*
原作者：adwktt
github:https://raw.githubusercontent.com/adwktt/adwktt/master/BBB.js
打开App点击 我的 获取Cookie
下載地址：http://bububao.yichengw.cn

脚本自用
修改内容： 支持多账号，支持主流推送（plus+,server酱等等）,修复不能看新闻bug
          增加首页看看賺，增加自动领步数金币
推送服务结合 sendNotify.js 使用,将sendNotify.js放在 BBB.js同级目录即可
更新时间：2020-1-29, 不熟悉QX等等设备获取多账号的过程，故仅支持 nodejs
*/



const $ = new Env('步步宝')
const notify = $.isNode() ? require('./sendNotify') : '';
const BBB_API = `https://bububao.duoshoutuan.com/` 
let notice =''
const now_time=new Date().getHours()
var i=0,num=0;
let CookieVal =[
   //ly
  `{"tokenstr":"B21B046B0E7E65B68BAA3D77B528903G1611471547","Accept":"*/*","version":"10","idfa":"2F85DC28-DD9D-4EE5-9E3C-408FF5E6A5CA","Host":"bububao.duoshoutuan.com","Accept-Language":"zh-cn","platform":"2","imei":"1D329BEA-15E5-4E2D-863E-2D5FF7655541","Content-Length":"0","User-Agent":"BBB/132 CFNetwork/978.0.7 Darwin/18.7.0","Connection":"keep-alive","Accept-Encoding":"br, gzip, deflate","store":"appstore","Cookie":"PHPSESSID=70fs9smsccck767rju8667bt26"}`
]

if ($.isNode()) {
      console.log(`============ 脚本执行-国际标准时间(UTC)：${new Date().toLocaleString()}  =============\n`)
      console.log(`============ 脚本执行-北京时间(UTC+8)：${new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString()}  =============\n`)
}

now = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);  

!(async () => {

$.msg($.name,"开始🎉🎉🎉")
$.log(`\n=================共提供`+CookieVal.length+`个账号====================\n`)
  for (i = 0; i < CookieVal.length; i++) {
    $.log(`=================第`+(i+1)+`个账号开始======================`)
    await userInfo()        // 模拟登陆
    await signIn()          // 签到
    await zaoWanDkInfo()    // 早晚打卡
    await sleepStatus()     // 查询睡觉状态
    await checkWaterNum()   // 查询喝水杯数
    await clickTaskStatus() // 查询每日点击任务状态
    await watchTaskStatus() // 查询每日观看广告任务状态
    await helpStatus()      // 查询助力视频状态
    await getNewsId()       // 查询新闻ID
    await getQuestionId()   // 查询答題ID
    await guaList()         // 查询刮刮卡ID
    await checkHomeJin()    // 查询首页状态
    if (now_time==10) {
      await checkH5Id()        // 看看賺,一天一次
    }     
    await showmsg()         // 推送消息
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


async function showmsg(){
    $.msg($.name, '', notice)
    if ($.isNode()) {
      await notify.sendNotify(`步步宝`,notice)
    }
}

var getBoxId = (function () {
    var i = 0;
    return function () {
        return ++i;
    };
})();

// 模拟登陆
function userInfo() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let userInfo ={
    url: `${BBB_API}user/profile`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(userInfo,async(error, response, data) =>{
     const userinfo = JSON.parse(data)
     if(response.statusCode == 200 && userinfo.code != -1){
          $.log('\n🎉模拟登陆成功\n')
     notice = '🎉步步宝账号: '+userinfo.username+'\n'+'🎉当前金币: '+userinfo.jinbi+'💰 约'+userinfo.money+'元💸\n'
    }else{
     notice = '⚠️异常原因: '+userinfo.msg+'\n'
           }
          resolve()
    })
   })
  } 
//签到
function signIn() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let signin ={
    url: `${BBB_API}user/sign`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(signin,async(error, response, data) =>{
$.log('\n🔔开始签到\n')
     const sign = JSON.parse(data)
      if(sign.code == 1) {
          $.log('\n🎉'+sign.msg+'签到金币+ '+sign.jinbi+'💰\n')
      signInStr = sign.nonce_str
          await signDouble()
         }else{
          $.log('\n🎉'+sign.msg+'\n')
         }
          resolve()
    })
   })
  } 

// 签到奖励翻倍
function signDouble() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let signdouble ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${signInStr}&tid=2&pos=1&`,
}
   $.post(signdouble,async(error, response, data) =>{
     const signin2 = JSON.parse(data)
$.log('\n🔔开始领取每日观看奖励\n')
      if(signin2.code == 1) {
          $.log('\n🎉奖励翻倍成功\n')
           }else{
          $.log('\n⚠️签到翻倍失败:'+signin2.msg+'\n')
           }
          resolve()
    })
   })
  } 

// 早晚打卡
function zaoWanDkInfo() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let zaowandkinfo ={
    url: `${BBB_API}mini/dk_info`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(zaowandkinfo,async(error, response, data) =>{
     const zwdkinfo = JSON.parse(data)
      if(zwdkinfo.code == 1 && zwdkinfo.is_daka == 0) {
      nowTime = zwdkinfo.now_time
      title1 = zwdkinfo.title1
      title2 = zwdkinfo.title2
          await zaoWanDk()
           }
          resolve()
    })
   })
  } 


// 早晚打卡
function zaoWanDk() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let zaowandk ={
    url: `${BBB_API}user/chuansj`,
    headers: JSON.parse(CookieVal[i]),
    body: `mini_pos=3&c_type=1&`,
}
   $.post(zaowandk,async(error, response, data) =>{
     const zwdk = JSON.parse(data)
      if(zwdk.code == 1) {
      zwdkStr = zwdk.nonce_str
          await $.wait(30000)
          await dkClick()
           }
          resolve()
    })
   })
  } 

function dkClick() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let dkclick ={
    url: `${BBB_API}mini/dk_click`,
    headers: JSON.parse(CookieVal[i]),
    body: `now_time=${nowTime}&`,
}
   $.post(dkclick,async(error, response, data) =>{
     const clickdk = JSON.parse(data)
      if(clickdk.code == 1) {
          $.log('\n🎉'+clickdk.msg+'+ '+clickdk.jinbi+'💰\n')
          $.msg(`🎉${title1}\n${title2}💰`,'','')
           }else{
          $.log('\n⚠️'+clickdk.msg)
           }
          resolve()
    })
   })
  } 

// 查询刮刮卡ID
function guaList() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let gualist ={
    url: `${BBB_API}gua/gualist?`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(gualist,async(error, response, data) =>{
$.log('\n🔔开始查询刮刮卡ID\n')
     const guaid = JSON.parse(data)
$.log('\n🔔查询刮刮卡ID成功,5s后开始刮卡\n')
      if(guaid.ka > 0){
      for (guaId of guaid.list)
      if(guaId.is_ad == 0)
      guaID = guaId.id
          await $.wait(5000)
          await guaDet()
         }else{
$.log('\n⚠️刮刮卡已用完,请明天再刮吧！\n')
        }

          resolve()
    })
   })
  } 
// 查询刮卡签名
function guaDet() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let guadet ={
    url: `${BBB_API}gua/guadet?`,
    headers: JSON.parse(CookieVal[i]),
    body: `gid=${guaID}&`
}
   $.post(guadet,async(error, response, data) =>{
$.log('\n🔔开始查询刮卡签名\n')
     const guasign= JSON.parse(data)
      if(response.statusCode == 200) {
$.log('\n🔔查询刮卡签名成功\n')
      SIGN = guasign.sign
      GLID = guasign.glid
$.log('\nsign: '+SIGN+'\n')
$.log('\nglid: '+GLID+'\n')
          await guaPost()
         }
          resolve()
    })
   })
  } 
// 开始刮卡
function guaPost() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let guapost ={
    url: `${BBB_API}gua/guapost?`,
    headers: JSON.parse(CookieVal[i]),
    body: `sign=${SIGN}&gid=${guaID}&glid=${GLID}&`
}
   $.post(guapost,async(error, response, data) =>{
$.log('\n🔔开始刮卡\n')
     const guaka= JSON.parse(data)
      if(typeof guaka.jf === 'number') {
      guaStr = guaka.nonce_str
          $.log('\n🎉刮卡成功\n恭喜您刮出'+guaka.tp+'张相同图案\n金币+ '+guaka.jf+'\n等待45s后开始翻倍刮卡奖励')
          await $.wait(45000)
          await guaDouble()
         }
          resolve()
    })
   })
  } 

// 领取刮卡翻倍奖励
function guaDouble() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let guadouble ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${guaStr}&tid=6&pos=1&`,
}
   $.post(guadouble,async(error, response, data) =>{
     const guaka2 = JSON.parse(data)
$.log('\n🔔开始领取刮卡翻倍奖励\n')
      if(guaka2.code == 1) {
          $.log('\n🎉刮卡翻倍成功,等待2s后查询下一张刮刮卡ID\n')
          await $.wait(2000)
          await guaList()
           }else{
          $.log('\n⚠️刮卡翻倍失败:'+guaka2.msg+'\n')
           }
          resolve()
    })
   })
  } 

// 查询喝水杯数
function checkWaterNum() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checkwaternum ={
    url: `${BBB_API}mini/water_info`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(checkwaternum,async(error, response, data) =>{
$.log('\n🔔开始查询喝水杯数\n')
     const waternum = JSON.parse(data)
      if(waternum.code == 1 && waternum.day_num < 7) {
      waterNum = waternum.day_num
      if(waternum.is_sp == 1){
          $.log('\n🎉喝水前需要看广告！,1s后开始看广告\n')
          await $.wait(1000)
          await checkWaterSp()
         }else{
          $.log('\n🎉查询成功,1s后领取喝水奖励\n')
          await $.wait(1000)
          await waterClick()
         }}else{
          $.log('\n⚠️喝水失败: 今日喝水已上限\n')
         }
          resolve()
    })
   })
  } 

function checkWaterSp() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checksp ={
    url: `${BBB_API}user/chuansj`,
    headers: JSON.parse(CookieVal[i]),
    body: `mini_pos=2&c_type=1&`,
}
   $.post(checksp,async(error, response, data) =>{
     const sp = JSON.parse(data)
      if(sp.code == 1) {
      waterSpStr = sp.nonce_str
          await WaterSp()
           }
          resolve()
    })
   })
  } 
// 观看喝水广告
function WaterSp() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let watersp ={
    url: `${BBB_API}mini/water_sp`,
    headers: JSON.parse(CookieVal[i]),
    body: `day_num=${waterNum}&`,
}
   $.post(watersp,async(error, response, data) =>{
     const spwater = JSON.parse(data)
      if(spwater.code == 1) {
          $.log('\n🎉正在观看喝水广告, 30后领取喝水奖励\n')
          await $.wait(30000)
          await waterClick()
           }
          resolve()
    })
   })
  } 
// 领取喝水奖励
function waterClick() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let waterclick ={
    url: `${BBB_API}mini/water_click`,
    headers: JSON.parse(CookieVal[i]),
    body: `day_num=0${waterNum}&`,
}
   $.post(waterclick,async(error, response, data) =>{
     const clickwater = JSON.parse(data)
$.log('\n🔔开始领取喝水奖励\n')
      if(clickwater.code == 1) {
          $.log('\n🎉'+clickwater.msg+'喝水金币+ '+clickwater.jinbi+'💰\n')
           }else{
          $.log('\n⚠️喝水失败:'+clickwater.msg+'\n')
           }
          resolve()
    })
   })
  } 

// 查询睡觉状态
function sleepStatus() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let sleepstatus ={
    url: `${BBB_API}mini/sleep_info`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(sleepstatus,async(error, response, data) =>{
$.log('\n🔔开始查询睡觉状态\n')
     const slpstatus = JSON.parse(data)
      if(slpstatus.code == 1) {
      if(slpstatus.is_lq == 1 && now.getHours() >= 8 && now.getHours() <= 18) {
      sleepStr = slpstatus.nonce_str
      sleepId = slpstatus.taskid
     }else{
$.log('🔔大白天的就不要睡觉啦！')
      }
      if(slpstatus.is_sleep == 0 && slpstatus.is_lq == 0 && now.getHours() >= 20) {
$.log('🔔都几点了，还不睡？5s后开始睡觉！')
          await $.wait(5000)
          await sleepStart()
         }else if((slpstatus.is_sleep == 1 || slpstatus.is_sleep == 0)&& slpstatus.is_lq == 1 && now.getHours() >= 8 && now.getHours() <= 12){
$.log('🔔都几点了，还不起？5s后准备起床！')
          await $.wait(5000)
          await sleepEnd()
         }else if(slpstatus.is_sleep == 1 && slpstatus.is_lq == 1 && now.getHours() >= 22){
          $.log('⚠️睡觉的時候不要玩手机！！！')
         }else if(slpstatus.is_sleep == 0 &&
now.getHours() >= 18){
          $.log('😘这么早就准备睡觉了嗎？是身体不舒服嗎？要保重身体呀！')
         }}
          resolve()
    })
   })
  } 


// 开始睡觉
function sleepStart() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let sleepstart ={
    url: `${BBB_API}mini/sleep_start`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(sleepstart,async(error, response, data) =>{
     const startsleep = JSON.parse(data)
$.log('\n🔔开始睡觉\n')
      if(startsleep.code == 1) {
          $.log('\n🎉睡觉成功！早睡早起身体好！\n')
           }else{
          $.log('\n⚠️睡觉失败:'+startsleep.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 开始起床
function sleepEnd() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let sleepend ={
    url: `${BBB_API}mini/sleep_end`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(sleepend,async(error, response, data) =>{
     const endsleep = JSON.parse(data)
$.log('\n🔔开始起床\n')
      if(endsleep.code == 1) {
          $.log('\n🎉起床了！別睡了！\n')
          await sleepDone()
           }else{
          $.log('\n⚠️起床失败:'+endsleep.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 领取睡觉金币
function sleepDone() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let sleepdone ={
    url: `${BBB_API}mini/sleep_done`,
    headers: JSON.parse(CookieVal[i]),
    body: `taskid=${sleepId}&nonce_str=${sleepStr}&`
}
   $.post(sleepdone,async(error, response, data) =>{
     const donesleep = JSON.parse(data)
$.log('\n🔔开始领取睡觉金币\n')
      if(donesleep.code == 1) {
          $.log('\n🎉'+donesleep.msg+'金币+ '+donesleep.jinbi+'💰\n')
           }else{
          $.log('\n⚠️领取睡觉金币失败:'+donesleep.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 查询每日点击任务状态
function clickTaskStatus() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let clicktaskstatus ={
    url: `${BBB_API}user/renwu`,
    headers: JSON.parse(CookieVal[i]),
    body: `idfa=${JSON.parse(CookieVal[i])['idfa']}&`,
}
   $.post(clicktaskstatus,async(error, response, data) =>{
     const clicktask = JSON.parse(data)
      if(clicktask.first.admobile_st != 2) {
$.log('\n🔔开始查询每日点击任务状态\n')
          await checkDailyClickAdId()
         }else{
          $.log('\n⚠️每日点击广告任务已上限\n')
         }
       resolve()
    })
   })
  } 
// 查询每日观看广告任务状态
function watchTaskStatus() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let watchtaskstatus ={
    url: `${BBB_API}user/renwu`,
    headers: JSON.parse(CookieVal[i]),
    body: `idfa=${JSON.parse(CookieVal[i])['idfa']}&`,
}
   $.post(watchtaskstatus,async(error, response, data) =>{
     const watchtask = JSON.parse(data)
$.log('\n🔔开始查询每日观看广告任务状态\n')
       if(watchtask.v_st != 2) {
$.log('\n🔔每日观看广告任务状态查询成功,1s后查询每日观看广告ID\n')
          await $.wait(1000)
          await checkDailyWatchAdId()
         }else{
          $.log('\n⚠️每日看广告任务已上限\n')
         }
       resolve()
    })
   })
  } 

// 查询每日观看广告ID
function checkDailyWatchAdId() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checkdailywatchadid ={
    url: `${BBB_API}user/chuansj`,
    headers: JSON.parse(CookieVal[i]),
    body: `mini_pos=0&c_type=1&`,
}
   $.post(checkdailywatchadid,async(error, response, data) =>{
$.log('\n🔔开始查询每日观看广告ID\n')
     const dailywatchid = JSON.parse(data)
      if(dailywatchid.code == 1) {
      dailyWatchStr = dailywatchid.nonce_str
         // $.log('\n'+dailyWatchStr+'\n')
          $.log('\n🎉查询成功,30s后领取奖励\n')
          await $.wait(30000)
          await DailyWatchAd()
           }
          resolve()
    })
   })
  } 

// 领取每日观看奖励
function DailyWatchAd() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let dailywatchad ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${dailyWatchStr}&tid=9&pos=1&`,
}
   $.post(dailywatchad,async(error, response, data) =>{
     const dailywatch = JSON.parse(data)
$.log('\n🔔开始领取每日观看奖励\n')
      if(dailywatch.code == 1) {
          $.log('\n🎉每日观看奖励领取成功,5m(300s)后查询下一次广告\n')
          for(let i=1;i<=60;i++){
              (function(){
                  setTimeout(() => {
                    $.log('\n⏱请等待'+(60-i)*5+'s后查询下一次广告\n')
                  }, 5000*i);
              })()
          }
          await $.wait(300000)
          await watchTaskStatus()
           }else{
          $.log('\n⚠️每日奖励领取失败:'+dailywatch.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 查询每日广告ID
function checkDailyClickAdId() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checkdailyclickadid ={
    url: `${BBB_API}user/admobile_show`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(checkdailyclickadid,async(error, response, data) =>{
$.log('\n🔔开始查询每日广告ID\n')
     const dailyclickid = JSON.parse(data)
      if(dailyclickid.code == 1) {
      dailyClickAdId = dailyclickid.ad_id
         // $.log('\n'+dailyClickAdId+'\n')
          $.log('\n🎉查询成功,1s后领取奖励\n')
          await $.wait(1000)
          await checkDailyClickAd()
           }
          resolve()
    })
   })
  } 

// 查询每日广告点击ID
function checkDailyClickAd() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checkdailyclickad ={
    url: `${BBB_API}user/admobile_click`,
    headers: JSON.parse(CookieVal[i]),
    body: `ad_id=${dailyClickAdId}&`,
}
   $.post(checkdailyclickad,async(error, response, data) =>{
$.log('\n🔔开始查询每日广告点击ID\n')
     const dailyclick = JSON.parse(data)
      if(dailyclick.code == 1) {
      dailyClickStr = dailyclick.nonce_str
         // $.log('\n'+dailyClickStr+'\n')
          $.log('\n🎉查询成功,5s后返回领取奖励\n')
          await $.wait(5000)
          await DailyClickAd()
           }
          resolve()
    })
   })
  } 
// 领取每日点击奖励
function DailyClickAd() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let dailyclickad ={
    url: `${BBB_API}user/admobile_done`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${dailyClickStr}&ad_id=${dailyClickAdId}&`,
}
   $.post(dailyclickad,async(error, response, data) =>{
     const dailyclick = JSON.parse(data)
$.log('\n🔔开始领取每日点击奖励\n')
      if(dailyclick.code == 1) {
          $.log('\n🎉每日点击奖励领取成功,1s后查询下一次广告ID\n')
          await $.wait(1000)
          await clickTaskStatus()
           }else{
          $.log('\n⚠️每日点击领取失败:'+dailyclick.msg+'\n')
           }
          resolve()
    })
   })
  } 

// 查询首页状态
function checkHomeJin() {
  $.log('\n🔔开始查询首页状态\n')
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let checkhomejin ={
      url: `${BBB_API}user/home`,
      headers: JSON.parse(CookieVal[i]),
    }
    $.post(checkhomejin,async(error, response, data) =>{
      const checkhomejb = JSON.parse(data)
      if(checkhomejb.right_st !=2 && checkhomejb.right_time > 0){
        $.log('\n🔔开始查询首页金币状态\n')
        $.log('\n🔔等待'+(checkhomejb.right_time+5)+'s领取首页金币')
        await $.wait(checkhomejb.right_time*1000+5000)
        await homeJin()
      }else if(checkhomejb.right_st == 0 && checkhomejb.right_time <= 0){
        $.log('\n🔔开始查询首页金币状态\n')
        await homeJin()
      }else if(checkhomejb.right_st == 0 && checkhomejb.right_jinbi_st == 0){
        $.log('\n🔔开始查询首页金币状态\n')
        await homeJin()
      }else if (checkhomejb.right_st == 2 && checkhomejb.steps_btn_st == 1) {
        $.log('\n🔔开始查询步数状态\n')
        await doneJin()
      }else if (checkhomejb.jinbi_st == 1 && checkhomejb.jinbi == 600) {
        $.log('\n🔔步数超过6000步，领取超额金币\n')
        await doneJinS()
      }else if(checkhomejb.right_st == 2 && checkhomejb.jindan_show != 2){
        $.log('\n🔔开始查询首页金蛋状态\n')
        $.log('\n🔔等待'+(checkhomejb.jindan_djs+5)+'s领取金蛋奖励')
        await $.wait(checkhomejb.jindan_djs*1000+5000)
        await checkGoldEggId()
      }else if(checkhomejb.right_st == 2 && checkhomejb.jindan_show == 2 && checkhomejb.hb_st == 0){
        $.log('\n🔔开始查询首页紅包状态\n')
        await checkRedBagId()
      }else if(checkhomejb.right_st == 2 && checkhomejb.jindan_show == 2 && checkhomejb.hb_st == 1){
        $.log('\n🔔开始查询首页紅包状态\n')
        $.log('\n🔔等待'+(checkhomejb.hb_time+5)+'s领取首页紅包')
        time = checkhomejb.hb_time+5
        for(let i=1;i<=(time/5);i++){
          (function(){
            setTimeout(() => {
              $.log('\n⏱请等待'+((time/5-i)*5)+'s后领取首页紅包\n')
            }, 5000*i);
          })()
        }
        await $.wait(checkhomejb.hb_time*1000+5000)
        await checkRedBagId()
      }else if(checkhomejb.right_st == 2 && checkhomejb.jindan_show == 2 && checkhomejb.hb_time < 0){
        await checkRedBagId()
      }else if(checkhomejb.right_st == 2 && checkhomejb.jindan_show == 2 && checkhomejb.hb_st == 2){
        $.log('\n🔔首页金币状态:'+checkhomejb.right_text+'\n🔔首页紅包状态:'+checkhomejb.hb_text+'\n🔔首页金蛋状态:'+checkhomejb.jindan_text+'\n'+'\n🔔首页步数状态:'+checkhomejb.steps_btn+'\n')
      }
      resolve()
    })
  })
} 

// 领取首页金币
function homeJin() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let homejin ={
    url: `${BBB_API}user/homejin`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(homejin,async(error, response, data) =>{
     const homejb = JSON.parse(data)
     if(homejb.code == 1){
$.log('\n🔔开始领取首页金币\n')
          $.log('\n🎉首页金币:'+homejb.msg+'\n金币+ '+homejb.jinbi+'等待30s后开始翻倍金币\n')
         homeJinStr = homejb.nonce_str
          //$.log('\n'+homeJinStr+'\n')
          await $.wait(30000)
          await homeJinCallBack()
    }else{
          $.log('\n⚠️首页金币失败:'+homejb.msg+'\n')
           }
          resolve()
    })
   })
  } 


// 翻倍首页金币
function homeJinCallBack() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let homejincallback ={
      url: `${BBB_API}you/callback`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${homeJinStr}&tid=21&pos=1&`,
    }
    $.post(homejincallback,async(error, response, data) =>{
      const hmjcallback = JSON.parse(data)
      $.log('\n🔔开始翻倍首页金币\n')
      if(hmjcallback.code == 1) {
        $.log('\n🎉首页金币翻倍成功\n')
        await checkHomeJin()
      }else{
        $.log('\n🔔首页金币翻倍失败'+hmjcallback.msg+'\n')
      }
      resolve()
    })
  })
} 

// 查询首页紅包ID
function checkRedBagId() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let checkredbagid ={
      url: `${BBB_API}user/chuansj`,
      headers: JSON.parse(CookieVal[i]),
      body: `c_type=2`,
    }
    $.post(checkredbagid,async(error, response, data) =>{
      $.log('\n🔔开始查询首页紅包ID\n')
      const code = JSON.parse(data)
      if(code.code == 1) {
        redBagStr = code.nonce_str
        $.log('\n🔔查询首页紅包ID成功,等待31s后领取首页紅包\n')
        await $.wait(31000)
        await redBagCallback()
      }
      resolve()
    })
  })
} 

// 领取首页紅包
function redBagCallback() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let redbagcallback ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${redBagStr}&tid=17&pos=1&`,
}
   $.post(redbagcallback,async(error, response, data) =>{
     const redbag = JSON.parse(data)
$.log('\n🔔开始领取首页紅包\n')
      if(redbag.code == 1) {
          $.log('\n🎉首页紅包领取成功\n')
          await checkHomeJin()
           }else{
          $.log('\n⚠️首页紅包领取失败:'+redbag.msg+'\n')
          await checkHomeJin()
           }
          resolve()
    })
   })
  } 

// 查询首页金蛋ID
function checkGoldEggId() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checkgoldeggid ={
    url: `${BBB_API}user/jindan_click`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(checkgoldeggid,async(error, response, data) =>{
     const goldeggid = JSON.parse(data)
      if(goldeggid.code == 1) {
$.log('\n🔔金蛋ID data'+data)
$.log('\n🔔开始查询首页金蛋ID\n')
      goldEggStr = goldeggid.nonce_str
          $.log('\n'+goldEggStr+'\n')
      goldEggId = goldeggid.taskid
          $.log('\n'+goldEggId+'\n')
          await goldEggDone()
           }else{
          $.log('\n⚠️首页金蛋失败:'+goldeggid.msg+'\n')
          await checkHomeJin()
        }
          resolve()
    })
   })
  } 
// 领取首页金蛋奖励
function goldEggDone() {
return new Promise((resolve, reject) => {
  let timestamp= Date.parse(new Date())/1000;
  let goldeggdone ={
    url: `${BBB_API}user/jindan_done`,
    headers: JSON.parse(CookieVal[i]),
    body: `taskid=${goldEggId}&clicktime=${timestamp}&donetime=${timestamp}+1000&nonce_str=${goldEggStr}&`
}
   $.post(goldeggdone,async(error, response, data) =>{
     const goldegg2 = JSON.parse(data)
      if(goldegg2.code == 1) {
$.log('\n🔔开始领取首页金蛋奖励\n')
          $.log('\n🎉首页金蛋:'+goldegg2.msg+'\n金币+ '+goldegg2.jinbi+'\n')
          await goldEggCallback()
           }else{
          $.log('\n⚠️首页金蛋失败:'+goldegg2.msg+'\n')
          await checkHomeJin()
           }
          resolve()
    })
   })
  } 

// 翻倍首页金蛋
function goldEggCallback() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let goldeggcallback ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${goldEggStr}&tid=5&pos=1&`,
}
   $.post(goldeggcallback,async(error, response, data) =>{
     const goldeggback = JSON.parse(data)
$.log('\n🔔开始翻倍首页金蛋\n')
      if(goldeggback.code == 1) {
          $.log('\n🎉金蛋翻倍成功\n')
          await checkHomeJin()
           }else{
          $.log('\n⚠️金蛋翻倍失败:'+goldeggback.msg+'\n')
          await checkHomeJin()
           }
          resolve()
    })
   })
  } 
// 查询助力视频状态
function helpStatus() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let helpstatus ={
      url: `${BBB_API}user/help_index`,
      headers: JSON.parse(CookieVal[i]),
    }
    $.post(helpstatus,async(error, response, data) =>{
      const help = JSON.parse(data)
      $.log('\n🔔开始查询助力视频状态\n')
      if(help.status == 0) {
        $.log('\n🔔查询助力视频状态成功, 1s后获取助力视频ID\n')
        await checkCode()
      }else{
        $.log('\n🔔今日助力已上限,请明天再試!\n')
      }
      resolve()
    })
  })
} 

// 查询助力视频ID
function checkCode() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let checkcode ={
      url: `${BBB_API}user/chuansj`,
      headers: JSON.parse(CookieVal[i]),
      body: `mini_pos=5`,
    }
    $.post(checkcode,async(error, response, data) =>{
      const code = JSON.parse(data)
      $.log('\n🔔开始查询助力视频ID\n')
      if(code.code == 1) {
        nonce_str = code.nonce_str
        $.log('\n🔔查询助力视频ID成功, 开始观看助力视频\n')
        await helpClick()
      }
      resolve()
    })
  })
} 

// 观看助力视频
function helpClick() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let helpclick ={
      url: `${BBB_API}user/help_click`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${nonce_str}`,
    }
    $.post(helpclick,async(error, response, data) =>{
      const help = JSON.parse(data)
      if(help.code == 1) {
        $.log('\n🔔开始观看助力视频, 32s后领取助力视频奖励\n')
        await $.wait(32000)
        $.log('\n🎉观看助力视频成功, 1s后领取金币+ '+help.jinbi+'\n')
        await callBack()
      }else{
        $.log('\n⚠️观看助力视频失败: '+help.msg+'\n')
      }
      resolve()
    })
  })
} 


// 领取助力视频奖励
function callBack() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let callback ={
      url: `${BBB_API}you/callback`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${nonce_str}&tid=22&pos=1&`,
    }
    $.post(callback,async(error, response, data) =>{
      const back = JSON.parse(data)
      $.log('\n🔔开始领取助力视频奖励\n')
      if(back.code == 1) {
        $.log('\n🎉领取助力视频奖励成功,1s后查询下一次助力视频状态\n')
        await $.wait(1000)
        await helpStatus()
      }else{
        $.log('\n⚠️助力视频奖励失败:'+back.msg+'\n')
      }
      resolve()
    })
  })
} 

// 查询新闻ID
function getNewsId() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let getnewsid ={
    url: `${BBB_API}user/news`,
    headers: JSON.parse(CookieVal[i]),
    body: `type_class=1`
}
   $.post(getnewsid,async(error, response, data) =>{
     const newsid = JSON.parse(data)
     if(newsid.code == 1){
       if(newsid.is_first == -1 && newsid.is_max == 0){
          $.log('\n🔔开始查询新闻ID\n')
          newsStr = newsid.nonce_str
          $.log('\n🎉新闻ID查询成功,每15s领取阅读奖励\n')
          for (var m = 0; m < 3; m++) {
            $.log(`\n🎉同一篇新闻第`+(m+1)+`次阅读\n`)
            await $.wait(15000)
            await autoRead()
          }
          $.log('\n3次阅读完成，开始查询下一篇新闻ID\n')
          await getNewsId()
        }else{
          $.log('\n⚠️阅读失败: 今日阅读已上限\n')
          await checkLuckNum()
         }}else{
          $.log('\n⚠️查询新闻ID失败:'+newsid.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 阅读
function autoRead() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let autoread ={
      url: `${BBB_API}user/donenews`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${newsStr}`,
    }
    $.post(autoread,async(error, response, data) =>{
      const read = JSON.parse(data)
      if(read.code == 1) {
        $.log('\n🎉阅读成功,金币+ '+read.jinbi+'💰\n')
      }else{
        $.log('\n⚠️阅读失败:'+data+'\n')
      }
      resolve()
    })
  })
} 
// 查询抽奖次数
function checkLuckNum() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let lucknum ={
    url: `${BBB_API}user/lucky`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(lucknum,async(error, response, data) =>{
     const num = JSON.parse(data)
$.log('\n🔔开始查询抽奖次数\n')
      if(num.lucky_num != 0) {
          $.log('\n🎉剩余抽奖次数:'+num.lucky_num+'1s后开始抽奖\n')
          await $.wait(1000)
          await luckyClick()
         }else if(num.lucky_num == 0) {
          $.log('\n⚠️今日抽奖次数已用完,1s后查询宝箱状态\n')
          await $.wait(1000)
       for (box of num.lucky_box){
          //$.log(box)
          if (box != 2)
          await luckyBox()
          if (box == 2)
          $.log('\n⚠️宝箱已开启\n')
         }
       }
          resolve()
    })
   })
  } 
// 开始抽奖
function luckyClick() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let luckclick ={
    url: `${BBB_API}user/lucky_click`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(luckclick,async(error, response, data) =>{
     const lucky = JSON.parse(data)
$.log('\n🔔开始抽奖\n')
      if(lucky.code == 1) {
          $.log('\n🎉抽奖:'+lucky.msg+'\n金币+ '+lucky.jinbi+'\n')
         luckyStr = lucky.nonce_str
          //$.log('\n'+luckyStr+'\n')
      if(lucky.jinbi != 0) {
          await $.wait(5000)
          await luckyCallBack()
         }else{
          await luckyClick()
         }
       }
          resolve()
    })
   })
  } 

// 翻倍抽奖
function luckyCallBack() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let luckycallback ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${luckyStr}&tid=16&pos=1&`,
}
   $.post(luckycallback,async(error, response, data) =>{
     const callback = JSON.parse(data)
$.log('\n🔔开始翻倍抽奖\n')
      if(callback.code == 1) {
          $.log('\n🎉抽奖翻倍成功\n')
          await $.wait(5000)
          await luckyClick()
           }else{
          $.log('\n⚠️抽奖翻倍失败:'+callback.msg+'\n')
           }
          resolve()
    })
   })
  } 
// 打开宝箱
function luckyBox() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let luckybox ={
    url: `${BBB_API}user/lucky_box`,
    headers: JSON.parse(CookieVal[i]),
    body: `box=${getBoxId()}&`,
}
//$.log('\nlockyboxBODY:'+luckybox.body+'\n')
   $.post(luckybox,async(error, response, data) =>{
     const boxlucky = JSON.parse(data)
$.log('\n🔔开始打开宝箱\n')
      if(boxlucky.code == 1) {
          $.log('🎉宝箱: '+boxlucky.msg+'\n金币+ '+boxlucky.jinbi+'\n')
         luckyBoxStr = boxlucky.nonce_str
          $.log('\n🔔宝箱翻倍ID'+luckyBoxStr+'\n')
          await $.wait(5000)
          await luckyBoxCallBack()
         }else{
          $.log('\n⚠️宝箱失败:'+boxlucky.msg+'\n')
         }
          resolve()
    })
   })
  } 
// 翻倍宝箱
function luckyBoxCallBack() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let luckyboxcallback ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${luckyBoxStr}&tid=16&pos=1&`,
}
   $.post(luckyboxcallback,async(error, response, data) =>{
     const boxcallback = JSON.parse(data)
$.log('\n🔔开始翻倍宝箱\n')
      if(boxcallback.code == 1) {
          $.log('\n🎉宝箱翻倍成功\n')
          await $.wait(1000)
           }else{
          $.log('\n⚠️宝箱翻倍失败'+boxcallback.msg+'\n')
           }
          resolve()
    })
   })
  } 


// 查询答題ID
function getQuestionId() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let getquestionid ={
    url: `${BBB_API}mini/cy_info`,
    headers: JSON.parse(CookieVal[i]),
}
   $.post(getquestionid,async(error, response, data) =>{
     const question = JSON.parse(data)
      if(question.code == 1 && question.day_num != 0) {
$.log('\n🔔开始查询答題ID\n')
         questionSite = question.site
          $.log('\n🎉答題ID1⃣️: '+questionSite+'\n')
         questionId = question.cy_id
          $.log('\n🎉答題ID2⃣️: '+questionId+'\n')
         spId = question.day_num
          $.log('\n🎉答題视频: '+spId+'\n')
      if(question.is_sp == 1) {
          await $.wait(5000)
          await checkSp()
         }else{
          await answerQue()
         }}else{
          $.log('\n⚠️查询答題ID成功,答題失败: 今日答題已上限\n')
         }
          resolve()
    })
   })
  } 

function checkSp() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let checksp ={
    url: `${BBB_API}user/chuansj`,
    headers: JSON.parse(CookieVal[i]),
    body: `mini_pos=1&c_type=1&`,
}
   $.post(checksp,async(error, response, data) =>{
     const sp = JSON.parse(data)
      if(sp.code == 1) {
      spStr = sp.nonce_str
          //$.log('\n'+spStr+'\n')
          await $.wait(5000)
          await cySp()
           }
          resolve()
    })
   })
  } 

function cySp() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let cysp ={
    url: `${BBB_API}mini/cy_sp`,
    headers: JSON.parse(CookieVal[i]),
    body: `day_num=${spId}&`,
}
   $.post(cysp,async(error, response, data) =>{
     const sp = JSON.parse(data)
      if(sp.code == 1) {
         // $.log('\n'+sp.msg+'\n')
          //await $.wait(5000)
          await answerQue()
           }
          resolve()
    })
   })
  } 
// 开始答題
function answerQue() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let answerque ={
    url: `${BBB_API}mini/cy_click`,
    headers: JSON.parse(CookieVal[i]),
    body: `cy_id=${questionId}&site=${questionSite}&`,
}
//$.log('\nanswerqueBODY:'+answerque.body+'\n')
   $.post(answerque,async(error, response, data) =>{
     const answer = JSON.parse(data)
$.log('\n🔔开始答題\n')
      if(answer.code == 1) {
          $.log('\n🎉答題: '+answer.msg+'\n金币+ '+answer.jinbi+'\n')
         answerStr = answer.nonce_str
          $.log('\n🎉答題翻倍ID:'+answerStr+'\n')
          await $.wait(5000)
          await answerQueCallBack()
         }else{
          $.log('\n⚠️答題失败: '+answer.msg+'\n')
         }
          resolve()
    })
   })
  } 

// 翻倍答題金币
function answerQueCallBack() {
return new Promise((resolve, reject) => {
  let timestamp=new Date().getTime();
  let answerquecallback ={
    url: `${BBB_API}you/callback`,
    headers: JSON.parse(CookieVal[i]),
    body: `nonce_str=${answerStr}&tid=18&pos=1&`,
}
//$.log('\nanswerQueCallBackBODY:'+answerquecallback.body+'\n')
   $.post(answerquecallback,async(error, response, data) =>{
     const answerback = JSON.parse(data)
$.log('\n🔔开始翻倍答題金币\n')
      if(answerback.code == 1) {
          $.log('\n🎉答題金币翻倍成功\n')
          await $.wait(5000)
          await getQuestionId()
           }else{
          $.log('\n⚠️答題金币翻倍失败:'+answerback.msg+'\n')
           }
          resolve()
    })
   })
  } 

// 领取步数金币
function doneJin() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let donejin ={
      url: `${BBB_API}user/donejin`,
      headers: JSON.parse(CookieVal[i]),
    }
    $.post(donejin,async(error, response, data) =>{
      const donejb = JSON.parse(data)
      if(donejb.code == 1){
        $.log('\n🔔开始领取步数金币\n')
        $.log('\n🎉步数金币:'+donejb.msg+'\n金币+ '+donejb.jinbi+'，等待30s后开始翻倍金币\n')
        doneJinStr = donejb.nonce_str
        await $.wait(30000)
        await doneJinCallBack()
      }else{
        $.log('\n⚠️步数金币失败：'+donejb.msg+'\n')
      }
      resolve()
    })
  })
} 


// 翻倍步数金币
function doneJinCallBack() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let donejincallback ={
      url: `${BBB_API}you/callback`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${doneJinStr}&tid=19&pos=1&`,
    }
    $.post(donejincallback,async(error, response, data) =>{
      const bsjcallback = JSON.parse(data)
      $.log('\n🔔开始翻倍步数金币\n')
      if(bsjcallback.code == 1) {
        $.log('\n🎉步数金币翻倍成功\n')
        await checkHomeJin()
      }else{
        $.log('\n🔔步数金币翻倍失败：'+bsjcallback.msg+'\n')
      }
      resolve()
    })
  })
}

// 领取超过步数限额金币
function doneJinS() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let donejins ={
      url: `${BBB_API}user/donejin`,
      headers: JSON.parse(CookieVal[i]),
    }
    $.post(donejins,async(error, response, data) =>{
      const donejbs = JSON.parse(data)
      if(donejbs.code == 1){
        $.log('\n🔔开始领取超过步数限额金币\n')
        $.log('\n🎉超过步数限额,领取'+donejbs.jinbi+'金币:'+donejbs.msg+'\n')
      }else{
        $.log('\n⚠️步数限额金币失败:'+donejbs.msg+'\n')
      }
      resolve()
    })
  })
}

//查询看看賺mini_id
function checkH5Id() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let checkh5id ={
      url: `${BBB_API}user/h5_list?page=1&page_limit=15`,
      headers: JSON.parse(CookieVal[i]),
    }
    $.post(checkh5id,async(error, response, data) =>{
      const checkh5 = JSON.parse(data)
      if(response.statusCode == 200){
        for(ID of checkh5){
          H5ID = ID.mini_id
          $.log('\nmini_id：'+H5ID+'\n')
          await doTaskH5()
        }
      }
  resolve()
    })
  })
}

//查询看看賺nonce_str和taskid
function doTaskH5() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let dotaskh5 ={
      url: `${BBB_API}user/h5_news`,
      headers: JSON.parse(CookieVal[i]),
      body: `mini_id=${H5ID}`,
    }
    $.post(dotaskh5,async(error, response, data) =>{
      const doh5task = JSON.parse(data)
      $.log('\ndoTaskH5：'+data+'\n')
        if(response.body.indexOf('nonce_str') != -1) {
          H5Str = doh5task.nonce_str
          $.log('\nH5Str：'+H5Str+'\n')
          H5TaskID = doh5task.taskid
          $.log('\nH5TaskID：'+H5TaskID+'\n')
          await $.wait(30000)
          await upLoadTime2()
        }else{
          $.log('\n'+data+'\n')
        }
  resolve()
    })
  })
}

function upLoadTime() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let uploadtime ={
      url: `https://wapinformation.dfxwdc.com/wapreport/screen_show?encodedMsg=cWlkMTAyNjcJMTYxMDkxODY0MzAyMjkwNTYJbmV3cwllYXN0ZGF5X3dhcG5ld3MJanVuc2hpCWRmdHQtNzcxMjNkYWI3MC04YWFmCXRvdXRpYW8JaHR0cHM6Ly90b3V0aWFvLmVhc3RkYXkuY29tLwlqdW5zaGkJMQkxCTAJLy9taW5pLmVhc3RkYXkuY29tL21vYmlsZS8yMTAxMTYxMTU0MTE5NTU1NTE3NzcuaHRtbAl0b3V0aWFvCWp1bnNoaQ%3D%3D&_=1610918646639&jsonpcallback=Zepto${timestamp}`,
      headers: {"Accept": "*/*","Accept-Encoding": "gzip, deflate, br","Accept-Language": "zh-cn","Connection": "keep-alive","Host": "wapunionstatis.dfxwdc.com","Referer": "https://toutiao.eastday.com/?qid=qid10267","User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",},
      timeout: 30000,
    }
    $.get(uploadtime,async(error, response, data) =>{
      $.log('\nupLoadTime:'+timestamp+'\n'+data+'\n')
      await $.wait(30000)
      await h5Done()
      resolve()
    })
  })
} 

function upLoadTime2() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let uploadtime ={
      url: `https://api.clotfun.online/tiger/getConfig/a0d2cb8e06bd53b0530f8786624999db?hdggHtmlId=675`,
      headers: {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",},
      timeout: 30000,
    }
    $.get(uploadtime,async(error, response, data) =>{
      $.log('\nupLoadTime2:'+data+'\n')
      await $.wait(30000)
      await h5Done()
      resolve()
    })
  })
} 


//开始看看賺
function h5Done() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let h5done ={
      url: `${BBB_API}user/h5_newsdone`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${H5Str}&taskid=${H5TaskID}`,
      timeout: 31000,
    }
    $.post(h5done,async(error, response, data) =>{
      const doneh5 = JSON.parse(data)
      if(doneh5.code == 1) {
        $.log('\n看看賺成功, 金币+ '+doneh5.jinbi+'，31秒后翻倍金币\n')
        h5DoneStr = doneh5.fb_str
        await $.wait(31000)
        await h5DoneCallBack()
      }else{
        $.log('\n看看賺发生错误：'+doneh5.msg+'\n')
      }
      resolve()
    })
  })
}

// 翻倍看看賺金币
function h5DoneCallBack() {
  return new Promise((resolve, reject) => {
    let timestamp=new Date().getTime();
    let donejincallback ={
      url: `${BBB_API}you/callback`,
      headers: JSON.parse(CookieVal[i]),
      body: `nonce_str=${h5DoneStr}&tid=19&pos=1&`,
    }
    $.post(donejincallback,async(error, response, data) =>{
      const bsjcallback = JSON.parse(data)
      $.log('\n🔔开始翻倍看看賺金币\n')
      if(bsjcallback.code == 1) {
        $.log('\n🎉看看賺金币翻倍成功\n')
        await checkHomeJin()
      }else{
        $.log('\n🔔 看看賺金币翻倍失败'+bsjcallback.msg+'\n')
      }
      resolve()
    })
  })
}



function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
