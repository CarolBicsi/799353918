import {
  segment
} from 'icqq'
import plugin from '../../lib/plugins/plugin.js'

let msgsscr = false // 消息转发信息是否为bot,false为是，true为否
let selilo = 2 // 默认数量
const url = 'https://api.wdvipa.com/sj'

export class St extends plugin {
  constructor () {
    super({
      name: 'lolicon',
      dsc: 'st',
      event: 'message',
      priority: 1,
      rule: [{
        reg: '^原神((\\d+)|(.*))',
        fnc: 'js'
      }, {
        reg: '^sst',
        fnc: 'sst'
      }]
    })
  }

  // 获取图片并利用本文件makeForwardMsg函数制作转发消息
  async js (e) {
    let num = e.msg.match(/\d+/) || selilo
    let dec = '已帮你整理好了'
    let sule = `正在给你找图片啦～\n 数量${num}张获取中～`
    let res
    let msg
    let msgList = []
    await e.reply(sule, true, {
      recallMsg: 0
    })
    for (let i = 0; i < [num]; i++) {
      msg = `已获取图片第${i + 1}张`
      res = await segment.image(url)
      msgList.push(res)
      console.log(msg)
    }
    let forwardMsg = await this.makeForwardMsg(dec, msgList) // 借助makeForwardMsg函数制作转发消息
    await e.reply(forwardMsg) // 发送消息
  }

  // 制作转发消息（因为yunzai的制作转发消息函数传入值不包含描述项，所以重写函数并添加对应判断）
  async makeForwardMsg (title, msg) {
    let nickname =
            msgsscr === false ? Bot.nickname : this.e.sender.card || this.e.user_id
    let id =
            msgsscr === false ? Bot.uin : this.e.user_id
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.nickname
    }
    let userInfo = {
      nickname,
      user_id: id
    }

    let forwardMsg = [
      {
        ...userInfo,
        message: title
      },
      {
        ...userInfo,
        message: msg
      }
    ]

    /** 制作转发内容 */
    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }

    /** 处理描述 */
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)

    return forwardMsg
  }
}
