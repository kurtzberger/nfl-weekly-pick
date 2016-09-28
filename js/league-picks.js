$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		setTimeout( function()
		{
			var week, Byes, Games, localURL;
			week = location.search.substring(1).split("&")[0].split("=")[1];
			
			// this URL is used just for this webpage
			if(week === CUR_WEEK)
				localURL = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
			else
				localURL = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
			
			$('.league-picks').addClass("deep-orange lighten-3");
			$("#week" + week + "-link").addClass("deep-orange lighten-3");
			$("#title").text(season + " Week " + week + " League Picks");
			
			// Get a reference to the database service
			var database = firebase.database();
			
			$.get(localURL, function( data )
			{
				var xmlDoc = $(data);
				week = xmlDoc.find('gms')[0].getAttribute('w');
				Games = xmlDoc.find('g');
				Byes = byeTeams(Games);
				
				// sort games by game ID
				Games.sort(function(a,b)
				{ 
					return (a.getAttribute('eid') > b.getAttribute('eid'))	?  1 : -1; 
				});
				
				path = season + '/picks/week' + week;
				var Names = [], Users = [], Picks = {}, Winners = [];
				
				// search database for all users' display name and then finish putting in all data except user's picks
				// users' picks will be handled in a seperate database query
				database.ref('users').once('value').then(function(snapshot)
				{
					var data = snapshot.val();
					// get all display names from imported data
					for(var i in data)
					{
						Users.push(i);
						Names.push(data[i].displayName);
					}
					
					// span the length of number of games divided by bye teams. if there are no teams on bye, then "None" is placed here
					if(Byes.length > 0)
					{
						for(var i=0; i<Byes.length; i++)
							$("#byes").append('<td colspan="' + Games.length*2/Byes.length + '" style="text-align: center;">' + teamLogo(Byes[i]) + '</td>');
					} else
					{
						$("#byes").append('<td colspan="' + Games.length*2 + '" style="text-align: center;">None</td>');
					}
					
					// span the length of number of games for the picks header
					$("#headers").append('<th colspan="' + Games.length*2 + '" data-field="picks" class="cellHeader" style="text-align: center;">Picks</th>');
					$("#headers").append('<th data-field="total-points" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Points</th>');
					$("#headers").append('<th data-field="win-pct" class="cellHeader" style="max-width:72px; min-width:72px; text-align: center;">Win %</th>');
					
					// place the user's display name in the table. each iteration is a new row in the table
					for(var i=0; i<Names.length; i++)
					{
						var name = Names[i];
						var tag = replaceAll(Users[i], '@', '');
						tag = replaceAll(tag, '_', '');	// remove illegal characters
						$("#body").append('<tr id=' + tag + '></tr>');
						//player's name in the table
						$("#" + tag).append('<td>'+name+'</td>');
					
						for(var j=0; j<Games.length; j++)
						{				
							
							// only do this the first time through the outer loop
							if(i===0)
							{
								//place the game start time as a header of the game
								$("#nfl-games-headers").append('<th colspan="2" style="font-size: 14px; font-weight: 400; max-width:72px; min-width:72px; text-align: center;" id="date-' + j +'">' + 
										gameStartTime(Games[j].getAttribute('eid'), Games[j].getAttribute('t'), Games[j].getAttribute('d')) + '</th>');
								$("#away-teams").append('<td style="text-align: center;" colspan="2" id="visitor-' + j + '">' + teamLogo(Games[j].getAttribute('v')) + '</td>');
								$("#away-score").append('<td style="text-align: center;" colspan="2">' + ((Games[j].getAttribute('vs') === '') ? 0 : Games[j].getAttribute('vs')) + '</td>');
								var time = Games[j].getAttribute('k');
								if(Games[j].getAttribute('q') === "Suspended" && j < Games.length - 1)
									$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + getQuarter(Games[j].getAttribute('q')) + '</td>');
								else if(time !== null && time !== "")
									$("#quarter").append('<td style="text-align: center;" class="quarterBorder">' + getQuarter(Games[j].getAttribute('q')) + '</td>' +
														 '<td style="text-align: center;" class="quarterBorder verticalLine">' + time + '</td>');
								else if(j < Games.length-1)
									$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + getQuarter(Games[j].getAttribute('q')) + '</td>');
								else
									$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder">' + getQuarter(Games[j].getAttribute('q')) + '</td>');
								$("#home-score").append('<td style="text-align: center;" colspan="2">' + ((Games[j].getAttribute('hs') === '') ? 0 : Games[j].getAttribute('hs')) + '</td>');
								$("#home-teams").append('<td style="text-align: center; border-bottom: thin solid #d0d0d0;" colspan="2" id="home-' + j + '">' + teamLogo(Games[j].getAttribute('h')) + '</td>');
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
						Picks = snapshot.val();
						Winners = determineWinners(Games);
						// put all users' picks into the table, and hide other users' picks of games that haven't started
						// mark the users games correct (green) or wrong (red) as well if the games are complete.
						userPicks(Picks, Winners, xmlDoc);
					});
				});
			});
		}, 1000);
	});
});

