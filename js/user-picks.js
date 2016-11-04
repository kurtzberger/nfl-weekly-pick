/* global UID, firebase, season, LOAD_DELAY */

$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		wait();		// wait for global variables to be set
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
	var weekData, url, path;
	var SIZE = 800;
	var desktop = $(window).width() > SIZE;
	
	if(desktop)
		$('#submit-picks').html('<i class="mdi mdi-send right"></i>Submit');
	else
		$('#submit-picks').html('<i class="mdi mdi-send"></i>');

	url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + location.search.substring(1).split("&")[0].split("=")[1];
	$('.your-picks').addClass("deep-orange lighten-3");

	// read from nfl.com all the games
	$.get(url, function( data )
	{
		// create weekly data object from XML file imported
		weekData = new WeekGames(data, function()
		{
			path = weekData.season + '/picks/week' + weekData.week;
			// span the length of number of by teams.
			$("#bye-header").attr('colspan', weekData.byesTeams.length);
			//if there are no teams on bye, then "None" is placed here
			if(weekData.byesTeams.length > 0)
			{
				for(var i=0; i<weekData.byesTeams.length; i++)
				{
					$("#byeLogos").append('<td style="text-align: center;">' + weekData.byesTeams[i].logo + '</td>');
					$("#byeNames").append('<td style="text-align: center;">' + weekData.byesTeams[i].fullName + '</td>');
				}
			} else
			{
				$("#byes").append('<td colspan="' + 7 + '" rowspan="2" class="flow-text" style="text-align: center;">None</td>');
			}

			for(var i=0; i<weekData.games.length; i++)
			{
				var away = weekData.games[i].awayTeam.abbrName;
				var awayFull = weekData.games[i].awayTeam.fullName;
				var awayLogo = weekData.games[i].awayTeam.logo;
				var home = weekData.games[i].homeTeam.abbrName;
				var homeFull = weekData.games[i].homeTeam.fullName;
				var homeLogo = weekData.games[i].homeTeam.logo;
				var id = weekData.games[i].id;
				var date = desktop ? weekData.games[i].dateStringLong : weekData.games[i].dateStringShort;
				var iconSize = desktop ? '' : 'mdi-12px';

				$("#body").append('<tr id=' + weekData.games[i].id + '></tr>');
				$("#" + id).append('<td id="date'+ i +'">' + date + '</td>');				//date in the table
				$("#" + id)//.append('<td>' + awayLogo + '</td>')															// away team logo
					.append('<td class="pick-cell" id="away'+ i +'"><input name="game' + i + '" type="radio" value="' + away + '" />' +	// away team radio button
							'<label id="'+ away + '" class="black-text" for='+ away +'>'+ (desktop ? awayFull : away) +'</label></td>')						// away team radio button label
					//.append('<td>' + homeLogo + '</td>')															// home team logo
					.append('<td class="pick-cell" id="home'+ i +'"><input name="game' + i + '" type="radio" value="' + home + '" />' +	// home team radio button
							'<label id="'+ home + '" class="black-text" for='+ home +'>'+ (desktop ? homeFull : home) +'</label></td>')						// home team radio button label
					.append('<td><select id="dropdown-' + i + '"><option value="" selected></option></select></td>')	// point assignment dropdown
					.append('<td><a id="reset-' + i + '" class="btn waves-effect waves-light blue-grey lighten-1 col' +	// reset button
							' s12 reset-game"><i class="mdi mdi-undo-variant '+ iconSize +'"></i></a></td>');
				$('#' + 'away' + i).css({'background-image': 'url(../team-logos/trans'+ away +'.png)'});
				$('#' + 'home' + i).css({'background-image': 'url(../team-logos/trans'+ home +'.png)'});
				//$("#" + tag).css({'background-image': 'url(../team-logos/trans'+ picks[i][j].pick +'.png)'})
				for(var j=1; j<=weekData.games.length; j++)
					$("#dropdown-" + i).append('<option value=' + j + '>' + j + '</option>');							// add point options to dropdown

				$("select").material_select();			// update select lists
			}

			databaseImport(database, path, UID);		// fill in any pick user has already submitted to the database.
			disableStartedGames(weekData);				// disable any games that have started			
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
					complete: function() { $("#week" + weekData.week + "-link").trigger("click"); } }); // Callback for Modal close
			} else $('#submit-div').html('<a id="submit-picks" class="btn waves-effect waves-light blue-grey lighten-1 btn-large col s12"><i class="mdi mdi-send right"></i>Submit</a>');
		}, LOAD_DELAY);
	});

	$('#main-content').on('click', '.reset-game', function()
	{
		var temp = $(this).attr('id').substring($(this).attr('id').indexOf('-')+1);	//temp variable for game identifier
		$('input:radio[name=game' + temp +']').prop('checked', false);	// clear team pick
		$('#dropdown-' + temp).val('');	// clear point value
		pointAssignments();	// update point values

	});
	
	$(window).resize(function()
	{
		desktop = $(window).width() > SIZE;
		
		for(var i=0; i<weekData.games.length; i++)
		{
			var away = weekData.games[i].awayTeam.abbrName;
			var awayFull = weekData.games[i].awayTeam.fullName;
			var home = weekData.games[i].homeTeam.abbrName;
			var homeFull = weekData.games[i].homeTeam.fullName;
			var date = desktop ? weekData.games[i].dateStringLong : weekData.games[i].dateStringShort;
			
			$('#date' + i).text(date);
			$('#' + away).text(desktop ? awayFull : away);
			$('#' + home).text(desktop ? homeFull : home);
		}
		
		if(desktop)
			$('#submit-picks').html('<i class="mdi mdi-send right"></i>Submit');
		else
			$('#submit-picks').html('<i class="mdi mdi-send"></i>');
	});
}


