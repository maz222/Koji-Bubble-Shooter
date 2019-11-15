import { h, Component } from 'preact';
import GameContainer from './GameContainer';
import Leaderboard from './Leaderboard';
import SetScore from './SetScore';
import IntroScene from './IntroSceneReact';


export default class App extends Component {
	state = {
		score: 0,
		view: 'intro',
	};

	componentDidMount() {
		window.setAppView = view => { this.setState({ view }); }
		window.setScore = score => { this.setState({ score }); }
        console.log(window.innerHeight);
	}

	render() {
		var styling = {
			width:'100%',
			height:window.innerHeight+'px'
		};
		if (this.state.view === 'game') {
			console.log("Setting game");
			return (
				<div>
					<GameContainer />
				</div>
			)
		}
		if (this.state.view === 'setScore') {
			return (
				<div>
					<SetScore score={this.state.score} />
				</div>
			)
		}
		if (this.state.view === 'leaderboard') {
			return (
				<div>
					<Leaderboard />
				</div>
			)
		}
		if (this.state.view === 'intro') {
			return(
				<div>
					<IntroScene />
				</div>
			)
		}
		return null;
	}
}
