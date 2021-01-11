require('dotenv').config();
const { Telegraf } = require('telegraf');
const { helper } = require('./helper');
const { config } = require('./config');
const { commands } = require('./commands');
const axios = require('axios');
const express = require('express');
const { response } = require('express');
const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');
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

bot.use(async (ctx, next) => {
  const teamIdOptions = helper.getRequestOptions(`/games/date/${helper.getLocalMoment()}`, NBA_KEY);
  const response = await axios.request(teamIdOptions);
  ctx.state.games = await response.data.api.games;
  return next()
})

bot.context.db = {
  getScores: () => { return 42 }
}

bot.help((ctx) => ctx.reply('send me a sticker'));

bot.command('games',(ctx) => {
    const options = helper.getRequestOptions(`/games/date/${helper.getLocalMoment()}`, NBA_KEY);
    const title = `<b>🏀 今日NBA赛事情况</b>`;

    axios.request(options).then((response) => {
      let markup = `<b>客队 VS 主队</b>\n\n`
      const { games } = response.data.api;
      markup += commands.renderWithHTML(games, config.cn);
      ctx.replyWithHTML(markup); 
    }).catch((error) => {
      console.error(error);
    });

    ctx.replyWithHTML(title);
})

bot.command('standings', (ctx) => {
  const title = '👏 NBA积分情况'
  const options = helper.getRequestOptions(`/standings/standard/2020`, NBA_KEY);

  axios.request(options).then((response) => {
    const { standings } = response.data.api;
    const westStandings = helper.getSortedTeams(helper.sortStandings(standings, 'west'), config.en, config.cn);
    const eastStandings = helper.getSortedTeams(helper.sortStandings(standings, 'east'), config.en, config.cn);
    ctx.replyWithMarkdown(`*东部*\n*No.*  *胜*  *负* *胜率* *队名*\n\`${eastStandings}\``);
    ctx.replyWithMarkdown(`*西部*\n*No.*  *胜*  *负* *胜率* *队名*\n\`${westStandings}\``);
  }).catch((error) => {
    console.error(error);
  });

  ctx.reply(title);
})

bot.command('live', async (ctx) => {
  const title = 'NBA比赛数据';
  try {
    const games =  ctx.state.games;
    const gameIds = games.map(game => game.gameId);
    console.log(gameIds);
    setTimeout(async () => {
        const options = helper.getRequestOptions(`/gameDetails/${gameIds[1]}`, NBA_KEY);
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
            score: {
              linescore: vLinescore,
              points: vPoints
            }
          },
          hTeam: {
            nickname: hNickname,
            shortName: hShortname,
            score: {
              linescore: hLinescore,
              points: hPoints
            }
          }
        } = await response.data.api.game[0];

        const headings = `*${config.cn[vNickname]}  ${vPoints} - ${hPoints} ${config.cn[hNickname]}*\n`;
        const statusPeriod = `\`${commands.getCurrentPeriod(statusGame, currentPeriod)} ${clock}\`\n`;
        const linescoreH = `\`Team${commands.formatTextPeriod(helper.padStartStr)}\`\n`;
        const v = `\`${vShortname} ${commands.getLineScore(vLinescore)}\`\n`;
        const h = `\`${hShortname} ${commands.getLineScore(hLinescore)}\`\n`;
        const replyHTML = `${headings}${statusPeriod}${linescoreH}${v}${h}`;
        ctx.replyWithMarkdown(replyHTML);
    }, 0)
  } catch (e) {
    console.log(e);
  }
  ctx.reply(`${title}`);
})

bot.command('players', ctx => {
  ctx.reply('🤞敬请期待！');
})

bot.command('currenttime', ctx => {
  const { hours: UTCHours, minutes: UTCMinutes } = helper.getUTCMoment();
  const { hours: GMTHours, minutes: GMTMinutes } = helper.getGMTMoment();
  ctx.reply(`世界标准时间 ${UTCHours}:${helper.formatDate(UTCMinutes)} | 中国时间 ${GMTHours}:${helper.formatDate(GMTMinutes)}`);
})

bot.start(ctx => {
  ctx.reply(`获取NBA当天比赛场次、东西部排名以及比赛详细数据等。\n\n👏 /\games - 获取当天比赛场次\n 👏 /\standings - 获取东西部排名`);
});

bot.on('text', (ctx) => {
  const scores = ctx.db.getScores(ctx.message.chat.id)
  return ctx.reply(`${ctx.state.role}: ${scores}`)
})

process.env.NODE_ENV === 'production' ? production() : development();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
