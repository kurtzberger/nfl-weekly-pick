/**
 * Name:		functions.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for all custom functions
 */

Date.prototype.stdTimezoneOffset = function() {
	var jan = new Date(this.getFullYear(), 0, 1);
	var jul = new Date(this.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

/** Returns the full name of an NFL team given a valid three letter abbreviation
 * @param name
 * @returns {String}
 */
function teamName(name)
{
	if(name=="ARI") 	return "Arizona Cardinals";
	else if(name=="ATL")return "Atlanta Falctions";
	else if(name=="BAL")return "Baltimore Ravens";
	else if(name=="BUF")return "Buffalo Bills";
	else if(name=="CAR")return "Carolina Panthers";
	else if(name=="CHI")return "Chicago Bears";
	else if(name=="CIN")return "Cincinnati Bengals";
	else if(name=="CLE")return "Cleveland Browns";
	else if(name=="DAL")return "Dallas Cowboys";
	else if(name=="DEN")return "Denver Broncos";
	else if(name=="DET")return "Detroit Lions";
	else if(name=="GB")	return "Green Bay Packers";
	else if(name=="HOU")return "Houston Texans";
	else if(name=="IND")return "Indianapolis Colts";
	else if(name=="JAX")return "Jacksonville Jaguars";
	else if(name=="KC") return "Kansas City Chiefs";
	else if(name=="LA") return "Los Angeles Rams";
	else if(name=="MIA")return "Miami Dolphins";
	else if(name=="MIN")return "Minnesota Vikings";
	else if(name=="NE")	return "New England Patriots";
	else if(name=="NO")	return "New Orleans Saints";
	else if(name=="NYG")return "New York Giants";
	else if(name=="NYJ")return "New York Jets";
	else if(name=="OAK")return "Oakland Raiders";
	else if(name=="PHI")return "Philadelphia Eagles";
	else if(name=="PIT")return "Pittsburgh Steelers";
	else if(name=="SD")	return "San Diego Chargers";
	else if(name=="SF")	return "San Francisco 49ers";
	else if(name=="SEA")return "Seattle Seahawks";
	else if(name=="TB")	return "Tampa Bay Buccaneers";
	else if(name=="TEN")return "Tennessee Titans";
	else if(name=="WAS")return "Washington Redskins";
	else				return "Unknown Team";
};

/**
 * Returns an HTML image of an NFL team given a valid three letter abbreviation
 * @param name
 * @returns {String}
 */
function teamLogo(name)
{
	if(name==="ARI") 	return '<img alt="Arizona Cardinals" src="http://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.gif">';
	else if(name==="ATL")return '<img alt="Atlanta Falctions" src="http://prod.static.falcons.clubs.nfl.com/nfl-assets/img/gbl-ico-team/ATL/logos/home/large.png" >';
	else if(name==="BAL")return '<img alt="Baltimore Ravens" src="https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/415px-Baltimore_Ravens_logo.svg.png" >';
	else if(name==="BUF")return '<img alt="Buffalo Bills" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/279px-Buffalo_Bills_logo.svg.png" >';
	else if(name==="CAR")return '<img alt="Carolina Panthers" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Carolina_Panthers_logo_2012.svg/100px-Carolina_Panthers_logo_2012.svg.png" >';
	else if(name==="CHI")return '<img alt="Chicago Bears" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/400px-Chicago_Bears_logo.svg.png" >';
	else if(name==="CIN")return '<img alt="Cincinnati Bengals" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Cincinnati_Bengals.svg/250px-Cincinnati_Bengals.svg.png" >';
	else if(name==="CLE")return '<img alt="Cleveland Browns" src="https://upload.wikimedia.org/wikipedia/en/5/5a/Cleveland_Browns_Logo.svg" >';
	else if(name==="DAL")return '<img alt="Dallas Cowboys" src="http://content.sportslogos.net/logos/7/165/full/406.gif" >';
	else if(name==="DEN")return '<img alt="Denver Broncos" src="http://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/100px-Denver_Broncos_logo.svg.png" >';
	else if(name==="DET")return '<img alt="Detroit Lions" src="http://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuoif9.gif" >';
	else if(name==="GB") return '<img alt="Green Bay Packers" src="http://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.gif" >';
	else if(name==="HOU")return '<img alt="Houston Texans" src="http://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/100px-Houston_Texans_logo.svg.png" >';
	else if(name==="IND")return '<img alt="Indianapolis Colts" src="http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/100px-Indianapolis_Colts_logo.svg.png" >';
	else if(name==="JAX")return '<img alt="Jacksonville Jaguars" src="http://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Jacksonville_Jaguars_2013_logo.png/100px-Jacksonville_Jaguars_2013_logo.png" >';
	else if(name==="KC") return '<img alt="Kansas City Chiefs" src="http://content.sportslogos.net/logos/7/162/full/857.gif" >';
	else if(name==="LA") return '<img alt="Los Angeles Rams" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/NFL_Rams_logo.svg/281px-NFL_Rams_logo.svg.png" >';
	else if(name==="MIA")return '<img alt="Miami Dolphins" src="http://upload.wikimedia.org/wikipedia/en/thumb/8/81/Miami_Dolphins_2013_Logo.svg/100px-Miami_Dolphins_2013_Logo.svg.png" >';
	else if(name==="MIN")return '<img alt="Minnesota Vikings" src="http://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Minnesota_Vikings_Logo_2013.png/100px-Minnesota_Vikings_Logo_2013.png" >';
	else if(name==="NE") return '<img alt="New England Patriots" src="http://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/100px-New_England_Patriots_logo.svg.png" >';
	else if(name==="NO") return '<img alt="New Orleans Saints" src="http://content.sportslogos.net/logos/7/175/full/907.gif" >';
	else if(name==="NYG")return '<img alt="New York Giants" src="http://content.sportslogos.net/logos/7/166/full/919.gif" >';
	else if(name==="NYJ")return '<img alt="New York Jets" src="http://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/100px-New_York_Jets_logo.svg.png" >';
	else if(name==="OAK")return '<img alt="Oakland Raiders" src="http://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Oakland_Raiders.svg/100px-Oakland_Raiders.svg.png" >';
	else if(name==="PHI")return '<img alt="Philadelphia Eagles" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Philadelphia_Eagles_primary_logo.svg/100px-Philadelphia_Eagles_primary_logo.svg.png" >';
	else if(name==="PIT")return '<img alt="Pittsburgh Steelers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/135px-Pittsburgh_Steelers_logo.svg.png" >';
	else if(name==="SD") return '<img alt="San Diego Chargers" src="http://upload.wikimedia.org/wikipedia/en/thumb/0/06/San_Diego_Chargers_logo.svg/100px-San_Diego_Chargers_logo.svg.png" >';
	else if(name==="SF") return '<img alt="San Francisco 49ers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/49ers_Logo.svg/460px-49ers_Logo.svg.png" >';
	else if(name==="SEA")return '<img alt="Seattle Seahawks" src="http://upload.wikimedia.org/wikipedia/it/0/01/Seattle_Seahawks_Logo_2012.png" >';
	else if(name==="TB") return '<img alt="Tampa Bay Buccaneers" src="http://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Tampa_Bay_Buccaneers_2014.png/100px-Tampa_Bay_Buccaneers_2014.png" >';
	else if(name==="TEN")return '<img alt="Tennessee Titans" src="http://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Tennessee_Titans_logo.svg/100px-Tennessee_Titans_logo.svg.png" >';
	else if(name==="WAS")return '<img alt="Washington Redskins" src="http://content.sportslogos.net/logos/7/168/full/im5xz2q9bjbg44xep08bf5czq.gif" >';
	else				 return 'Unknown Logo';

};

/**
 * A function that takes a day and time from NFL's xml file
 * @param day - String that must be in the format yyyymmddgg; where 'gg' represents the game number of that day.
 * @param time - String that must be in the format hh:mm or h:mm
 * @returns dateString - DateString in the form "weekday, mmm dd, yyyy hh:mm AM/PM timezone"
 */
function gameStartTime(day, time, weekday, short=true)
{
	// parse the hour part of time into an integer
	var hour = parseInt(time.substring(0, time.indexOf(":")));
	// pare the minute part of time into an integer
	var minute = parseInt(time.substr(time.indexOf(":") + 1, 2));
	// check if AM or PM and change times to UTC timezone (Times from NFL.com are EST)
	// A London game will be played only on Sunday's in which case the time reported from NFL.com is AM and not PM
	if(weekday=="Sun" && day.substr(day.length - 2)=="00" && hour > 8)
		hour += 4;
	else
		hour += 16;
	// check for daylight savings
	var date = new Date(Date.UTC(parseInt(day.substr(0, 4)), parseInt(day.substr(4, 2))-1, parseInt(day.substr(6, 2)), hour, minute));
	if(!date.dst())
		date.setHours(date.getHours() + 1);
	if(!short)
		return date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) + " " +
			date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: 'short'});
	else
		return date.toLocaleString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' }) + " " +
			date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric',});
};

