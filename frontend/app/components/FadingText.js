class FadingText{
    //startFontInfo {
        //font - font to be used (optional)
        //color - color of the text - p5.js COLOR
        //size - font size - int
    //}
    //endFontInfo {
        //color - color of the text - p5.js COLOR
        //size - font size - int
    //}
    //text - text to be displayed
    //origin - the starting position of the text - p5.js VECTOR
    //velocity - velocity of the text (for floating upwards, etc) - p5.js VECTOR
    //duration - how many frames the fade should last for - int
    constructor(text,startInfo, endInfo, origin, velocity, duration) {
        this.text = text;
        this.startInfo = startInfo;
        this.endInfo = endInfo;
        this.currentInfo = {
            color: this.startInfo.color,
            size: this.startInfo.size,
            position:origin,
            currentFrame:0
        }
        this.origin = origin;
        this.position = origin;
        this.velocity = velocity;
        this.duration = duration;
        this.step = 100/this.duration/60;

    }
    update() {
        this.currentInfo.currentFrame += 1;
        this.currentInfo.color = lerpColor(this.currentInfo.color, this.endInfo.color, this.step);
        this.currentInfo.size = lerp(this.currentInfo.size, this.endInfo.size, this.step);
        this.position.add(this.velocity);
    }
    render(offset=[0,0]) {
        textAlign(CENTER, CENTER);
        fill(this.currentInfo.color);
        textSize(this.currentInfo.size);
        var pos = this.currentInfo.position.array();
        text(this.text,pos[0]+offset[0],pos[1]+offset[1]);
    }
}