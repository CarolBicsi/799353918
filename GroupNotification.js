import plugin from '../../lib/plugins/plugin.js'
import common from '../../lib/common/common.js'
import moment from 'moment'
import {
    segment
} from 'icqq'
export class newcomer extends plugin {
    constructor() {
        super({
            name: '群通知',
            dsc: '群变动',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'notice.group',
            priority: 5000,
        })
    }
    async accept(e) {
        let msg
        let forwardMsg
        switch (e.sub_type) {
            case 'increase':
                {
                    if (e.user_id === Bot.uin) {
                        msg = segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`), `我是小胡桃\n大家快来欢迎我`;
                    } else if (e.user_id !== Bot.uin) {
                        msg = [
                            `[通知 - 新增群员]\n`,
                            segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${e.user_id}&spec=640&img_type=jpg`),
                            segment.at(e.user_id),
                            `新成员QQ：${e.user_id}\n`,
                            `新成员昵称：${e.nickname}\n`,
                            `您好我是本群的小小助手\n`,
                            `欢迎${e.nickname}加入米游大世界\n`
                        ]
                    }
                    break
                }
            case 'decrease':
                {
                    if (e.operator_id == e.user_id) {
                        msg = [
                            segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${e.user_id}&spec=640&img_type=jpg`),
                            `[通知 - 群员退群]\n`,
                            `退群人QQ：${e.user_id}\n`,
                            `退群人昵称：${e.member.nickname}\n`,
                            `退群人群名片：${e.member.card}\n`
                        ]
                    } else if (e.operator_id !== e.user_id) {
                        msg = [
                            segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${e.user_id}&spec=640&img_type=jpg`),
                            '[通知 - 群员被踢]\n',
                            `操作人QQ：${e.operator_id}\n`,
                            `被踢人QQ：${e.user_id}\n`,
                            `被踢人昵称：${e.member.nickname}\n`,
                            `被踢人群名片：${e.member.card}\n`
                        ]
                    }
                    break
                }
            case 'admin':
                {
                    e.set ? logger.mark('机器人被设置管理') : logger.mark('机器人被取消管理');
                    if (e.user_id === Bot.uin) {
                        msg = [
                            segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
                            (e.set ? '[通知 - 机器人被设置管理]:\n' : '[通知 - 机器人被取消管理]:\n')
                        ]
                    } else {
                        e.set ? logger.mark('新增群管理员') : logger.mark('取消群管理员');
                        msg = [
                            segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
                            (e.set ? '[通知 - 新增群管理员]:\n' : '[通知 - 取消群管理员]:\n'),
                            `被操作QQ：${e.user_id}\n`
                        ]
                    }
                    break
                }
            case 'recall':
                {
                    // 是否为机器人撤回
                    if (e.user_id === Bot.uin) {
                        return false;
                    }
                    const res = JSON.parse(await redis.get(`notice:messageGroup:${e.message_id}`));
                    if (!res) {
                        return false;
                    }
                    let forwardMsg;
                    let special = '';
                    const msgType = {
                        flash: {
                            msg: () => e.group.makeForwardMsg([{
                                message: segment.image(res[0].url),
                                nickname: e.group.pickMember(e.user_id).card,
                                user_id: e.user_id
                            }]),
                            type: '[闪照]'
                        },
                        record: {
                            msg: () => segment.record(res[0].url),
                            type: '[语音]'
                        },
                        video: {
                            msg: () => segment.video(res[0].file),
                            type: '[视频]'
                        },
                        xml: {
                            msg: () => res,
                            type: '[合并消息]'
                        }
                    };
                    if (msgType[res[0].type]) {
                        forwardMsg = await msgType[res[0].type].msg();
                        special = msgType[res[0].type].type;
                    } else {
                        forwardMsg = await Bot.pickFriend(Config.masterQQ[0]).makeForwardMsg([{
                            message: res,
                            nickname: e.group.pickMember(e.user_id).card,
                            user_id: e.user_id
                        }]);
                    }
                    const isManage = e.operator_id !== e.user_id ? `撤回管理：${e.group.pickMember(e.operator_id).card}(${e.operator_id})\n` : '';
                    const isManageText = isManage ? '群聊管理撤回' : '群聊撤回';
                    const msg = [
                        segment.image(`https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/100`),
                        `[通知 - 群聊${isManage ? '管理' : ''}撤回]\n`,
                        `撤回群名：${e.group_name}\n`,
                        `撤回群号：${e.group_id}\n`,
                        isManage,
                        `${isManage ? '被撤回人' : '撤回人员'}：${e.group.pickMember(e.user_id).card}(${e.user_id})\n`,
                        `撤回时间：${moment(e.time * 1000).format('MM-DD HH:mm:ss')}`,
                        special ? `\n特殊消息：${special}` : ''
                    ];
                    logger.mark(isManageText);
                    break;
                }
            default:
                return false;
        }
        await this.reply(msg)
        if (forwardMsg) await this.reply(forwardMsg)
    }
}