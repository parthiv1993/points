var iplTeams = require('./iplTeams');
var credentials = require('./credentials');
var matches = require('./Matches');
var teamToChange = 'team1';

var userPoints = {}

var matchPerformances = {
    // matchId : { playerId : {}}
}

var matchPoints = {
    // matchId
    1 : {
        // playerId : { batting: x,bowling:y,fielding : z,bonus: w ,total : x+y+z+w}
    }
}

var playerPoints = {
    // playerId
    125 : {
        // matchId : {batting : x,bowling:y,fielding:z,bonus:w,total : w+x+y+z}
    }
}

/**
 * 
 * userPoints = {
 *      auctionId : {
 *          userId:{
 *              playerId:{
 *                  matchId:{
 *                      battingPoints : 0
 *                      bowlingPoints : 0
 *                      fieldingPoints : 0
 *                      bonusPoints : 0
 *                      totalPoints : 0
 *                  }
 *              }
 *          }
 *      }
 * }
 */
var userPoints = {
    // auction 
    auction1 : {
        // user 
        parthiv : {
            // playerId
            11 : {
                // matchId
                1 : {
                    // bating points
                    // bowling points
                    // fielding points
                    // bonus points
                    // total
                }
            }
        }
    }
}

var userTeams = {
    auction1 :{
        parthiv : {
            team1 : []
        },
        nikhil : {},
        shashank : {},
        mantri : {},
        prakash : {},
        vishal : {},
        vohera : {},
        ravi : {}
    },
    auction2 : {
        nikhil : {},
        shashank : {},
        mantri : {},
        prakash : {},
        vishal : {},
        vivek : {},
        varun : {},
        kundan : {}
    }
}

function Player(playerId,playerName,iplTeam,nationality){
    return{
        playerId : playerId,
        playerName : playerName,
        iplTeam : iplTeam,
        nationality : nationality
    }
}

function Match(matchNumber,homeTeam,awayTeam){
    return {
        matchNumber,
        homeTeam,
        awayTeam
    }
}

function Performances(runs,ballsPlayed,fours,sixes,oversBalled,maidens,wickets,dotBalls,runsConceeded,catches,stumpings,runouts,winningSide,playerOfMatch){
    return {
        runs,
        ballsPlayed,
        fours,
        sixes,
        oversBalled,
        maidens,
        wickets,
        dotBalls,
        runsConceeded,
        catches,
        stumpings,
        runouts,
        winningSide,
        playerOfMatch
    }
}

function editUserTeam(auction,user,team){
    var auctionTeams = teams.userTeams[auction];
    auctionTeams[user] = team;
    return true;
}

function getUserTeam(auction,user) {
    var auctionTeams = teams.userTeams[auction];
    return auctionTeams[user];
}

function evaluate(command){
    try {
        return eval(command);
    }
    catch(e){
        return e;
    }
}

function getMatches(){
    return matches;
}

function getPlayersForMatch(matchId){
    var match = matches[matchId];
    var players = [];
    if(match){
        var homeTeam = match.homeTeam;
        var awayTeam = match.awayTeam;
        players = players.concat(iplTeams[homeTeam] || []);
        players = players.concat(iplTeams[awayTeam] || []);
    }
    return players;
}

function addMatch(match){
    if(match && match.matchId){
        var matchId = match.matchId;
        if(matches[matchId]){
            matches[matchId] = match;
            return true;
        }
    }
    return false;
}

function editMatch(matchId,match){
    if(matches[matchId]){
        matches[matchId] = match;
        return true;
    }
    return false;
}

function deleteMatch(matchId){
    if(matches[matchId]){
        delete matches[matchId];
        return true;
    }
    return false;
}

