const { helper } = require('./helper');

const commands = {
  //
  // games command code
  //
  getGameStatus(statusGame) {
    let = emojiGame = '';
    if (statusGame === 'Finished') {
      emojiGame = '👏';
    } else if (statusGame === 'Scheduled') {
      emojiGame ='👉';
    } else {
      emojiGame ='🔥';
    }

    return emojiGame;
  },
  
  /**
   * 
   * @param {Object} games games message GET /games/date/endpoint/
   * @param {Object} trans Translate English team nickname into chinese team nickname
   */
  renderWithHTML(games, trans) {
    return games
      .map(
        ({ vTeam, hTeam, statusGame, clock, startTimeUTC, currentPeriod }) =>
          `${this.getGameStatus(statusGame)} ${trans[vTeam["nickName"]]} *${
            vTeam.score.points
          }* - *${hTeam.score.points}* ${trans[hTeam["nickName"]]} ${this.getCurrentPeriod(statusGame, currentPeriod)} ${statusGame === 'Scheduled' ? '' : clock}`
      )
      .join('\n\n')
  },
  //
  // live
  //
  getLineScore(linescores) {
    if(linescores.length < 0) return;
    return linescores
      .map(linescore => helper.padStartStr(linescore))
      .join(' ');
  },

  formatTextPeriod(func) {
    const periods = ['1', '2', '3', '4'];
    return periods
      .map(period => func(period))
      .join(' ');
  },

  getCurrentPeriod(statusGame, period) {
    let currentPeriod = ''
    if (statusGame === 'Finished') {
      currentPeriod = '已结束';
    } else if (statusGame === 'Scheduled') {
      currentPeriod = '未开始/延迟';
    } else {
      currentPeriod = `第 ${period[0]} 节`;
    }

    return currentPeriod;
  },

  getLeaders(leaders, delimeter) {
    return leaders
      .filter(leader => leader.hasOwnProperty(delimeter))
      .sort((a, b) => parseInt(b[delimeter], 10) - parseInt(a[delimeter], 10))[0]
  },

  getMaxLeaders(leaders, delimeter) {
    return `\`${helper.padStartStr(this.getLeaders(leaders, delimeter)[delimeter])}\` ${this.getLeaders(leaders, delimeter)['name']}`
  }
}

module.exports.commands = commands;
