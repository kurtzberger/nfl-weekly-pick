/**
 * Function to build the HTML for each row on user's picks page
 * @param {String} id The ID of the NFL game
 * @param {integer} rank The rank of this row
 * @param {Team} away The away team
 * @param {Team} home The home team
 * @param {string} userPick [optional] Imported userpick from the database. Will be either be '-' (no pick), home, or away.
 * @returns {String} An HTML string of the entire row to be inserted into the picks table.
 */
function insertRow(id, rank, away, home, userPick = null) {
	var rowHTML = '<tr id="' + id + '" class="sortable">' + 
		insertRank(rank) + 
		insertPick(id, away, home, userPick) +
		insertDate() +
		insertMove() +
		'</tr>';
	return rowHTML;
}

function insertRank(rank) {
	var rankHTML = '<td class="rank">' +
		rank +
		'</td>';
	return rankHTML;
}

function insertPick(id, away, home, userPick) {
	var awayHTML =
		'<td class="pick" colspan="4">\n\
			<div class="switch-toggle well">\n\
				<input type="radio" name="' + id + '" id="' + away + '" value="' + away + '" checked="checked">\n\
				<label for="' + away + '">\n\
					<div class="inner-center mobile-logo" id="' + away + '-div">' + away + '</div>\n\
				</label>\n\
				<input type="radio" name="' + id + '" id="' + home + '" value="' + home + '">\n\
				<label for="' + home + '">\n\
					<div class="inner-center mobile-logo" id="' + home + '-div">' + home + '</div>\n\
				</label>\n\
				<a class="btn" id="btn-' + id + '"></a>\n\
			</div>\n\
		</td>';
	var homeHTML =
		'<td class="pick" colspan="4">\n\
			<div class="switch-toggle well">\n\
				<input type="radio" name="' + id + '" id="' + away + '" value="' + away + '">\n\
				<label for="' + away + '">\n\
					<div class="inner-center mobile-logo" id="' + away + '-div">' + away + '</div>\n\
				</label>\n\
				<input type="radio" name="' + id + '" id="' + home + '" value="' + home + '" checked="checked">\n\
				<label for="' + home + '">\n\
					<div class="inner-center mobile-logo" id="' + home + '-div">' + home + '</div>\n\
				</label>\n\
				<a class="btn" id="btn-' + id + '"></a>\n\
			</div>\n\
		</td>';
	var pickHTML = 
		'<td class="pick" colspan="4">\n\
			<div class="switch-toggle well">\n\
				<input type="radio" name="' + id + '" id="' + away + '" value="' + away + '">\n\
				<label for="' + away + '">\n\
					<div class="inner-center mobile-logo" id="' + away + '-div">' + away + '</div>\n\
				</label>\n\
				<input class="no-pick" type="radio" name="' + id + '" id="' + away + '-' + home + '" value="-" checked="checked">\n\
				<label class="no-pick" for="' + away + '-' + home + '">\n\
					<div class="inner-left"><i class="mdi mdi-arrow-left-bold" aria-hidden="true"></i></div>\n\
					<div class="inner-right"><i class="mdi mdi-arrow-right-bold" aria-hidden="true"></i></div>\n\
					<div class="inner-center pick-text" style="display: none;">PICK</div>\n\
				</label>\n\
				<input type="radio" name="' + id + '" id="' + home + '" value="' + home + '">\n\
				<label for="' + home + '">\n\
					<div class="inner-center mobile-logo" id="' + home + '-div">' + home + '</div>\n\
				</label>\n\
				<a class="btn" id="btn-' + id + '"></a>\n\
			</div>\n\
		</td>';
	switch (userPick) {
	case away:	return awayHTML;
	case home:	return homeHTML;
	default:	return pickHTML;
	}
}

function insertDate() {
	var dateHTML = '<td class="date"></td>';
	return dateHTML;
}

function insertMove() {
	var moveHTML = 
		'<td class="move">\n\
			<div class="button-container">\n\
				<button value="up" class="btn btn-default"><i class="mdi mdi-arrow-up"></i></button>\n\
				<button value="down" class="btn btn-default"><i class="mdi mdi-arrow-down"></i></button>\n\
			</div>\n\
		</td>';
	return moveHTML;
}

