var columns = document.querySelectorAll("p");

shapes = [];
var filled = false;
var shapenumber = 0;
for(var i=0;i<columns.length;i++)
{
	columns[i].addEventListener("click", main);
}

function main(){
	var counter = this.id;
	var columns = document.querySelectorAll("p");
	for(var i=0;i<columns.length;i++)
	{
        var id = document.getElementById(columns[i].id);
		id.className ="tabs";
	}
    
	var id = document.getElementById(counter);
	id.className = "selected";
	
	var topbar2 = document.getElementById('topbar2');
	topbar2.style.display = 'none';
    
	var topbar = document.getElementById('topbar');
	topbar.style.height = "80px";
    
	var fill = document.getElementById('fill');
    var deleteShape = document.getElementById('delete');
    
    var polygonSides = document.getElementById('polygonSides');
    polygon_sides = polygonSides.value
    polygonSides.style.display = "none";
	var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
		
	imagery = new Image();
	image = new Image();
	pos = {};
	var recta;
	var fillID = undefined;
	saveImage();

	context.lineWidth = lineWidth.value;
	context.font = '24px Helvetica';
	context.strokeStyle = strokeStyle.value;
	context.fillStyle = fillStyle.value;

	editing = false;
	dragging = false;

	extra = [
	{ 
		'brush': pencil, 'image': image, 'lines':lines, 'circle': circle, 'polygon':polygon, 'edit':edit, 'eraser':eraser, 'clear':clear
	}
	];

	//drawGrid(context, 'grey','1',  10, 10);
    if(counter == 'polygon'){
        polygonSides.style.display = "block";
    }
	if(counter == 'clear'){
		context.clearRect(0, 0, canvas.width, canvas.height);
		shapenumber = 0;
		shapes = []; 
		//drawGrid(context, 'grey','1' , 10, 10); 
		saveImage();
	}

	if(counter == 'edit'){
		editing = true;
	}

	function drawGrid(context, color,linewidth,  stepx, stepy)
	{   
		context.strokeStyle = color;   
		context.lineWidth = linewidth;
		for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) 
		{      
			context.beginPath();      
			context.moveTo(i, 0);      
			context.lineTo(i, context.canvas.height);      
			context.stroke(); 
		}
		for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) 
		{      
			context.beginPath();      
			context.moveTo(0, i);      
			context.lineTo(context.canvas.width, i);     
			context.stroke(); 
		} 
	}

	function windowToCanvas(x,y){
		var bbox = canvas.getBoundingClientRect();
		return { x:x - bbox.left*(canvas.width/bbox.width),
				 y:y - bbox.top*(canvas.height/bbox.height)
				};
	}

	function saveImage(){
		imagery = context.getImageData(0,0,canvas.width,canvas.height);
	}

	function loadImage(){
		context.putImageData(imagery,0,0);
	}

	canvas.onmousedown = function(e){
		saveImage();
		
		var loc = windowToCanvas(e.clientX, e.clientY);
		pos = loc;
		e.preventDefault();		
		if(editing){
			for(var i=0;i<shapes.length;i++){
				shapes[i].creation(shapes[i].context, shapes[i].sides, shapes[i].strokeStyle, shapes[i].fillStyle, shapes[i].lineWidth,shapes[i].loc, shapes[i].pos, shapes[i].counter);
				if(shapes[i].context.isPointInPath(loc.x,loc.y))
				{
					topbar.style.height = "40px";
					topbar2.style.display = 'block';
					dragging = shapes[i];
					offsetposX = loc.x - shapes[i].pos.x;
					offsetposY = loc.y - shapes[i].pos.y;
					offsetX = loc.x - shapes[i].loc.x;
					offsetY = loc.y - shapes[i].loc.y;
					fillID=i;
				}
			}
		}
		else{
			dragging = true;
		}
		
	};

	canvas.onmousemove = function(e){
		e.preventDefault();
		var loc = windowToCanvas(e.clientX, e.clientY);
		
		if(dragging && editing){
			dragging.pos.x = loc.x - offsetposX;     
			dragging.pos.y = loc.y - offsetposY; 
			dragging.loc.x = loc.x - offsetX;
			dragging.loc.y = loc.y - offsetY;
			context.clearRect(0, 0, canvas.width, canvas.height); 
			shapes.forEach( function(index){
				index.creation(index.context, index.sides, index.strokeStyle, index.fillStyle,index.lineWidth,index.loc, index.pos, index.counter);
				if(index.filled){
					index.context.fillStyle = index.fillStyle;
					index.context.fill();
				}
			});
		}
		else{
			if(dragging){
				loadImage();
				if(counter == 'brush'){
					pencil(context, 0 , context.strokeStyle, context.lineWidth,loc, counter);
				}
				else if(counter == 'circle'){
					var object = new construct(context, 0 , context.strokeStyle,context.fillStyle, context.lineWidth,loc, pos, counter);
					object.creation();
					shapes.push(object);
				}
				else if(counter == 'lines'){
					var object = new construct(context, 0 , context.strokeStyle, context.fillStyle, context.lineWidth,loc, pos, counter);
					object.creation();
					shapes.push(object);
				}
				else if(counter == 'eraser'){
					eraser(context, 'white','10',loc, pos, counter);
				}
				else if(counter == 'polygon'){
					var object = new construct(context, polygon_sides , context.strokeStyle, context.fillStyle, context.lineWidth,loc, pos, counter);
					object.creation();
					shapes.push(object);
				}
				else{}
			}
		}
	}
	canvas.onmouseup = function(e){
		e.preventDefault();
		context.beginPath();
		saveImage();
		if(dragging == true){
			shapes[shapenumber] = shapes[shapes.length - 1];
			shapenumber++;
			shapes.length=shapenumber;
		}
		dragging = false;
	};

	strokeStyle.onchange = function(e){
		context.strokeStyle = strokeStyle.value;
	};

	lineWidth.onchange = function(e){
		context.lineWidth = lineWidth.value;
    };
    
    polygonSides.onchange = function(e){
		polygon_sides = polygonSides.value;
	};

	fillStyle.onchange = function(e){
		context.fillStyle = fillStyle.value;
	};

	fill.onclick = function(e){
		shapes[fillID].creation(shapes[fillID].context, shapes[fillID].sides, shapes[fillID].strokeStyle, shapes[fillID].fillStyle, shapes[fillID].lineWidth,shapes[fillID].loc, shapes[fillID].pos, shapes[fillID].counter);
		shapes[fillID].fillStyle = fillStyle.value;
		shapes[fillID].context.fill();
		shapes[fillID].filled = true;
	};

	deleteShape.onclick = function(e){
		context.clearRect(0, 0, canvas.width, canvas.height);
		var i=0;
		
		while(i<shapes.length){
			if(i==fillID){
				if(i==shapes.length - 1){
					shapes.length--;
					shapenumber--;
					fillID = undefined;
					break;
				}
				else{
					var j=fillID;
					while(j<shapes.length -1){
						shapes[j] = shapes[j+1];
						j++;
					}
					shapes.length--;
					shapenumber--;
					fillID = undefined;
					break;
				}
			}
			i++;
		}
		
		for(var i=0;i<shapes.length;i++){
			shapes[i].creation(shapes[i].context, shapes[i].sides, shapes[i].strokeStyle, shapes[i].fillStyle, shapes[i].lineWidth,shapes[i].loc, shapes[i].pos, shapes[i].counter);
			if(shapes[i].filled){
				shapes[i].context.fillStyle = shapes[i].fillStyle;
				shapes[i].context.fill();
			}
		}
	};

	function construct(context, sides, strokeStyle, fillStyle, lineWidth,loc, pos,counter){
		this.context= context;
		this.sides = sides;
		this.strokeStyle = strokeStyle;
		this.lineWidth = lineWidth;
		this.loc= loc;
		this.pos= pos;
		this.counter= counter;
		this.fillStyle = fillStyle;
		this.filled = false;
		this.creation = extra[0][counter];
	}

	function lines(){
		context.lineWidth = this.lineWidth;
		context.strokeStyle = this.strokeStyle;
		context.beginPath();
		context.moveTo(this.pos.x,this.pos.y);
		context.lineTo(this.loc.x, this.loc.y);
		context.stroke();
	}

	function circle(){

		context.lineWidth = this.lineWidth;
		context.strokeStyle = this.strokeStyle;
		var radius = Math.sqrt((this.loc.x-this.pos.x)*(this.loc.x-this.pos.x) + (this.loc.y-this.pos.y)*(this.loc.y-this.pos.y));
		context.beginPath();
		context.arc(this.pos.x, this.pos.y, radius, 0, 2*Math.PI,false);
		context.closePath();
		context.stroke();
	}

	function polygon(){
		context.lineWidth = this.lineWidth;
		context.strokeStyle = this.strokeStyle;
		var radius = Math.sqrt((this.loc.x-this.pos.x)*(this.loc.x-this.pos.x) + (this.loc.y-this.pos.y)*(this.loc.y-this.pos.y));
		var minAngle = 2*Math.PI/this.sides;

		context.beginPath();
		context.moveTo(this.pos.x + radius*Math.cos(minAngle), this.pos.y + radius*Math.sin(minAngle));
		for(var i=0;i<this.sides;i++){
			angle = (i+1)*minAngle;
			context.lineTo(this.pos.x + radius*Math.cos(angle), this.pos.y + radius*Math.sin(angle));
		}
		context.closePath();
		context.stroke();
	}

	function eraser(context, strokeStyle, eraserwidth, loc){
		context.save();
		context.fillStyle = strokeStyle;
		context.beginPath();
		context.clearRect(loc.x - eraserwidth/2, loc.y - eraserwidth/2, eraserwidth, eraserwidth);
		context.fill();
		context.restore();
		saveImage();
	}

	function pencil(context, sides, strokeStyle,lineWidth,loc,counter){
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;
		context.moveTo(pos.x,pos.y);
		context.lineTo(loc.x,loc.y);
		context.stroke();
		pos = loc;
	}


	function filtering(context){

		imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height); 
		//alert();
		data = imageData.data;

		for(var i=0;i<data.length-4;i+=4){
			average =(data[i] + data[i+1] + data[i+2])/3;     
			data[i] = average;      
			data[i+1] = average;      
			data[i+2] = average; 
		}
		context.putImageData(imageData, 0, 0);
	}
}