/**
 * Loads current week's picks from NFL's database
 * @param xml
 */
function xmlImport(xml)
{
	var xmlDoc = $(xml);
	var g = xmlDoc.find('g');
	var home, away, day, time, weekday, dateString;
    //var week = xmlDoc.find('gms')[0].getAttribute('w');
    //var season = xmlDoc.find('gms')[0].getAttribute('y');
    
	for(var i=0; i<g.length; i++)
	{
		home = g[i].getAttribute('h');
		away = g[i].getAttribute('v');
		day = g[i].getAttribute('eid');
		weekday = g[i].getAttribute('d');
		time = g[i].getAttribute('t');
		dateString = gameStartTime(day, time, weekday, false);
		$("#body").append('<tr id=' + day + '></tr>');
		//date in the table
		$("#" + day).append('<td id="date' + i + '" style="text-align: center;">' + dateString + '</td>');
		//away at home data in table
		$("#" + day).append('<td>' + teamLogo(away) + '</td><td>' + '<input name="game' + i + '" type="radio" id="'+ away + '" value="' + away + '" />' +
				'<label class="black-text" for='+ away +'>'+ teamName(away) +'</label></td>'+
				'<td>' + teamLogo(home) + '</td><td>' + '<input name="game' + i + '" type="radio" id="'+ home + '" value="' + home + '" />' +
				'<label class="black-text" for='+ home +'>'+ teamName(home) +'</label></td>');
		//assigned points data in table
		$("#" + day).append('<td><select id="dropdown-' + i + '"><option value="" selected></option></select></td>');
		//reset button
		$("#" + day).append('<td><a id="reset-' + i + '" class="btn waves-effect waves-light blue-grey lighten-1 col s12 reset-game"><i class="mdi mdi-undo-variant"></i></a></td>');
		for(var j=1; j<=g.length; j++)
		{
			$("#dropdown-" + i).append('<option value=' + j + '>' + j + '</option>');
		}
		// update select lists
		$("select").material_select();
	}
};

