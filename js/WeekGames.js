/**
 * WeekGames.js
 * 
 * Takes the XML imported games from NFL.com and creates a Javascript object containing information about those NFL games.
 * The XML root element is the returned data from a call to $.get(). The URL passed to $.get() is either:
 * 'http://www.nfl.com/liveupdate/scorestrip/ss.xml' (for live updates for current week)		OR
 * 'http://http://www.nfl.com/ajax/scorestrip?season=####&seasonType=REG&week=##' (replace #'s with year and week number for specific week)
 * 
 * WeekGames contains an array of GameStats objects (with length equal to the number of games played that week).
 * Simliar to WeekGames, GameStats contains useful information about a given NFL game (e.g., date/time, home team, away team, etc.)
 * Finally, the homeTeam/awayTeam properties contained in GameStats are objects containing information about that team (e.g., team abbreviation, team full name, score, etc.)
 * @author Eric Kurtzberg
 */

/**
 * Sets the number of games that have started
 * @param {type} weekGames
 * @param {type} callback
 */
function getStartedGames(weekGames, callback) {
	for (var i=0; i<weekGames.games.length; i++) {
		if (weekGames.timeNow > weekGames.games[i].date) {
			weekGames.startedGames++;
			weekGames.games[i].isGameStarted = true;
		}
	}
	callback();
}

/**
 * Get the current time as returned by an api service
 * @param {WeekGames} weekGames WeekGames Object 
 * @param {function} callback function to be called upon completion.
 */
function getTimeNow(weekGames, callback) {
	$.ajax({
		dataType:	'json',	
		url:		'http://time.jsontest.com/',
		timeout:	5000,		// timeout in milliseconds
		success:	function (result) {
			weekGames.timeNow = new Date(result.milliseconds_since_epoch);
			getStartedGames(weekGames, callback);
		},
		error:		function (xhr) {
			console.log('Error status: ' + xhr.status);
			console.log('Error reading from time server.');
			// wait 5 seconds and try again
			setTimeout(function () {
				getTimeNow(weekGames, callback);
			}, 5000 );
		}
	});
}

