/* global UID, firebase, season, LOAD_DELAY, CUR_WEEK, curUser, Team */

// document ready handler
$(function () {
	$("#header").load("../header.html", function () {
		wait();		// wait for global variables to be set
	});	
});

/**
 * This function will wait for the global variable UID to be set before continuing to load the rest of the page.
 * When UID is set to a value, this indicates all other global variables have been set. 
 */
function wait() {
	if (UID === null) {
		setTimeout(function() {
			wait();
		}, 500);
	} else {
		loadPage();
	}
}

function loadPage() {
	var SIZE = 768;
	var desktop = $(window).width() > SIZE;
	var weekData;
	// Get a reference to the database service
	var database = firebase.database();
	var mobile = !desktop;
	var week = location.search.substring(1) === '' 
		?	CUR_WEEK
		:	location.search.substring(1);
	var url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
	var path;
	var saved = true;
	$("#headerTitle").text(curUser.displayName + "'s " + season + " Week " + week + " Picks");
	$('#user-picks').css({'font-weight': 'bold', 'background': '#b4b4b4'});
	$('#week-dropdown').prepend('Week ' + week + '&nbsp;');
	for (var i=1; i<=17; i++) {
		var href = i === parseInt(week)
			?	'#'
			:	'?' + i;
		$('#weeks-list').append('<li><a href="'+href+'" id="'+i+'" class="week">Week '+i+'</a></li>');
	}
	$('#' + week).css({'font-weight': 'bold', 'background': '#b4b4b4'});

	// read from nfl.com all the games
	$.get(url, function(data) {
		// create weekly data object from XML document object imported
		weekData = new WeekGames(data, function () {
			path = weekData.season + '/picks/week' + weekData.week + '/' + UID;
			databaseImport(database, path, weekData, desktop);
		});
	});

	//Helper function to keep table row from collapsing when being sorted
	var fixHelperModified = function (e, ui) {
		ui.children().each(function() {
			var w = $(this).width();
			var h = $(this).height();
			$(this).width(w).height(h);
		});
		return ui;
	};

	//Make table sortable
	$('.ui-sortable').sortable({
		animation:	250,	// animation duration (ms)
		items: '> .sortable',
		start:	function (event, ui) {
			var startPos = ui.item.index();
			ui.placeholder.height(ui.helper.outerHeight() - ((startPos === 0)
				? 1
				: 0));
			ui.placeholder.width(ui.helper.outerWidth());
			ui.item.data('startPos', startPos);
			$(ui.helper).animate({opacity: 0.6}, 250);
			$('.locked', this).each(function(){
				var $this = $(this);
				$this.data('pos', $this.index());
			});
		},
		helper:	fixHelperModified,
		change:	function (event, ui) {
			var $sortable = $(this);
			var $locked = $('.locked', this).detach();
			var $helper = $('<tr></tr>').prependTo(this);
			$locked.each(function () {
				var $this = $(this);
				var target = $this.data('pos');
				$this.insertAfter($('tr', $sortable).eq(target));
			});
			$helper.remove();
			var games = $('#games tr').length - 1;
			var startPos = ui.item.data('startPos');
			var index = ui.placeholder.index();
			var cIndex = (startPos < index)
				? index-2
				: index-1;
			ui.placeholder.prevAll('tr').each(function () {
				if ($(this).is(ui.item)) {
					return;
				}
				$(this).find('.rank').text(games - cIndex);
				cIndex--;
			});

			cIndex = (startPos < index) ? index : index + 1;
			ui.placeholder.nextAll('tr').each(function () {
				if ($(this).is(ui.item)) {
					return;
				}
				$(this).find('.rank').text(games - cIndex);
				cIndex++;
			});
			ui.item.find('.rank').text(games - ((startPos < index)
				? index-1
				: index));
		},
		axis:	'y',
		revert:	"true",
		stop:	function (event, ui) {
			$(ui.item).animate({opacity: 1}, 250);
			saved = false;
		}
	});

	$('tbody').on('click', '.well', function () {
		var val = $(this).find('input:checked').val();
		if (val !== '-') {
			$(this).find('.no-pick').remove();
			$(this).find('.btn').css('background-color', Team.getTeamColor(val));
		}
	}).on('click', 'button', function () {
		var btn = $(this);
		if (btn.val() === 'up') {
			moveUp(btn.parents('tr'));
		} else {
			moveDown(btn.parents('tr'));
		}
		btn.blur();
		saved = false;
	});	

	$(window).resize(function (event) {
		if ($('#modal').hasClass('in') === false) {
			desktop = $(window).width() > SIZE;
			if (desktop === mobile) {
				buildGames(desktop, weekData);	// reload the page for the new window size
				mobile = !desktop;	// reset our trigger
				$('.home').css({'width':'140px'});
			}
		}
	});

	$('#games').change(function () { 
		saved = false;
	});

	$(window).on('beforeunload', function () {
		if (!saved) {
			return 'You have unsaved changes to your picks. Are you sure you want to leave?';
		}
	});

	$('#submit-div').click(function () {
		var html = $('#submit-div').html();
		// replace button with loader animation
		$('#submit-div').html(insertLoader());
		saved = submitPicks(database, path);
		// replace loader animation after submission is complete
		$('#submit-div').html(html);
	});

	$('#show-byes').click(function () {
		$('.modal-title').text('Teams On Bye Week');
		$('#modal-text').html('<div class="wrapper row"><table class="table"><tbody id="bye-table"></tbody></table></div>');
		if(weekData.byeTeams.length > 0) {
			for (var i=0; i<weekData.byeTeams.length; i++) {
				$('<tr class="modal-row"><td>'+ weekData.byeTeams[i].logo +'</td><td class="bye-cell">'+ 
					weekData.byeTeams[i].fullName +'</td></tr>').appendTo('#bye-table');
			}
		} else {
			$('#bye-table').html('<td>None</td>');
		}
		// apply various styling. CSS file won't apply to dynamic elements
		$('td').css('vertical-align', 'middle');
		$('#modal').modal('show');
	});

	$('#modal').on('hidden.bs.modal', function (e) {
		$('#modal-text').html('');
		$(window).trigger('resize');
	});
}

