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
  // players
  //

  //
  // live
  //

  //
  // standings
  //

}

module.exports.commands = commands;
