const { Composer } = require('micro-bot');

const bot = new Composer();

bot.start(ctx => {
  
  ctx.reply('Welcome');
});

module.exports = bot;
