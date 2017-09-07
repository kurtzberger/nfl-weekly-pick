/* global sPage, firebase, CUR_WEEK */

/**
 * Name:		links.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for handling all link click events
 */

$(function () {
    /**
     *	Load standings page
     */
    $("#header").on("click", "#standings-link", function () {
        if (sPage !== "standings") {
            if (sPage === "") {
                window.location.href = "standings";
            } else if (sPage !== "standings") {
                window.location.href = "../standings";
            }
        }
    });

    /**
     *	Load registration page
     */
    $("#header").on("click", "#register-link", function () {
        if (sPage !== "register") {
			window.location.href = "../register";
        }
    });

    /**
     *	Load password change page
     */
    $("#header").on("click", "#change-password-link", function () {
        if (sPage !== "change-password") {
			window.location.href = "../change-password";
        }
    });

    $("#header").on("click", '#login-logout', function () {
        var user = firebase.auth().currentUser; // current user
        if (user !== null) {
            firebase.auth().signOut().then(function () {
                // additional logout stuff here
            }, function(error) {
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
            });
        }
        if (sPage !== "login") {
			window.location.href = "../login";
        }
    });

    /**
     * 	Load League picks page depending on which week was clicked.
     */
    $("#header").on('click', '#league-picks', function () {
		var week = (CUR_WEEK === 'Preseason')
			?	1
			:	CUR_WEEK;
		if (sPage !== 'league-picks') {
			window.location.href = "../league-picks/?" + week;
		}
    });

    /**
     * 	Load user picks page 
     */
    $("#header").on('click', '#user-picks', function () {
		var week = (CUR_WEEK === 'Preseason')
			?	1
			:	CUR_WEEK;
		if (sPage !== 'user-picks') {
			window.location.href = "../user-picks/?" + week;
		}
    });

    /**
     * Load rules webpage
     */
    $("#header").on('click', '#rules-link', function () {
        if (sPage !== "rules") {
			window.location.href = "../rules";
        }
    });

	/**
	 * link for choosing picks for non-users
	 */
    $("#header").on('click', '#non-user-link', function () {
        if (sPage !== "non-user-picks") {
			window.location.href = "../non-user-picks";
        }
    });
});