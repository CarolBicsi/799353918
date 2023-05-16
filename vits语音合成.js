import plugin from '../../lib/plugins/plugin.js';
import fetch from 'node-fetch'
import fs from 'fs'
import _ from 'lodash'
import crypto from 'crypto'

let text = ''
let Data = ""
let Speaker = {}
let translation = "关闭"
let language = '中日混合（中文用[ZH][ZH]包裹起来，日文用[JA][JA]包裹起来）'
let noiseScale = 0.6  //情感控制推荐0.6到0.8
let noiseScaleW = 0.668 //发音时长
let lengthScale = 1.6 //语速,数值越大语速越慢
let appid = " " //这里写你的翻译APPID
let miyao = " "  //这里写你的翻译密码
let space = 'https://shikongmengo-vits-uma-genshin-honkai.hf.space/api/generate'
let url = 'https://shikongmengo-vits-uma-genshin-honkai.hf.space/api/generate'
let uploadRecord = ""
let Global = "雷电将军（雷神）"

/*判断是否有枫叶插件，如果有则导入枫叶的高清语音处理方法**/
if(fs.existsSync('plugins/hs-qiqi-plugin/model/uploadRecord.js')) {
    uploadRecord = (await import("../../plugins/hs-qiqi-plugin/model/uploadRecord.js")).default
}

//有bug联系3446737520，应该是没有之前测试了可以正常跑
//翻译接口请到http://api.fanyi.baidu.com/doc/21配置
//想使用高清语音，就安装枫叶插件
//安装插件后发送合成帮助，查看使用方法

