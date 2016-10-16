var fs = require("fs");


module.exports = 
{
	submit: function(params, response)
	{
		console.log("all keys of params:");
		for(i in params)
			console.log(i);
		fs.writeFile("../drawdata/"+Date.now()+".txt", formatCoordinates(params.coordinates), function(err){
			if(err)
				response.send('{"status": "failed", "error": "'+JSON.stringify(err)+'"}');
			else			
				response.send('{"status": "ok"}');
		});
	}
}	

function formatCoordinates(c)
{
	var string = "";	
	for(var i = 0; i < c.length; i++)
		string += c[i][0] + "," + c[i][1] + (i < c.length-1 ? "\n" : "");
	return string;
}
