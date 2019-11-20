var wallBounce = false;

class Button {
    constructor(defaultInfo,hoverInfo) {
        this.defaultInfo = defaultInfo;
        this.hoverInfo = hoverInfo;
    }
    checkHover() {
        if(mouseX >= this.defaultInfo.position[0] && mouseX <= this.defaultInfo.position[0]+this.defaultInfo.buttonSize[0]) {
            return(mouseY >= this.defaultInfo.position[1] && mouseY <= this.defaultInfo.position[1]+this.defaultInfo.buttonSize[1]);
        }
        return false;
    }
    render() {
        var info = this.checkHover() ? this.hoverInfo : this.defaultInfo;
        fill(info.buttonColor);
        rect(info.position[0],info.position[1],info.buttonSize[0],info.buttonSize[1],10);
        fill(info.textColor);
        textSize(info.textSize);
        text(info.text,info.position[0],info.position[1],info.buttonSize[0],info.buttonSize[1]);
    }
}

class BackButton extends Button {
    render() {
        var info = this.checkHover() ? this.hoverInfo : this.defaultInfo;
        fill(info.buttonColor);
        rect(info.position[0],info.position[1],info.buttonSize[0],info.buttonSize[1],10);
        var padding = 20;
        if(gameData.data.backIcon != null) {
            image(gameData.data.backIcon, info.position[0]+padding/2,info.position[1]+padding/2,info.buttonSize[0]-padding,info.buttonSize[1]-padding);
        }
    }
}

class SoundButton extends Button {
    render() {
        var info = this.checkHover() ? this.hoverInfo : this.defaultInfo;
        fill(info.buttonColor);
        rect(info.position[0],info.position[1],info.buttonSize[0],info.buttonSize[1],10);
        var padding = 20;
        if(gameData.data.isMuted) {
            if(gameData.data.muteIcon != null) {
                image(gameData.data.muteIcon, info.position[0]+padding/2,info.position[1]+padding/2,info.buttonSize[0]-padding,info.buttonSize[1]-padding);
            }
        }
        else {
            if(gameData.data.soundIcon != null) {
                image(gameData.data.soundIcon,info.position[0]+padding/2,info.position[1]+padding/2,info.buttonSize[0]-padding,info.buttonSize[1]-padding);
            }
        }
    }
}

class BaseGameState {
    constructor(parent,topBar,grid,cursor,quitButton,soundButton) {
        this.parent = parent;
        this.topBar = topBar;
        this.grid = grid;
        this.cursor = cursor;
        this.quitButton = quitButton;
        this.soundButton = soundButton;
        this.clicked = false;
    }
    update() {
        this.grid.update();
        this.topBar.update();
        if(keyIsPressed) {
            let bonus = frameRate() < 40 ? 4 : 1;
            if(keyCode === LEFT_ARROW) {
                this.cursor.adjustAngle(100 * 1/frameRate());
            }
            if(keyCode === RIGHT_ARROW) {
                this.cursor.adjustAngle(-100 * 1/frameRate());
            }
        }
        if(this.clicked) {
            let bonus = frameRate() < 40 ? 1.25 : 1;
            if(mouseY > height*.5) {
                if(mouseX > width/2) {
                    this.cursor.adjustAngle(-100 * 1/frameRate());
                }
                else {
                    this.cursor.adjustAngle(100 * 1/frameRate());
                }
            }
        }
        return this;
    }
    render() {
        background(Koji.config.gameGraphics.backgroundColor);
        if(gameData.data.gameBG != null) {
            image(gameData.data.gameBG,0,0,width,height);
        }
        this.grid.render();
        this.topBar.render();
        this.cursor.render();
        this.quitButton.render();
        this.soundButton.render();
        let gridDimensions = [this.grid.bubbleRadius*2*(this.grid.columns+.5),this.grid.bubbleRadius*2*this.grid.rows];
    }
    mousePress() {
        this.clicked = true;
        return false;
    }
    mouseRelease() {
        this.clicked = false;
        if(this.quitButton.checkHover()) {
            window.setAppView('intro');
        }
        if(this.soundButton.checkHover()) {
            gameData.toggleMute();
            return true;
        }
        return false;
    }
}