/**
 * This function will disable all elements of a game that has already started (on user picks page).
 */
function disableStartedGames(callback)
{
	
	$.ajax({
		dataType:	'jsonp',	// use JSON w/padding to work around the cross-domain policies 
		url:		'http://www.timeapi.org/utc/now.json',
		success:	function(result)
			{
				var now = new Date(result.dateString);
				var gameTime, startedGames = 0, numberOfGames = $('#body tr').length;
				for(var i=0; i<numberOfGames; i++)
				{
					gameTime = Date.parse($("#date" + i).text());
					if(gameTime < now)
					{
						$("input[name=game" + i + "]").prop('disabled', true);
						$("#dropdown-" + i).prop('disabled', true);
						$('select').material_select();	// update material select UI
						$("#reset-" + i).prop('disabled', true);
						$('#body tr').eq(i).css({ opacity: 0.5 });
						startedGames++;
					}
				}
				if(startedGames === numberOfGames) $("#submit-picks").hide();	// hide submit button if all games have started
				callback();
			}
	});
};

function pointAssignments()
{
	var Values = [];	// array of values
	var value, numberOfGames = $('#body tr').length;
	
	for(var i=0; i<=numberOfGames; i++)
	{
		// fill the array with all possible point values
		if(i==0)
			Values.push("");
		else
			Values.push(i);
	}
	
	for(var i=0; i<numberOfGames; i++)
	{
		value = $('#dropdown-' + i).val();									// get current selected value
		if(value != "")														// do not remove empty selection from array. This is always a valid selection in all elements.
			Values.splice(Values.indexOf(parseInt(value)), 1);				// remove selected value for array 
		$('#dropdown-' + i + ' option[value!="' + value + '"]').remove();	// remove all values EXCEPT selected
		if(value == "")
			$('#dropdown-' + i + ' option[value="' + value + '"]').remove();// remove empty selection from element (to be added back later). 
																			// if we don't remove the empty selection there will be a duplicate added in later.
	}
	for(var i=0; i<Values.length; i++)
	{
		for(var j=0; j<numberOfGames; j++)
		{
			value = $('#dropdown-' + j).val();
			//next two conditions insert selection options in order based on their value
			if(parseInt(value) > Values[i])
				$('<option value=' + Values[i] + '>' + Values[i] + '</option>').insertBefore($('#dropdown-' + j + ' option[value="' + value + '"]'));	// add smaller values before
			else
				$('#dropdown-' + j).append('<option value=' + Values[i] + '>' + Values[i] + '</option>');	// add larger values after
		}
	}
	$('select').material_select();	// update material select UI
};

