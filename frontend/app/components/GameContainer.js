import { h, Component } from 'preact';
import PropTypes from 'prop-types';

// Note: If you are using p5, you can uncomment all of the p5 lines
// and things should just work =)

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

const { p5 } = window;

class GameContainer extends Component {
    componentWillMount() {
		console.log("will mount");
        //Include all scripts here
        require('script-loader!app/components/Bubble.js');
        require('script-loader!app/components/BubbleFactory.js');
        require('script-loader!app/components/BubbleGrid.js');
        require('script-loader!app/components/Cursor.js');
        require('script-loader!app/components/GameData.js');
        require('script-loader!app/components/GameScene.js');
        require('script-loader!app/components/TopBar.js');
        require('script-loader!app/components/FadingText.js');


        require('script-loader!app/index.js');

    }

    componentDidMount() {
		console.log("did mount");
        this.p5Game = new p5(null, document.getElementById('game-container'));
    }

    componentWillUnmount() {
		console.log("unmounted");
        this.p5Game.remove();
    }

    render() {

        let backStyling = {
            backgroundColor:'hsl(9,72%,55%)',
            padding:'10px',
            margin:'20px',
            borderRadius:'10px',
            border:0,
            fontSize:'1em'
        }
        let backHoverStyling = {...backStyling, backgroundColor:'hsl(9,72%,35%'};
        let backContent = 'Intro';

        let soundStyling = {
            backgroundColor:'hsl(9,72%,55%)',
            padding:'10px',
            margin:'20px',
            borderRadius:'10px',
            border:0,
            fontSize:'1em'
        }
        let soundHoverStyling = {...backStyling, backgroundColor:'hsl(9,72%,35%'};
        let soundContent = 'Sound';

        return (
            <div id={'game-container'} />
        );
    }
}

export default GameContainer;
