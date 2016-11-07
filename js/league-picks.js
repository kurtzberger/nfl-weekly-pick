/* global UID, season, firebase, CUR_WEEK, Team */

$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		wait();	// wait for global variables to be set
	});
});

/**
 * This function will wait for the global variable UID to be set before continuing to load the rest of the page.
 * When UID is set to a value, this indicates all other global variables have been set. 
 */
function wait()
{
	if(UID === null)
	{
		setTimeout( function() { wait(); }, 500 );
	} else
	{
		loadPage();
	}
}

/**
 * Load all page elements for this page
 */
function loadPage()
{
	// Get a reference to the database service
	var database = firebase.database();
	var week, weekData, url, path;
	week = location.search.substring(1).split("&")[0].split("=")[1];

	// this URL is used just for this webpage
	if(week === CUR_WEEK)
	{
		url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
	}
	else
	{
		url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
	}

	$('.league-picks').addClass("deep-orange lighten-3");
	$("#week" + week + "-link").addClass("deep-orange lighten-3");
	$("#headerTitle").text(season + " Week " + week + " League Picks");

	$.get(url, function(xml)
	{
		// create weekly data object from XML file imported
		weekData = new WeekGames(xml, function()
		{
			path = season + '/picks/week' + weekData.week;
			var names = [], users = [];

			// search database for all users' display name and then finish putting in all data except user's picks
			// users' picks will be handled in a seperate database query
			database.ref('users').once('value').then(function(snapshot)
			{
				var data = snapshot.val();
				// get all display names from imported data
				for(var i in data)
				{
					users.push(i);
					names.push(data[i].displayName);
				}

				// span the length of number of games divided by bye teams. if there are no teams on bye, then "None" is placed here
				if(weekData.byesTeams.length > 0)
				{
					for(var i=0; i<weekData.byesTeams.length; i++)
					{
						var spacer = weekData.games.length / weekData.byesTeams.length - 1;
						$('#byes').append('<td colspan="'+ spacer +'"></td>')	// add a spacer between bye team logos
								  .append('<td class="pick-cell" id="bye-' + i + '"></td>');	// the logo must only span 1 column or it will be oversized
						$("#bye-" + i).css({'background-image': 'url('+ Team.getTeamUrl(weekData.byesTeams[i].abbrName) +')'});

					}
				} else
				{
					$("#byes").append('<td colspan="' + weekData.games.length + '" style="text-align: center;">None</td>');
				}

				// span the length of number of games for the picks header
				$("#headers").append('<th colspan="' + weekData.games.length + '" data-field="picks" class="cellHeader" style="text-align: center;">Picks</th>');
				$("#headers").append('<th data-field="total-points" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Points</th>');
				$("#headers").append('<th data-field="win-pct" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Win %</th>');

				// place the user's display name in the table. each iteration is a new row in the table
				for(var i=0; i<names.length; i++)
				{
					var name = names[i];
					var tag = replaceAll(replaceAll(users[i], '@', ''), '_', '');	// remove illegal characters
					$("#league-picks-table").append('<tr id=' + tag + '></tr>');
					//player's name in the table
					$("#" + tag).append('<td class="cell">'+name+'</td>');

					for(var j=0; j<weekData.games.length; j++)
					{				
						// only do this the first time through the outer loop
						if(i===0)
						{
							var quarter = Number.isInteger(parseInt(weekData.games[j].quarter)) ? 'Q' + weekData.games[j].quarter : weekData.games[j].quarter;
							//place the game start time as a header of the game
							$("#nfl-games-headers").append('<th class="cell" id="date-' + j +'">' + weekData.games[j].dateStringShort + '</th>');
							$("#away-teams").append('<td class="pick-cell" id="visitor-' + j + '"></td>');
							$("#visitor-" + j).css({'background-image': 'url(../team-logos/trans'+ weekData.games[j].awayTeam.abbrName +'.png)'})
									.text(weekData.games[j].awayTeam.score);
							if(j < weekData.games.length-1)
								$("#quarter").append('<td class="cell quarterBorder verticalLine">' + quarter + ' ' + weekData.games[j].timeInQuarter + '</td>');
							else
								$("#quarter").append('<td class="cell quarterBorder">' + quarter + ' ' + weekData.games[j].timeInQuarter + '</td>');
							$("#home-teams").append('<td class="pick-cell" style="border-bottom: thin solid #d0d0d0;"  id="home-' + j + '"></td>');
							$("#home-" + j).css({'background-image': 'url(../team-logos/trans'+ weekData.games[j].homeTeam.abbrName +'.png)'})
									.text(weekData.games[j].homeTeam.score);
							if(weekData.games[j].awayTeam.hasPossession)
								$('#visitor-' + j).css('background-color', (weekData.games[j].awayTeam.isInRedZone ? '#da9694' : '#ffff66'));
							else if(weekData.games[j].homeTeam.hasPossession)
								$('#home-' + j).css('background-color', (weekData.games[j].homeTeam.isInRedZone ? '#da9694' : '#ffff66'));
						}

						// mark each users' pick cell for easier access upon next database query
						$("#" + tag).append('<td id="' + tag + '-' + j + '"></td>');
					}
					$("#" + tag).append('<td id="' + tag + '-total-points" class="points"></td>');
					$("#" + tag).append('<td id="' + tag + '-win-pct" class="win-pct"></td>');
				}

				// search database and retrieve all users' picks and then populate the table accordingly
				database.ref(path).once('value').then(function(snapshot)
				{
					// put all users' picks into the table, and hide other users' picks of games that haven't started
					// mark the users games correct (green) or wrong (red) as well if the games are complete.
					userPicks(snapshot.val(), weekData);
					$(".remove-me").remove();	// remove loading animation
					$(".show-me").toggle();		// toggle hidden content
				});
			});
		});
	});
}

