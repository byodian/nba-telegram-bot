require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();

// eslint-disable-next-line no-undef
const NBA_KEY = process.env.NBA_KEY;
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const URL = process.env.URL || 'https://nbtelegrambot.herokuapp.com';

const now = new Date();

const getMonth= function(month) {
  return month < 10 ? `0${month}` : `${month}`;
}

const getDate = function(date) {
  return date < 10 ? `0${date}` : `${date}`;
}

const getCurrentDate = function() {
  const year = now.getFullYear();
  const month = now.getUTCMonth() + 1;
  const date = now.getUTCDate();

  return `${year}-${getMonth(month)}-${getDate(date)}`
}

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

bot.help((ctx) => ctx.reply('send me a sticker'));

bot.command('today',(ctx, next) => {
  const options = {
      method: 'GET',
      url: `https://api-nba-v1.p.rapidapi.com/games/date/${getCurrentDate()}`,
      headers: {
        'x-rapidapi-key': NBA_KEY,
        'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
      }
    };

    const title = `<b>🏀今日NBA赛事情况</b>`;

    axios.request(options).then((response) => {
      let replyText = `<code>Visiting Team VS Home Team (Status)</code>\n\n`
      const { games } = response.data.api;

      games.forEach(game => {
        const { vTeam, hTeam } = game;
        replyText += `<code>🔥 ${vTeam.nickName} ${vTeam.score.points} - ${hTeam.score.points} ${hTeam.nickName}</code> <code>(${game.statusGame}) </code>\n\n`;
      })
      ctx.replyWithHTML(replyText);
      return next();
    }).catch((error) => {
      console.error(error);
    });

    ctx.replyWithHTML(title);
})

bot.command('standings', (ctx) => {
  const title = '🚀NBA积分情况'

  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/standings/standard/2020',
    headers: {
      'x-rapidapi-key': NBA_KEY,
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
    }
  };

  axios.request(options).then(() => {
    ctx.reply('敬请期待！');
  }).catch((error) => {
    console.error(error);
  });

  ctx.reply(title);
})

bot.command('live', (ctx) => {
  ctx.reply('敬请期待！');
})

bot.command('players', ctx => {
  ctx.reply('敬请期待！');
})

process.env.NODE_ENV === 'production' ? production() : development();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
