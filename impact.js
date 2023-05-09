import plugin from '../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

var work=1;//控制开启和关闭,1开启，0关闭，暂时不可用
var api="http://h.bvb.moe:13389/impart?";
export class impact extends plugin{
	constructor(){
		super({
			/** 功能名称 */
			name:'impact系统',
			/** 功能描述 */
			dsc: '多人在线淫趴系统',
			/** https://oicqjs.github.io/oicq/#events */
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 6000,
			rule:[
				{
					/** 命令正则匹配 */
					reg: "淫趴帮助",  //匹配消息正则，命令正则
					/** 执行方法 */
					fnc: 'help'
				},
				{
					reg: "^#?生成牛子$",
					fnc: 'create'
				},
				{
					reg: "^#?remake$",
					fnc: 'remake'
				},
				{
					reg: "^#?开导|打胶$",
					fnc: 'ziwei'
				},
				{
					reg: "^#?嗦牛子$",
					fnc: 'suo'
				},
				{
					reg: "^#?决斗$",
					fnc: 'playerpk'
				},
				{
					reg: "^#?查询精神状态$",
					fnc: 'query'
				},
			]
		}
		)
	}	


async help(e){
	await e.reply('1.生成牛子 2.remake 3.开导/打胶 4.嗦牛子@某人 5.决斗@某人 6.查询精神状态/查询精神状态@某人')
}

async create(e){
	let url=api+"fun=create&qq_myself="+e.user_id+"&qqgroup_myself="+e.group_id
	let res = await fetch(url).catch((err) => logger.error(err));
	if(!res){
		return await this.reply('接口请求失败,请联系群433567006')
	}
	res = await res.text()
	await this.reply(`${res}`)
}

async remake(e){
	let url=api+"fun=remake&qq_myself="+e.user_id+"&qqgroup_myself="+e.group_id
	let res = await fetch(url).catch((err) => logger.error(err));
	if(!res){
		return await this.reply('接口请求失败,请联系群433567006')
	}
	res = await res.text()
	await this.reply(`${res}`)
}

async ziwei(e){
	let url=api+"fun=ziwei&qq_myself="+e.user_id
	let res = await fetch(url).catch((err) => logger.error(err));
	if(!res){
		return await this.reply('接口请求失败,请联系群433567006')
	}
	res = await res.text()
	await this.reply(`${res}`)
}

async suo(e){
	let qq_pk = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
	let url=api+"fun=suo&qq_myself="+e.user_id+"&qq_pk="+qq_pk;
	let res = await fetch(url).catch((err) => logger.error(err));
	if(!res){
		return await this.reply('接口请求失败,请联系群433567006')
	}
	res = await res.text()
	await this.reply(`${res}`)
}

async playerpk(e){
	let qq_pk = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
	let url=api+"fun=pk&qq_myself="+e.user_id+"&qq_pk="+qq_pk;
	let res = await fetch(url).catch((err) => logger.error(err));
	if(!res){
		return await this.reply('接口请求失败,请联系群433567006')
	}
	res = await res.text()
	await this.reply(`${res}`)
}

async query(e){
	let qq = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
	if(qq==""){
		let url=api+"fun=query&qq_myself="+e.user_id;
		let res = await fetch(url).catch((err) => logger.error(err));
		if(!res){
			return await this.reply('接口请求失败,请联系群433567006')
		}
		res = await res.text()
		await this.reply(`${res}`)
	}else{
		let url=api+"fun=query&qq_myself="+qq;
		let res = await fetch(url).catch((err) => logger.error(err));
		if(!res){
			return await this.reply('接口请求失败,请联系群433567006')
		}
		res = await res.text()
		await this.reply(`${res}`)
	}
	
	
}


}