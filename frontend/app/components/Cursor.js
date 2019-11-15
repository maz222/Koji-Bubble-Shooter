class Cursor {
	//screenBottom - center of the bottom of the screen
	//bubble - array of bubbles to be shot
	constructor(bubbleFactory,screenBottom,width,bubbleRadius) {
		this.angle = 90;
		this.bubbleFactory = bubbleFactory;
		this.bottom = screenBottom;
		this.bubble = null;
		this.width = width;
		this.bubbleRadius = bubbleRadius;
		//this.addBubble();
	}
	radToDeg(angle) {
		return angle * (180 / Math.PI);
	}
	degToRad(angle) {
		return angle * (Math.PI / 180);
	}
	adjustAngle(amount) {
		var lowerBound = 8;
		var upperBound = 172;
		this.angle = this.angle + amount;
		this.angle = Math.min(Math.max(lowerBound,this.angle),upperBound);
	}
	update(mousePosition) {
		const bubbleSize = this.bubbleRadius;
		var baseCorner = [this.bottom[0] - bubbleSize, this.bottom[1] - bubbleSize];
		var mouseAngle = this.radToDeg(Math.atan2((this.bottom[1]+bubbleSize) - mousePosition[1], mousePosition[0] - (this.bottom[0]+bubbleSize)));
		if(mouseAngle < 0) {
			mouseAngle = 180 + (180 + mouseAngle);
		}
		var lowerBound = 8;
		var upperBound = 172;
		if(mouseAngle > 90 && mouseAngle < 270) {
			if(mouseAngle > upperBound) {
				mouseAngle = upperBound;
			}
		}
		else {
			if(mouseAngle < lowerBound || mouseAngle >= 270) {
				mouseAngle = lowerBound;
			}
		}
		this.angle = mouseAngle;
	}
	shootBubble() {
		var t = this.bubble;
		this.bubble = null;
		return t;
	}
	addBubble(possibleColors=null) {
		var bubble = this.bubbleFactory.getBubble(createVector(this.bottom[0],this.bottom[1]),possibleColors);
	    this.bubble = bubble;
	}
	render() {
		//draw cursor
		const bubbleSize = this.bubbleRadius;
		var cursorPosX = this.bottom[0] + bubbleSize*2 * Math.cos(this.degToRad(this.angle));
		var cursorPosY = this.bottom[1] - bubbleSize*2 * Math.sin(this.degToRad(this.angle));
		const cursorColor = [255,255,255];
		fill(cursorColor);
		noStroke();
		circle(cursorPosX, cursorPosY, this.bubbleRadius/2);
		//draw active bubble
		if(this.bubble != null) {
			this.bubble.render();
		}
		//strokeWeight(1);
		//stroke(0);
		//line(this.bottom[0]-this.width/2*.95,this.bottom[1]-bubbleSize*3,this.bottom[0]+this.width/2*.95,this.bottom[1]-bubbleSize*3);
	}
}