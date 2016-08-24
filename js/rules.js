$(document).ready(function()
{
	$("#header").load("../header.html", function()
	{
		$("#rules-link").addClass("deep-orange lighten-3");
		$("#title").text("League Rules & Information");
		
		// initialize tabs
		$('ul.tabs').tabs();		
	});
});

