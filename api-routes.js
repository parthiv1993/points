let router = require('express').Router();
const databaseOperations = require('./constants/DataBase');

router.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
});

router.get('/getUserTeam/:auction/:user', function (req, res) {
    var auction = req.params.auction ; 
    var user = req.params.user;
    var userTeam = databaseOperations.getUserTeam(auction,user);
    res.send(userTeam);
});

router.post('/editUserTeam/:auction/:user', function (req, res) {
    var auction = req.params.auction;
    var user = req.params.user;
    var team = req.body.team;
    var abc = databaseOperations.editUserTeam(auction,user,team);
    res.send(abc);
});

router.post('/eval',function(req,res){
    var response = databaseOperations.evaluate(req.body.command);
    res.send(response);
})

router.get('/matches',function(req,res){
    var matches = databaseOperations.getMatches();
    res.send(matches);
})

router.post('/matches',function(req,res){
    var match = req.body.match;
    var response = databaseOperations.addMatch(match)
    if(response){
        res.send(response);
        return;
    }
    res.status(400);
    res.send('Bad request ! Matches with Match already exist');
})

router.put('/matches/:matchId',function(req,res){
    var match = req.body.match;
    var matchId = req.params.matchId;
    var response = databaseOperations.editMatch(matchId,match);
    if(response){
        res.send(response);
        return;
    }
    res.status(400);
    res.send(`Match with match ${matchId} doesn't exist`);
})

router.delete('/matches/:matchId',function(req,res){
    var matchId  = req.params.matchId;
    var response = databaseOperations.deleteMatch(matchId);
    if(response){
        res.send(response);
        return;
    }
    res.status(400);
    res.send(`Match with match ${matchId} doesn't exist`);
})

router.get('/getPlayersForMatch/:matchId',function(req,res){
    var matchId  = req.params.matchId;
    var players = databaseOperations.getPlayersForMatch(matchId);
    res.send(players);
})

router.post('/addPlayerPerformances/:matchId',function(req,res){
    var matchId = req.params.matchId;
    var performances = req.body.performances;
    var response = databaseOperations.addPerformances(matchId,performances)
    if(response){
        res.send(response);
        return;
    }
    res.status(400);
    res.send(response);
})

router.post('/calcPerformances/:matchId',function(req,res){
    var matchId = req.params.matchId;
    var response = databaseOperations.calcPerformances(matchId);
    if(response){
        res.send(response);
        return;
    }
    res.status(400);
    res.send(response);
})

router.post('/addUserPoints/:matchId',function(req,res){
    var matchId = req.params.matchId;
    var response = databaseOperations.addUserPointsOfMatch(matchId);
    res.send(response);
})

module.exports=router;