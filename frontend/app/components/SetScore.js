import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import Koji from '@withkoji/vcc';

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

class SetScore extends Component {
    static propTypes = {
        score: PropTypes.number,
    };

    state = {
        email: '',
        name: '(name)',
        isSubmitting: false,
    };

    componentDidMount() {
        //Activated with a delay so it doesn't lose focus immediately after click
        setTimeout(function () {
            this.nameInput.focus();
        }.bind(this), 100);

    }

    handleClose = () => {
        window.setAppView("intro");
    }

    handleSubmit = (e) => {
        if (this.state.name != "") {
            this.setState({ isSubmitting: true });

            const body = {
                name: this.state.name,
                score: this.props.score,
                privateAttributes: {
                    email: this.state.email,
                },
            };

            fetch(`${Koji.config.serviceMap.backend}/leaderboard/save`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
                .then((response) => response.json())
                .then((jsonResponse) => {
                    console.log(jsonResponse);

                    window.setAppView('leaderboard');
                })
                .catch(err => {
                    console.log(err);
                });

        }
    }

    render() {
	let pageStyle = {
		display:'flex',
		flexDirection:'column',
		justifyContent:'center',
		alignItems:'center',
		backgroundColor:Koji.config.colors.backgroundColor,
		width:'100vw',
		height:'100vh',
	};

	let bannerStyle = {
		color:'rgb(20,20,20)',
		textAlign:'center',
		fontSize:'4em',
		minWidth:"calc(25% - 60px)",
		padding:'20px',
		backgroundColor:'rgb(245,245,245)',
		marginBottom:'10px',
		borderRadius:'5px',
        fontFamily:'Open Sans'
	};

	let submitSheetStyle = {
		display:'flex',
		flexDirection:'column',
		justifyContent:'space-around',
		alignItems:'center',
		backgroundColor:'rgb(245,245,245)',
		borderRadius:'5px',
		boxShadow:'0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
		minWidth:"calc(25% - 60px)",
		minHeight:"calc(25% - 60px)",
		padding: "40px 0 40px 0"
	};

	let scoreStyle = {
		fontSize:'3em',
		marginBottom:"40px",
        fontFamily:'Open Sans'
	};

	let nameStyle = {
		fontSize:'1.5em',
		borderRadius:'10px',
		textAlign:'center',
		padding:'10px',
		width:"calc(80% - 40px)",
		border:"3px solid black",
		backgroundColor:'rgba(0,0,0,0)',
		marginBottom:"40px",
        fontFamily:'Open Sans'
	}

	let submitStyle = {
		padding:'20px',
		fontSize:'1.25em',
		border:"1px solid rgba(0,0,0,.25)",
		borderRadius:'10px',
		backgroundColor:'hsl(129,72%,53%)',
		width:"calc(80% - 40px)",
        fontFamily:'Open Sans'
	}
	let submitHoverStyle = {...submitStyle, backgroundColor:'hsl(129,72%,33%)'};

	let cancelStyle = {
		padding:'20px',
		fontSize:'1.25em',
		backgroundColor:'rgb(221,75,49)',
		marginTop:'50px',
		border:0,
		borderRadius:'10px',
		boxShadow:'0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
		minWidth: "calc(calc(25% - 60px)*.66)",
        fontFamily:'Open Sans'
	}
	let cancelHoverStyle = {...cancelStyle, backgroundColor:'rgb(144,42,24)'};

	return(
		<div id="leadboard-screen" style={pageStyle}>
			<h1 style={bannerStyle}>High Score</h1>
			<div id="submit-sheet" style={submitSheetStyle}>
				<h1 style={scoreStyle}>{this.props.score}</h1>
				<input type="text" style={nameStyle} value={this.state.name} onChange={(e) => this.setState({name:e.target.value})}></input>
				<HoverButton inactiveStyle={submitStyle} activeStyle={submitHoverStyle} onClick={this.handleSubmit} content={this.state.isSubmitting ? "Submitting..." : "Submit"}/>
			</div>
			<HoverButton inactiveStyle={cancelStyle} activeStyle={cancelHoverStyle} onClick={this.handleClose} content={"Cancel"}/>
		</div>
	);



    }
}

export default SetScore;
