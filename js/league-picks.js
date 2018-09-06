/* global UID, season, firebase, CUR_WEEK, Team, curUser */
var TIMEOUT; // global timeout variable
var weekData;	// global variable for weekly data
// document ready handler
$(function() {
	$("#header").load("../header.html", function() {
		wait(); // wait for global variables to be set
	});
});

/**
 * This function will wait for the global variables to be set before continuing to load the rest of the page.
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

/**
 * Load all page elements for this page
 */
function loadPage() {
	var loaded = false;
	// Get a reference to the database service
	var database = firebase.database();
	var url, path, picks, users;
	var week = parseInt(location.search.substring(1) === '' 
		?	CUR_WEEK	// current week
		:	location.search.substring(1));
	var SIZE = 1348;
	var desktop = $(window).width() > SIZE;
	var mobile = !desktop;	// one shot trigger

	// this URL is used just for this webpage
	//if (week === CUR_WEEK) {
	//	url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';
	//} else {
		url = 'http://www.nfl.com/ajax/scorestrip?season=' + season + '&seasonType=REG&week=' + week;
	//}

	$('#league-picks').css({'font-weight': 'bold', 'background': '#b4b4b4'});
	$("#headerTitle").text(season + " Week " + week + " League Picks");
	$('#week-dropdown').prepend('Week ' + week + '&nbsp;');
	$('#stats-title').text('Week ' + week + ' Scores');
	// there are 17 NFL weeks
	for (var i=1; i<=17; i++) {
		var href = i === parseInt(week)
			?	'#'
			:	'?' + i;
		$('#weeks-list').append('<li><a href="'+href+'" id="'+i+'" class="week">Week '+i+'</a></li>');
	}
	$('#' + week).css({'font-weight': 'bold', 'background': '#b4b4b4'});

   // get games from nfl.com
	$.get(url, function(xml) {
		weekData = new WeekGames(xml, function() {
			path = weekData.season + '/picks/week' + weekData.week;

			// search database for all users' display name and then finish putting in all data except user's picks
			// users' picks will be handled in a seperate database query
			database.ref('users').once('value').then(function(snapshot) {
				users = removeInactiveUsers(snapshot.val());
				// attach database listener to this week's data. fires every time new picks are submitted/changed
				database.ref(path).on('value', function(snapshot) {
					picks = snapshot.val();
					if (!loaded) {
						loadUserPicks(weekData, users, picks);	// for desktop
						loadNFLGames(weekData);	// load NFL scores
						// load user stats for this week (mobile and desktop)
						loadUsersStats(weekData, users, function () {
							$(".loader").hide();	// hide loading animation
							$('.show-me').toggle();
							if (desktop) {
								$('#desktop').show();
							} else {
								$('#mobile').show();	
							}
						});	
						loaded = true;	// mark this true ASAP
					} else {
						clearTimeout(TIMEOUT);
					}
					if (weekData.week === CUR_WEEK && weekData.completedGames !== weekData.games.length) {
						TIMEOUT = setTimeout(function () {
							// update weekData first
							weekData.update(function () {
								updateNFLScores(users, picks); // calls updateUserPicks & updateUsersStats after
							});
						}, 10000);
					}
				});
			});
		});
	});
	
	$('#mobile').find('#scores').on('click', 'tr', function () {
		var gameID = $(this).attr('id');
		var game = weekData.getGame(gameID);
		$('#modal').find('table').attr('data-gameid', gameID);
		modalUserPicks(game, picks, users);
		$('#modal').modal('show');
	});
	
	$('#modal').on('hidden.bs.modal', function (e) {
		$('#modal tbody').html('');
		$('#modal').find('table').attr('data-gameid', '');
	});
	
	$(window).resize(function (event) {
		if ($('#modal').hasClass('in') === false) {
			desktop = $(window).width() > SIZE;
			if (desktop === mobile) {
				$('#mobile').toggle();
				$('#desktop').toggle();
				mobile = !desktop;	// reset our trigger
			}
		}
	});
}

