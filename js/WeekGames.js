/**
 * WeekGames.js
 * 
 * Takes the XML document object from NFL.com and creates a Javascript object containing information about those NFL games.
 * An XML document object is the returned data from a call to $.get(). The URL passed to $.get() is either:
 * 'http://www.nfl.com/liveupdate/scorestrip/ss.xml' (for live updates for current week)	OR
 * 'http://http://www.nfl.com/ajax/scorestrip?season=####&seasonType=REG&week=##' (replace #'s with year and week number for specific week)
 * 
 * WeekGames contains an array of GameStats objects (with length equal to the number of games played that week).
 * Simliar to WeekGames, GameStats contains useful information about a given NFL game (e.g., date/time, home team, away team, etc.)
 * Finally, the homeTeam/awayTeam properties contained in GameStats are objects containing information about that team (e.g., team abbreviation, team full name, score, etc.)
 * @author Eric Kurtzberg
 * @version 1.1
 */
 
 /**
 * Object constructor containing all the weekly data
 * @param {Object} xml XML document object as returned by jQuery.get() from NFL.com.
 * @param {function} callback Function to call once the constructor is complete
 */
function WeekGames(xml, callback) {
	var x2js			= new X2JS();
	var jsonObj			= x2js.xml2json(xml);	// convert to JSON object
	var weekData		= jsonObj.ss.gms;

	this.setGames(weekData.g);
	
	this.week			= parseInt(weekData._w);
	this.season			= parseInt(weekData._y);
	this.setSeasonType(weekData._t);
	this.startedGames;
	this.regFinals		= getObjects(jsonObj, '_q', 'F').length;
	this.otFinals		= getObjects(jsonObj, '_q', 'FO').length;
	this.completedGames	= this.regFinals + this.otFinals;
	this.setByeTeams();
	
	// sort the games by date. if dates are equal, sort by game id... just in case
	this.games.sort(function (a, b) {
		// use date.getTime() since we're comparing with !== operator
		if (a.date.getTime() !== b.date.getTime()) {
			return a.date - b.date;
		} else {
			return parseInt(a.id) - parseInt(b.id);
		}
	});
	this.setTimeNow(callback);
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
 * Updates all NFL data to most current data returned from NFL.com 
 * @param {function} callback function to be called upon completion
 * @returns {undefined}
 */
WeekGames.prototype.update = function (callback) {
	// get reference to WeekGames Object, because 'this' will reference something else inside the $.ajax() call
	var self = this;
	$.ajax({
		url: 'http://www.nfl.com/liveupdate/scorestrip/ss.xml',
		timeout: 5000, // timeout in milliseconds
		success: function(xml) {
			WeekGames.call(self, xml, callback);
		},
		error: function(xhr) {
			console.log("Error status: " + xhr.status);
			TIMEOUT = setTimeout(function () {
				self.update(callback);
			}, 5000);
		}
	});
};

/**
 * Parses through each game element in JSON object and returns an array of objects each with info about the containing game.
 * @param {Object} games Array of JSON objects. Members of the JSON object converted from XML document object as returned by x2js.xml2json(xml).
 */
WeekGames.prototype.setGames = function (games) {
	var gameStats = [];
	for (var i=0; i<games.length; i++) {
		gameStats.push(new GameStats(
			games[i]._eid,
			games[i]._d,
			games[i]._t,
			games[i]._q,
			games[i]._k,
			games[i]._h,
			games[i]._hs,
			games[i]._v,
			games[i]._vs,
			games[i]._p,
			games[i]._rz,
			games[i]._ga,
			games[i]._gt
		));
	}
	this.games = gameStats;
};

/**
 * Get the current time as returned by an api service
 * @param {function} callback function to be called upon completion.
 */
WeekGames.prototype.setTimeNow = function (callback) {
	// get reference to WeekGames Object, because 'this' will reference something else inside the $.ajax() call
	var self = this;
	$.ajax({
		dataType:	'json',	
		url:		'http://time.jsontest.com/',
		timeout:	5000,		// timeout in milliseconds
		success:	function (result) {
			self.timeNow = new Date(result.milliseconds_since_epoch);
			self.setStartedGames(callback);
		},
		error:		function (xhr) {
			console.log('Error status: ' + xhr.status);
			console.log('Error reading from time server.');
			// wait 5 seconds and try again
			setTimeout(function () {
				self.setTimeNow(callback);
			}, 5000 );
		}
	});
};

WeekGames.prototype.setSeasonType = function (seasonType) {
	switch (seasonType) {
	case 'P':	this.seasonType = 'Preseason'; break;
	case 'R':
		if (this.week <= 17) {
			this.seasonType = 'Regular';
		} else {
			this.seasonType = 'Postseason';
		}
		break;
	default:	this.seasonType = 'Unknown'; break;
	}
};

/**
 * Sets the number of games that have started
 * @param {type} callback
 */
WeekGames.prototype.setStartedGames = function (callback) {
	this.startedGames = 0;
	for (var i=0; i<this.games.length; i++) {
		if (this.timeNow > this.games[i].date) {
			this.startedGames++;
			this.games[i].isGameStarted = true;
		}
	}
	callback();
};

/**
 * Determines which Teams are on a bye week and pushes a new Team object corresponding to that time to the array
 */
WeekGames.prototype.setByeTeams = function () {
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
		LAC:	undefined,
		MIA:	undefined,
		MIN:	undefined,
		NE :	undefined,
		NO :	undefined,
		NYG:	undefined,
		NYJ:	undefined,
		OAK:	undefined,
		PHI:	undefined,
		PIT:	undefined,
		SF :	undefined,
		SEA:	undefined,
		TB :	undefined,
		TEN:	undefined,
		WAS:	undefined
	};
	// remove teams that are playing a game
	for (var i=0; i<this.games.length; i++) {
		delete byeTeamsObj[this.games[i].homeTeam.abbrName];
		delete byeTeamsObj[this.games[i].awayTeam.abbrName];
	}
	// create Team object for remaining teams
	for (var i in byeTeamsObj) {
		byeTeams.push(new Team(i));
	}
	this.byeTeams = byeTeams;
};

