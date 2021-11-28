const helper = {

  getRequestOptions(endpoint, NBA_KEY) {
    
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
  getNickName(teams) {
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
  sortStandings(standings, area) {
    if (!standings.length < 0) return;
    return standings
      .filter(({ conference: { name } }) => name === area)
      .sort((a, b) => {
        return Number(a.conference.rank) - Number(b.conference.rank);
      });
  },

  padEndStr(str, num = 9, delimeter = ' ') {
    return Number(str) <= num ? str.padEnd(2, delimeter) : str;
  },

  padStartStr(str, len = 1, delimeter = ' ') {
    return str.length <= len ? str.padStart(2, delimeter) : str;
  },

  /**
   *
   * @param {Array} standings  Sorted NBA standings
   */
  getSortedTeams(standings, enTeams, cnTeams) {
    return standings
      .map(
        ({ teamId, conference: { rank }, win, loss, winPercentage }) =>
          `${helper.padEndStr(rank)} ${helper.padEndStr(win)} ${helper.padEndStr(
            loss
          )} ${winPercentage} ${cnTeams[enTeams[teamId]]}\n`
      )
      .join("");
  },

  correntDay(day) {
    if (day === 32) return day - 31;
    return day;
  },

  getUTCMoment() {
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

  getGMTMoment(offset = 8) {
    if (!offset === 'number') return;
    const temp = this.getUTCMoment().hours + offset;

    const hoursGMT = temp >= 24 ? temp - 24 : temp;
    const dayOfMonth = temp >= 24 ? this.correntDay(this.getUTCMoment().dayOfMonth + 1) : this.getUTCMoment().dayOfMonth;

    return {
      year: this.getUTCMoment().year,
      month: this.getUTCMoment().month + 1,
      day: dayOfMonth,
      hours: hoursGMT,
      minutes: this.getUTCMoment().minutes
    }
  },

  formatDate(num, delimeter = 10) {
    if (!typeof num === "number") return;
    if (!typeof delimeter === "number") return;
    return num < delimeter ? `0${num}` : `${num}`;
  },

  getLocalMoment(timeOffset = 8) {
    if (!typeof timeOffset === "number") return;
    const { year, month, day} = this.getGMTMoment();
    return `${year}-${this.formatDate(month)}-${this.formatDate(day)}`
  },
};

module.exports.helper = helper;