function modalUserPicks(game, picks, users) {
	var away = game.awayTeam;
	var home = game.homeTeam;
	var green = '#00d05e'; // correct pick color
	var red = '#da9694'; // incorrect pick color
	var html = '';
	$('.modal-title').text(away.fullName.split('\n')[0] + ' at ' + home.fullName.split('\n')[0]); // just put the city name in modal title
	if (!$.isEmptyObject(picks)) {
		for (var i in picks) {
			var userPick = getObjects(picks[i], 'id', game.id)[0];
			var team = (userPick)
				?	userPick.pick
				:	'-';
			if (team === '-') {
				continue;	// no pick was made. skip this iteration
			}
			var name = users[i].displayName;
			var rank = userPick.rank;
			var bgColor = '';
			if(game.winner) {
				if(game.winner.abbrName === userPick.pick) {
					bgColor = green;
				} else {
					bgColor = red;
				}
			}
			
			if (game.isGameStarted || UID === i || nonUserCheck(i)) {
				html += '<tr class="modal-row" style="background-color: ' + bgColor + '"><td>'+ name +'</td>' +
					'<td>'+ rank +'</td>' +
					'<td>' + Team.getTeamLogo(team) + '</td>' +
					'<td class="pick">' + Team.getTeamName(team) + '</td></tr>';
			} else {
				html += '<tr class="modal-row"><td>'+ name +'</td>' +
					'<td colspan="3">Hidden until kickoff</td>';
			}
		}
	}
	$('#modal tbody').html(html);
	// apply various styling. CSS file won't apply to dynamic elements
	$('td').not('.pick-cell').css('vertical-align', 'middle');
}

function loadNFLGames(weekData) {
	for (var i=0; i<weekData.games.length; i++) {
		var id = weekData.games[i].id;
		var date = weekData.games[i].dateStringShort;
		var away = weekData.games[i].awayTeam;
		var home = weekData.games[i].homeTeam;
		var quarterTime = (($.isNumeric(weekData.games[i].quarter))
			?	'Q' + weekData.games[i].quarter
			:	weekData.games[i].quarter) + ' ' + weekData.games[i].timeInQuarter;
		//desktop
		$('#dates').append('<td style="font-size: 95%;">' + date + '</td>');	// date
		$('#away-teams').append('<td data-gameid="' + id + '" class="pick-cell away">' + away.score + '</td>');	// away score
		$('#home-teams').append('<td data-gameid="' + id + '" class="pick-cell home">' + home.score + '</td>');	// home score
		$('#picks-header').attr('colspan', weekData.games.length);
		//mobile
		$('#mobile').find('#scores').append('<tr id="' + id + '"></tr>');	
		$('#' + id).append('<td class="date">' + date + '</td>');	// date
		$('#' + id).append('<td data-gameid="' + id + '" class="away">' + away.score + '</td>');	// away score
		$('#' + id + ', #quarter').append('<td data-gameid="' + id + '" class="quarter">' + quarterTime.trim() + '</td>');	// quarter and time (mobile & desktop)
		$('#' + id).append('<td data-gameid="' + id + '" class="home">' + home.score + '</td>');	// home score
		$('td[data-gameid="' + id + '"].away').css({'background-image': 'url(../team-logos/trans' + away.abbrName + '.png)'});	// away logo (mobile & desktop)
		$('td[data-gameid="' + id + '"].home').css({'background-image': 'url(../team-logos/trans' + home.abbrName + '.png)'});	// home logo (mobile & desktop)
		if (away.hasPossession) {
			$('td[data-gameid="' + id + '"].away').css('background-color', (away.isInRedZone ? '#da9694' : '#ffff66'));
			$('td[data-gameid="' + id + '"].home').css('background-color', '');
		} else if (home.hasPossession) {
			$('td[data-gameid="' + id + '"].away').css('background-color', '');
			$('td[data-gameid="' + id + '"].home').eq(i).css('background-color', (home.isInRedZone ? '#da9694' : '#ffff66'));
		}
	}
}

