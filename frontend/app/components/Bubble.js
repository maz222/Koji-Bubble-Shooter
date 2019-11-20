class BubbleBaseState {
    constructor(bubble) {
        this.bubble = bubble;
    }
    update() {
        return this;
    }
    render(offset, scale=1) {
        var img = gameData.data.bubbleImages[this.bubble.colors[0]];
        var imgX = this.bubble.position.x+offset[0]-this.bubble.radius*scale;
        var imgY = this.bubble.position.y+offset[1]-this.bubble.radius*scale;
        image(img,imgX,imgY,this.bubble.radius*2*scale,this.bubble.radius*2*scale);
    }
}

class MoveState extends BubbleBaseState {
    constructor(bubble, velocityVector, speed) {
        super(bubble);
        this.velocity = velocityVector;
        this.speed = speed;
    }
    //bounce bubble off of a wall
    bounce(wallVector) {
        //play bounce sound
        gameData.playSound(1);
        wallVector = wallVector.normalize();
        var temp = createVector(this.velocity.x,this.velocity.y);
        var dotP = temp.dot(wallVector);
        wallVector.mult(dotP);
        wallVector.mult(2);
        this.velocity.sub(wallVector);
    }
    update() {
        var temp = createVector(this.velocity.x,this.velocity.y);
        temp.mult(this.speed);
        this.bubble.position.add(temp);
        return this;
    }
    render(offset, scale=1) {
        super.render(offset, scale);
    }
}

class MatchState extends BubbleBaseState {
    constructor(bubble, pointValue, blinkCount=2, blinkDuration=5, textDuration=20) {
        super(bubble);
        this.blinkCount = blinkCount * 2;
        this.pointValue = pointValue;
        this.blinkDuration = blinkDuration;
        this.textDuration = textDuration;
        this.timer = 0;
        var b1 = color(255,255,255,255);
        var b2 = color(20,20,20);
        var textStart = {color:b1,size:this.bubble.radius*1.5};
        var textEnd = {color:b1, size:0};
        var textVelocity = createVector(0,-1);
        this.text = new FadingText(this.pointValue,textStart,textEnd,this.bubble.position,textVelocity,Math.floor(textDuration*60/Math.min(60,frameRate())));
    }
    update() {
        this.timer += 1;
        if(this.blinkCount > 0) {
            if(this.timer > this.blinkDuration) {
                this.blinkCount -= 1;
                this.timer = 0;
            }
        }
        else{
            if(this.timer > this.textDuration) {
                return null;
            }
            else {
                this.text.update();
            }
        }
        return this;
    }
    render(offset, scale=1) {
        if(this.blinkCount > 0) {
            if(this.blinkCount%2==0) {
                super.render(offset, scale);
            }
        }
        else {
            this.text.render(offset);
        }
    }
}

class Bubble {
    constructor(colors, radius, position) {
        this.colors = colors;
        this.position = position;
        this.radius = radius;
        this.state = new BubbleBaseState(this);
    }
    setBaseState() {
        this.state = new BubbleBaseState(this);
    }
    setMatchState(pointValue=10) {
        this.state = new MatchState(this,pointValue);
    }
    setMoveState(velocityVector,speed) {
        this.state = new MoveState(this,velocityVector,speed);
    }
    bounce(wallVector) {
        this.state.bounce(wallVector);
    }
    update() {
        this.state = this.state.update();
        if(this.state == null) {
            return null;
        }
        return this;
    }
    render(offset=[0,0], scale=1) {
        this.state.render(offset, scale);
    }
}