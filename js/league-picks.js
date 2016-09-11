$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		// wait 2 seconds to allow CUR_WEEK to get set
		setTimeout( function()
		{
			var week, Games, localURL;
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
					
					// span the length of number of games for the picks header
					$("#headers").append('<th colspan="' + Games.length*2 + '" data-field="picks">Picks</th>');
					
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
								if(time !== null && time !== "")
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
					}
					
					// search database and retrieve all users' picks and then populate the table accordingly
					database.ref(path).once('value').then(function(snapshot)
					{
						Picks = snapshot.val();
						Winners = determineWinners(xmlDoc.find('g'));
						// put all users' picks into the table, and hide other users' picks of games that haven't started
						// mark the users games correct (green) or wrong (red) as well if the games are complete.
						userPicks(Picks, Winners, function()
						{															
						
							// remove loading animation
							$(".loader").remove();
							// toggle hidden content
							$(".show-me").toggle();
	
							// call this function regularly to reveal other user's picks after the games start
							var timeID = setInterval(function()
							{
								if(xmlDoc.find('g[q="F"], g[q="FO"]').length === Games.length)
								{
									clearInterval(timeID);
									return;
								}
								userPicks(Picks, Winners, function()
								{
									// update Winners
									$.get(localURL, function( data )
									{
										Winners = determineWinners($(data).find('g'));
									});
								}); 
							}, 10000);
							
							//regularly update nfl scores if it's the current week
							if(week === CUR_WEEK)
							{
								var id = setInterval(function()
								{
									if(xmlDoc.find('g[q="F"], g[q="FO"]').length === Games.length)
									{
										clearInterval(id);
										return;
									}
									updateNFLScores();
								}, 60000);
							}
						});
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
				else
					return quarter + "Q";
	}
};

/**
 * Function that will update the NFL scores on the webpage
 */
function updateNFLScores()
{
	$.get('http://www.nfl.com/liveupdate/scorestrip/ss.xml', function( data )
	{
		//delete all scores in table first and quarter
		$("#away-score").find('td:gt(0)').remove();
		$("#quarter").find('td:gt(0)').remove();
		$("#home-score").find('td:gt(0)').remove();
		
		var Games = $(data).find('g');
		//update scores now
		for(var i=0; i<Games.length; i++)
		{
			// away score
			$("#away-score").append('<td style="text-align: center;" colspan="2">' + Games[i].getAttribute('vs') + '</td>');
			// quarter
			var time = Games[i].getAttribute('k');
			if(time !== null && time !== "")
				$("#quarter").append('<td style="text-align: center;" class="quarterBorder">' + getQuarter(Games[i].getAttribute('q')) + '</td>' +
									 '<td style="text-align: center;" class="quarterBorder verticalLine">' + time + '</td>');
			else if (i < Games.length - 1)
				$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder verticalLine">' + getQuarter(Games[i].getAttribute('q')) + '</td>');
			else
				$("#quarter").append('<td style="text-align: center;" colspan="2" class="quarterBorder">' + getQuarter(Games[i].getAttribute('q')) + '</td>');
			// home score
			$("#home-score").append('<td style="text-align: center;" colspan="2">' + Games[i].getAttribute('hs') + '</td>');
		}
	});
};