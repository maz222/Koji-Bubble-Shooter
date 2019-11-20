import { h, Component } from 'preact';
import Koji from '@withkoji/vcc';


//import HoverButton from './HoverButtonReact.js';

class HoverButton extends Component {
	constructor(props) {
		super(props);
		this.state={active:false};
	}
	render() {
		let styling = this.state.active ? this.props.activeStyle : this.props.inactiveStyle;
		return(<button onClick={() => this.props.onClick()} style={styling} 
			onMouseEnter={() => this.setState({active:true})} 
			onMouseLeave={() => this.setState({active:false})}
			>{this.props.content}</button>)
	}
}

class IntroScreen extends Component {
	state = {
		titleText : Koji.config.introScreen.titleContent,
		descriptionText : Koji.config.introScreen.descriptionContent,
		playText : Koji.config.introScreen.playContent,
		leaderboardText : Koji.config.introScreen.leaderboardContent
	}
	render() {
		var pageStyle = {
			display:'flex',
			flexDirection:'column',
			justifyContent:'space-around',
			alignItems:'center',
			backgroundColor:Koji.config.introScreen.backgroundColor,
			width:'100%',
			height:window.innerHeight + 'px'
		};
		if(Koji.config.introScreen.backgroundImage != "") {
			pageStyle.backgroundImage = Koji.config.introScreen.backgroundImage
		}

		var titleStyle = {
			fontSize: window.innerHeight > window.innerWidth ? '3em' : '4em',
			color:Koji.config.introScreen.titleColor,
            fontFamily:'Open Sans',
			margin:0
		};

		var descriptionStyle = {
			marginLeft:'10px',
			marginRight:'10px',
			fontSize: window.innerHeight > window.innerWidth ? '1em' : '1.25em',
			color:Koji.config.introScreen.descriptionColor,
			whiteSpace:'pre-wrap',
			padding: '30px 20px 30px 20px',
			backgroundColor:'rgba(0,0,0,.25)',
			borderRadius:'5px',
            fontFamily:'Open Sans'
		};

		var playStyle = {
			fontSize:'1em',
			backgroundColor:'hsl(129,72%,53%)',
			color:'rgb(255,255,255)',
			padding:"20px",
			border:0,
			borderRadius:'10px',
			width:'40%',
            fontFamily:'Open Sans'
		};
		var playHover = {...playStyle,backgroundColor:'hsl(129,72%,33%)'};

		var leaderboardStyle = {
			fontSize:'1em',
			backgroundColor:'hsl(219,72%,53%)',
			color:'rgb(255,255,255)',
			padding:"20px",
			border:0,
			borderRadius:'10px',
			width:'40%',
            fontFamily:'Open Sans'
		};
		var leaderboardHover = {...leaderboardStyle,backgroundColor:'hsl(219,72%,33%'};

		console.log(this.state.descriptionText);

		return(
			<div id="introScreen" style={pageStyle}>
				<h1 id="title" style={titleStyle}>{this.state.titleText}</h1>
				<h4 id="description" style={descriptionStyle}>{this.state.descriptionText}</h4>
				<HoverButton activeStyle={playHover} inactiveStyle={playStyle} content={this.state.playText} onClick={() => window.setAppView('game')}/>
				<HoverButton activeStyle={leaderboardHover} inactiveStyle={leaderboardStyle} content={this.state.leaderboardText} onClick={() => window.setAppView('leaderboard')}/>
			</div>
		);
	}
}

export default IntroScreen;