module.exports={
    1: new Match('CSK','RCB')
}

function Match(homeTeam,awayTeam){
    return {
        homeTeam,
        awayTeam
    }
}