class ShootGameState extends BaseGameState {
    constructor(parent,topBar,grid,cursor,bubble,quitButton,soundButton=null) {
        super(parent,topBar,grid,cursor,quitButton,soundButton);
        wallBounce = false;
        this.bubble = bubble;
        var cursorAngle = this.cursor.angle;
        var bubbleVector = p5.Vector.fromAngle(radians(cursorAngle));
        bubbleVector.mult(-1);
        bubbleVector.x = bubbleVector.x*-1;
        this.bubble.setMoveState(bubbleVector,bubble.radius*30);
        this.state = this;
        this.topBar.shots -= 1;
        gameData.playSound(0);
    }
    checkWallCollision() {
        var bubblePosition = this.bubble.position;
        var gridOrigin = this.grid.origin;
        var gridWidth = this.grid.columns * this.grid.bubbleRadius*2 + this.grid.bubbleRadius;
        var gridHeight = this.grid.rows * this.grid.bubbleRadius*2;
        //left wall
        if(bubblePosition.x-this.bubble.radius <= gridOrigin[0]) {
            bubblePosition.x = gridOrigin[0] + this.bubble.radius;
            this.bubble.bounce(createVector(1,0));
            gameData.playSound(1);
            wallBounce = true;
        }
        //right wall
        if(bubblePosition.x+this.bubble.radius >= gridOrigin[0] + gridWidth) {
            bubblePosition.x = gridOrigin[0] + gridWidth - this.bubble.radius;
            this.bubble.bounce(createVector(-1,0));
            gameData.playSound(1);
            wallBounce = true;
        }
        //top wall
        if(bubblePosition.y-this.bubble.radius <= gridOrigin[1]) {
            bubblePosition.y = gridOrigin[1] + this.bubble.radius;
            var gridCell = this.grid.getCellFromPixel([bubblePosition.x,bubblePosition.y],true);
            this.grid.grid[gridCell[0]][gridCell[1]] = this.bubble;
            this.bubble.setBaseState();
            this.grid.resetCellPositions();
            this.grid.addBubbleToCount(this.bubble);
            this.bubble = null;
            this.state = new MatchGameState(this.parent,this.topBar,this.grid,this.cursor,gridCell,this.quitButton,this.soundButton);
            wallBounce = true;
            return true;
        }
        //bottom wall
        return false;
    }
    update() {
        super.update();
        this.bubble.update();
        if(!this.checkWallCollision()) {
            if(this.grid.checkCollision([this.bubble.position.x,this.bubble.position.y])) {
                var gridCell = this.grid.getCellFromPixel([this.bubble.position.x,this.bubble.position.y],true);
                let t = this.bubble.state.velocity;
                t.mult(-1);
                console.log(t);
                t.mult(this.bubble.state.speed);
                let p = this.bubble.position;
                while(this.grid.grid[gridCell[0]][gridCell[1]] != null) {
                    console.log(this.bubble.position);
                    this.bubble.position.add(t);   
                    gridCell = this.grid.getCellFromPixel([this.bubble.position.x,this.bubble.position.y],true);                 
                }
                if(gridCell[0] == this.grid.rows-1 && this.grid.grid[gridCell[0]][gridCell[1]] != null) {
                    return new GameOverState(this.parent,this.topBar,this.grid,this.cursor,this.quitButton,this.soundButton);
                }
                this.grid.grid[gridCell[0]][gridCell[1]] = this.bubble;
                this.grid.addBubbleToCount(this.bubble);
                this.bubble.setBaseState();
                this.grid.resetCellPositions();
                this.bubble = null;
                return new MatchGameState(this.parent,this.topBar,this.grid,this.cursor,gridCell,this.quitButton,this.soundButton);
            }
        }
        return this.state;
    }
    render() {
        super.render();
        this.bubble.render();
    }
}

