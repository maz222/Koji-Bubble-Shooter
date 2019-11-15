var state = null;
var gameData = null;

//===This function is called before starting the game
//Load everything here
function preload() {
    gameData = new GameData();
    //--load images--
    //load bubble images
    var bubbles = Koji.config.gameGraphics.bubbles;
    for(var i in bubbles) {
      var temp = loadImage(bubbles[i]);
       gameData.data.bubbleImages.push(temp);
    }
    //load Intro background image
    var t = Koji.config.introScreen.backgroundImage
     gameData.data.introBG = t == "" ? null : loadImage(t);
    //load Game background image
    var t = Koji.config.gameGraphics.backgroundImage;
     gameData.data.gameBG = t == "" ? null: loadImage(t);
    //load grid background image
    var t = Koji.config.gameGraphics.gridImage;
     gameData.data.gridBG = t == "" ? null : loadImage(t);

    //load sound button icons
    //unmute
    var t = Koji.config.gameGraphics.soundButton;
    gameData.data.soundIcon = t == "" ? null : loadImage(t);
    //mute
    var t = Koji.config.gameGraphics.unmuteButton;
    gameData.data.muteIcon = t == "" ? null : loadImage(t);

    //load back button icon
    var t = Koji.config.gameGraphics.backButton;
    gameData.data.backIcon = t == "" ? null : loadImage(t);

    //--load sounds--
    //shoot
    var t = Koji.config.gameSounds.shoot;
     gameData.data.sounds[0] = t == "" ? null :loadSound(t);
    //bounce
    var t = Koji.config.gameSounds.bounce;
     gameData.data.sounds[1] = t == "" ? null :loadSound(t);
    //match
    var t = Koji.config.gameSounds.match;
     gameData.data.sounds[2] = t == "" ? null :loadSound(t);
    //add rows
    var t = Koji.config.gameSounds.addRows;
     gameData.data.sounds[3] = t == "" ? null :loadSound(t);
    //music
    var t = Koji.config.gameSounds.music;
     gameData.data.music = t == "" ? null : loadSound(t);

    //--colors and settings aren't preloaded, just accessed directly when needed--
}

//This function runs once after the app is loaded
function setup() {
    frameRate(60);
    createCanvas(window.innerWidth,window.innerHeight);
    state = new GameScene();
}

function draw() {
	state = state.update();
	state.render();
}

function mousePressed() {
	state.handlePress();
}

function mouseReleased() {
	state.handleRelease();
}


//Takes the player to the "setScore" view for submitting the score to leaderboard
//Notice that it makes use of the "score" variable. You can change this if you wish.
function submitScore(score) {
    window.setScore(score);
    window.setAppView("setScore");
}