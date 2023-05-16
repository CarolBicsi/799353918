/*
 * @Author: 渔火Arcadia  https://github.com/yhArcadia
 * @Date: 2022-12-02 14:24:49
 * @LastEditors: Arcadia
 * @LastEditTime: 2022-12-04 20:18:03
 * @FilePath: /Yunzai-Bot/plugins/example/tilitixing.js
 * @Description: 
 * 
 * Copyright (c) 2022 by 渔火Arcadia 1761869682@qq.com, All Rights Reserved. 
 */
import plugin from "../../lib/plugins/plugin.js";
import { segment } from "oicq";
import schedule from "node-schedule";
import moment from "moment";
export class tilitixing extends plugin {
  constructor() {
    super({
      name: "tilitixing",
      dsc: "简单开发示例",
      event: "message.group",
      priority: 5000,
      rule: [
        {
          reg: "^#(体力|树脂)(.+)$",
          fnc: "tili",
        }, 
      ],
    });
  }
  /**
   * @param {*} e
   * @return {*}
   */
  async tili(e) {
    let now = NaN
    let to = NaN
    let reg1 = /^#(体力|树脂)(\d{1,3})\/(\d{1,3})/
    let reg2 = /^#(体力|树脂)(\d{1,3})/
    if (reg1.test(e.msg)) {
      now = reg1.exec(e.msg)[2] * 1
      to = reg1.exec(e.msg)[3] * 1
    }
    else if (reg2.test(e.msg)) {
      now = reg2.exec(e.msg)[2] * 1
      to = 160
    }
    else return false

    logger.warn(now, to);

    if (now < 0 || now > 159 || to < 1 || to > 160 || now >= to) return false

    let minute = (to - now) * 8
    redis.set(`Yz:tilitixing:${e.user_id}`, JSON.stringify({ qq: e.user_id, gid: e.group_id, to: to, }), { EX: minute * 60 })
    let time = moment(Date.now()).add(minute, "minutes").format("HH:mm"); 
    e.reply([`当前体力${now}，预计${time}恢复至${to}`, "，成功预约提醒~"], true)
    return true
  }
}

schedule.scheduleJob("0/30 * * * * ? ", async () => {
  let li = await redis.keys(`Yz:tilitixing:*`)
  for (let val of li) { 
    let ttl = await redis.ttl(val) 
    if (ttl < 40) {
      let data = await redis.get(val)
      tixing(JSON.parse(data), ttl)
      redis.del(val)
    }
  }
})

/**
 * @param {*} data 用户体力数据
 * @param {*} ttl 该redis key 的TTL
 * @return {*}
 */
async function tixing(data, ttl) {
  let g = Bot.pickGroup(Number(data.gid))

  setTimeout(() => {
    g.sendMsg([segment.at(data.qq * 1), `体力已经恢复到${data.to * 1}啦！`]),
      g.pokeMember(data.qq * 1);
  }, (ttl - 2) * 1000);

  setTimeout(() => {
    g.sendMsg([segment.at(data.qq * 1), `醒醒，体力已经恢复到${data.to * 1}啦！`])
    g.pokeMember(data.qq * 1);
  }, (ttl - 1) * 1000);

  setTimeout(() => {
    g.sendMsg([segment.at(data.qq * 1), `快醒醒！！，体力已经恢复到${data.to * 1}啦！！`])
    g.pokeMember(data.qq * 1);
  }, (ttl) * 1000);

  setTimeout(() => {
    g.pokeMember(data.qq * 1);
  }, (ttl + 1) * 1000); 
}