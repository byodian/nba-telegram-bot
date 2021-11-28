require('dotenv').config();
const { Telegraf } = require('telegraf');
const { helper } = require('./helper');
const { config } = require('./config');
const { commands } = require('./commands');
const axios = require('axios');
const express = require('express');
const app = express();

// eslint-disable-next-line no-undef
const NBA_KEY = process.env.NBA_KEY;
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const URL = process.env.URL || '';

console.log('当前时间： ' + helper.getLocalMoment());

// eslint-disable-next-line no-undef
const bot = new Telegraf(BOT_TOKEN);
const development = function() {
  console.log('Bot run in development mode');
  console.log('Deleting webhook');
  bot.telegram.deleteWebhook();
  console.log('Starting polling');
  bot.startPolling();
}

const production = function() {
  console.log('Bot run in production mode');
  bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
  app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));
}

const gameLeaders = (leaders) => {
  const points = `得分：${commands.maxLeader(leaders, 'points')}\n`;
  const assists = `助攻：${commands.maxLeader(leaders, 'assists')}\n`;
  const rebounds = `篮板：${commands.maxLeader(leaders, 'rebounds')}\n\n`;
  return `${points}${assists}${rebounds}`;
}

// Command
bot.start(ctx => {
  ctx.reply(`获取NBA当天比赛场次、东西部排名以及比赛详细数据等。\n\n👏 /\games - 获取当天比赛场次\n👏 /\standings - 获取东西部排名`);
});

bot.command('currenttime', ctx => {
  const { hours: UTCHours, minutes: UTCMinutes } = helper.getUTCMoment();
  const { hours: GMTHours, minutes: GMTMinutes } = helper.getGMTMoment();
  ctx.reply(`世界标准时间 ${UTCHours}:${helper.formatDate(UTCMinutes)} - 中国时间 ${GMTHours}:${helper.formatDate(GMTMinutes)}`);
})

bot.command('standings', async (ctx) => {
  ctx.reply('👏 NBA积分情况');
	let season
	const { month, year } = helper.getUTCMoment();
	// 比如今年是 2021年，则前半年为 2020 赛季，后半年为 2021 赛季
	// NBA 一般 10月份为下一个赛季的季前赛
	// 所以以 10月份为分界线，获取不同赛季的数据
	if (month + 1 > 9 ) {
		season = year	
	} else {
		season = year - 1 
	}
  const options = helper.getRequestOptions(`/standings/standard/${season}`, NBA_KEY);
  try {
    const response = await axios.request(options);
    const { standings } = await response.data.api;
    const westStandings = helper.getSortedTeams(helper.sortStandings(standings, 'west'), config.en, config.cn);
    const eastStandings = helper.getSortedTeams(helper.sortStandings(standings, 'east'), config.en, config.cn);
    ctx.replyWithMarkdown(`*东部*\n*No.*  *胜*  *负* *胜率* *队名*\n\`${eastStandings}\``);
    ctx.replyWithMarkdown(`*西部*\n*No.*  *胜*  *负* *胜率* *队名*\n\`${westStandings}\``);
  } catch(e) {
    console.log(e)
  }
})

const isCurDayGame = ({ startTimeUTC }) => commands.getStartTime(startTimeUTC).hour <= 24

const filterGames = function (games = []) {
	return 	games.filter()
}

bot.use(async (ctx, next) => {
	const {year, month, day }  = helper.getGMTMoment()

	try {
		const lastTeamIdOptions = helper.getRequestOptions(`/games/date/${year}-${month}-${day - 1}`, NBA_KEY);
		const lastGames = (await axios.request(lastTeamIdOptions)).data.api.games
		ctx.state.games = lastGames.filter(game => !isCurDayGame(game))

		const teamIdOptions = helper.getRequestOptions(`/games/date/${helper.getLocalMoment()}`, NBA_KEY);
		const response = await axios.request(teamIdOptions);
		ctx.state.games = ctx.state.games.concat(response.data.api.games.filter(isCurDayGame));
		
		return next()
	}	catch(e) {
		console.log(e.message)
	}
				
	
})

bot.command('games',(ctx) => {
  try {
		let markup = `${helper.getLocalMoment()}\n\n**客队vs主队**\n\n`
		markup += commands.displayGames(ctx.state.games, config.cn);
    ctx.replyWithMarkdown(markup); 
  } catch(e) {
    console.log(e)
  }
})

bot.command('live', async (ctx) => {
  try {
    const title = '*比赛场次ID*\n输入下面的数字获取当天比赛详细数据';
    const gameIds =  ctx.state.games
      .map(game => (`${game.gameId} ${config.cn[game.vTeam.nickName]} - ${config.cn[game.hTeam.nickName]}`))
      .join('\n');
    ctx.replyWithMarkdown(`${title}\n\n\`${gameIds}\``);
  } catch (e) {
    console.log(e);
  }
})

bot.on('text', async (ctx) => {
  if (!/^\d*$/g.test(ctx.message.text)) {
    return ctx.reply('😂请输入数字');
  };

  try {
    const options = helper.getRequestOptions(`/gameDetails/${ctx.message.text}`, NBA_KEY);
    const response = await axios.request(options);
    const {
      currentPeriod,
      clock,
      statusGame,
      vTeam: {
        nickname: vNickname,
        shortName: vShortname,
        score: { linescore: vLinescore, points: vPoints },
        leaders: vLeaders
      },
      hTeam: {
        nickname: hNickname,
        shortName: hShortname,
        score: { linescore: hLinescore, points: hPoints },
        leaders: hLeaders
      },
    } = await response.data.api.game[0];

    const statusPeriod = `\n\`${commands.getCurrentPeriod(statusGame, currentPeriod)} ${clock}\`\n`;

    if (statusGame === 'Scheduled') {
    	ctx.replyWithMarkdown(`*${config.cn[vNickname]} - ${config.cn[hNickname]}*${statusPeriod}`);
    } else {
	    const headings = `*${config.cn[vNickname]} ${vPoints} - ${hPoints} ${config.cn[hNickname]}*\n`;	
	    const linescoreHeadings = `\n\`Team${commands.styledPeriods(helper.padStartStr, vLinescore)} Total\`\n`;
      const v = `\`${vShortname} ${commands.getLineScore(vLinescore)} ${vPoints}\`\n`;
      const h = `\`${hShortname} ${commands.getLineScore(hLinescore)} ${hPoints}\`\n`;
      const l = `\n*本场最佳*\n\n`
      const vL = `*${config.cn[vNickname]}*👇\n\n${gameLeaders(vLeaders)}`;
      const hL = `*${config.cn[hNickname]}*👇\n\n${gameLeaders(hLeaders)}`;
	    ctx.replyWithMarkdown(`${headings}${statusPeriod}${linescoreHeadings}${v}${h}${l}${vL}${hL}`);
    }

  } catch(e) {
    console.log(e);
  }
});

process.env.NODE_ENV === 'production' ? production() : development();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
