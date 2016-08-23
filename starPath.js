function starPathBg( canvas, options ) {
	
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	var ctx = canvas.getContext("2d");

	var ctrl = new Controller();


	// Populate Node Array
	for (var i = 0; i < options.maxNodes ; i++) {
		
		ctrl.nodeArray.push( new Node() );

	}

	var timeout = setTimeout( step(), 1000 / options.frameRate );


	function step(){

		ctrl.step();

		clearTimeout( timeout );
		setTimeout( step, 1000 / options.frameRate );
	}





	function Controller(){

		this.nodeArray = [];


		this.timeToPulse = 1000 / options.pulseRate + ( Math.random() - 0.5 ) * options.pulseRange ;
		this.pulsePath = [];
		this.pulseNode = null;
		this.previousPulseNode = null;
		this.pulseCounter = 0;





		this.step = function(){



			if( this.timeToPulse < 0 && this.pulsePath.length == 0 && this.pulseNode == null ){

				this.startPulse();
				this.timeToPulse = 1000 / options.pulseRate + ( Math.random() - 0.5 ) * options.pulseRange ;

			} else {

				this.timeToPulse -= 1000 / options.frameRate;
			}

			if( this.pulsePath.length == 0 && this.pulseNode !== null ){

				this.endPulse();
				this.pulseNode = null;

			} else if( this.pulsePath.length > 0 && this.pulseCounter%2 == 0 ){

				var nextNode = this.pulsePath.shift();

				this.drawPulse( nextNode );

				this.previousPulseNode = this.pulseNode;
				this.pulseNode = nextNode;

				this.pulseCounter++;

			} else if( this.pulsePath.length > 0 && this.pulseCounter%2 == 1 ){

				this.pulseCounter++;
			}



			for (var i = 0; i < this.nodeArray.length; i++) {
				
				this.nodeArray[i].step();
			}
		}


		this.startPulse = function( startNode, endNode ){

			this.startNode = (startNode !== undefined) ? startNode : Math.floor( Math.random() * this.nodeArray.length );
			this.endNode = (endNode !== undefined) ? endNode : Math.floor( Math.random() * this.nodeArray.length );
			this.pulseNode = this.startNode;
			this.previousPulseNode = this.startNode;

			this.nodeArray[this.startNode].color = "Yellow";
			this.nodeArray[this.startNode].size = 10;

			this.nodeArray[this.endNode].color = "Lime";
			this.nodeArray[this.endNode].size = 10;

			this.pulsePath = this.djikstraPath( this.djikstraGrid( this.djikstraGroup() ) ) ;
		}

		this.drawPulse = function( nextNode ){


			ctx.clearRect( 0, 0, canvas.width, canvas.height );

			ctx.strokeStyle="white";
			ctx.lineWidth=2;
			ctx.beginPath();
			ctx.moveTo( this.nodeArray[this.pulseNode].posX, this.nodeArray[this.pulseNode].posY );
			ctx.lineTo( this.nodeArray[nextNode].posX, this.nodeArray[nextNode].posY );
			ctx.stroke();

		}

		this.endPulse = function(){

			this.nodeArray[this.startNode].color = "white";
			this.nodeArray[this.startNode].size = 2;
			this.nodeArray[this.endNode].color = "white";
			this.nodeArray[this.endNode].size = 2;

			ctx.clearRect( 0, 0, canvas.width, canvas.height );

		}


		this.djikstraGroup = function(){

			var allGroupsArray = [];
			var groupArray = [];
			var distanceArray = [];

			for (var i = 0; i < this.nodeArray.length; i++) {
				
				distanceArray = [];
				groupArray = [];
				for (var j = 0; j < this.nodeArray.length; j++) {
				
					distanceArray.push({'node': j, 'distance': this.nodeArray[i].distanceFrom( this.nodeArray[j] ) });
				}
				distanceArray.sort( function(a, b) { return a.distance - b.distance; });

				for (var k = 0; k < options.groupSize; k++) {
					groupArray.push( distanceArray[k] );
				}

				allGroupsArray.push( { 'node':i, 'group':groupArray } );
			}

			return allGroupsArray ;
		}


		this.djikstraGrid = function( allGroupsArray ){

			var unvisited = [];
			var visited = [];
			var weight = [];
			var previous = [];

			var c=0;
			var u, uIndex;
			var alt = 0;

			if( this.startNode == this.endNode ){

				return previous;
			}

			for (var i = 0; i < this.nodeArray.length; i++) {

				unvisited.push( i );
				previous[i] = null;

				if( i !== this.startNode ){

					weight[i] = 1000000;

				} else {

					weight[i] = 0;
				}
			}

			var targetFound = false;
			while( unvisited.length > 0 && !targetFound && c < options.maxNodes ){


				uIndex = this.minWeight( unvisited, weight );
				u = unvisited[uIndex];

				unvisited.splice(uIndex, 1);


				for (var i = 0; i < allGroupsArray[u].group.length; i++) {

					

					if( allGroupsArray[u].group[i].node == this.endNode ){

						previous[this.endNode] = u;
						targetFound = true;
					
					} else {



						alt = weight[u] + allGroupsArray[u].group[i].distance;

						if( alt < weight[allGroupsArray[u].group[i].node] ){


							weight[allGroupsArray[u].group[i].node] = alt;
							previous[allGroupsArray[u].group[i].node] = u;

						}

					}
				}

				c++;
			}

			return previous;
		};

		this.djikstraPath = function( previous ){


			var c = 0;
			var S = [];
			u = this.endNode;

			while ( previous.length > 0 && previous[u] !== null && c < options.maxNodes ){

				S.unshift(u);
				u = previous[u];

				c++;
			}

			S.unshift(u);

			if( u == this.startNode ){

				return S;

			} else {

				return [];
			}

			
		}


		this.minWeight = function( Q, weightArray ){

			var min = 0;
			var minValue = weightArray[0];


			for (var i = 1; i < Q.length; i++) {
				
				if( weightArray[Q[i]] < minValue ){

					min = i;
					minValue = weightArray[Q[i]];
				}
			}
			return min;

		}
	}




	function Node( posX, posY, speedX, speedY, size, color ){

		this.posX = (posX !== undefined) ? posX : Math.random() * canvas.width;
		this.posY = (posY !== undefined) ? posY : Math.random() * canvas.height;
		this.speedX = (speedX !== undefined) ? speedX : ( Math.random() * 2 - 1 ) * options.speed;
		this.speedY = (speedY !== undefined) ? speedY : ( Math.random() * 2 - 1 ) * options.speed;
		this.size = (size !== undefined) ? size : Math.round( ( Math.random() * 3 ) );
		this.color = (color !== undefined) ? color : "white";



		this.step = function(){

			this.undraw();
			this.move();
			this.draw();
		}

		this.move = function(){

			this.posX = this.posX + this.speedX;
			this.posY = this.posY + this.speedY;

			if( this.posX < 0){

				this.posX = canvas.width;

			} else if( this.posY < 0 ){

				this.posY = canvas.height;

			} else if ( this.posX > canvas.width ){

				this.posX = 0;

			} else if( this.posY > canvas.width ){

				this.posY = 0;
			}
		}

		this.undraw = function(){

			ctx.clearRect( this.posX - 5, this.posY - 5, 11, 11 );
		}

		this.draw = function(){


			var grd=ctx.createRadialGradient( this.posX, this.posY, 1, this.posX, this.posY, this.size );
			grd.addColorStop(0,this.color);
			grd.addColorStop(1,"transparent");

			ctx.fillStyle = grd;
			ctx.fillRect( this.posX - ( this.size ), this.posY - ( this.size ), this.size * 2 , this.size * 2 );
		}
		
		this.distanceFrom = function( otherNode ){

			return Math.sqrt( Math.pow( this.posX - otherNode.posX, 2) + Math.pow( this.posY - otherNode.posY, 2 ) );
		}
	}





}