class MatchGameState extends BaseGameState {
    constructor(parent,topBar,grid,cursor,gridCell,quitButton,soundButton=null) {
        super(parent,topBar,grid,cursor,quitButton,soundButton);
        var bubblePointValue = parseInt(Koji.config.gameSettings.bubblePoints);
        bubblePointValue = wallBounce ? bubblePointValue*2 : bubblePointValue;
        this.grid.setMatchState(gridCell);
        if(this.grid.state.matches.length > 0) {
            //play match sound
            gameData.playSound(2);
            this.topBar.turns = this.topBar.maxTurns;
        }
        else {
            this.topBar.turns = this.topBar.turns - 1;
        }
        for(var m=0; m<this.grid.state.matches.length; m++) {
            this.topBar.scoreToAdd += bubblePointValue*(m+1);
        }
        for(var f=0; f<this.grid.state.floaters.length; f++) {
            this.topBar.scoreToAdd += bubblePointValue*(f+1);
        }
        this.topBar.scoreToAdd += this.grid.state.floaters.length * bubblePointValue;
    }
    update() {
        super.update();
        return this.grid.isReady() ? new ReadyGameState(this.parent,this.topBar,this.grid,this.cursor,this.quitButton,this.soundButton) : this;
    }
}

class ReadyGameState extends BaseGameState {
    constructor(parent,topBar,grid,cursor,quitButton,soundButton=null) {
        super(parent,topBar,grid,cursor,quitButton,soundButton);
        this.state = this;
        if(this.grid.isEmpty()) {
        //Add score
            for(var i=0; i<10; i++) {
                this.topBar.scoreToAdd += (i+1) * 10;
            }
            //play add rows sound
            gameData.playSound(3);
            var rowCount = parseInt(Koji.config.gameSettings.startingRows);
            for(var i=0; i<rowCount; i++) {
                this.grid.addRow();
            }
            this.topBar.turns = this.topBar.maxTurns;
        }
        if(this.topBar.turns <= 0) {
            this.topBar.turns = this.topBar.maxTurns;
            var rowCount = parseInt(Koji.config.gameSettings.rowsAdded);
            for(var i=0; i<rowCount; i++) {
                this.grid.addRow();
            }
            //play add rows sound
            gameData.playSound(3);
        }
        this.cursor.addBubble(this.grid.getCurrentColors());
        this.grid.checkOverflow();
    }
    update() {
        super.update();
        if(this.topBar.shots <= 0 && this.state === this) {
            return new GameOverState(this.parent,this.topBar,this.grid,this.cursor,this.quitButton,this.soundButton);
        }
        if(this.grid.overflow || this.topBar.time <= 0 && this.state === this) {
            return new GameOverState(this.parent,this.topBar,this.grid,this.cursor,this.quitButton,this.soundButton);
        }
        if(keyIsPressed && keyCode === UP_ARROW) {
            var bubble = this.cursor.shootBubble(this.grid.getCurrentColors());
            this.state = new ShootGameState(this.parent,this.topBar,this.grid,this.cursor,bubble,this.quitButton,this.soundButton);        
        }
        return this.state;
    }
    mousePress() {
        super.mousePress();
        this.clicked = true;
    }
    mouseRelease() {
        if(super.mouseRelease()) {
            this.clicked = false;
            return;
        }
        this.clicked = true;
        if(this.clicked && mouseY <= height*.5) {
            var bubble = this.cursor.shootBubble(this.grid.getCurrentColors());
            this.state = new ShootGameState(this.parent,this.topBar,this.grid,this.cursor,bubble,this.quitButton,this.soundButton);
        }
        this.clicked = false;
    }
}