/**
 * Fills in all user's picks according to the currently logged in user. The function will hide other users' picks if that pick's game hasn't started
 * This function will mark picks correct (in green) or incorrect (in red) upon completion of a game, and at the same time calculate total points and win percentage for the week.
 * If weekData is data for the current NFL week and not all games are final, then a timeout will be set to update NFL scores, 
 * upon which this function will be called again until all games are final.
 * @param {Object} picks Object of all the user's picks and point assignments
 * @param {WeekData} weekData All NFL games for this week
 * @returns {undefined} Nothing
 */
function userPicks(picks, weekData)
{
	var green = '#00d05e';			// correct pick color
	var red = '#da9694';			// incorrect pick color
	$(".points").text("0");			// clear points
	$(".win-pct").text("0.00%");	// clear win %

	for(var i in picks)
	{
		for(var j in picks[i])
		{
			var tag = replaceAll(replaceAll(j + '-' + picks[i][j].game, '@', ''), '_', '');	// remove illegal characters
			if((weekData.timeNow < weekData.games[picks[i][j].game].date && j !== UID) && !nonUserCheck(j))	// game has not started and this pick isn't from current user
			{
				$('#' + tag).text("HIDDEN");
				$('#' + tag).attr('class', 'cell');
				//$("#" + tag + '-points').text("");
				continue;
			}
			// add pick and points to cell
			$("#" + tag).css({'background-image': 'url(../team-logos/trans'+ picks[i][j].pick +'.png)'})
						.text(picks[i][j].points).attr('class', 'pick-cell');
			if(weekData.games[picks[i][j].game].winner !== null)	// game is a final
			{
				if(picks[i][j].pick === weekData.games[picks[i][j].game].winner.abbrName)	// pick was correct
				{
					$("#" + tag).css("background-color", green);
				}
				else																		// pick was incorrect
				{
					$("#" + tag).css("background-color", red);
				}
			}
		}
	}

	// take care of empty picks
	$("#league-picks-table td:empty").each(function ()
	{
		if(weekData.games[this.cellIndex-1].winner !== null)	// game is a final
		{
			$(this).css("background-color", "#da9694");
		}
		else if(weekData.games[this.cellIndex-1].winner === null && $(this).css("background-color") !== "rgba(0, 0, 0, 0)")
		{
			$(this).css("background-color", "rgba(0, 0, 0, 0)");
		}
	});
	
	
	// update scores and win percentages
	$("#league-picks-table").find('tr:not(#headers)').each(function()
	{
		var cells = $(this).find('td');	// get all cells in this row
		var wins = 0;					// reset number of wins for this row
		for(var i=1; i<cells.length-2; i++)
		{
			if(cells.eq(i).css("background-color") === 'rgb(0, 208, 94)')	// pick was correct
			{
				wins++;
				cells.eq(cells.length-2).text(filterFloat(cells.eq(cells.length-2).text()) + filterFloat(cells.eq(i).text()));
			}
			else if(cells.eq(i).css("background-color") === 'rgb(218, 150, 148)')	// pick was incorrect
			{
				cells.eq(cells.length-2).text(filterFloat(cells.eq(cells.length-2).text()) - filterFloat(cells.eq(i).text()));
			}
		}
		cells.eq(cells.length-1).text((weekData.completedGames === 0 ? '0.00' : (wins / weekData.completedGames * 100).toFixed(2)) + "%");	// calculate win percent
	});

	//regularly update nfl scores if it's the current week and not all games are complete
	if(weekData.week === CUR_WEEK && weekData.completedGames !== weekData.games.length)
	{
		// set timeout for next request.
		setTimeout(function()
		{
			updateNFLScores(picks);
		}, 10000);
	}
}

