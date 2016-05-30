/**
 * Name:		functions.js
 * Author: 		Eric Kurtzberg
 * Description:	javascript for all custom functions
 */

Date.prototype.stdTimezoneOffset = function() {
	var jan = new Date(this.getFullYear(), 0, 1);
	var jul = new Date(this.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};


/** Returns the full name of an NFL team given a valid three letter abbreviation
 * @param name
 * @returns {String}
 */
function teamName(name)
{
	if(name=="ARI") 	return "Arizona Cardinals";
	else if(name=="ATL")return "Atlanta Falctions";
	else if(name=="BAL")return "Baltimore Ravens";
	else if(name=="BUF")return "Buffalo Bills";
	else if(name=="CAR")return "Carolina Panthers";
	else if(name=="CHI")return "Chicago Bears";
	else if(name=="CIN")return "Cincinnati Bengals";
	else if(name=="CLE")return "Cleveland Browns";
	else if(name=="DAL")return "Dallas Cowboys";
	else if(name=="DEN")return "Denver Broncos";
	else if(name=="DET")return "Detroit Lions";
	else if(name=="GB")	return "Green Bay Packers";
	else if(name=="HOU")return "Houston Texans";
	else if(name=="IND")return "Indianapolis Colts";
	else if(name=="JAX")return "Jacksonville Jaguars";
	else if(name=="KC") return "Kansas City Chiefs";
	else if(name=="LA") return "Los Angeles Rams";
	else if(name=="MIA")return "Miami Dolphins";
	else if(name=="MIN")return "Minnesota Vikings";
	else if(name=="NE")	return "New England Patriots";
	else if(name=="NO")	return "New Orleans Saints";
	else if(name=="NYG")return "New York Giants";
	else if(name=="NYJ")return "New York Jets";
	else if(name=="OAK")return "Oakland Raiders";
	else if(name=="PHI")return "Philadelphia Eagles";
	else if(name=="PIT")return "Pittsburgh Steelers";
	else if(name=="SD")	return "San Diego Chargers";
	else if(name=="SF")	return "San Francisco 49ers";
	else if(name=="SEA")return "Seattle Seahawks";
	else if(name=="TB")	return "Tampa Bay Buccaneers";
	else if(name=="TEN")return "Tennessee Titans";
	else if(name=="WAS")return "Washington Redskins";
	else				return "Unknown Team";
};

/**
 * Returns an HTML image of an NFL team given a valid three letter abbreviation
 * @param name
 * @returns {String}
 */
function teamLogo(name)
{
	if(name=="ARI") 	return '<img alt="Arizona Cardinals" src="http://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="ATL")return '<img alt="Atlanta Falctions" src="http://prod.static.falcons.clubs.nfl.com/nfl-assets/img/gbl-ico-team/ATL/logos/home/large.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="BAL")return '<img alt="Baltimore Ravens" src="https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/415px-Baltimore_Ravens_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="BUF")return '<img alt="Buffalo Bills" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/279px-Buffalo_Bills_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="CAR")return '<img alt="Carolina Panthers" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Carolina_Panthers_logo_2012.svg/100px-Carolina_Panthers_logo_2012.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="CHI")return '<img alt="Chicago Bears" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/400px-Chicago_Bears_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="CIN")return '<img alt="Cincinnati Bengals" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Cincinnati_Bengals.svg/250px-Cincinnati_Bengals.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="CLE")return '<img alt="Cleveland Browns" src="http://upload.wikimedia.org/wikipedia/en/thumb/f/f0/2015_Browns_helmet.png/100px-2015_Browns_helmet.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="DAL")return '<img alt="Dallas Cowboys" src="http://content.sportslogos.net/logos/7/165/full/406.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="DEN")return '<img alt="Denver Broncos" src="http://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/100px-Denver_Broncos_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="DET")return '<img alt="Detroit Lions" src="http://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuoif9.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="GB")	return '<img alt="Green Bay Packers" src="http://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="HOU")return '<img alt="Houston Texans" src="http://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/100px-Houston_Texans_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="IND")return '<img alt="Indianapolis Colts" src="http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/100px-Indianapolis_Colts_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="JAX")return '<img alt="Jacksonville Jaguars" src="http://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Jacksonville_Jaguars_2013_logo.png/100px-Jacksonville_Jaguars_2013_logo.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="KC") return '<img alt="Kansas City Chiefs" src="http://content.sportslogos.net/logos/7/162/full/857.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="LA") return '<img alt="Los Angeles Rams" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/NFL_Rams_logo.svg/281px-NFL_Rams_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="MIA")return '<img alt="Miami Dolphins" src="http://upload.wikimedia.org/wikipedia/en/thumb/8/81/Miami_Dolphins_2013_Logo.svg/100px-Miami_Dolphins_2013_Logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="MIN")return '<img alt="Minnesota Vikings" src="http://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Minnesota_Vikings_Logo_2013.png/100px-Minnesota_Vikings_Logo_2013.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="NE")	return '<img alt="New England Patriots" src="http://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/100px-New_England_Patriots_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="NO")	return '<img alt="New Orleans Saints" src="http://content.sportslogos.net/logos/7/175/full/907.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="NYG")return '<img alt="New York Giants" src="http://content.sportslogos.net/logos/7/166/full/919.gif" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="NYJ")return '<img alt="New York Jets" src="http://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/100px-New_York_Jets_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="OAK")return '<img alt="Oakland Raiders" src="http://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Oakland_Raiders.svg/100px-Oakland_Raiders.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="PHI")return '<img alt="Philadelphia Eagles" src="http://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Philadelphia_Eagles_primary_logo.svg/100px-Philadelphia_Eagles_primary_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="PIT")return '<img alt="Pittsburgh Steelers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/135px-Pittsburgh_Steelers_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="SD")	return '<img alt="San Diego Chargers" src="http://upload.wikimedia.org/wikipedia/en/thumb/0/06/San_Diego_Chargers_logo.svg/100px-San_Diego_Chargers_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="SF")	return '<img alt="San Francisco 49ers" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/49ers_Logo.svg/460px-49ers_Logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="SEA")return '<img alt="Seattle Seahawks" src="http://upload.wikimedia.org/wikipedia/it/0/01/Seattle_Seahawks_Logo_2012.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="TB")	return '<img alt="Tampa Bay Buccaneers" src="http://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Tampa_Bay_Buccaneers_2014.png/100px-Tampa_Bay_Buccaneers_2014.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="TEN")return '<img alt="Tennessee Titans" src="http://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Tennessee_Titans_logo.svg/100px-Tennessee_Titans_logo.svg.png" style="float: left; width: auto; max-height: 35px;">';
	else if(name=="WAS")return '<img alt="Washington Redskins" src="http://content.sportslogos.net/logos/7/168/full/im5xz2q9bjbg44xep08bf5czq.gif" style="float: left; width: auto; max-height: 35px;">';
	else				return '';

};