function addPerformances(matchId,performancesToAdd){
    var match = matches[matchId];
    if(match){
        var performances = {}
        performancesToAdd.map((performance)=>{
            performances[performance.playerId] = new Performances(
                performance.runs || 0,
                performance.ballsPlayed || 0 ,
                performance.fours || 0,
                performance.sixes || 0,
                performance.oversBalled || 0,
                performance.maidens || 0,
                performance.wickets || 0,
                performance.dotBalls || 0,
                performance.runsConceeded || 0,
                performance.catches || 0,
                performance.stumpings || 0,
                performance.runouts || 0,
                performance.winningSide || false,
                performance.playerOfMatch || false
            )
        })
        matchPerformances[matchId] = performances;
        return true;
    }
    return false;
}

function calcPerformances(matchId){
    var match = matches[matchId];
    if(match){
        var points = {};
        var performances = matchPerformances[matchId];
        for(playerId in performances) {
            points = calculatePoints(performances[playerId]);
            var matchPoint = matchPoints[matchId];

            if(matchPoint){
                matchPoint[playerId] = points
            }else{
                matchPoints[matchId]={
                    [playerId]:points
                };
            }

            var playerPoint = playerPoints[playerId];
            if(playerPoint){
                playerPoint[matchId]=points;
            }else{
                playerPoints[playerId]={
                    [matchId]:points
                };
            }
        }
        return true;
    }
    return false;
}

function calculatePoints(performance){
    var battingPoints = 0;
    battingPoints = battingPoints+performance.runs;
    battingPoints = battingPoints+(performance.runs-performance.ballsPlayed);
    battingPoints = battingPoints + (performance.fours*1);
    battingPoints = battingPoints + (performance.sixes*2);
    var battingBonus =  performance.runs >= 100 ? 50 :
                        performance.runs >= 75 ? 30 :
                        performance.runs >= 50 ? 15 :
                        performance.runs >= 25 ? 5 :
                        performance.runs ==0 ? -5 : 0

    battingPoints = battingBonus + battingPoints;
    
    var bowlingPoints = 0;
    var ballsBowled = getBallsBowled(performance.oversBalled);
    bowlingPoints = bowlingPoints + (performance.wickets*20);
    var difference = (ballsBowled*1.5)-performance.runsConceeded;
    difference>0 ? bowlingPoints = bowlingPoints+ (difference*2) : bowlingPoints+difference;
    var bowlingBonus =  performance.wickets >=5 ? 50 :
                        performance.wickets >=4 ? 30 :
                        performance.wickets >=3 ? 15 :
                        performance.wickets >=2 ? 5 :0;
    bowlingPoints = bowlingBonus+bowlingPoints;
    bowlingPoints = bowlingPoints + performance.dotBalls;
    bowlingPoints = bowlingPoints + (performance.maidens*25);

    var fieldingPoints = 10 * (performance.catches + performance.stumpings + performance.runouts);

    var bonusPoints = 0;
    performance.playerOfMatch ? bonusPoints = bonusPoints+25 : null;
    performance.winningSide ? bonusPoints = bonusPoints+5 : null;

    var totalPoints = battingPoints + bowlingPoints + fieldingPoints + bonusPoints;

    return {
        battingPoints,
        bowlingPoints,
        fieldingPoints,
        bonusPoints,
        totalPoints
    };
}

function getBallsBowled(overs){
    var completedOvers = Math.floor(overs);
    var extraBalls = (overs - Math.floor(overs))*10;
    return (completedOvers*6)+extraBalls;
}

function addUserPointsOfMatch(matchId){
    var matchId = parseInt(matchId);
    var team = matchId<29? 'team1' : matchId<56 ? 'team2' : 'team3';
    var playerPointsInMatch = matchPoints[matchId];
    if(playerPointsInMatch){
        for(playerId in playerPointsInMatch){
            for(auction in userPoints){
                for(user in auction){}
            }
            console.log(playerId);
            console.log(playerPointsInMatch[playerId]);
        }
    }
    return true;
}


module.exports={
    editUserTeam,
    getUserTeam,
    evaluate,

    // Matches Functions
    addMatch,
    getMatches,
    editMatch,
    deleteMatch,
    getPlayersForMatch,

    // performances
    addPerformances,
    calcPerformances,
    
    // addToUsers
    addUserPointsOfMatch
}