/**
 * Function that will update the NFL scores on the webpage
 * @param {JSON Object} picks imported from Firebase database
 * @returns {undefined} None
 */
function updateNFLScores(picks)
{
	$.ajax({
		url:		'http://www.nfl.com/liveupdate/scorestrip/ss.xml',
		timeout:	5000,	// timeout in milliseconds
		success:	function(xml)
		{
			// create weekly data object from XML file imported (with updated scores)
			var weekData = new WeekGames(xml, function()
			{
				//update scores
				for(var i=0; i<weekData.games.length; i++)
				{
					var quarter = Number.isInteger(parseInt(weekData.games[i].quarter)) ? 'Q' + weekData.games[i].quarter : weekData.games[i].quarter;
					$('#visitor-' + i).text(weekData.games[i].awayTeam.score);                               	// away score
					$('#quarter').find('td:gt(0)').eq(i).text(quarter + ' ' + weekData.games[i].timeInQuarter);	// quarter & time
					$('#home-' + i).text(weekData.games[i].homeTeam.score);                                     // home score
					if(weekData.games[i].awayTeam.hasPossession)
					{
						$('#visitor-' + i).css('background-color', (weekData.games[i].awayTeam.isInRedZone ? '#da9694' : '#ffff66'));
						$('#home-' + i).css('background-color', '');
					} else if(weekData.games[i].homeTeam.hasPossession)
					{
						$('#visitor-' + i).css('background-color', '');
						$('#home-' + i).css('background-color', (weekData.games[i].homeTeam.isInRedZone ? '#da9694' : '#ffff66'));
					} else
					{
						$('#home-' + i).css('background-color', '');
						$('#visitor-' + i).css('background-color', '');
					}
				}
				
				userPicks(picks, weekData);	// update user picks (reveal/mark correct or incorrect)
			});
		},
		error:	function(xhr)
		{
			console.log("Error status: " + xhr.status);
			console.log("Error reading from time server.");
			setTimeout(function() { updateNFLScores(picks); }, 5000 );	// wait 5 seconds and try again
		}
	});
}