class BubbleFactory {
	constructor(colors, specialBubbleProb, bubbleSize) {
		this.colors = colors;
		this.specialProb = specialBubbleProb;
		this.bubbleSize = bubbleSize;
	}
	getBubble(bubblePosition, colors=null) {
		//special bubble chance here
		var possibleColors = colors == null ? this.colors : colors;
		var bubbleColorIndex = Math.floor(Math.random() * possibleColors.length);
		var bubbleColor = [possibleColors[bubbleColorIndex]];
		var bubble = new Bubble(bubbleColor,this.bubbleSize,bubblePosition);
		return bubble;
	}
}