function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};

/**
 * Submits all user's picks of current week to database.
 * @param database
 * @param path
 * @param user
 */
function submitPicks(database, path, user)
{
	var team, points, eid;
	var PickWithErrors = [];
	var noErrors = true;
	for(var i=0; i<$('#body tr').length; i++)
	{
		team = $('input[name=game'+ i +']:checked').val();
		points = $('#dropdown-' + i).val();
		if( typeof team === 'undefined' && points !== '' ||
			typeof team !== 'undefined' && points === '' )
		{
			PickWithErrors = $('input[name="game'+i+'"]').map(function()
			{
				  return $(this).attr('id');
			});
			Materialize.toast(PickWithErrors[0] + " @ " + PickWithErrors[1] + " not submitted. This pick needs both a team chosen AND a point assigned." , 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
			if(noErrors) noErrors = false;
		}
		eid = $('#body tr').eq(i).attr('id');
		// don't submit picks with not team selected or points assigned
		if(typeof team != 'undefined' && points != '')
		{			
			database.ref(path + '/' + eid + '/' + user).update({
				game:	i,
				pick:	team,
				points:	(points=='' ? 0 : parseInt(points))
			}).catch(function(error)
			{
				Materialize.toast('Submission failed ' + error.message, 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
				return false;
			});
		} else if(typeof team === 'undefined' && points === '') // if pick empty, ensure that the database reflects that in the case that the user reset the pick after submitting it.
		{
			database.ref(path + '/' + eid + '/' + user).remove().catch(function(error)
			{
				Materialize.toast('Submission failed ' + error.message, 6000, "red darken-1"); // 6000 is the duration of the toast in milliseconds
				return false;
			});			
		}
	}
	return noErrors;
};

/**
 * Import all user's picks for the current week from database. Used on 'Your picks' page.
 * @param database
 * @param path
 * @param user
 */
function databaseImport(database, path, user)
{
	database.ref(path).once('value').then(function(snapshot)
	{
		var data = snapshot.val();
		for(var i in data)
		{
			for(var j in data[i])
			{
				if(j === UID)
				{
					$("input[value=" + data[i][j].pick + "]").prop('checked', true); // set the game picked
					if(data[i][j].points !== "0")
						$("#dropdown-" + data[i][j].game).val(data[i][j].points);	// set the number of points assigned to that game
				}
			}
		}
		pointAssignments();
		
	});
};

/**
 * 
 * @returns String - a funny phrase
 */
function funnyPhrase()
{
	var phrases = [
		"I am awesome!", "#MicDrop", "Nothing can stop me!", "Click here for no reason",
		"Good for you!", "If time is money... are ATMs Time Machines?", "If anything is possible, is it possible for something to be impossible?",
		"Two wrongs don't make a right, but two Wrights make a plane.", "Why do noses run while feet smell?", "Don't click me.", 
		"Ahh... look at all the lonely people.", "My picks are better than yours.", "Unbelievable!"];
		
	return phrases[Math.floor(Math.random() * phrases.length)];
};

/**
 * Takes the user's email address and creates a valid database entry
 * @param user
 * @returns A valid database UID.
 */
function createUID(user)
{
	var tempUID = '';

	tempUID = user.replace('.', '_')
				  .replace('$', '_')
				  .replace('#', '_')
				  .replace('[', '_')
				  .replace(']', '_')
				  .replace('/', '_');

	return tempUID.toLowerCase();
};

/**
 * A function used to determine winner's of a given team. This function is meant only to work on the league picks' page
 * @param Games the to be processed
 * @returns
 */
function determineWinners(Games)
{
	var visitorScore, homeScore, quarter;
	var Winners = [];
	for(var i=0; i<Games.length; i++)
	{
		visitorScore = parseInt(Games[i].getAttribute('vs'));
		homeScore = parseInt(Games[i].getAttribute('hs'));
		quarter = Games[i].getAttribute('q');
		
		if(quarter === "F" || quarter === "FO")
		{
			// determine winners and place them in the array; update the html if the current page is league picks
			if(visitorScore > homeScore)
			{
				Winners.push(Games[i].getAttribute('v'));
			} else if(visitorScore < homeScore)
			{
				Winners.push(Games[i].getAttribute('h'));
			} else
			{
				Winners.push("TIE");
			}
		} else
			Winners.push("-");
	}
	
	return Winners;
};

/**
 * Fills in all user's picks according to the currently logged in user. The function will hide other users' picks if that pick's game hasn't started
 * @param Picks Object of all the user's picks and point assignments
 * @param {Array} Winners Array of winners (returned from determine winners function
 * @param {function} callback a function to be called upon completion
 * @returns
 */
function userPicks(Picks, Winners, callback)
{
	$.ajax({
		dataType:	'jsonp',	// use JSON w/padding to work around the cross-domain policies 
		url:		'http://www.timeapi.org/utc/now.json',
		success:	function(result)
		{
			debugger;
			var now = new Date(result.dateString);
<<<<<<< HEAD
			var gameTime, tag, wins, finals = 0;
			$(".points").text("0");	// clear points
			$(".win-pct").text("0.00%");	// clear win %
			
			// determine number of final games
			for(var i=0; i<Winners.length; i++)
			{
				if(Winners[i] !== "-")
					finals++;
			}
			
=======
			var gameTime, tag;

>>>>>>> parent of 4e7ddde... Update for Carl's Email
			for(var i in Picks)
			{
				for(var j in Picks[i])
				{
					gameTime = Date.parse($("#date-" + Picks[i][j].game).text());
<<<<<<< HEAD
					tag = replaceAll(j + '-' + Picks[i][j].game, '@', '');
					tag = replaceAll(tag, '_', '');	// remove illegal characters
					if((gameTime > now && j !== UID) && !nonUserCheck(j)) 
=======
					tag = (j + '-' + Picks[i][j].game).replace('@', '').replace('_','');	// remove illegal characters
					if(gameTime > now && j !== UID)
>>>>>>> parent of 4e7ddde... Update for Carl's Email
					{
						$('#' + tag).text("HIDDEN");
						$("#" + tag + '-points').text("");
						continue;
					}
					$("#" + tag).html(teamLogo(Picks[i][j].pick));
					$("#" + tag + "-points").html(Picks[i][j].points);
					if(Winners[Picks[i][j].game] !== "-")	// game is a final
					{
						if(Picks[i][j].pick === Winners[Picks[i][j].game])
						{
							$("#" + tag + ", #" + tag + "-points").css("background-color", "#00d05e");
						}
						else
						{
							$("#" + tag + ", #" + tag + "-points").css("background-color", "#da9694");
						}
					}
				}
			}

			//take care of empty picks
			$("td:empty").each(function ()
			{
				var index = Math.floor(((this.cellIndex % 2 === 0) ? this.cellIndex - 1 : this.cellIndex) / 2);
				var quarter = $("#quarter").find('td').eq(index).text();
				if(Winners[index] !== "-" && (quarter === "Final" || quarter === "Final OT"))	// game is a final
					$(this).css("background-color", "#da9694");
			});

			$("#league-picks-table").find('tr:not(#headers)').each(function()
			{
				var Cells = $(this).find('td');	// get all cells in this row
				wins = 0;	// reset number of wins for this row
				for(var i=2; i<Cells.length-2; i+=2)
				{
					if(Cells.eq(i).css("background-color") === 'rgb(0, 208, 94)')	// pick was correct
					{
						wins++;
						Cells.eq(Cells.length-2).text(filterFloat(Cells.eq(Cells.length-2).text()) + filterFloat(Cells.eq(i).text()));
					}
					else if(Cells.eq(i).css("background-color") === 'rgb(218, 150, 148)')	// pick was incorrect
					{
						Cells.eq(Cells.length-2).text(filterFloat(Cells.eq(Cells.length-2).text()) - filterFloat(Cells.eq(i).text()));
					}
				}
				Cells.eq(Cells.length-1).text((finals === 0 ? '0.00' : (wins / finals * 100).toFixed(2)) + "%");	// calculate win percent
			});

			callback();
		}
	});
<<<<<<< HEAD
};

function nonUserCheck(user)
{
	return	user === "placeholder@1_com" ||
			user === "placeholder@2_com" ||
			user === "placeholder@3_com";
};


/**
 * A stricter way of parsing floats. Will return an integer where possible, otherwise,
 * if number can be interpreted as a float, then a float will be returned.
 * @param value
 * @returns equivalent number (float or int) depending on if it can be interpreted as a float or int.
 */
function filterFloat (value) {
    if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
      .test(value))
      return Number(value);
  return NaN;
=======
>>>>>>> parent of 4e7ddde... Update for Carl's Email
};