/**
 * Loads current week's picks from NFL's database
 * @param xml
 */
function xmlImport(xml)
{
	var xmlDoc = $(xml)
	var g = xmlDoc.find('g');
	var home, away, day, date, time, hour, minute, dateString;
    var week = xmlDoc.find('gms')[0].getAttribute('w');
    var season = xmlDoc.find('gms')[0].getAttribute('y');
    
    $("#title").append(season + " Week " + week + " Picks");
    
	for(var i=0; i<g.length; i++)
	{
		home = g[i].getAttribute('h');
		away = g[i].getAttribute('v');
		day = g[i].getAttribute('eid');
		time = g[i].getAttribute('t');
		hour = parseInt(time.substring(0, time.indexOf(":")));			
		minute = parseInt(time.substr(time.indexOf(":") + 1, 2));
		if(g[i].getAttribute('d')=="Sun" && day.substr(day.length - 2)=="00" && hour > 8)
			hour += 4;
		else
			hour += 16;
		// check for daylight savings
		date = new Date(Date.UTC(parseInt(day.substr(0, 4)), parseInt(day.substr(4, 2))-1, parseInt(day.substr(6, 2)), hour, minute));
		if(!date.dst())
			date.setHours(date.getHours() + 1);
		dateString = date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) + " " +
			date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: 'short'});
		$("#body").append('<tr id=row-' + i + '></tr>');
		//date date in the table
		$("#row-" + i).append('<td>' + dateString + '</td>');
		//away at home data in table
		$("#row-" + i).append('<td>' + teamLogo(away) + '</td><td>' + '<input name="game' + i + '" type="radio" id='+ away +' />' +
				'<label class="black-text" for='+ away +'>'+ teamName(away) +'</label></td>'+
				'<td>' + teamLogo(home) + '</td><td>' + '<input name="game' + i + '" type="radio" id='+ home +' />' +
				'<label class="black-text" for='+ home +'>'+ teamName(home) +'</label></td>');
		//assigned points data in table
		$("#row-" + i).append('<td><select id=dropdown-' + i + '><option value="" selected></option></select></td>');
		for(var j=1; j<=g.length; j++)
		{
			$("#dropdown-" + i).append('<option value=' + j + '>' + j + '</option>');
		}
		// update select lists
		$("select").material_select();
	}
	
	//remove loader animation
	$(".loader").remove();
};

function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};