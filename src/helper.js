const helper = {

  getRequestOptions: (endpoint, NBA_KEY) => {
    return {
      method: "GET",
      url: `https://api-nba-v1.p.rapidapi.com${endpoint}`,
      headers: {
        "x-rapidapi-key": NBA_KEY,
        "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      },
    };
  },
  /**
   *
   * @param {Array} teams NBA teams message from API (GET /games/league/)
   * response.api.teams
   */
  getNickName: (teams) => {
    obj = {};
    teams
      .filter(
        (team) =>
          team.leagues.standard.confName.toLowerCase() === "west" ||
          team.leagues.standard.confName.toLowerCase() === "east"
      )
      .forEach((team) => {
        if (team.hasOwnProperty("teamId") && team.hasOwnProperty("nickname")) {
          obj[team.teamId] = team.nickname;
        }
      });

    return obj;
  },

  /**
   *
   * @param {Array} standings NBA teams standings message for API Get /standings/
   * @param {String} area NBA teams conference name
   */
  sortStandings: (standings, area) => {
    if (!standings.length < 0) return;
    return standings
      .filter(({ conference: { name } }) => name === area)
      .sort((a, b) => {
        return Number(a.conference.rank) - Number(b.conference.rank);
      });
  },

  padEndStr: (str, num = 9, delimeter = ' ') => {
    return Number(str) <= num ? str.padEnd(2, delimeter) : str;
  },

  padStartStr: (str, len = 1, delimeter = ' ') => {
    return str.length <= len ? str.padStart(2, delimeter) : str;
  },

  /**
   *
   * @param {Array} standings  Sorted NBA standings
   */
  getSortedTeams: (standings, enTeams, cnTeams) => {
    return standings
      .map(
        ({ teamId, conference: { rank }, win, loss, winPercentage }) =>
          `${helper.padEndStr(rank)} ${helper.padEndStr(win)} ${helper.padEndStr(
            loss
          )} ${winPercentage} ${cnTeams[enTeams[teamId]]}\n`
      )
      .join("");
  },
  getUTCMoment: () => {
    const date = new Date();

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      dayOfMonth: date.getUTCDate(),
      dayOfWeek: date.getUTCDay(),
      hours: date.getUTCHours(),
      minutes: date.getUTCMinutes(),
    };
  },

  getGMTMoment: (offset = 8) => {
    if (!offset === 'number') return;
    return {
      hours: helper.getUTCMoment().hours + offset,
      minutes: helper.getUTCMoment().minutes
    }
  },

  formatDate: (num, delimeter = 10) => {
    if (!typeof num === "number") return;
    if (!typeof delimeter === "number") return;
    return num < delimeter ? `0${num}` : `${num}`;
  },

  getLocalMoment: (timeOffset = 8) => {
    if (!typeof timeOffset === "number") return;
    if (!typeof utcMoment === "object") return;

    let formatDay = '';
    const { year, month, dayOfMonth: day, hours } = helper.getUTCMoment();

    const formatMonth = helper.formatDate(month + 1);
    if (hours < 24 - timeOffset) {
      formatDay = helper.formatDate(day); 
    } else {
      formatDay = helper.formatDate(day + 1);
    }

    return `${year}-${formatMonth}-${formatDay}`
  },

};

module.exports.helper = helper;