function loadUserPicks(weekData, users, picks) {
	var green = '#00d05e'; // correct pick color
	var red = '#da9694'; // incorrect pick color
	var headers = $('#headers').html();
	$('#league-picks-table').html('<tr id="headers">' + headers + '</tr>');
	for (var i in users) {
		var tag = replaceAll(replaceAll(i, '@', ''), '_', ''); // remove illegal characters
		$('#league-picks-table').append('<tr id="' + tag + '"></tr>');
		$('#' + tag).append('<td style="font-weight: bold;">' + users[i].displayName + '</td>');
		for (var j=0; j<weekData.games.length; j++) {
			var bgColor = '';
			var game = weekData.games[j];
			var userPick = (picks)
				?	getObjects(picks[i], 'id', game.id)[0]
				:	null;
			var team = (userPick)
				?	userPick.pick
				:	'-';
			if (team === '-' && !game.winner) {
				$('#' + tag).append('<td></td>');	// no pick was made.
				continue;
			}
			var rank = (userPick)
				?	userPick.rank
				:	'';
			if(game.winner) {
				if(game.winner.abbrName === team) {
					bgColor = green;
				} else {
					bgColor = red;
				}
			}
			if (game.isGameStarted || UID === i || nonUserCheck(i)) {
				$('<td class="pick-cell" style="background-color: ' + bgColor + ';' + 
					' background-image: url(../team-logos/trans' + team + '.png);">' + rank + '</td>')
					.appendTo('#' + tag);
			} else {
				$('<td>Hidden</td>').appendTo('#' + tag);
			}
		}
	}
}

function loadUsersStats(weekData, users, callback) {
	// create a standings object for this week
	var standings = {
		completedGames: 0
	};
	// get all display names from imported data and initialize stats for each user
	for (var i in users) {
		standings[i] = {
			name: users[i].displayName,
			UID:	i,
			points: 0,
			unassignedPoints: 0,
			wins: 0
		};
	}
	processStandings(standings, {
		start:		weekData.week,
		end:		weekData.week,
		callback:	function () {
			var sorted = sortStandings(standings, true);
			// mobile stats
			for (var i = 0; i < sorted.length; i++) {
				var winPct = (sorted[i].wins * 100.0 / standings.completedGames).toFixed(2);
				$('#mobile').find('#stats').append('<tr id="mobile-stats' + i + '"></tr>');
				$('<td>' + sorted[i].name + '</td>').appendTo('#mobile-stats' + i);	// name in mobile stats table
				$('<td class="points">' + sorted[i].points + '</td>').appendTo('#mobile-stats' + i);	// points in mobile stats table
				$('<td class="wins">' + sorted[i].wins + '</td>').appendTo('#mobile-stats' + i);	// wins in mbile stats table
				$('<td class="win-pct">' + (isNaN(winPct) ? '0.00' : winPct) + '%</td>').appendTo('#mobile-stats' + i);	// win % in mobile stats table
			}
			// desktop stats
			for (var i in standings) {
				if (i === 'completedGames') {
					continue;
				}
				var tag = replaceAll(replaceAll(i, '@', ''), '_', ''); // remove illegal characters
				var winPct = (standings[i].wins * 100.0 / standings.completedGames).toFixed(2);
				$('<td class="points">' + standings[i].points + '</td>').appendTo('#' + tag);	// points in table
				$('<td class="win-pct">' + (isNaN(winPct) ? '0.00' : winPct) + '%</td>').appendTo('#' + tag);	// win % in table	
			}
			$('td').not('.pick-cell').css('vertical-align', 'middle'); // apply to dynamic elements
			callback();
		}
	});
}

/**
 * Function that will update the NFL scores on the webpage
 * @param {JSON Object} users
 * @param {JSON Object} picks imported from Firebase 
 * @returns {undefined} None
 */
function updateNFLScores(users, picks) {
	for (var i = 0; i < weekData.games.length; i++) {
		var id = weekData.games[i].id;
		var away = weekData.games[i].awayTeam;
		var home = weekData.games[i].homeTeam;
		var quarterTime = (($.isNumeric(weekData.games[i].quarter))
			?	'Q' + weekData.games[i].quarter
			:	weekData.games[i].quarter) + ' ' + weekData.games[i].timeInQuarter;
		// jQuery selectors for this iteration
		var $away = $('td[data-gameid="' + id + '"].away');
		var $home = $('td[data-gameid="' + id + '"].home');
		var $quarter = $('td[data-gameid="' + id + '"].quarter');
		$away.text(away.score); // mobile away score
		$quarter.text(quarterTime.trim()); // quarter & time
		$home.text(home.score); // home score
		if (away.hasPossession) {
			$away.css('background-color', (away.isInRedZone ? '#da9694' : '#ffff66'));
			$home.css('background-color', '');
		} else if (home.hasPossession) {
			$away.css('background-color', '');
			$home.css('background-color', (home.isInRedZone ? '#da9694' : '#ffff66'));
		} else {
			$away.css('background-color', '');
			$home.css('background-color', '');
		}
	}
	updateUserPicks(weekData, users, picks);	// update user picks (reveal/mark correct or incorrect)
	updateUsersStats(weekData, users);
	if (weekData.week === CUR_WEEK && weekData.completedGames !== weekData.games.length) {
		TIMEOUT = setTimeout(function () {
			// update weekData first
			weekData.update(function () {
				updateNFLScores(users, picks); // calls updateUserPicks & updateUsersStats after
			});
		}, 10000);
	}
}

