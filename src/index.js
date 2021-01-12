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

const leaders = (leaders) => {
  const points = `*得分*：${commands.getMaxLeaders(leaders, 'points')}\n`;
  const assists = `*助攻*：${commands.getMaxLeaders(leaders, 'assists')}\n`;
  const rebounds = `*篮板*：${commands.getMaxLeaders(leaders, 'rebounds')}\n\n`;
  return `${points}${assists}${rebounds}`;
}

//
// Command
//
bot.start(ctx => {
  ctx.reply(`获取NBA当天比赛场次、东西部排名以及比赛详细数据等。\n\n👏 /\games - 获取当天比赛场次\n👏 /\standings - 获取东西部排名`);
});

bot.command('currenttime', ctx => {
  const { hours: UTCHours, minutes: UTCMinutes } = helper.getUTCMoment();
  const { hours: GMTHours, minutes: GMTMinutes } = helper.getGMTMoment();
  ctx.reply(`世界标准时间 ${UTCHours}:${helper.formatDate(UTCMinutes)} | 中国时间 ${GMTHours}:${helper.formatDate(GMTMinutes)}`);
})

bot.command('standings', async (ctx) => {
  ctx.reply('👏 NBA积分情况');
  const options = helper.getRequestOptions(`/standings/standard/2020`, NBA_KEY);
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

bot.use(async (ctx, next) => {
  const teamIdOptions = helper.getRequestOptions(`/games/date/${helper.getLocalMoment()}`, NBA_KEY);
  const response = await axios.request(teamIdOptions);
  ctx.state.games = await response.data.api.games;
  return next()
})

bot.command('games',(ctx) => {
  try {
    ctx.replyWithHTML('<b>🏀 今日NBA赛事情况</b>');
    let markup = `<b>客队 VS 主队</b>\n\n`
    markup += commands.renderWithHTML(ctx.state.games, config.cn);
    ctx.replyWithHTML(markup); 
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
      city,
      leadChanges,
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

    const headings = `*${config.cn[vNickname]}  ${vPoints} - ${hPoints} ${config.cn[hNickname]}*\n`;
    const statusPeriod = `\`${commands.getCurrentPeriod(
      statusGame,
      currentPeriod
    )} ${clock}\`\n`;
    const linescoreH = `\`Team${commands.formatTextPeriod(
      helper.padStartStr
    )}\`\n`;
    const v = `\`${vShortname} ${commands.getLineScore(vLinescore)}\`\n`;
    const h = `\`${hShortname} ${commands.getLineScore(hLinescore)}\`\n\n`;
    const l = `*本场最佳*\n\n`
    const vL = `*${config.cn[vNickname]}*👇\n\n${leaders(vLeaders)}`;
    const hL = `*${config.cn[hNickname]}*👇\n\n${leaders(hLeaders)}`;
    ctx.replyWithMarkdown(`${headings}${statusPeriod}${linescoreH}${v}${h}${l}${vL}${hL}`);
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