class GameOverState extends BaseGameState {
    constructor(parent,topBar,grid,cursor,quitButton,soundButton=null) {
        super(parent,topBar,grid,cursor,quitButton,soundButton);
        this.counter = 0;
        this.bannerHeight = 150;
        this.topBar.forceScore();
        this.clicked = false;

        textSize(28);
        var buttonWidth = this.grid.columns*this.grid.bubbleRadius*2+this.grid.bubbleRadius;
        var buttonHeight = Math.max(textAscent("Play Again"),textAscent("Submit Score")) + 20;

        var buttonY = height/2 + this.bannerHeight/2 + 20;
        var playAgainDefault = {
            text:"Play Again",
            textSize:28,
            textColor:[255,255,255],
            buttonSize:[buttonWidth,buttonHeight],
            position:[this.grid.origin[0],buttonY],
            buttonColor:[49,221,75]
        };
        var playAgainHover = {...playAgainDefault, buttonColor:[24,145,42]};
        this.playAgainButton = new Button(playAgainDefault, playAgainHover);

        var submitDefault = {
            text:"Submit Score",
            textSize:28,
            textColor:[255,255,255],
            buttonSize:[buttonWidth,buttonHeight],
            position:[this.grid.origin[0],buttonY+buttonHeight+20],
            buttonColor:[49,109,221]
        }
        var submitHover = {...submitDefault, buttonColor:[24,66,145]};
        this.submitButton = new Button(submitDefault, submitHover);
    }
    update() {
        this.cursor.update([mouseX,mouseY]);
        this.counter += 10;
        return this;
    }
    render() {
        background(Koji.config.gameGraphics.backgroundColor);
        if(gameData.data.gameBG != null) {
            image(gameData.data.gameBG,0,0,width,height);
        }
        this.quitButton.render();
        this.soundButton.render();
        this.grid.render();
        this.cursor.render();
        fill('rgba(0,0,0,0.5)');
        rect(0,0,width,height);
        this.topBar.renderScoreOnly();
        fill(0,0,0);
        rect(0,height/2 - Math.min(this.counter/2,this.bannerHeight/2),width,Math.min(this.counter,this.bannerHeight));
        if(this.counter >= this.bannerHeight) {
            fill(255,255,255);
            var message = Koji.config.gameSettings.gameOverContent;
            text(message,width/2,height/2);
            this.playAgainButton.render();
            this.submitButton.render();
        }
        cursor();
    }
    mousePress() {
        super.mousePress();
        this.clicked = true;
    }
    mouseRelease() {
        super.mouseRelease();
        this.clicked = true;
        if(this.clicked) {
            if(this.counter < this.bannerHeight) {
                this.counter = this.bannerHeight;
            }
            else {
                if(this.playAgainButton.checkHover()) {
                    this.parent.create();
                }
                if(this.submitButton.checkHover()) {
                    submitScore(this.topBar.score);
                }
            }
        }
        this.clicked = false;
    }
}

