local ProfileTemplate = {

	currentGame = {
		isIt             = false,
		timerRemaining   = 120,
		score            = 0,
		isInHidingSpot   = false,
		lastTagTime      = 0,
	},

	tagGame = {
		totalTagsMade    = 0,
		totalGamesPlayed = 0,
		gamesWon         = 0,
		gamesLost        = 0,
		currentStreak    = 0,
		highestScore     = 0,
		totalTimeAsIt    = 0,
	},

}

return ProfileTemplate
