$('#game').on('switchChange.bootstrapSwitch', function ()
{
});
$('#reset').click(function ()
{
	for(var i=0; i<16; i++)
		$('#' + i).bootstrapSwitch('indeterminate', true);
});


$('#loadGames').click(function ()
{
	var season = $('#season').val();
	var week = $('#week').val();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() 
	{
		if(xmlhttp.readyState == XMLHttpRequest.DONE)
		{
			xmlImport(xmlhttp);					
		}
	}
	xmlhttp.open("GET", 'http://www.nfl.com/ajax/scorestrip?season='+season+'&seasonType=REG&week='+week, true);
	xmlhttp.send(null);
});

function xmlImport(xml)
{
	var xmlDoc = xml.responseXML;
	var g = xmlDoc.getElementsByTagName('g');
	var home, away;
	$('#list').html('');	//reset list
	for(var i=0; i<g.length; i++)
	{
		$('#list').append('<li><input id='+i+' type="checkbox"></li>');
		$('#' + i).bootstrapSwitch('indeterminate', true);
		$('#' + i).bootstrapSwitch('labelWidth', 0);
		$('#' + i).bootstrapSwitch('handleWidth', 100);
		$('#' + i).bootstrapSwitch('onText', g[i].getAttribute('h'));
		$('#' + i).bootstrapSwitch('offText', g[i].getAttribute('v'));		
	}
}