/**
 * Returns a GameStats object that matches the given 'id'. If no game is matched, then a null object is returned.
 * @param {string} id Game ID number 'eid'
 * @returns {@var;gameStats}
 */
WeekGames.prototype.getGame = function (id) {
	var game = null;
	for (var i=0; i<this.games.length; i++) {
		if (this.games[i].id === id) {
			game = this.games[i];
			break;
		}
	}
	return game;
};

/**
 * GameStats object contructor. Constructs an object that contains all information about an NFL game given the following parameters.
 * @param {string} id Game ID number ('eid')
 * @param {string} day Three letter abbreviation for the day the game is being played ('d')
 * @param {string} time Time of day game is being played ('t')
 * @param {string} quarter Current quarter of the game ('q')
 * @param {string} timeInQuarter Time remaining in the current quarter ('k')
 * @param {string} homeTeam Home team three letter NFL team abbreviation ('h')
 * @param {string} homeTeamScore Home team score ('hs')
 * @param {string} awayTeam Away team three letter NFL team abbreviation ('v')
 * @param {string} awayTeamScore Away team score ('vs')
 * @param {string} teamWithPossession Team with possession of the ball ('p')
 * @param {string} isInRedZone Team with possession is in the red zone ('rz')
 * @param {string} gameAlert Game alert ('ga')
 * @param {string} gameType Preseason, Regular, or Postseason ('gt')
 * @returns {GameStats} Object with information about an NFL game
 */
function GameStats(id, day, time, quarter, timeInQuarter, homeTeam, homeTeamScore, awayTeam, awayTeamScore, teamWithPossession, isInRedZone, gameAlert, gameType) {
	this.id = id;
	this.setDate(time, day, id);
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
	this.setQuarter(quarter);
	this.timeInQuarter = (timeInQuarter)
		? timeInQuarter
		: '';
	this.homeTeam = new Team(homeTeam, teamWithPossession, homeTeamScore, isInRedZone);
	this.awayTeam = new Team(awayTeam, teamWithPossession, awayTeamScore, isInRedZone);
	this.gameAlert = gameAlert;
	this.gameType = gameType;
	this.setWinner();
}

/**
 * Calculates the kickoff date/time of an NFL game
 * @param {string} time Time of day in the format of 'hh:mm' or 'h:mm'
 * @param {string} day Day of week in the 3 letter abbreviated form (e.g., 'Mon')
 * @param {string} id Identifier for the NFL game containing the date of the game
 * (e.g., yyyymmdd## where yyyy = Year, mm = Month, dd = Day of month, and ## = game played that week (1st, 2nd, etc.))
 * @returns {getDate.date|Date}
 */
