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

  padEndStr: function (str, num = 9, delimeter = " ") {
    return Number(str) <= num ? str.padEnd(2, delimeter) : str;
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

  formatDate: (num, delimeter = 10) => {
    if (!typeof num === "number") return;
    if (!typeof delimeter === "number") return;
    return num < delimeter ? `0${num}` : `${num}`;
  },

  getLocalMoment: (timeOffset = 8) => {
    if (!typeof timeOffset === "number") return;
    if (!typeof utcMoment === "object") return;

    var { year, month, dayOfMonth: day, hours } = helper.getUTCMoment();

    if (hours < 24 - timeOffset) {
      return `${year}-${helper.formatDate(month + 1)}-${helper.formatDate(day)}`;
    } else {
      return `${year}-${month + 1}-${day + 1}`;
    }
  },
};

module.exports.helper = helper;
