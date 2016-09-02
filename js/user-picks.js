$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		var week, localURL, seasonType, path;
		week = location.search.substring(1).split("&")[0].split("=")[1];
		// this URL is used just for this webpage
		localURL = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
		
		$('.your-picks').addClass("deep-orange lighten-3");
		$("#user-picks-week" + week + "-link").addClass("deep-orange lighten-3");
		
		$("#user-picks-link").addClass("deep-orange lighten-3");

		// Get a reference to the database service
		var database = firebase.database();
		
		// read from nfl.com all the games for the given URL defined in init.js
		$.get(localURL, function( data )
		{
			seasonType = $(data).find('gms')[0].getAttribute('t');
			path = season + '/picks/week' + week;
			// load xml data into the table
			xmlImport(data);
			databaseImport(database, path, UID);
			disableStartedGames(function() 
			{
				//remove loader animation
				$(".loader").remove();
				$(".show-me").toggle();
			});
		});
		
		$('#main-content').on('change', 'select', function()
		{
			// correctly handle all point assignment events, i.e., don't allow duplicate point assignments
			setTimeout(function() { pointAssignments(); }, 150);
		});
		
		$('#main-content').on("click", "#submit-picks", function()
		{
			var success = false;
			$("#submit-div").html('<div class="loader s12 m4 center">' +
				'<div class="preloader-wrapper big active">' +
				'<div class="spinner-layer spinner-blue-only">' +
				'<div class="circle-clipper left">' +
				'<div class="circle"></div>' +
				'</div><div class="gap-patch">' +
				'<div class="circle"></div>' + 
				'</div><div class="circle-clipper right">' +
				'<div class="circle"></div></div></div></div></div>');
			setTimeout(function()
			{ 
				success = submitPicks(database, path, UID);
				if(success)
				{
					$("#main-content").html("");
					$("#modal-text").html("<h4>Picks submitted!</h4><p>Your picks have been submitted</p>");
					$("#modal-confirm").text(funnyPhrase());
					$("#notification").openModal({
						complete: function() { $("#week" + week + "-link").trigger("click"); } }); // Callback for Modal close
				} else $('#submit-div').html('<a id="submit-picks" class="btn waves-effect waves-light blue-grey lighten-1 col s12"><i class="mdi mdi-send right"></i>Submit</a>');
			}, LOAD_DELAY);
		});
		
		$('#main-content').on('click', '.reset-game', function()
		{
			var temp = $(this).attr('id').substring($(this).attr('id').indexOf('-')+1);	//temp variable for game identifier
			$('input:radio[name=game' + temp +']').prop('checked', false);	// clear team pick
			$('#dropdown-' + temp).val('');	// clear point value
			pointAssignments(); // update point values
			
		});
		
		// call this function regularly to disable any games that have started
		setInterval(function(){ disableStartedGames(function(){}); }, 10000);
	});
	
});