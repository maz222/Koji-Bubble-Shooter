class GameData {
	constructor() {
		this.data = {
			bubbleImages:[],
			sounds:[],
			music:null,
			isMuted:true
		};
        userStartAudio();
	}
	toggleMute() {
		this.data.isMuted = !this.data.isMuted;
		if(this.data.isMuted) {
			this.mute();
		}
		else {
			if(this.data.music != null) {
				this.data.music.loop();
			}
		}
	}
	//[0] - shoot, [1] - bounce, [2] - match, [3] add rows
	playSound(soundIndex) {
		if(!this.data.isMuted && this.data.sounds[soundIndex] != null) {
			this.data.sounds[soundIndex].play();
		}
	}
	playMusic() {
		if(!this.data.isMuted && this.data.music != null) {
			this.data.music.loop();
		}
	}
	mute() {
		for(var i in this.data.sounds) {
			if(this.data.sounds[i] != null) {
				this.data.sounds[i].stop();
			}
		}
		if(this.data.music != null) {
			this.data.music.stop();
		}
	}
}