function moveUp(item) {
	var prev = item.prevAll('.sortable').first();
	if (prev.length === 0) {
		return;
	}
	//remove table-hover class temporarily
	$('table').removeClass('table-hover');
	//create clone to replace after animation
	var rows = $('tr:not(.table-header)').clone();
	var curIndex = $(item).index();
	var curRank = $(item).find('.rank').text();
	var prevIndex = $(prev).index();
	var prevRank = $(prev).find('.rank').text();
	var diff = prevRank - curRank;
	//swap rows in clone
	rows[curIndex] = rows[prevIndex];
	rows[prevIndex] = $(item).clone()[0];
	//update the rank immediately and in clone
	$('tr:not(.table-header)').eq(curIndex).find('.rank').text(curRank);
	$('tr:not(.table-header)').eq(prevIndex).find('.rank').text(prevRank);
	$(rows[curIndex]).find('.rank').text(curRank);
	$(rows[prevIndex]).find('.rank').text(prevRank);
	prev.children('td').css({'z-index': 999, 'position': 'relative'}).animate({
		top: item.height() * diff
	}, 550 ).wrapInner('<div />').children();
	item.children('td').css({'z-index': 1000, 'position': 'relative', 'background-color': '#f5f5f5'}).animate({ 
		top: '-' + (prev.height() * diff)
	}, 600, function () {
		//remove original and replace with clone
		$('tr:not(.table-header)').remove();
		$('tbody').append(rows);
		//add table-hover class back
		$('table').addClass('table-hover');
	}).wrapInner('<div />').children();
}

function moveDown(item) {
	var next = item.nextAll('.sortable').first();
	if (next.length === 0) {
		return;
	}
	//remove table-hover class temporarily
	$('table').removeClass('table-hover');
	//create clone to replace after animation
	var rows = $('tr:not(.table-header)').clone();
	var curIndex = $(item).index();
	var curRank = $(item).find('.rank').text();
	var nextIndex = $(next).index();
	var nextRank = $(next).find('.rank').text();
	var diff = curRank - nextRank;
	//swap rows in clone
	rows[curIndex] = rows[nextIndex];
	rows[nextIndex] = $(item).clone()[0];
	//update the rank immediately and in clone
	$('tr:not(.table-header)').eq(curIndex).find('.rank').text(curRank);
	$('tr:not(.table-header)').eq(nextIndex).find('.rank').text(nextRank);
	$(rows[curIndex]).find('.rank').text(curRank);
	$(rows[nextIndex]).find('.rank').text(nextRank);
	next.children('td').css({'z-index': 999, 'position': 'relative'}).animate({
		top: '-' + (item.height() * diff)
	}, 550 ).wrapInner('<div />').children();
	item.children('td').css({'z-index': 1000, 'position': 'relative', 'background-color': '#f5f5f5'}).animate({ 
		top: next.height() * diff
	}, 600, function () {
		//remove original and replace with clone
		$('tr:not(.table-header)').remove();
		$('tbody').append(rows);
		//add table-hover class back
		$('table').addClass('table-hover');
	}).wrapInner('<div />').children();
}

function loadGames(desktop, weekData) {
	for (var i=0; i<weekData.games.length; i++) {
		var rank = i + 1;
		var away = weekData.games[i].awayTeam.abbrName;
		var home = weekData.games[i].homeTeam.abbrName;
		var id = weekData.games[i].id;
		$('#games').prepend(insertRow(id, rank, away, home));
	}
	buildGames(desktop, weekData);
}

/**
 * Build loaded games for mobile screen or desktop screen
 * @param {type} desktop
 * @param {type} weekData
 * @returns {undefined}
 */