function updateUserPicks(weekData, users, picks) {
	var green = '#00d05e'; // correct pick color
	var red = '#da9694'; // incorrect pick color
	for (var i in users) {
		var tag = replaceAll(replaceAll(i, '@', ''), '_', ''); // remove illegal characters
		for (var j=0; j<weekData.games.length; j++) {
			var $cell = $('#' + tag).find('td').eq(j+1);
			var bgColor = $cell.css('background-color');
			if (bgColor !== 'rgba(0, 0, 0, 0)') {
				continue;	// user pick was updated in a previous call.
			}
			var game = weekData.games[j];
			var userPick = getObjects(picks[i], 'id', game.id)[0];
			var team = (userPick)
				?	userPick.pick
				:	'-';
			if (team === '-' && !game.winner) {
				$cell.text('');	// no pick was made.
				continue;
			}
			var rank = (userPick)
				?	userPick.rank
				:	'';
			if (game.winner) {
				if(game.winner.abbrName === team) {
					bgColor = green;
				} else {
					bgColor = red;
				}
			}
			if (game.isGameStarted || UID === i || nonUserCheck(i)) {
				$cell.css('background-color', bgColor)
					.css('background-image', 'url(../team-logos/trans' + team + '.png)')
					.addClass('pick-cell')
					.text(rank);
			} else {
				$cell.text('Hidden');
			}
		}
	}
	// call modalUserPicks if user has a modal dialog box open to update those picks as well
	if (($("#modal").data('bs.modal') || {}).isShown) {
		var gameID = $('#modal').find('table').attr('data-gameID');
		var game = weekData.getGame(gameID);
		modalUserPicks(game, picks, users);
	}
}

function updateUsersStats(weekData, users) {
	// create a standings object for this week
	var standings = {
		completedGames: 0
	};
	// get all display names from imported data and initialize stats for each user
	for (var i in users) {
		standings[i] = {
			name: users[i].displayName,
			UID:	i,
			points: 0,
			unassignedPoints: 0,
			wins: 0
		};
	}
	processStandings(standings, {
		start:		weekData.week,
		end:		weekData.week,
		callback:	function () {
			var sorted = sortStandings(standings, true);
			// mobile stats
			for (var i = 0; i < sorted.length; i++) {
				var winPct = (sorted[i].wins * 100.0 / standings.completedGames).toFixed(2);
				var $cell = $('#mobile-stats' + i).find('td');
				$cell.eq(0).text(sorted[i].name);	// name in the mobile stats table
				$cell.eq(1).text(sorted[i].points);	// points in mobile stats table
				$cell.eq(2).text(sorted[i].wins);	// wins in mobile stats table
				$cell.eq(3).text((isNaN(winPct) ? '0.00' : winPct) + '%');	// win % in mobile stats table
			}
			// desktop stats
			for (var i in standings) {
				if (i === 'completedGames') {
					continue;
				}
				var tag = replaceAll(replaceAll(i, '@', ''), '_', ''); // remove illegal characters
				var winPct = (standings[i].wins * 100.0 / standings.completedGames).toFixed(2);
				$('#' + tag).find('.points').text(standings[i].points);	// points in table
				$('#' + tag).find('.win-pct').text((isNaN(winPct) ? '0.00' : winPct) + '%');	// win % in table	
			}
			$('td').not('.pick-cell').css('vertical-align', 'middle'); // apply to dynamic elements	
		}
	});
}