GameStats.prototype.setDate = function (time, day, id) {
	var splitTime = time.split(':');		// split the time
	var hour = parseInt(splitTime[0]);		// parse the hour part of time into an integer
	var minute = parseInt(splitTime[1]);	// parse the minute part of time into an integer
	// check for London game or Thanksgiving game and adjust for UTC accordingly
	if (day === 'Sun' && id.substr(id.length - 2) === '00' && hour > 8 || day === 'Thu' && hour === 12) {
		hour += 4;
	} else {
		hour += 16;
	}
	// check for daylight savings
	var date = new Date(Date.UTC(parseInt(id.substr(0, 4)), parseInt(id.substr(4, 2))-1, parseInt(id.substr(6, 2)), hour, minute));
	if (!date.dst()) {
		date.setHours(date.getHours() + 1);
	}
	this.date = date;
};

/**
 * Function to decipher the NFL quarter read in from NFL's XML document
 * @param {string} quarter string read in from NFL's XML document (e.g., '1', '4', 'F', 'FO')
 * @return {string} returns a more readable string giving the parameter passed
 */
GameStats.prototype.setQuarter = function (quarter) {
	var q;
	switch (quarter) {
	case 'P' : q = 'Pregame'; break;
	case 'H' : q = 'Halftime'; break;
	case 'F' : q = 'Final'; break;
	case 'FO': q = 'Final OT'; break;
	default	 :	
		if (parseInt(quarter) > 4 ) {
			q = 'OT';
		} else {
			q = quarter;
		}
	}
	this.quarter = q;
};

/**
 * Determines the winner for the given GameStats object
 * Will set 'TIE' if the game resulted in a tie.
 * Will set null if the game has not yet been decided.
 * Otherwise will return the Team object of the winning team
 */
