$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		var week, Games, localURL;
		week = location.search.substring(1).split("&")[0].split("=")[1];
		// this URL is used just for this webpage
		localURL = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
		//localURL = 'http://www.nfl.com/ajax/scorestrip?season=2015&seasonType=REG&week=10';
		$('.league-picks').addClass("deep-orange lighten-3");
		$("#week" + week + "-link").addClass("deep-orange lighten-3");
		$("#title").text(season + " Week " + week + " League Picks");
		
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
		
		// Get a reference to the database service
		var database = firebase.database();
		
		$.get(localURL, function( data )
		{
			var xmlDoc = $(data);
			week = xmlDoc.find('gms')[0].getAttribute('w');
			season = xmlDoc.find('gms')[0].getAttribute('y');
			Games = xmlDoc.find('g');
			
			path = season + '/picks/week' + week;
			var Names = [], Users = [], Picks = {};
			
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
				
				// place the user's display name in the header
				for(var i=0; i<Names.length; i++)
				{
					var name = Names[i];
					$("#headers").append('<th colspan="2" data-field="name-' + i + '" id="' + name + '-header"></th>');
					//$("#headers").append('<th style="width:5px;" data-field="name-points-' + i + '" id="' + name + 'points-header"></th>');
					//player's name in the table
					$("#" + name + "-header").text(name);
				}
				
				// write the current weeks' games and players' picks to the table. each loop iteration is a row in the table
				for(var i=0; i<Games.length; i++)
				{
					$("#body").append('<tr id=' + i + '></tr>');
					$("#" + i).append('<td id="winner-' + i + '"></td>');
					$("#" + i).append('<td id="visitor-score-' + i + '">' + (Games[i].getAttribute('vs')=="" ? 0 : Games[i].getAttribute('vs')) + '</td>');
					$("#" + i).append('<td id="visitor-' + i + '">' + teamLogo(Games[i].getAttribute('v')) + '</td>');
					$("#" + i).append('<td id="quarter-' + i + '">' + Games[i].getAttribute('q') + '</td>');
					$("#" + i).append('<td id="home-score-' + i + '">' + (Games[i].getAttribute('hs')=="" ? 0 : Games[i].getAttribute('hs')) + '</td>');
					$("#" + i).append('<td id="home-' + i + '">' + teamLogo(Games[i].getAttribute('h')) + '</td>');
					$("#" + i).append('<td id="date-' + i + '">' + gameStartTime(Games[i].getAttribute('eid'), Games[i].getAttribute('t'), Games[i].getAttribute('d')) + '</td>');
					// mark each users' pick cell for easier access upon next database query
					for(var j=0; j<Names.length; j++)
					{
						var tag = Users[j].replace('@','').replace('_','');	// remove illegal characters
						$("#" + i).append('<td style="width:100px;" id="' + tag + '-' + i + '"></td>');
						$("#" + i).append('<td style="width:10px;" id="' + tag + '-' + i + '-points"></td>');
					}
				}
				
				// search database and retrieve all users' picks and then populate the table accordingly
				database.ref(path).once('value').then(function(snapshot)
				{
					Picks = snapshot.val();
					userPicks(Picks);	// put all users' picks into the table, and hide other users' picks of games that haven't started
					determineWinners(Games);	// determine the winners of each game.
					
					// remove loading animation
					$(".loader").remove();
					// toggle hidden content
					$(".show-me").toggle();
					
					// call this function regularly to fill in other user's picks after the games start
					setInterval(function()
					{
						userPicks(Picks); 
					}, 1000);
				});
			});
		});
	});
});