class GameScene {
    constructor() {
        this.create();
    }
    create() {
        var topDimensions = [width,height*.3];
        //setup grid
        var gridCols = parseInt(Koji.config.gameSettings.gridColumns);
        var gridRows = parseInt(Koji.config.gameSettings.gridRows);
        var padding = .2;
        var gridWidth = Math.floor((width-width*padding)/(gridCols+.5)/2);
        var gridHeight = height*.8;
        gridHeight = Math.floor(gridHeight/(gridRows+1)/2);
        var bubbleRad = Math.min(gridWidth,gridHeight);
        var cursorBubbleCount = 1;
        var extraPadding = height - topDimensions[1] - gridRows*bubbleRad*2 - height*.1;
        var gridOrigin = [width/2 - (gridCols+.5)*bubbleRad,height - gridRows*bubbleRad*2 - height*.1 - extraPadding/2];
        var colors = [];
        for(var i=0; i < gameData.data.bubbleImages.length; i++) {
            colors.push(i);
        }
        this.bubbleFact = new BubbleFactory(colors, 0, bubbleRad);
        this.grid = new BubbleGrid(gridRows,gridCols,gridOrigin,bubbleRad,this.bubbleFact);
        var startingRows = Koji.config.gameSettings.startingRows;
        for(var i=0; i<startingRows; i++) {
            this.grid.addRow();
        }
        //setup top section
        topDimensions[1] = height*.2;
        var maxShots = parseInt(Koji.config.gameSettings.maxShots);
        var turnsUntilRows = parseInt(Koji.config.gameSettings.rowTimer);
        var bubblePoints = Koji.config.gameSettings.bubblePoints;
        //score / shot bar
        var scoreBarDimensions = [bubbleRad*2*(gridCols+.5),topDimensions[1]*.75];
        //subtract area for quit / sound buttons
        var scoreBarOrigin = [width/2 - scoreBarDimensions[0]/2,topDimensions[1]*.25+extraPadding/2];
        scoreBarOrigin[1] += height*.1;
        this.topBar = new TopBar(scoreBarOrigin,scoreBarDimensions[0],scoreBarDimensions[1],turnsUntilRows,maxShots,Math.floor(bubblePoints/5));
        
        var cursorOrigin = [gridOrigin[0]+gridCols*bubbleRad+bubbleRad/2,gridOrigin[1]+bubbleRad*gridRows*2-bubbleRad*1.5];
        this.cursor = new Cursor(this.bubbleFact,cursorOrigin,gridCols*bubbleRad*2+bubbleRad,bubbleRad,cursorBubbleCount);
        this.reset = false;
        gameData.playMusic();

        textSize(12);
        var quitContent = "Quit";
        var quitDefaultInfo = {
            position:[scoreBarOrigin[0],scoreBarOrigin[1]-(height*.1-20)/2-10],
            buttonSize:[height*.1-20,height*.1-20],
            buttonColor:[221,75,49],
            textColor:[0,0,0],
            textSize:14,
            text:quitContent
        }
        var quitHoverInfo = {...quitDefaultInfo, buttonColor:[145,42,24]}      
        this.quitButton = new BackButton(quitDefaultInfo, quitHoverInfo);

        var soundDefaultInfo = {
            position:[width-scoreBarOrigin[0]-(height*.1)+20,scoreBarOrigin[1]-(height*.1-20)/2-10],
            buttonSize:[height*.1 - 20,height*.1-20],
            buttonColor:[40,40,40],
        }
        var soundHoverInfo = {...soundDefaultInfo, buttonColor:[20,20,20]};
        this.soundButton = new SoundButton(soundDefaultInfo, soundHoverInfo);

        this.state = new ReadyGameState(this,this.topBar,this.grid,this.cursor,this.quitButton,this.soundButton);
    }
    update() {
        this.state = this.state.update();
        return this;
    }
    renderBorder() {
        strokeWeight(2);
        stroke(10);
        fill(40,40,40,255);
        var padding = 5;
        var boxCornerX= this.grid.origin[0]-padding;
        var boxCornerY = this.grid.origin[1]-padding;
        var boxWidth = this.grid.bubbleRadius*this.grid.columns*2+this.grid.bubbleRadius + padding*2;
        var boxHeight = this.grid.bubbleRadius*this.grid.rows*2+this.grid.bubbleRadius;
        var borderRadius = 10;
        rect(boxCornerX,boxCornerY,boxWidth,boxHeight,borderRadius);
        strokeWeight(0);
    }
    renderBackground() {
        var bubbleRad = 20;
        for(var r=0;r<Math.ceil(height/bubbleRad);r++) {
            for(var c=0;c<Math.ceil(width/bubbleRad);c++) {
                var spriteIndex = r%gameData.data.bubbleImages.length;
                var img = gameData.data.bubbleImages[spriteIndex];
                image(img,r*bubbleRad*2,c*bubbleRad*2,bubbleRad*1.75,bubbleRad*1.75);
            }
        }
    }
    render() {
        background(80);
        //this.renderBackground();
        this.renderBorder();
        this.state.render();
    }
    handlePress() {
        this.state.mousePress();
    }
    handleRelease() {
        this.state.mouseRelease();
    }
}