Date.prototype.stdTimezoneOffset = function () {
	var jan = new Date(this.getFullYear(), 0, 1);
	var jul = new Date(this.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

/**
 * Calculates the kickoff date/time of an NFL game
 * @param {string} time Time of day in the format of 'hh:mm' or 'h:mm'
 * @param {string} day Day of week in the 3 letter abbreviated form (e.g., 'Mon')
 * @param {string} id Identifier for the NFL game containing the date of the game
 * (e.g., yyyymmdd## where yyyy = Year, mm = Month, dd = Day of month, and ## = game played that week (1st, 2nd, etc.))
 * @returns {getDate.date|Date}
 */
function getDate(time, day, id) {
	var splitTime = time.split(':');		// split the time
	var hour = parseInt(splitTime[0]);		// parse the hour part of time into an integer
	var minute = parseInt(splitTime[1]);	// parse the minute part of time into an integer
	// check for London game or Thanksgiving game and adjust for UTC accordingly
	if (day==='Sun' && id.substr(id.length - 2)==='00' && hour > 8 || day==='Thu' && hour===12) {
		hour += 4;
	} else {
		hour += 16;
	}
	// check for daylight savings
	var date = new Date(Date.UTC(parseInt(id.substr(0, 4)), parseInt(id.substr(4, 2))-1, parseInt(id.substr(6, 2)), hour, minute));
	if (!date.dst()) {
		date.setHours(date.getHours() + 1);
	}
	return date;
}

/**
 * Function to decipher the NFL quarter read in from NFL's XML document
 * @param {string} quarter string read in from NFL's XML document (e.g., '1', '4', 'F', 'FO')
 * @return {string} returns a more readable string giving the parameter passed
 */
function getQuarter(quarter) {
	switch (quarter) {
	case 'P' : return 'Pregame';
	case 'H' : return 'Halftime';
	case 'F' : return 'Final';
	case 'FO': return 'Final OT';
	default	 :	
		if (parseInt(quarter) > 4 ) {
			return 'OT';
		} else {
			return quarter;
		}
	}
}

/**
 * Returns the full name of an NFL team given a valid three letter abbreviation
 * @param {String} name Team abbreviation
 * @returns {String} full name of an NFL team ('Unknown Team' otherwise)
 * @static
 */
Team.getTeamName = function (name) {
	switch (name) {
	case 'ARI': return 'Arizona\nCardinals';
	case 'ATL':	return 'Atlanta\nFalcons';
	case 'BAL':	return 'Baltimore\nRavens';
	case 'BUF':	return 'Buffalo\nBills';
	case 'CAR':	return 'Carolina\nPanthers';
	case 'CHI':	return 'Chicago\nBears';
	case 'CIN':	return 'Cincinnati\nBengals';
	case 'CLE':	return 'Cleveland\nBrowns';
	case 'DAL':	return 'Dallas\nCowboys';
	case 'DEN':	return 'Denver\nBroncos';
	case 'DET':	return 'Detroit\nLions';
	case 'GB' :	return 'Green Bay\nPackers';
	case 'HOU':	return 'Houston\nTexans';
	case 'IND':	return 'Indianapolis\nColts';
	case 'JAX':	return 'Jacksonville\nJaguars';
	case 'KC' :	return 'Kansas City\nChiefs';
	case 'LA' :	return 'Los Angeles\nRams';
	case 'MIA':	return 'Miami\nDolphins';
	case 'MIN':	return 'Minnesota\nVikings';
	case 'NE' :	return 'New England\nPatriots';
	case 'NO' :	return 'New Orleans\nSaints';
	case 'NYG':	return 'New York\nGiants';
	case 'NYJ':	return 'New York\nJets';
	case 'OAK':	return 'Oakland\nRaiders';
	case 'PHI':	return 'Philadelphia\nEagles';
	case 'PIT':	return 'Pittsburgh\nSteelers';
	case 'SD' :	return 'San Diego\nChargers';
	case 'SF' :	return 'San Francisco\n49ers';
	case 'SEA':	return 'Seattle\nSeahawks';
	case 'TB' :	return 'Tampa Bay\nBuccaneers';
	case 'TEN':	return 'Tennessee\nTitans';
	case 'WAS':	return 'Washington\nRedskins';
	default:	return 'Unknown\nTeam';
	}	
};

/**
 * Returns an HTML image of an NFL team given a valid three letter abbreviation
 * @param {type} name Team abbreviation
 * @returns {String}
 * @static
 */
Team.getTeamLogo = function (name) {
	switch (name) {
	case 'ARI':	return '<img alt="Arizona Cardinals" src="http://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.gif">';
	case 'ATL':	return '<img alt="Atlanta Falctions" src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Atlanta_Falcons_logo.svg/1088px-Atlanta_Falcons_logo.svg.png" >';
	case 'BAL':	return '<img alt="Baltimore Ravens" src="https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/415px-Baltimore_Ravens_logo.svg.png" >';
	case 'BUF':	return '<img alt="Buffalo Bills" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/279px-Buffalo_Bills_logo.svg.png" >';
	case 'CAR':	return '<img alt="Carolina Panthers" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Carolina_Panthers_logo_2012.svg/100px-Carolina_Panthers_logo_2012.svg.png" >';
	case 'CHI':	return '<img alt="Chicago Bears" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/400px-Chicago_Bears_logo.svg.png" >';
	case 'CIN':	return '<img alt="Cincinnati Bengals" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Cincinnati_Bengals.svg/250px-Cincinnati_Bengals.svg.png" >';
	case 'CLE':	return '<img alt="Cleveland Browns" src="https://upload.wikimedia.org/wikipedia/en/5/5a/Cleveland_Browns_Logo.svg" >';
	case 'DAL':	return '<img alt="Dallas Cowboys" src="http://content.sportslogos.net/logos/7/165/full/406.gif" >';
	case 'DEN':	return '<img alt="Denver Broncos" src="http://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/100px-Denver_Broncos_logo.svg.png" >';
	case 'DET':	return '<img alt="Detroit Lions" src="http://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuoif9.gif" >';
	case 'GB' :	return '<img alt="Green Bay Packers" src="http://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.gif" >';
	case 'HOU':	return '<img alt="Houston Texans" src="http://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/100px-Houston_Texans_logo.svg.png" >';
	case 'IND':	return '<img alt="Indianapolis Colts" src="http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/100px-Indianapolis_Colts_logo.svg.png" >';
	case 'JAX':	return '<img alt="Jacksonville Jaguars" src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Jacksonville_Jaguars_logo.svg/100px-Jacksonville_Jaguars_logo.svg.png" >';
	case 'KC' :	return '<img alt="Kansas City Chiefs" src="http://content.sportslogos.net/logos/7/162/full/857.gif" >';
	case 'LA' :	return '<img alt="Los Angeles Rams" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/NFL_Rams_logo.svg/281px-NFL_Rams_logo.svg.png" >';
	case 'MIA':	return '<img alt="Miami Dolphins" src="http://upload.wikimedia.org/wikipedia/en/thumb/8/81/Miami_Dolphins_2013_Logo.svg/100px-Miami_Dolphins_2013_Logo.svg.png" >';
	case 'MIN':	return '<img alt="Minnesota Vikings" src="https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Minnesota_Vikings_logo.svg/95px-Minnesota_Vikings_logo.svg.png" >';
	case 'NE' :	return '<img alt="New England Patriots" src="http://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/100px-New_England_Patriots_logo.svg.png" >';
	case 'NO' :	return '<img alt="New Orleans Saints" src="http://content.sportslogos.net/logos/7/175/full/907.gif" >';
	case 'NYG':	return '<img alt="New York Giants" src="http://content.sportslogos.net/logos/7/166/full/919.gif" >';
	case 'NYJ':	return '<img alt="New York Jets" src="http://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/100px-New_York_Jets_logo.svg.png" >';
	case 'OAK':	return '<img alt="Oakland Raiders" src="http://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Oakland_Raiders.svg/100px-Oakland_Raiders.svg.png" >';
	case 'PHI':	return '<img alt="Philadelphia Eagles" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Philadelphia_Eagles_primary_logo.svg/100px-Philadelphia_Eagles_primary_logo.svg.png" >';
	case 'PIT':	return '<img alt="Pittsburgh Steelers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/135px-Pittsburgh_Steelers_logo.svg.png" >';
	case 'SD' :	return '<img alt="San Diego Chargers" src="http://upload.wikimedia.org/wikipedia/en/thumb/0/06/San_Diego_Chargers_logo.svg/100px-San_Diego_Chargers_logo.svg.png" >';
	case 'SF' :	return '<img alt="San Francisco 49ers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/49ers_Logo.svg/460px-49ers_Logo.svg.png" >';
	case 'SEA':	return '<img alt="Seattle Seahawks" src="http://upload.wikimedia.org/wikipedia/it/0/01/Seattle_Seahawks_Logo_2012.png" >';
	case 'TB' :	return '<img alt="Tampa Bay Buccaneers" src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Tampa_Bay_Buccaneers_logo.svg/191px-Tampa_Bay_Buccaneers_logo.svg.png" >';
	case 'TEN':	return '<img alt="Tennessee Titans" src="http://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Tennessee_Titans_logo.svg/100px-Tennessee_Titans_logo.svg.png" >';
	case 'WAS':	return '<img alt="Washington Redskins" src="http://content.sportslogos.net/logos/7/168/full/im5xz2q9bjbg44xep08bf5czq.gif" >';
	default:	return 'Unknown Logo';
	}
};

/**
 * Returns the logo url of an NFL team given a valid three letter abbreviation
 * @param {String} name Team abbreviation
 * @returns {String} logo url of an NFL team ('Unknown logo' otherwise)
 * @static
 */
Team.getTeamUrl = function (name) {
	switch (name) {
	case 'ARI':	return 'http://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.gif';
	case 'ATL':	return 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Atlanta_Falcons_logo.svg/1088px-Atlanta_Falcons_logo.svg.png';
	case 'BAL':	return 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/415px-Baltimore_Ravens_logo.svg.png';
	case 'BUF':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/279px-Buffalo_Bills_logo.svg.png';
	case 'CAR':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Carolina_Panthers_logo_2012.svg/100px-Carolina_Panthers_logo_2012.svg.png';
	case 'CHI':	return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/400px-Chicago_Bears_logo.svg.png';
	case 'CIN':	return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Cincinnati_Bengals.svg/250px-Cincinnati_Bengals.svg.png';
	case 'CLE':	return 'https://upload.wikimedia.org/wikipedia/en/5/5a/Cleveland_Browns_Logo.svg';
	case 'DAL':	return 'http://content.sportslogos.net/logos/7/165/full/406.gif';
	case 'DEN':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/100px-Denver_Broncos_logo.svg.png';
	case 'DET':	return 'http://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuoif9.gif';
	case 'GB' :	return 'http://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.gif';
	case 'HOU':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/100px-Houston_Texans_logo.svg.png';
	case 'IND':	return 'http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/100px-Indianapolis_Colts_logo.svg.png';
	case 'JAX':	return 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Jacksonville_Jaguars_logo.svg/100px-Jacksonville_Jaguars_logo.svg.png';
	case 'KC' :	return 'http://content.sportslogos.net/logos/7/162/full/857.gif';
	case 'LA' :	return 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/NFL_Rams_logo.svg/281px-NFL_Rams_logo.svg.png';
	case 'MIA':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/8/81/Miami_Dolphins_2013_Logo.svg/100px-Miami_Dolphins_2013_Logo.svg.png';
	case 'MIN':	return 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Minnesota_Vikings_logo.svg/95px-Minnesota_Vikings_logo.svg.png';
	case 'NE' :	return 'http://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/100px-New_England_Patriots_logo.svg.png';
	case 'NO' :	return 'http://content.sportslogos.net/logos/7/175/full/907.gif';
	case 'NYG':	return 'http://content.sportslogos.net/logos/7/166/full/919.gif';
	case 'NYJ':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/100px-New_York_Jets_logo.svg.png';
	case 'OAK':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Oakland_Raiders.svg/100px-Oakland_Raiders.svg.png';
	case 'PHI':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Philadelphia_Eagles_primary_logo.svg/100px-Philadelphia_Eagles_primary_logo.svg.png';
	case 'PIT':	return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/135px-Pittsburgh_Steelers_logo.svg.png';
	case 'SD' :	return 'http://upload.wikimedia.org/wikipedia/en/thumb/0/06/San_Diego_Chargers_logo.svg/100px-San_Diego_Chargers_logo.svg.png';
	case 'SF' :	return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/49ers_Logo.svg/460px-49ers_Logo.svg.png';
	case 'SEA':	return 'http://upload.wikimedia.org/wikipedia/it/0/01/Seattle_Seahawks_Logo_2012.png';
	case 'TB' :	return 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Tampa_Bay_Buccaneers_logo.svg/191px-Tampa_Bay_Buccaneers_logo.svg.png';
	case 'TEN':	return 'http://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Tennessee_Titans_logo.svg/100px-Tennessee_Titans_logo.svg.png';
	case 'WAS':	return 'http://content.sportslogos.net/logos/7/168/full/im5xz2q9bjbg44xep08bf5czq.gif';
	default:	return 'Unknown Logo';
	}
};

/**
 * Returns the primary team color for an NFL team given a valid three letter abbreviation
 * @param {String} name Team abbreviation
 * @returns {String} primary team color of an NFL team in the format 'rgb(255, 255, 255)' 
 */
Team.getTeamColor = function (name) {
	switch (name) {
	case 'ARI': return '#97233F';
	case 'ATL':	return '#A71930';
	case 'BAL':	return '#241773';
	case 'BUF':	return '#00338D';
	case 'CAR':	return '#0085CA';
	case 'CHI':	return '#0B162A';
	case 'CIN':	return '#FB4F14';
	case 'CLE':	return '#FB4F14';
	case 'DAL':	return '#002244';
	case 'DEN':	return '#FB4F14';
	case 'DET':	return '#005A8B';
	case 'GB' :	return '#203731';
	case 'HOU':	return '#A71930';
	case 'IND':	return '#002C5F';
	case 'JAX':	return '#000000';
	case 'KC' :	return '#E31837';
	case 'LA' :	return '#002244';
	case 'MIA':	return '#008E97';
	case 'MIN':	return '#4F2683';
	case 'NE' :	return '#002244';
	case 'NO' :	return '#9F8958';
	case 'NYG':	return '#0B2265';
	case 'NYJ':	return '#203731';
	case 'OAK':	return '#000000';
	case 'PHI':	return '#004953';
	case 'PIT':	return '#000000';
	case 'SD' :	return '#0073CF';
	case 'SF' :	return '#AA0000';
	case 'SEA':	return '#69BE28';
	case 'TB' :	return '#D50A0A';
	case 'TEN':	return '#002244';
	case 'WAS':	return '#773141';
	default	:	return 'Unknown';
	}
};

/**
 * Object Team constructor containing team abbrevation, full name, and logo (HTML string).
 * @param {string} name Team abbreviation
 * @param {string} teamWithPossession the team with possession 
 * @param {string} score the score for this team 
 * @param {string} isInRedZone is this team in the red zone (true or false)
 * @returns {Team}
 */
function Team(name, teamWithPossession, score, isInRedZone) {
	this.abbrName = name;
	this.fullName = Team.getTeamName(name);
	this.logo = Team.getTeamLogo(name);
    this.hasPossession = (teamWithPossession === this.abbrName);
    this.score = (isNaN(parseInt(score)))
		? 0
		: parseInt(score);
	this.isInRedZone = (isInRedZone === '1');
}

/**
 * Determines the winner for the give GameStats object
 * Will set 'TIE' if the game resulted in a tie.
 * Will set null if the game has not yet been decided.
 * Otherwise will return the Team object of the winning team
 * @param {GameStats} game GameStats object constructed from XML document from NFL.com
 */
function getWinner(game) {
	if (game.quarter.includes('Final')) {
		if (game.awayTeam.score > game.homeTeam.score) {
			return game.awayTeam;
		} else if (game.awayTeam.score < game.homeTeam.score) {
			return game.homeTeam;
		} else {
			return 'TIE';
		}
	} else {
		return null;
	}
}

/**
 * GameStats object contructor. Constructs an object that contains all information about an NFL game given the following parameters.
 * @param {string} id Game ID number ('eid' attribute on NFL's XML document)
 * @param {string} day Three letter abbreviation for the day the game is being played ('d' attribute on NFL's XML document)
 * @param {string} time Time of day game is being played ('t' attribute on NFL's XML document)
 * @param {string} quarter Current quarter of the game ('q' attribute on NFL's XML document)
 * @param {string} timeInQuarter Time remaining in the current quarter ('k' attribute on NFL's XML document)
 * @param {string} homeTeam Home team three letter NFL team abbreviation ('h' attribute on NFL's XML document)
 * @param {string} homeTeamScore Home team score ('hs' attribute on NFL's XML document)
 * @param {string} awayTeam Away team three letter NFL team abbreviation ('v' attribute on NFL's XML document)
 * @param {string} awayTeamScore Away team score ('vs' attribute on NFL's XML document)
 * @param {string} teamWithPossession Team with possession of the ball ('p' attribute on NFL's XML document)
 * @param {string} isInRedZone Team with possession is in the red zone ('rz' attribute on NFL's XML document)
 * @param {string} gameAlert Game alert ('ga' attribute on NFL's XML document)
 * @param {string} gameType Preseason, Regular, or Postseason ('gt' attribute on NFL's XML document)
 * @returns {GameStats} Object with information about an NFL game
 */
function GameStats(id, day, time, quarter, timeInQuarter, homeTeam, homeTeamScore, awayTeam, awayTeamScore, teamWithPossession, isInRedZone, gameAlert, gameType) {
	this.id = id;
	this.date = getDate(time, day, id);
	this.dateStringLong = (this.date.toLocaleString('en-US', {
		weekday:	'long',
		year:		'numeric',
		month:		'short',
		day: 'numeric'
	}) + '\n' + this.date.toLocaleTimeString('en-US', {
		hour:			'numeric',
		minute:			'numeric',
		timeZoneName:	'short'
	}));
	this.dateStringShort = (this.date.toLocaleString('en-US', {
		year:	'2-digit',
		month:	'numeric',
		day:	'numeric'
	}) + '\n' + this.date.toLocaleTimeString('en-US', {
		hour:	'numeric',
		minute: 'numeric'
	}));
	this.isGameStarted = false;
	this.quarter = getQuarter(quarter);
	this.timeInQuarter = (timeInQuarter !== null && time !== '')
		? timeInQuarter
		: '';
	this.homeTeam = new Team(homeTeam, teamWithPossession, homeTeamScore, isInRedZone);
	this.awayTeam = new Team(awayTeam, teamWithPossession, awayTeamScore, isInRedZone);
	this.gameAlert = gameAlert;
	this.gameType = gameType;
	this.winner = getWinner(this);
}

/**
 * Parses through each game element in XML document and returns an array of objects each with info about the containing game.
 * @param {Object} xmlDoc As returned by jQuery().
 * @ returns {Array|WeekGames} Returns an array of WeekGames objects
 */
function getGames(xmlDoc) {
	var gameStats = [];
	var games = xmlDoc.find('g');
	for (var i=0; i<games.length; i++) {
		gameStats.push(new GameStats(
			games[i].getAttribute('eid'),
			games[i].getAttribute('d'),
			games[i].getAttribute('t'),
			games[i].getAttribute('q'),
			games[i].getAttribute('k'),
			games[i].getAttribute('h'),
			games[i].getAttribute('hs'),
			games[i].getAttribute('v'),
			games[i].getAttribute('vs'),
			games[i].getAttribute('p'),
			games[i].getAttribute('rz'),
			games[i].getAttribute('ga'),
			games[i].getAttribute('gt')
		));
	}
	return gameStats;
}

/**
 * @param {Array} games Array of GameStats containing all this weeks games
 * @returns {Array|getByeTeams.byeTeams}
 */
function getByeTeams(games) {
	var byeTeams = [];
	// Start the list with all NFL teams
	var byeTeamsObj = {
		ARI:	undefined,
		ATL:	undefined,
		BAL:	undefined,
		BUF:	undefined,
		CAR:	undefined,
		CHI:	undefined,
		CIN:	undefined,
		CLE:	undefined,
		DAL:	undefined,
		DEN:	undefined,
		DET:	undefined,
		GB :	undefined,
		HOU:	undefined,
		IND:	undefined,
		JAX:	undefined,
		KC :	undefined,
		LA :	undefined,
		MIA:	undefined,
		MIN:	undefined,
		NE :	undefined,
		NO :	undefined,
		NYG:	undefined,
		NYJ:	undefined,
		OAK:	undefined,
		PHI:	undefined,
		PIT:	undefined,
		SD :	undefined,
		SF :	undefined,
		SEA:	undefined,
		TB :	undefined,
		TEN:	undefined,
		WAS:	undefined
	};
	// remove teams that are playing a game
	for (var i=0; i<games.length; i++) {
		delete byeTeamsObj[games[i].homeTeam.abbrName];
		delete byeTeamsObj[games[i].awayTeam.abbrName];
	}
	// create Team object for remaining teams
	for (var i in byeTeamsObj) {
		byeTeams.push(new Team(i));
	}
	return byeTeams;
}

/**
 * Object constructor containing all the weekly data
 * @param {Object} xml XML root element as returned by jQuery.get() from NFL.com.
 * @param {function} callback Function to call once the constructor is complete
 */
function WeekGames(xml, callback) {
	var xmlDoc			= $(xml);
	var weekData		= xmlDoc.find('gms')[0];
	
	this.timeNow		= getTimeNow(this, callback);
	this.week			= weekData.getAttribute('w');
	this.season			= weekData.getAttribute('y');
	this.seasonType		= weekData.getAttribute('t');
	this.startedGames	= 0;
	this.completedGames	= xmlDoc.find('g[q="F"], g[q="FO"]').length;
	this.games			= getGames(xmlDoc);
	this.byesTeams		= getByeTeams(this.games);
	
	// sort the games by date. if dates are equal, sort by game id... just in case
	this.games.sort(function (a, b) {
		// use date.getTime() since we're comparing with !== operator
		if (a.date.getTime() !== b.date.getTime()) {
			return a.date - b.date;
		} else {
			return parseInt(a.id) - parseInt(b.id);
		}
	});
}