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
						$("#byes").append('<td colspan="' + (weekData.games.length*2)/(weekData.byesTeams.length) + '" style="text-align: center;">' + weekData.byesTeams[i].logo + '</td>');
				} else
				{
					$("#byes").append('<td colspan="' + weekData.games.length*2 + '" style="text-align: center;">None</td>');
				}

				// span the length of number of games for the picks header
				$("#headers").append('<th colspan="' + weekData.games.length*2 + '" data-field="picks" class="cellHeader" style="text-align: center;">Picks</th>');
				$("#headers").append('<th data-field="total-points" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Points</th>');
				$("#headers").append('<th data-field="win-pct" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Win %</th>');

				// place the user's display name in the table. each iteration is a new row in the table
				for(var i=0; i<names.length; i++)
				{
					var name = names[i];
					var tag = replaceAll(replaceAll(users[i], '@', ''), '_', '');	// remove illegal characters
					$("#league-picks-table").append('<tr id=' + tag + '></tr>');
					//player's name in the table
					$("#" + tag).append('<td>'+name+'</td>');

					for(var j=0; j<weekData.games.length; j++)
					{				
						// only do this the first time through the outer loop
						if(i===0)
						{
							//place the game start time as a header of the game
							$("#nfl-games-headers").append('<th colspan="2" style="font-size: 14px; font-weight: 400; max-width:72px; min-width:72px; text-align: center;" id="date-' + j +'">' + 
									weekData.games[j].dateStringShort + '</th>');
							$("#away-teams").append('<td style="text-align: center;" colspan="2" id="visitor-' + j + '">' + weekData.games[j].awayTeam.logo + '</td>');
							$("#away-score").append('<td style="text-align: center;" colspan="2">' + weekData.games[j].awayTeamScore + '</td>');
							if(weekData.games[j].quarter === "Suspended" && j < weekData.games.length - 1)
								$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + weekData.games[j].quarter + '</td>');
							else if(weekData.games[j].timeInQuarter !== null && weekData.games[j].timeInQuarter !== "")
								$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">Q' + weekData.games[j].quarter + ' ' + weekData.games[j].timeInQuarter + '</td>');
							else if(j < weekData.games.length-1)
								$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + weekData.games[j].quarter + '</td>');
							else
								$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder">' + weekData.games[j].quarter + '</td>');
							$("#home-score").append('<td style="text-align: center;" colspan="2">' + weekData.games[j].homeTeamScore + '</td>');
							$("#home-teams").append('<td style="text-align: center; border-bottom: thin solid #d0d0d0;" colspan="2" id="home-' + j + '">' + weekData.games[j].homeTeam.logo + '</td>');
						}

						// mark each users' pick cell for easier access upon next database query
						$("#" + tag).append('<td style="max-width:47px; min-width:47px;" id="' + tag + '-' + j + '"></td>');
						$("#" + tag).append('<td style="text-align: center; max-width:25px; min-width:25px;" id="' + tag + '-' + j + '-points"></td>');
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
				$("#" + tag + '-points').text("");
				continue;
			}
			$("#" + tag).html(Team.getTeamLogo(picks[i][j].pick));
			$("#" + tag + "-points").html(picks[i][j].points);
			if(weekData.games[picks[i][j].game].winner !== null)	// game is a final
			{
				if(picks[i][j].pick === weekData.games[picks[i][j].game].winner.abbrName)	// pick was correct
				{
					$("#" + tag + ", #" + tag + "-points").css("background-color", "#00d05e");
				}
				else																		// pick was incorrect
				{
					$("#" + tag + ", #" + tag + "-points").css("background-color", "#da9694");
				}
			}
		}
	}

	// take care of empty picks
	$("#league-picks-table td:empty").each(function ()
	{
		var index = Math.floor(((this.cellIndex % 2 === 0) ? this.cellIndex - 1 : this.cellIndex) / 2);
		if(weekData.games[index].winner !== null)	// game is a final
		{
			$(this).css("background-color", "#da9694");
		}
		else if(weekData.games[index].winner === null && $(this).css("background-color") !== "rgba(0, 0, 0, 0)")
		{
			$(this).css("background-color", "rgba(0, 0, 0, 0)");
		}
	});
	
	
	// update scores and win percentages
	$("#league-picks-table").find('tr:not(#headers)').each(function()
	{
		var Cells = $(this).find('td');	// get all cells in this row
		var wins = 0;					// reset number of wins for this row
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
		Cells.eq(Cells.length-1).text((weekData.completedGames === 0 ? '0.00' : (wins / weekData.completedGames * 100).toFixed(2)) + "%");	// calculate win percent
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
					$("#away-score").find('td:gt(0)').eq(i).text(weekData.games[i].awayTeamScore);										// away score
					$("#quarter").find('td:gt(0)').eq(i).text('Q' + weekData.games[i].quarter + ' ' + weekData.games[i].timeInQuarter);	// quarter & time
					$("#home-score").find('td:gt(0)').eq(i).text(weekData.games[i].homeTeamScore);										// home score
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