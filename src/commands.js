const commands = {
  //
  // games command code
  //
  getGameStatus: (statusGame) => {
    if (statusGame === 'Finished') {
      return '👏';
    } else if (statusGame === 'Scheduled') {
      return '👉';
    } else {
      return '🔥';
    }
  },
  
  /**
   * 
   * @param {Object} games games message GET /games/date/endpoint/
   * @param {Object} trans Translate English team nickname into chinese team nickname
   */
  renderWithHTML: (games, trans) =>
    games
      .map(
        ({ vTeam, hTeam, statusGame, clock, }) =>
          `${commands.getGameStatus(statusGame)} ${trans[vTeam["nickName"]]} <b>${
            vTeam.score.points
          }</b> - <b>${hTeam.score.points}</b> ${trans[hTeam["nickName"]]}`
      )
      .join('\n\n'),
  //
  // live
  //
  getLineScore: (linescores) => {
    if(linescores.length < 0) return;
    return linescores
      .map(linescore => linescore)
      .join(' ');
  },
  formatTextPeriod: (func) => {
    const periods = ['1', '2', '3', '4'];
    return periods
      .map(period => func(period))
      .join(' ');
  },
  getCurrentPeriod: (statusGame, period) => {
    if (statusGame === 'Finished') {
      return '已结束';
    } else if (statusGame === 'Scheduled') {
      return '未开始';
    } else {
      return `第 ${period[0]} 节`;
    }
  },
}

module.exports.commands = commands;