function buildGames(desktop, weekData) {
	$('tr:not(.table-header)').each(function () {
		var id = $(this).attr('id');
		var game = weekData.getGame(id);
		var away = game.awayTeam.abbrName;
		var home = game.homeTeam.abbrName;
		var pick = $(this).find('input:checked');
		if (desktop) {
			$('<td colspan="2" class="away" id="away'+ id +'">' + Team.getTeamName(away) + '</td>').insertAfter($(this).find('.rank'));
			$('<td colspan="2" class="home" id="home'+ id +'">' + Team.getTeamName(home) + '</td>').insertAfter($(this).find('.pick'));
			$(this).find('.mobile-logo').eq(0).text(away).css({'background-image':'none'});
			$(this).find('.mobile-logo').eq(1).text(home).css({'background-image':'none'});
			$(this).find('.date').text(game.dateStringLong);
			$('#away' + id).css({'background-image': 'url(../team-logos/trans'+ away +'.png)'});
			$('#home' + id).css({'background-image': 'url(../team-logos/trans'+ home +'.png)'});
		} else {
			$(this).find('.date').text(game.dateStringShort);
			$('#' + away + '-div').css({'background-image':	'url('+ Team.getTeamUrl(away) +')'}).text('');
			$('#' + home + '-div').css({'background-image':	'url('+ Team.getTeamUrl(home) +')'}).text('');
		}

		if (pick.val() === '-') {
			$('#btn-' + pick.attr('name')).css('background-color', 'rgb(57, 85, 107)');
		} else {
			$('#btn-' + pick.attr('name')).click();
		}
	});
	if(desktop) {
		$('th[data-field="pick"]').show();
		$('td.pick').attr('colspan', 1);
		$('.pick-text').show();
	} else {
		$('th[data-field="pick"]').fadeOut(300);
		$('.away, .home').fadeOut(300, function () {
			$(this).remove();
			$('.pick').attr('colspan', 4);
		});
		$('.inner-center').not('.pick-text').text('');
		$('.pick-text').fadeOut(300);
	}
	$('td').css('vertical-align', 'middle');
}

function databaseImport(database, path, weekData, desktop) {
	database.ref(path).once('value').then(function (snapshot) {
		var picks = snapshot.val();
		if (picks === null) {
			// no picks have been made for this week, so load the games as is
			loadGames(desktop, weekData);
		} else {
			// picks have been submitted to the database load games as saved in database
			for (var i=0; i<weekData.games.length; i++) {
				var rank = weekData.games.length - i;
				var userPick = getObjects(picks, 'rank', rank.toString())[0];
				var game = weekData.getGame(userPick.id);
				var away = game.awayTeam.abbrName;
				var home = game.homeTeam.abbrName;
				$('#games').append(insertRow(game.id, userPick.rank, away, home, picks[i].pick));
			}
			buildGames(desktop, weekData);
		}
		disableStartedGames(weekData);
		// apply various styling. CSS file won't apply to dynamic elements
		$('td').css('vertical-align', 'middle');
		// hide loading animation
		$(".loader").hide();
		// toggle hidden content
		$(".show-me").toggle();
	});
}

/**
* This function will disable all elements of a game that has already started (on user picks page).
* It will continue to call itself every 10 seconds until all games have started.
* @param {WeekGames} weekData Weekly Games Object
* @returns {undefined} Nothing
*/
function disableStartedGames(weekData) {
   // user is currently sorting
   var sorting = $('.ui-sortable-helper').length;
   if (!sorting) {
		//remove table-hover class temporarily
		$('table').removeClass('table-hover');
		for (var i=0; i<weekData.games.length; i++) {
			var id = weekData.games[i].id;
			if (weekData.games[i].isGameStarted) {
				var id = weekData.games[i].id;
				$('#' + id).removeClass('sortable').addClass('locked').removeAttr('style')
					.find('label, input').prop('disabled', true);
			}
		}
		//add table-hover class back
		$('table').addClass('table-hover');
	}
	// if all games haven't started or the user is sorting, call this function again to disable games.
	if (weekData.startedGames !== weekData.games.length || sorting) {
		setTimeout(function () {
		// set timeout for next request, update the time before calling this function again
			weekData.setTimeNow(function () {
				disableStartedGames(weekData);
			});
		}, 30000);
	} else {
		$("#submit-picks").hide();	// hide submit button if all games have started
	}
}

/**
* Submits all user's picks of current week to database.
* @param {type} database Firebase database reference
* @param {type} path The path in the database to write data
* @returns {undefined} Nothing
*/
function submitPicks(database, path) {
   var pick, rank, id;
   var games = $('#games tr');
   for (var i=0; i<games.length; i++) {
	   var row = games.eq(i);	// select the corresponding "i"th game
	   pick = row.find('input:checked').val();
	   rank = row.find('.rank').text();
	   id = row.find('input').attr('name');

	   database.ref(path + '/' + i).set({
		   id:		id,
		   pick:	pick,
		   rank:	rank			
	   }).catch(function(error) {
		   $.notify({
			   // options
			   icon: 'mdi mdi-alert',
			   message: error.message
		   },{
			   // settings
			   type: "danger",
			   allow_dismiss: true,
			   showProgressbar: true
		   });
		   return false;
	   });
   }

   $.notify({
	   // options
	   icon: 'mdi mdi-check',
	   message: 'Picks successfully submitted and saved!'
   },{
	   // settings
	   type: "success",
	   allow_dismiss: true,
	   showProgressbar: true
   });
   return true;
}
