require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
// eslint-disable-next-line no-undef
const nbaKey = process.env.NBA_KEY;

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
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.on('sticker', (ctx) => ctx.reply('123'));
bot.hears('hi', (ctx) => {
  ctx.reply('Hey there');
});

bot.help((ctx) => ctx.reply('send me a sticker'));
bot.command('today', (ctx) => {

  const options = {
    method: 'GET',
    url: `https://api-nba-v1.p.rapidapi.com/games/date/${getCurrentDate()}`,
    headers: {
      'x-rapidapi-key': nbaKey,
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
    }
  };

  axios.request(options).then((response) => {
    let replyText = `<code>Visiting Team VS Home Team (Status)</code>\n\n`;

    const { games } = response.data.api;

    games.forEach(game => {
      const { vTeam, hTeam } = game;
      replyText += `<code>${vTeam.nickName} ${vTeam.score.points} - ${hTeam.score.points} ${hTeam.nickName}</code> <code>(${game.statusGame}) </code>\n\n`;
    })

    ctx.reply(replyText, {
      parse_mode: 'HTML'
    });
  }).catch((error) => {
    console.error(error);
  });
})

bot.command('standings', (ctx) => {

  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/standings/standard/2020',
    headers: {
      'x-rapidapi-key': nbaKey,
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
    }
  };

  axios.request(options).then(() => {
    ctx.reply('敬请期待！');
  }).catch((error) => {
    console.error(error);
  });
})

bot.command('live', (ctx) => {
  ctx.reply('敬请期待！');
})

bot.command('players', ctx => {
  ctx.reply('敬请期待！');
})

exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch(e) {
    console.log(e);
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' }
  }
}