let speakers = ['特别周', '无声铃鹿', '东海帝皇（帝宝，帝王）', '丸善斯基', '富士奇迹',
  '小栗帽', '黄金船', '伏特加', '大和赤骥', '大树快车', '草上飞', '菱亚马逊',
  '目白麦昆', '神鹰', '好歌剧', '成田白仁', '鲁道夫象征（皇帝）', '气槽',
  '爱丽数码', '星云天空', '玉藻十字', '美妙姿势', '琵琶晨光', '摩耶重炮',
  '曼城茶座', '美浦波旁', '目白赖恩', '菱曙', '雪中美人', '米浴', '艾尼斯风神',
  '爱丽速子（爱丽快子）', '爱慕织姬', '稻荷一', '胜利奖券', '空中神宫', '荣进闪耀',
  '真机伶', '川上公主', '黄金城（黄金城市）', '樱花进王', '采珠', '新光风',
  '东商变革', '超级小海湾', '醒目飞鹰（寄寄子）', '荒漠英雄', '东瀛佐敦',
  '中山庆典', '成田大进', '西野花', '春丽（乌拉拉）', '青竹回忆', '微光飞驹',
  '美丽周日', '待兼福来', 'mr cb（cb先生）', '名将怒涛（名将户仁）', '目白多伯',
  '优秀素质', '帝王光辉', '待兼诗歌剧', '生野狄杜斯', '目白善信', '大拓太阳神',
  '双涡轮（两立直，两喷射，二锅头，逆喷射）', '里见光钻（萨托诺金刚石）', '北部玄驹',
  '樱花千代王', '天狼星象征', '目白阿尔丹', '八重无敌', '鹤丸刚志', '目白光明',
  '成田拜仁（成田路）', '也文摄辉', '小林历奇', '北港火山', '奇锐骏', '苦涩糖霜',
  '小小蚕茧', '骏川手纲（绿帽恶魔）', '秋川弥生（小小理事长）', '乙名史悦子（乙名记者）',
  '桐生院葵', '安心泽刺刺美', '樫本理子', '神里绫华（龟龟）', '琴', '空（空哥）',
  '丽莎', '荧（荧妹）', '芭芭拉', '凯亚', '迪卢克', '雷泽', '安柏', '温迪',
  '香菱', '北斗', '行秋', '魈', '凝光', '可莉', '钟离', '菲谢尔（皇女）',
  '班尼特', '达达利亚（公子）', '诺艾尔（女仆）', '七七', '重云', '甘雨（椰羊）',
  '阿贝多', '迪奥娜（猫猫）', '莫娜', '刻晴', '砂糖', '辛焱', '罗莎莉亚',
  '胡桃', '枫原万叶（万叶）', '烟绯', '宵宫', '托马', '优菈', '雷电将军（雷神）',
  '早柚', '珊瑚宫心海（心海，扣扣米）', '五郎', '九条裟罗', '荒泷一斗（一斗）',
  '埃洛伊', '申鹤', '八重神子（神子）', '神里绫人（绫人）', '夜兰', '久岐忍',
  '鹿野苑平藏', '提纳里', '柯莱', '多莉', '云堇', '纳西妲（草神）', '深渊使徒',
  '妮露', '赛诺', '债务处理人', '坎蒂丝', '真弓快车', '秋人', '望族', '艾尔菲',
  '艾莉丝', '艾伦', '阿洛瓦', '天野', '天目十五', '愚人众-安德烈', '安顺', '安西',
  '葵', '青木', '荒川幸次', '荒谷', '有泽', '浅川', '麻美', '凝光助手', '阿托',
  '竺子', '百识', '百闻', '百晓', '白术', '贝雅特丽奇', '丽塔', '失落迷迭',
  '缭乱星棘', '伊甸', '伏特加女孩', '狂热蓝调', '莉莉娅', '萝莎莉娅', '八重樱',
  '八重霞', '卡莲', '第六夜想曲', '卡萝尔', '姬子', '极地战刃', '布洛妮娅',
  '次生银翼', '理之律者%26希儿', '理之律者', '迷城骇兔', '希儿', '魇夜星渊',
  '黑希儿', '帕朵菲莉丝', '不灭星锚', '天元骑英', '幽兰黛尔', '派蒙bh3',
  '爱酱', '绯玉丸', '德丽莎', '月下初拥', '朔夜观星', '暮光骑士', '格蕾修',
  '留云借风真君', '梅比乌斯', '仿犹大', '克莱因', '圣剑幽兰黛尔', '妖精爱莉',
  '特斯拉zero', '苍玄', '若水', '西琳', '戴因斯雷布', '贝拉', '赤鸢', '镇魂歌',
  '渡鸦', '人之律者', '爱莉希雅', '天穹游侠', '琪亚娜', '空之律者', '薪炎之律者',
  '云墨丹心', '符华', '识之律者', '特瓦林', '维尔薇', '芽衣', '雷之律者',
  '断罪影舞', '阿波尼亚', '榎本', '厄尼斯特', '恶龙', '范二爷', '法拉',
  '愚人众士兵', '愚人众士兵a', '愚人众士兵b', '愚人众士兵c', '愚人众a', '愚人众b',
  '飞飞', '菲利克斯', '女性跟随者', '逢岩', '摆渡人', '狂躁的男人', '奥兹',
  '芙萝拉', '跟随者', '蜜汁生物', '黄麻子', '渊上', '藤木', '深见', '福本',
  '芙蓉', '古泽', '古田', '古山', '古谷昇', '傅三儿', '高老六', '矿工冒',
  '元太', '德安公', '茂才公', '杰拉德', '葛罗丽', '金忽律', '公俊', '锅巴',
  '歌德', '阿豪', '狗三儿', '葛瑞丝', '若心', '阿山婆', '怪鸟', '广竹', '观海',
  '关宏', '蜜汁卫兵', '守卫1', '傲慢的守卫', '害怕的守卫', '贵安', '盖伊', '阿创',
  '哈夫丹', '日语阿贝多（野岛健儿）', '日语埃洛伊（高垣彩阳）', '日语安柏（石见舞菜香）',
  '日语神里绫华（早见沙织）', '日语神里绫人（石田彰）', '日语白术（游佐浩二）',
  '日语芭芭拉（鬼头明里）', '日语北斗（小清水亚美）', '日语班尼特（逢坂良太）',
  '日语坎蒂丝（柚木凉香）', '日语重云（齐藤壮马）', '日语柯莱（前川凉子）',
  '日语赛诺（入野自由）', '日语戴因斯雷布（津田健次郎）', '日语迪卢克（小野贤章）',
  '日语迪奥娜（井泽诗织）', '日语多莉（金田朋子）', '日语优菈（佐藤利奈）',
  '日语菲谢尔（内田真礼）', '日语甘雨（上田丽奈）', '日语（畠中祐）',
  '日语鹿野院平藏（井口祐一）', '日语空（堀江瞬）', '日语荧（悠木碧）',
  '日语胡桃（高桥李依）', '日语一斗（西川贵教）', '日语凯亚（鸟海浩辅）',
  '日语万叶（岛崎信长）', '日语刻晴（喜多村英梨）', '日语可莉（久野美咲）',
  '日语心海（三森铃子）', '日语九条裟罗（濑户麻沙美）', '日语丽莎（田中理惠）',
  '日语莫娜（小原好美）', '日语纳西妲（田村由加莉）', '日语妮露（金元寿子）',
  '日语凝光（大原沙耶香）', '日语诺艾尔（高尾奏音）', '日语奥兹（增谷康纪）',
  '日语派蒙（古贺葵）', '日语琴（斋藤千和）', '日语七七（田村由加莉）', '日语雷电将军（泽城美雪）',
  '日语雷泽（内山昂辉）', '日语罗莎莉亚（加隈亚衣）', '日语早柚（洲崎绫）', '日语散兵（柿原彻也）',
  '日语申鹤（川澄绫子）', '日语久岐忍（水桥香织）', '日语女士（庄子裕衣）', '日语砂糖（藤田茜）',
  '日语达达利亚（木村良平）', '日语托马（森田成一）', '日语提纳里（小林沙苗）', '日语温迪（村濑步）',
  '日语香菱（小泽亚李）', '日语魈（松冈祯丞）', '日语行秋（皆川纯子）', '日语辛焱（高桥智秋）',
  '日语八重神子（佐仓绫音）', '日语烟绯（花守由美里）', '日语夜兰（远藤绫）', '日语宵宫（植田佳奈）',
  '日语云堇（小岩井小鸟）', '日语钟离（前野智昭）', '杰克', '阿吉', '江舟', '鉴秋', '嘉义',
  '纪芳', '景澄', '经纶', '景明', '晋优', '阿鸠', '酒客', '乔尔', '乔瑟夫', '约顿',
  '乔伊斯', '居安', '君君', '顺吉', '纯也', '重佐', '大岛纯平', '蒲泽', '勘解由小路健三郎',
  '枫', '枫原义庆', '荫山', '甲斐田龍馬', '海斗', '惟神晴之介', '鹿野奈奈', '卡琵莉亚',
  '凯瑟琳', '加藤信悟', '加藤洋平', '胜家', '茅葺一庆', '和昭', '一正', '一道', '桂一',
  '庆次郎', '阿贤', '健司', '健次郎', '健三郎', '天理', '杀手a', '杀手b', '木南杏奈',
  '木村', '国王', '木下', '北村', '清惠', '清人', '克列门特', '骑士', '小林', '小春',
  '康拉德', '大肉丸', '琴美', '宏一', '康介', '幸德', '高善', '梢', '克罗索', '久保',
  '九条镰治', '久木田', '昆钧', '菊地君', '久利须', '黑田', '黑泽京之介', '响太', '岚姐',
  '兰溪', '澜阳', '劳伦斯', '乐明', '莱诺', '莲', '良子', '李当', '李丁', '小乐', '灵',
  '小玲', '琳琅a', '琳琅b', '小彬', '小德', '小楽', '小龙', '小吴', '小吴的记忆', '理正',
  '阿龙', '卢卡', '洛成', '罗巧', '北风狼', '卢正', '萍姥姥', '前田', '真昼', '麻纪',
  '真', '愚人众-马克西姆', '女性a', '女性b', '女性a的跟随者', '阿守', '玛格丽特', '真理',
  '玛乔丽', '玛文', '正胜', '昌信', '将司', '正人', '路爷', '老章', '松田', '松本', '松浦',
  '松坂', '老孟', '孟丹', '商人随从', '传令兵', '米歇尔', '御舆源一郎', '御舆源次郎', '千岩军教头',
  '千岩军士兵', '明博', '明俊', '美铃', '美和', '阿幸', '削月筑阳真君', '钱眼儿', '森彦',
  '元助', '理水叠山真君', '理水疊山真君', '朱老板', '木木', '村上', '村田', '永野',
  '长野原龙之介', '长濑', '中野志乃', '菜菜子', '楠楠', '成濑', '阿内', '宁禄', '牛志', '信博',
  '伸夫', '野方', '诺拉', '纪香', '诺曼', '修女', '纯水精灵', '小川', '小仓澪', '冈林',
  '冈崎绘里香', '冈崎陆斗', '奥拉夫', '老科', '鬼婆婆', '小野寺', '大河原五右卫门', '大久保大介',
  '大森', '大助', '奥特', '派蒙', '派蒙2', '病人a', '病人b', '巴顿', '派恩', '朋义',
  '围观群众', '围观群众a', '围观群众b', '围观群众c', '围观群众d', '围观群众e', '铜雀',
  '阿肥', '兴叔', '老周叔', '公主', '彼得', '乾子', '芊芊', '乾玮', '绮命', '杞平',
  '秋月', '昆恩', '雷电影', '兰道尔', '雷蒙德', '冒失的帕拉德', '伶一', '玲花', '阿仁',
  '家臣们', '梨绘', '荣江', '戎世', '浪人', '罗伊斯', '如意', '凉子', '彩香', '酒井',
  '坂本', '朔次郎', '武士a', '武士b', '武士c', '武士d', '珊瑚', '三田', '莎拉', '笹野',
  '聪美', '聪', '小百合', '散兵', '害怕的小刘', '舒伯特', '舒茨', '海龙', '世子',
  '谢尔盖', '家丁', '商华', '沙寅', '阿升', '柴田', '阿茂', '式大将', '清水', '志村勘兵卫',
  '新之丞', '志织', '石头', '诗羽', '诗筠', '石壮', '翔太', '正二', '周平', '舒杨',
  '齐格芙丽雅', '女士', '思勤', '六指乔瑟', '愚人众小兵d', '愚人众小兵a', '愚人众小兵b',
  '愚人众小兵c', '吴老五', '吴老二', '滑头鬼', '言笑', '吴老七', '士兵h', '士兵i',
  '士兵a', '士兵b', '士兵c', '士兵d', '士兵e', '士兵f', '士兵g', '奏太', '斯坦利',
  '掇星攫辰天君', '小头', '大武', '陶义隆', '杉本', '苏西', '嫌疑人a', '嫌疑人b', '嫌疑人c',
  '嫌疑人d', '斯万', '剑客a', '剑客b', '阿二', '忠胜', '忠夫', '阿敬', '孝利', '鹰司进',
  '高山', '九条孝行', '毅', '竹内', '拓真', '卓也', '太郎丸', '泰勒', '手岛', '哲平',
  '哲夫', '托克', '大boss', '阿强', '托尔德拉', '旁观者', '天成', '阿大', '蒂玛乌斯',
  '提米', '户田', '阿三', '一起的人', '德田', '德长', '智树', '利彦', '胖乎乎的旅行者',
  '藏宝人a', '藏宝人b', '藏宝人c', '藏宝人d', '阿祇', '恒雄', '露子', '话剧团团长',
  '内村', '上野', '上杉', '老戴', '老高', '老贾', '老墨', '老孙', '天枢星', '老云',
  '有乐斋', '丑雄', '乌维', '瓦京', '菲尔戈黛特', '维多利亚', '薇尔', '瓦格纳',
  '阿外', '侍女', '瓦拉', '望雅', '宛烟', '琬玉', '战士a', '战士b', '渡辺', '渡部', '阿伟',
  '文璟', '文渊', '韦尔纳', '王扳手', '武沛', '晓飞', '辛程', '星火', '星稀', '辛秀',
  '秀华', '阿旭', '徐刘师', '矢部', '八木', '山上', '阿阳', '颜笑', '康明', '泰久',
  '安武', '矢田幸喜', '矢田辛喜', '义坚', '莺儿', '盈丰', '宜年', '银杏', '逸轩', '横山',
  '永贵', '永业', '嘉久', '吉川', '义高', '用高', '阳太', '元蓉', '玥辉', '毓华', '有香',
  '幸也', '由真', '结菜', '韵宁', '百合', '百合华', '尤苏波夫', '裕子', '悠策', '悠也',
  '于嫣', '柚子', '老郑', '正茂', '志成', '芷巧', '知易', '支支', '周良', '珠函', '祝明', '祝涛']