GameStats.prototype.setWinner = function () {
	var winner;
	if (this.quarter.includes('Final')) {
		if (this.awayTeam.score > this.homeTeam.score) {
			winner = this.awayTeam;
		} else if (this.awayTeam.score < this.homeTeam.score) {
			winner = this.homeTeam;
		} else {
			winner = 'TIE';
		}
	} else {
		winner = null;
	}
	this.winner = winner;
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
 * Returns the full name of an NFL team given a valid three letter abbreviation
 * @param {String} name Team abbreviation
 * @returns {String} full name of an NFL team ('Unknown Team' otherwise)
 * @static
 */
Team.getTeamName = function (name) {
	switch (name) {
	case 'ARI':	return 'Arizona\nCardinals';
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
	case 'LAC':	return 'Los Angeles\nChargers';
	case 'MIA':	return 'Miami\nDolphins';
	case 'MIN':	return 'Minnesota\nVikings';
	case 'NE' :	return 'New England\nPatriots';
	case 'NO' :	return 'New Orleans\nSaints';
	case 'NYG':	return 'New York\nGiants';
	case 'NYJ':	return 'New York\nJets';
	case 'OAK':	return 'Oakland\nRaiders';
	case 'PHI':	return 'Philadelphia\nEagles';
	case 'PIT':	return 'Pittsburgh\nSteelers';
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
	var url = Team.getTeamUrl(name);
	if (url !== 'Unknown Team') {
		return '<img alt="" src="' + url + '">';
	} else {
		return url;
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
	case 'ARI':	return 'https://upload.wikimedia.org/wikipedia/en/7/72/Arizona_Cardinals_logo.svg';
	case 'ATL':	return 'https://upload.wikimedia.org/wikipedia/en/c/c5/Atlanta_Falcons_logo.svg';
	case 'BAL':	return 'https://upload.wikimedia.org/wikipedia/en/1/16/Baltimore_Ravens_logo.svg';
	case 'BUF':	return 'https://upload.wikimedia.org/wikipedia/en/7/77/Buffalo_Bills_logo.svg';
	case 'CAR':	return 'https://upload.wikimedia.org/wikipedia/en/1/1c/Carolina_Panthers_logo.svg';
	case 'CHI':	return 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chicago_Bears_logo.svg';
	case 'CIN':	return 'https://upload.wikimedia.org/wikipedia/commons/8/81/Cincinnati_Bengals_logo.svg';
	case 'CLE':	return 'https://upload.wikimedia.org/wikipedia/en/d/d9/Cleveland_Browns_logo.svg';
	case 'DAL':	return 'https://upload.wikimedia.org/wikipedia/commons/1/15/Dallas_Cowboys.svg';
	case 'DEN':	return 'https://upload.wikimedia.org/wikipedia/en/4/44/Denver_Broncos_logo.svg';
	case 'DET':	return 'https://upload.wikimedia.org/wikipedia/en/7/71/Detroit_Lions_logo.svg';
	case 'GB' :	return 'https://upload.wikimedia.org/wikipedia/commons/5/50/Green_Bay_Packers_logo.svg';
	case 'HOU':	return 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Texans_logo.svg';
	case 'IND':	return 'https://upload.wikimedia.org/wikipedia/commons/0/00/Indianapolis_Colts_logo.svg';
	case 'JAX':	return 'https://upload.wikimedia.org/wikipedia/en/7/74/Jacksonville_Jaguars_logo.svg';
	case 'KC' :	return 'https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg';
	case 'LA' :	return 'https://upload.wikimedia.org/wikipedia/en/8/8a/Los_Angeles_Rams_logo.svg';
	case 'LAC':	return 'https://upload.wikimedia.org/wikipedia/en/7/72/NFL_Chargers_logo.svg';
	case 'MIA':	return 'https://upload.wikimedia.org/wikipedia/en/3/37/Miami_Dolphins_logo.svg';
	case 'MIN':	return 'https://upload.wikimedia.org/wikipedia/en/4/48/Minnesota_Vikings_logo.svg';
	case 'NE' :	return 'https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg';
	case 'NO' :	return 'https://upload.wikimedia.org/wikipedia/commons/5/50/New_Orleans_Saints_logo.svg';
	case 'NYG':	return 'https://upload.wikimedia.org/wikipedia/commons/6/60/New_York_Giants_logo.svg';
	case 'NYJ':	return 'https://upload.wikimedia.org/wikipedia/en/6/6b/New_York_Jets_logo.svg';
	case 'OAK':	return 'https://upload.wikimedia.org/wikipedia/en/e/ec/Oakland_Raiders_logo.svg';
	case 'PHI':	return 'https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg';
	case 'PIT':	return 'https://upload.wikimedia.org/wikipedia/commons/d/de/Pittsburgh_Steelers_logo.svg';
	case 'SF' :	return 'https://upload.wikimedia.org/wikipedia/commons/3/3a/San_Francisco_49ers_logo.svg';
	case 'SEA':	return 'https://upload.wikimedia.org/wikipedia/en/8/8e/Seattle_Seahawks_logo.svg';
	case 'TB' :	return 'https://upload.wikimedia.org/wikipedia/en/a/a2/Tampa_Bay_Buccaneers_logo.svg';
	case 'TEN':	return 'https://upload.wikimedia.org/wikipedia/en/c/c1/Tennessee_Titans_logo.svg';
	case 'WAS':	return 'https://upload.wikimedia.org/wikipedia/en/6/63/Washington_Redskins_logo.svg';
	default:	return 'Unknown Team';
	}
};

/**
 * Returns the primary team color for an NFL team given a valid three letter abbreviation
 * @param {String} name Team abbreviation
 * @returns {String} primary team color of an NFL team in hexidecimal format 
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
	case 'LAC':	return '#0073CF';
	case 'MIA':	return '#008E97';
	case 'MIN':	return '#4F2683';
	case 'NE' :	return '#002244';
	case 'NO' :	return '#9F8958';
	case 'NYG':	return '#0B2265';
	case 'NYJ':	return '#203731';
	case 'OAK':	return '#000000';
	case 'PHI':	return '#004953';
	case 'PIT':	return '#000000';
	case 'SF' :	return '#AA0000';
	case 'SEA':	return '#69BE28';
	case 'TB' :	return '#D50A0A';
	case 'TEN':	return '#002244';
	case 'WAS':	return '#773141';
	default	:	return 'Unknown';
	}
};

/**
 * Search all object's keys for a specific value and return an object with all matching keys and values
 * @param {Object} obj The object to search
 * @param {string} key The object key to checked
 * @param {string} val The value to compare to the object key value
 * @returns {Array}
 */
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] === 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i === key && obj[key] === val) {
            objects.push(obj);
        }
    }
    return objects;
}