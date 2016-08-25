// Get a reference to the database service
var database = firebase.database();
// Global flag to specify when standings are done processing
var finished = false;
// Global finished games variable since this is being accessed in multiple funtions after callback
var completedGames = 0;

$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		var seasonType, week, localURL, Games;
		var Names = [], Users = [], Picks = {}, Standings = {};
		// this URL is used just for this webpage
		localURL = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
		
		$("#standings-link").addClass("deep-orange lighten-3");
		$("#title").text("Standings");
		
		// add loader animation
		$("#main-content").append('<div class="loader s12 m4 center">' +
				'<div class="preloader-wrapper big active">' +
				'<div class="spinner-layer spinner-blue-only">' +
				'<div class="circle-clipper left">' +
				'<div class="circle"></div>' +
				'</div><div class="gap-patch">' +
				'<div class="circle"></div>' + 
				'</div><div class="circle-clipper right">' +
				'<div class="circle"></div></div></div></div></div>');
		
		// get all users and create a standings object for that user.
		database.ref('users').once('value').then(function(snapshot)
		{
			var data = snapshot.val();
			// get all display names from imported data and initialize standings object
			for(var i in data)
			{
				Users.push(i);
				Names.push(data[i].displayName);
				Standings[i] = {
					name:				data[i].displayName,
					points:				0,
					wins:				0,
				};
			}
			
			$.get(localURL, function( data )
			{
				seasonType = $(data).find('g')[0].getAttribute('gt');
				if(seasonType == "PRE")
					week = 1;
				else if(seasonType == "REG")
					week = $(data).find('gms')[0].getAttribute('w');
				else
					week = 17;
			
				processStandings(week, Picks, Games, Standings);
				var timerID = setInterval( function()
				{
					
					if(finished)
					{
						// place objects into array
						//var sorted = [Standings].sort(function(a,b) { debugger; return (a.points > b.points) ? 1 : ((b.points > a.points) ? -1 : 0); });
						var Sorted = [];
						// place the user's display name in the table
						for(var i in Standings)
							Sorted.push(Standings[i]);
						
						// sort standings by points from highest points to lowest points. Win % is tie breaker
						Sorted.sort(function(a,b)
						{ 
							return (a.points < b.points)	?  1 : 
								  ((a.points > b.points) 	? -1 :
								  ((a.wins   < b.wins)		?  1 :
								  ((a.wins   > b.wins)		? -1 : 0))); 
						});
						
						for(var i=0; i<Sorted.length; i++)
						{
							var name = Sorted[i].name;
							var tag = Users[i].replace('@','').replace('_','');	// remove illegal characters
							var winPct = (Sorted[i].wins * 100.0 / completedGames).toFixed(2);
							$("#body").append('<tr id="' + tag + '"></tr>');
							//player's name in the table
							$("#" + tag).append('<td>' + name + '</td>');
							//player's score
							$("#" + tag).append('<td>' + Sorted[i].points + '</td>');
							//player's win %
							$("#" + tag).append('<td>' + (isNaN(winPct) ? '0.00' : winPct) + '%</td>');
						}
						
						// remove loading animation
						$(".loader").remove();
						// toggle hidden content
						$(".show-me").toggle();
						
						clearInterval(timerID);
					}
				}, 1000);
			});
		});
	});
});

function processStandings(week, Picks, Games, Standings)
{
	for(var n=1; n<=week; n++)
	{
		processLoop(n, week, Games, Standings);
	}
};

function processLoop(n, week, Games, Standings)
{
	getGames(n, Games, Standings, function(uWeek, uGames, uStandings)
	{
		database.ref(season + '/picks/week' + uWeek).once('value').then(function(snapshot)
		{
			Picks = snapshot.val();
			Standings = calcStandings(Picks, uGames, uStandings);
			completedGames += uGames.length;
			finished = (n == week);
			
		});
	});
};

function getGames(n, Games, Standings, callback)
{
	localURL = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + n;
	$.get(localURL, function( data )
	{
		var xmlDoc = $(data);
		Games = xmlDoc.find('g[q="F"], g[q="FO"]'); // only concerned with completed games
		
		// callback function returning the modified standings
		callback(n, Games, Standings);
	});
};

function calcStandings(Picks, Games, Standings)
{
	// enter possible unassigned points for this week
	for(var i in Standings)
		Standings[i].unassignedPoints = (Games.length * (Games.length + 1)) / 2;
	
	var Winners = determineWinners(Games);
	
	// outer loop is games
	for(var i in Picks)
	{
		// inner loop is user picks
		for(var j in Picks[i])
		{
			// if user's pick was correct credit them points and if they were wrong discredit them points
			if(Picks[i][j].pick == Winners[Picks[i][j].game])
			{
				Standings[j].points += Picks[i][j].points;
				Standings[j].wins++;
			} else
				Standings[j].points -= Picks[i][j].points;
			// since a pick was found here, mark these points as "assigned".
			Standings[j].unassignedPoints -= Picks[i][j].points;
		}
	}
	
	// subtract any remaining unassigned points
	for(var i in Standings)
		Standings[i].points -= Standings[i].unassignedPoints;
	
	return Standings;
};