/**
 * Import all user's picks for the current week from database.
 * @param {Firebase} database Database reference
 * @param {type} path Path to the desired picks in the database
 * @param {type} user User to match in the database
 * @returns {undefined}
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
				if(j === user)
				{
					$("input[value=" + data[i][j].pick + "]").prop('checked', true); // set the game picked
					if(data[i][j].points !== "0")
					{
						$("#dropdown-" + data[i][j].game).val(data[i][j].points);	// set the number of points assigned to that game
					}
				}
			}
		}
		pointAssignments();	// update point values
	});
}

/**
 * This function will disable all elements of a game that has already started (on user picks page).
 * It will continue to call itself every 10 seconds until all games have started.
 * @param {WeekGames} weekData Weekly Games Object
 * @returns {undefined} Nothing
 */
function disableStartedGames(weekData)
{
	for(var i=0; i<weekData.games.length; i++)
	{
		if(weekData.games[i].isGameStarted)
		{
			$("input[name=game" + i + "]").prop('disabled', true);
			$("#dropdown-" + i).prop('disabled', true);
			$('select').material_select();	// update material select UI
			$("#reset-" + i).prop('disabled', true);
			$('#body tr').eq(i).css({ opacity: 0.5 });
		}
	}
	if($(".show-me").css('display') === "none")
	{
		// remove loading animation
		$(".remove-me").remove();
		// toggle hidden content
		$(".show-me").toggle();
	}
	// if all games haven't started, call this function again to disable games.
	if(weekData.startedGames !== weekData.games.length) 
	{
		setTimeout(function()		// set timeout for next request.
		{
			disableStartedGames(weekData);
		}, 10000);
	} else
	{
		$("#submit-picks").hide();	// hide submit button if all games have started
	}
}

/**
 * Ensures all point values inside of dropdowns are unique and that the max value is the number of games.
 * @returns {undefined} Nothing
 */
function pointAssignments()
{
	var Values = [];	// array of values
	var value, numberOfGames = $('#body tr').length;
	
	for(var i=0; i<=numberOfGames; i++)
	{
		// fill the array with all possible point values
		if(i===0)
			Values.push("");
		else
			Values.push(i);
	}
	
	for(var i=0; i<numberOfGames; i++)
	{
		value = $('#dropdown-' + i).val();									// get current selected value
		if(value !== "")													// do not remove empty selection from array. This is always a valid selection in all elements.
		{
			Values.splice(Values.indexOf(parseInt(value)), 1);				// remove selected value for array 
		}
		$('#dropdown-' + i + ' option[value!="' + value + '"]').remove();	// remove all values EXCEPT selected
		if(value === "")
		{
			$('#dropdown-' + i + ' option[value="' + value + '"]').remove();// remove empty selection from element (to be added back later)
		}																	// if we don't remove the empty selection there will be a duplicate added in later.
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
}