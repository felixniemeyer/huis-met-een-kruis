var path = {
	drawing: false,
	recentNode: null,
	remainingConnections: [],
	coordinates: [],
	addAndCheck: function(nodePair){
		console.log(nodePair);
		var index = this.remainingConnections.indexOf(nodePair[0]+nodePair[1]);
		if(index < 0) index = this.remainingConnections.indexOf(nodePair[1]+nodePair[0]);
		if(index < 0)
			return "fault";
		else 
		{
			this.remainingConnections.splice(index,1);
			if(this.remainingConnections.length == 0)
				return "finished";
			else
				return "good";
		}
	}
};

var canvasSize, canvasLeft, canvasTop;

window.onresize = resizeSvg;

window.onload = function(){
	resizeSvg();
	addEventListeners();
};

function resizeSvg(){
	canvasSize = Math.min(window.innerHeight, window.innerWidth)*0.8;
	canvasLeft = (window.innerWidth - canvasSize) / 2;
	canvasTop = (window.innerHeight - canvasSize) / 2;
	var svg = document.getElementById("userDraw");
	svg.style["width"] = svg.style["height"] = canvasSize + "px";
	svg.style["left"] = canvasLeft + "px";
	svg.style["top"] = canvasTop + "px";
}

function addEventListeners()
{
	getElementsByClass("startpoint").addEventListener("mousedown", beginPath);
	getElementsByClass("node").addEventListener("mouseenter", touchPoint);

	canvas = document.getElementById("userDraw")
	canvas.addEventListener("mousemove", updateMousePosition);
	document.addEventListener("mouseup", function(){
		if(path.drawing) alert("user aborted, path not finished");
		clearAttemp();
		path.drawing = false;
	});
}

function beginPath(e){
	path.drawing = true;
	path.coordinates = [];
	path.recentNode = e.target.id;
	path.remainingConnections = [
		"bl_nodeml_node", "bl_nodemr_node", "bl_nodebr_node",
		"br_nodeml_node", "br_nodemr_node",
		"ml_nodetop_node", "ml_nodemr_node", 
		"mr_nodetop_node"];
	markNode(e.target);
	addCoordinates(getModelCoordinates(e.clientX, e.clientY));
	e.preventDefault();
}

function touchPoint(e){
	if(path.drawing)
	{	
		var currentNode = e.target.id;
		if(currentNode != path.recentNode)
		{
			addCoordinates(getModelCoordinates(e.clientX, e.clientY));
			console.log("just moved onto a point");
			console.log(currentNode);
			var pathStatus = path.addAndCheck([path.recentNode, currentNode]);
			switch(pathStatus)
			{
			case "fault":
				path.drawing = false;
				alert("failed");
				clearAttemp();
				break;		
			case "finished":
				path.drawing = false;
				alert("you succeeded");
				sendCoordinates();
				clearAttemp();
			case "good":
				markNode(e.target);
				path.recentNode = currentNode;
			}				
		}
	}
}

function markNode(node){
	node.style["fill"] = "#99ff55";
}

function clearAttemp()
{
	getElementsByClass("node").forEach(function(element){element.style["fill"] = "";});
	document.getElementById("stroke").setAttribute("d","");
}

function updateMousePosition(e){
	if(path.drawing)
	{
		var mouse = getModelCoordinates(e.clientX, e.clientY);
		if(farerApartThan(path.coordinates[path.coordinates.length-1], mouse, 0.05))
			addCoordinates(mouse);
	}
}

function getModelCoordinates(x,y)
{
	x = (x - canvasLeft) / canvasSize;
	y = (y - canvasTop) / canvasSize;
	return [x,y];
}

function farerApartThan(v1, v2, d)
{
	return Math.pow(v1[0]-v2[0],2) + Math.pow(v1[1]-v2[1],2) > d*d;
}

function addCoordinates(c)
{
	console.log
	path.coordinates.push(c);
	var stroke = document.getElementById("stroke");
	var old = stroke.getAttribute("d");
	stroke.setAttribute("d", old + (old != "" ? " L" : "M") + c[0] +" "+c[1]);
}

function sendCoordinates()
{
	var req = new XMLHttpRequest();
	req.open("POST", "api", true);
	req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	req.send('{"action": "submit", "params": {"coordinates": ' + JSON.stringify(path.coordinates) + '}}');
}

function DomCollection(argument)
{
	if(argument)
	{
		if(argument instanceof HTMLCollection)
		{
			this.domObjects = [].slice.call(argument, 0);
		}
		else if(argument instanceof DomCollection)
		{
			this.domObjects = argument.domObjects;
		}
	}
	else
	{
		this.domObjects = [];
	}
}
DomCollection.prototype.addEventListener = function(type, f){
	for(var i = 0; i < this.domObjects.length; i++)
		this.domObjects[i].addEventListener(type, f);
}
DomCollection.prototype.forEach = function(f){
	for(var i = 0; i < this.domObjects.length; i++)
		f(this.domObjects[i]);
}

function getElementsByClass(className, optional_element)
{
	var element = optional_element || document;
	return(new DomCollection(element.getElementsByClassName(className)));
}

