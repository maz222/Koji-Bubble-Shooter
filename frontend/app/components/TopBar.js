class TopBar {
    constructor(origin,width,height,maxTurns,maxShots,scoreIncrement=1) {
        this.origin = origin;
        this.width = width;
        this.height = height;

        this.score = 0;
        this.maxTurns = maxTurns;
        this.turns = maxTurns;
        this.maxShots = maxShots;
        this.shots = maxShots;
        this.scoreToAdd = 0;
        this.scoreIncrement = scoreIncrement;
    }
    forceScore() {
        this.score += this.scoreToAdd;
        this.scoreToAdd = 0;
    }
    update() {
        if(this.scoreToAdd > 0) {
            this.score += this.scoreIncrement;
            this.scoreToAdd -= this.scoreIncrement;
        }
    }
    render() {
        var mobileScale = 1;
        if(width<height) {
            mobileScale = .75;
        }
        textSize(36*mobileScale);
        var tempHeight = textAscent("1234567890 Shots");
        var padding = 15;
        fill(20,20,20);
        rect(this.origin[0],this.origin[1]+this.height/2-(tempHeight+padding*2)/2,this.width,tempHeight+padding*2,10);
        //set font stuff
        textAlign(CENTER,CENTER);
        strokeWeight(0);
        //render score
        fill(255,255,255);
        text(this.score,this.origin[0],this.origin[1],this.width/2,this.height+padding/2);
        //render shots
        var t = this.shots == 1 ? " shot" : " shots";
        text(this.shots+t,this.origin[0]+this.width/2,this.origin[1],this.width/2,this.height+padding/2);
        textSize(36*mobileScale);
    }
    renderScoreOnly() {
        textSize(48);
        var tempHeight = textAscent("1234567890");
        var padding = 15;
        fill(20,20,20);
        rect(this.origin[0],this.origin[1]+this.height/2-(tempHeight+padding*2)/2,this.width,tempHeight+padding*2,10);
        //set font stuff
        textAlign(CENTER,CENTER);
        strokeWeight(0);
        //render score
        fill(255,255,255);
        textSize(48);
        text(this.score,this.origin[0],this.origin[1],this.width,this.height+padding/2);  
    }
}