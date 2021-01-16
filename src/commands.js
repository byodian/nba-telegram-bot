const { helper } = require('./helper');

const commands = {
  //
  // games command code
  //
  getStartTime(startTimeUTC) {
  	const regx = /(^\d+-\d+-\d+[A-z])|(:\d+\.\d+[A-Z])/g;
  	const localTime = startTimeUTC
  		.replace(regx, '')
  		.split(':')
  		.map(num => parseInt(num, 10));

  	const hours = localTime[0] + 8 >= 24 ? localTime[0] + 8 - 24 : localTime[0] + 8;
  	const minutes = localTime[1];
  	return `${helper.formatDate(hours)}:${helper.formatDate(minutes)}`;
  },
  
  /**
   * 
   * @param {Object} games games message GET /games/date/endpoint/
   * @param {Object} trans Translate English team nickname into chinese team nickname
   */
  displayGames(games, trans) {
    return games
      .map(
        ({ vTeam, hTeam, statusGame, clock, startTimeUTC, currentPeriod }) =>
          `${this.getStartTime(startTimeUTC)} ${trans[vTeam["nickName"]]} *${
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

  overtime(times) {
    const OT = [];
    for(let i = 0; i < times; i++) {
      OT.push('OT');
    }

    return OT;
  },

  periods(linescores) {
    if(linescores.length <= 0) return;
    let periods = ['1', '2', '3', '4'];
    const len = linescores.length - periods.length;
    return periods.concat(this.overtime(len));
  },

  styledPeriods(callback, linescores) {
    const periods = this.periods(linescores);
    return periods
      .map(period => callback(period))
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

  leaders(leaders, delimeter) {
    return leaders
      .filter(leader => leader.hasOwnProperty(delimeter))
      .sort((a, b) => parseInt(b[delimeter], 10) - parseInt(a[delimeter], 10))[0]
  },

  maxLeader(leaders, delimeter) {
    return `\`${helper.padStartStr(this.leaders(leaders, delimeter)[delimeter])}\` ${this.leaders(leaders, delimeter)['name']}`
  }
}

module.exports.commands = commands;
