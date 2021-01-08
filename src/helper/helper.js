// Variables

const enTeams = {
  1: 'Hawks',
  2: 'Celtics',
  4: 'Nets',
  5: 'Hornets',
  6: 'Bulls',
  7: 'Cavaliers',
  8: 'Mavericks',
  9: 'Nuggets',
  10: 'Pistons',
  11: 'Warriors',
  14: 'Rockets',
  15: 'Pacers',
  16: 'Clippers',
  17: 'Lakers',
  19: 'Grizzlies',
  20: 'Heat',
  21: 'Bucks',
  22: 'Timberwolves',
  23: 'Pelicans',
  24: 'Knicks',
  25: 'Thunder',
  26: 'Magic',
  27: '76ers',
  28: 'Suns',
  29: 'Trail Blazers',
  30: 'Kings',
  31: 'Spurs',
  34: 'Team Giannis',
  35: 'Team LeBron',
  36: 'Team Wilbon',
  37: 'Team Stephen A',
  38: 'Raptors',
  39: 'USA',
  40: 'Jazz',
  41: 'Wizards',
  42: 'World',
};

const cnTeams = {
  Hawks: '老鹰',
  Celtics: '凯尔特人',
  Nets: '篮网',
  Hornets: '黄蜂',
  Bulls: '公牛',
  Cavaliers: '骑士',
  Mavericks: '独行侠',
  Nuggets: '掘金',
  Pistons: '活塞',
  Warriors: '勇士',
  Rockets: '火箭',
  Pacers: '步行者',
  Clippers: '快船',
  Lakers: '湖人',
  Grizzlies: '灰熊',
  Heat: '热火',
  Bucks: '雄鹿',
  Timberwolves: '森林狼',
  Pelicans: '鹈鹕',
  Knicks: '尼克斯',
  Thunder: '雷霆',
  Magic: '魔术',
  '76ers': '76人',
  Suns: '太阳',
  'Trail Blazers': '开拓者',
  Kings: '国王',
  Spurs: '马刺',
  'Team Giannis': '吉安尼斯队',
  'Team LeBron': '勒布朗队',
  'Team Wilbon': 'Wilbon 队',
  'Team Stephen A': '库里队',
  Raptors: '猛龙',
  USA: '美国队',
  Jazz: '爵士',
  Wizards: '奇才',
  World: '世界队',
};

// Helper functions

/**
 *
 * @param {Array} teams NBA teams message from API (GET /games/league/)
 * response.api.teams
 */
const getNickName = (teams) => {
  const obj = {};
  teams
    .filter(
      (team) =>
        team.leagues.standard.confName.toLowerCase() === 'west' ||
        team.leagues.standard.confName.toLowerCase() === 'east'
    )
    .forEach((team) => {
      if (team.hasOwnProperty('teamId') && team.hasOwnProperty('nickname')) {
        obj[team.teamId] = team.nickname;
      }
    });

  return obj;
};

/**
 *
 * @param {Array} standings NBA teams standings message for API Get /standings/
 * @param {String} area NBA teams conference name
 */
const getSortedStanding = (standings, area) => {
  if (!standings.length < 0) return;
  return standings
    .filter(({ conference: { name } }) => name === area)
    .sort((a, b) => {
      return Number(a.conference.rank) - Number(b.conference.rank);
    });
};

const padEndStr = function (str, num = 9, delimeter = ' ') {
  return Number(str) <= num ? str.padEnd(2, delimeter) : str;
};

/**
 *
 * @param {Array} standings  Sorted NBA standings
 */
const getTeamsRank = (standings, enTeams, cnTeams) => {
  return standings
    .map(
      ({ teamId, conference: { rank }, win, loss, winPercentage }) =>
        `${padEndStr(rank)} ${padEndStr(win)} ${padEndStr(loss)} ${winPercentage} ${
          cnTeams[enTeams[teamId]]
        }\n`
    )
    .join('');
};

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

module.exports = {
  enTeams,
  cnTeams,
  getSortedStanding,
  getTeamsRank,
  getCurrentDate
};