/**
 * Function to decipher the NFL quarter read in from NFL.com
 * @param {string} quarter string read in from NFL.com (e.g., "1", "4", "F", "FO")
 * @return {string} returns a more readable string giving the parameter passed
 */
function getQuarter(quarter)
{
	switch(quarter)
	{
		case "P" :	return "Pre-game";
		case "F" :	return "Final";
		case "FO":	return "Final OT";
		case "H" :	return "Halftime";
		default	 :	
				if(parseInt(quarter) > 4 )
						return "OT";
				else if(isNaN(quarter))
					return quarter;
				else
					return quarter + "Q";
	}
};

/**
 * Function that will update the NFL scores on the webpage
 * @param {JSON Object} Picks imported from Firebase database
 * @returns {undefined} None
 */
function updateNFLScores(Picks)
{
	var Games, xmlDoc;	// declare this outside the scope of AJAX so we may use it throughout the function
	$.ajax({
		url:		'http://www.nfl.com/liveupdate/scorestrip/ss.xml',
		success:	function(data)
		{
			//delete all scores in table first and quarter
			$("#away-score").find('td:gt(0)').remove();
			$("#quarter").find('td:gt(0)').remove();
			$("#home-score").find('td:gt(0)').remove();

			xmlDoc = $(data);
			Games = xmlDoc.find('g');
			// sort games by game ID
			Games.sort(function(a,b)
			{ 
				return (a.getAttribute('eid') > b.getAttribute('eid'))	?  1 : -1; 
			});
			//update scores now
			for(var i=0; i<Games.length; i++)
			{
				// away score
				$("#away-score").append('<td style="text-align: center;" colspan="2">' + Games[i].getAttribute('vs') + '</td>');
				// quarter
				var time = Games[i].getAttribute('k');
				if(Games[i].getAttribute('q') === "Suspended" && i < Games.length - 1)
					$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + getQuarter(Games[i].getAttribute('q')) + '</td>');
				else if(time !== null && time !== "")
					$("#quarter").append('<td style="text-align: center;" class="quarterBorder">' + getQuarter(Games[i].getAttribute('q')) + '</td>' +
										 '<td style="text-align: center;" class="quarterBorder verticalLine">' + time + '</td>');
				else if (i < Games.length - 1)
					$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + getQuarter(Games[i].getAttribute('q')) + '</td>');
				else
					$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder">' + getQuarter(Games[i].getAttribute('q')) + '</td>');
				// home score
				$("#home-score").append('<td style="text-align: center;" colspan="2">' + Games[i].getAttribute('hs') + '</td>');
			}
		},
		complete:	function()
		{
			// update Winners
			var UpdatedWinners = determineWinners(Games);
			// update user picks (reveal/mark correct or incorrect)
			userPicks(Picks, UpdatedWinners, xmlDoc);
		}
	});
};

/**
 * Fills in all user's picks according to the currently logged in user. The function will hide other users' picks if that pick's game hasn't started
 * @param Picks Object of all the user's picks and point assignments
 * @param {Array} Winners Array of winners (returned from determine winners function
 * @param {function} callback a function to be called upon completion
 * @returns
 */
function userPicks(Picks, Winners, data)
{
	$.ajax({
		dataType:	'jsonp',	// use JSON w/padding to work around the cross-domain policies 
		url:		'http://www.timeapi.org/utc/now.json',
		success:	function(result)
		{
			var now = new Date(result.dateString);
			var gameTime, tag, wins, finals = 0;
			$(".points").text("0");	// clear points
			$(".win-pct").text("0.00%");	// clear win %
			
			// determine number of final games
			for(var i=0; i<Winners.length; i++)
			{
				if(Winners[i] !== "-")
					finals++;
			}
			
			for(var i in Picks)
			{
				for(var j in Picks[i])
				{
					gameTime = Date.parse($("#date-" + Picks[i][j].game).text());
					tag = replaceAll(j + '-' + Picks[i][j].game, '@', '');
					tag = replaceAll(tag, '_', '');	// remove illegal characters
					if((gameTime > now && j !== UID) && !nonUserCheck(j)) 
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
					} else if(Winners[Picks[i][j].game] === "-" && $("#" + tag).css("background-color") !== "rgba(0, 0, 0, 0)")
					{
						$("#" + tag + ", #" + tag + "-points").css("background-color", "rgba(0, 0, 0, 0)");
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
				else if(Winners[index] === "-" && $(this).css("background-color") !== "rgba(0, 0, 0, 0)")
					$(this).css("background-color", "rgba(0, 0, 0, 0)");
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
		},
		complete: function()
		{
			var week = location.search.substring(1).split("&")[0].split("=")[1];
			if($(".show-me").css('display') === "none")
			{
				// remove loading animation
				$(".remove-me").remove();
				// toggle hidden content
				$(".show-me").toggle();
			}
			//regularly update nfl scores if it's the current week and not all games are complete
			if(week === CUR_WEEK && data.find('g[q="F"], g[q="FO"]').length !== data.find('g').length)
			{
				// set timeout for next request.
				setTimeout(function()
				{
					updateNFLScores(Picks);
				}, 10000);
			}
		},
		error:	function(xhr, textStatus, errorThrown)
		{
			console.log(xhr.responseText);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
};