export class vkice extends plugin {
    constructor () {
        super({
            name: "[vits]语音合成",
            dsc: "对接vits",
            event: 'message',
            priority: 9000,
            rule: [
                {
                    reg: `^#说(.*)`,
                    fnc: "Voice",
                },
                {
                    reg: "^#切换合成角色(.*)",
                    fnc: "switch",
                },
                {
                    reg: "^#(开启|关闭)日语合成$",
                    fnc: "Open",
                },
                {
                    reg: "^#设置全局合成角色(.*)$",
                    fnc: "Global",
                },
                {
                    reg: "^#合成帮助$",
                    fnc: "help",
                }
            ]
        });
    };
    async Voice(e) {
        let Msg = _.trimStart(e.msg, "#说")
        let result = Msg.replace(/[a-zA-Z]/g, ""); //剔除字母
        if (translation == "开启") {
            let input = `${appid}${result}1435660288${miyao}`;
            let hash = crypto.createHash('md5');
            hash.update(input);
            let encrypted = hash.digest('hex');
            try {
                let response = await fetch(`http://api.fanyi.baidu.com/api/trans/vip/translate?q=${result}&from=zh&to=jp&appid=${appid}&salt=1435660288&sign=${encrypted}`);
                let data = await response.json();
                logger.info(JSON.stringify(data));
                text = `[JA]${data.trans_result[0].dst}[JA]`;
            } catch (error) {
                e.reply("翻译出错，请检测appid和密钥是否正确");
                logger.error(error);
                return;
            }
        }
        if(translation == "关闭") {
            text = `[ZH]${result}[ZH]`
        }
        let UID = e.user_id
        if (space.endsWith('/api/generate')) {
            let KongMeng = space.substring(0, space.length - 13)
            logger.warn(`当前vits为${space}，已更新为${KongMeng}`)
            space = KongMeng
        }
        if (space.endsWith('/')) {
            let KongMeng = _.trimEnd(space, '/')
            logger.warn(`当前vits为${space}，已更新为${KongMeng}\n${text}`)
            space = KongMeng
        }
        logger.warn(`合成：${text}`)
        let speaker = (!Speaker[UID]) ? (Global) : (Speaker[UID].speaker) //三元运算
        /**定义API请求数据**/
        let body = {
            data: [
                text, language, speaker,
                noiseScale, noiseScaleW, lengthScale
            ]
        }
        let response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        })
        let responseBody = await response.text()
        let json = JSON.parse(responseBody)
        logger.info(json)
        if (response.status > 299) {
            e.reply("合成错误")
            return false;
        }
        if(json.data[0] == "输入文本不能为空！") {
            e.reply("输入文本不能为空")
            return false;
        }
        let [message, audioInfo, take] = json?.data
        logger.info(message, take)
        let audioLink = `${space}/file=${audioInfo.name}` //构造文件下载链接
        fetch(audioLink)
          .then(responsel => {
            if (!responsel.ok) {
                e.reply(`服务器返回状态码异常, ${responsel.status}`)
                return false;
            }
            return responsel.buffer()
          })
          .then(async buffer => {
            await new Promise((resolve, reject) => {
                fs.writeFile('plugins/example/audio.mp3', buffer, (err) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
            if(fs.existsSync('plugins/hs-qiqi-plugin/model/uploadRecord.js')){
                e.reply(await uploadRecord(`plugins/example/audio.mp3`,0,false))
            } else {
                e.reply(segment.record('plugins/example/audio.mp3'))
            }
          })
          .catch(error => {
            e.reply(`文件保存错误`)
            return false;
          })
    }
    async switch(e) {
        let UID = e.user_id
        let Msg = _.trimStart(e.msg, "#切换合成角色")
        if(!Speaker[UID]){
            Speaker[UID] = {"speaker": "雷电将军（雷神）"}
        }
        if(speakers.includes(Msg) == true) {
            Speaker[UID].speaker = Msg
            e.reply(`你的合成角色已经切换为“${Msg}”`)
            return true;
        } else {
            function searchKeyword(keyword) {
                let result = []
                for (let i = 0; i < speakers.length; i++) {
                    if (speakers[i].includes(keyword)) {
                        result.push(speakers[i]);
                    }
                }
                return result;
            }
            let Quantity = searchKeyword(`${Msg}`)
            if(Quantity.length != 0){
                let output = ''
                for (let i = 0; i < Quantity.length; i++) {
                    output += Quantity[i] + '\n';
                }
                e.reply(`不存在“${Msg}”角色，已为您找到${Quantity.length}个相似结果`)
                let Messag = {
                    message: output,
                    nickname: `VITS语音合成角色参考`,
                    user_id: Bot.uin
                }
                Messag = await Bot.makeForwardMsg(Messag);
                await e.reply(Messag);
                return true;
            } else {
                e.reply('在角色数组里面我居然都没有找到一个相似的')
                return;
            }
        }
    }
    async Open(e) {
        if(e.msg == "#开启日语合成") {
            translation = "开启"
            e.reply("开启成功")
            return true;
        } else if(e.msg == "#关闭日语合成"){
            translation = "关闭"
            e.reply("关闭成功")
            return true;
        }
    }
    async Global(e) {
        if(!e.isMaster) {
            e.reply('只有主人可以操作')
            return;
        }
        let Msg = _.trimStart(e.msg, "#设置全局合成角色")
        if(speakers.includes(Msg) == true) {
            Global = Msg  //更新全局角色
            e.reply(`全局合成角色已设置为“${Msg}”，在别人没有设置角色时会使用这个进行合成`)
            return;
        } else {
            function searchKeyword(keyword) {
                let result = []
                for (let i = 0; i < speakers.length; i++) {
                    if (speakers[i].includes(keyword)) {
                        result.push(speakers[i]);
                    }
                }
                return result;
            }
            let Quantity = searchKeyword(`${Msg}`)
            if(Quantity.length != 0){
                let output = ''
                for (let i = 0; i < Quantity.length; i++) {
                    output += Quantity[i] + '\n';
                }
                e.reply(`不存在“${Msg}”角色，已为您找到${Quantity.length}个相似结果`)
                let Messag = {
                    message: output,
                    nickname: `VITS语音合成角色参考`,
                    user_id: Bot.uin
                }
                Messag = await Bot.makeForwardMsg(Messag);
                await e.reply(Messag);
                return true;
            } else {
                e.reply('在角色数组里面我居然都没有找到一个相似的')
                return;
            }
        }
    }
    async help(e) {
        e.reply(`#说<内容>\n#设置全局合成角色<角色名>\n#切换合成角色<角色>\n#开启日语合成\n#关闭日语合成\n日语合成需要进行额外的配置`)
        return;
    }
}