import React, { Component } from 'react';
import {
  Person,
} from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
      },
      coinType:'Add your CoinType',
      holdingPercent:'0%',
      remoteCoinType:'',
      remoteHoldingPercent:'',
  	};
  }

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    return (
      !userSession.isSignInPending() ?
      <div className="panel-welcome" id="section-2">
        <div className="avatar-section">
          <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" alt=""/>
        </div>
        <h1>Hello, <span id="heading-name">{ person.name() ? person.name() : 'Nameless Person' }</span>!</h1>
        <p className="lead">
          <button
            className="btn btn-primary btn-lg"
            id="signout-button"
            onClick={ handleSignOut.bind(this) }
          >
            Logout
          </button>
        </p>
        <input value={this.state.coinType} onChange={e=>this.handleCoinTypeChange(e)}/>
        <input value={this.state.holdingPercent} onChange={e=>this.handleHoldingPercentChange(e)}/>
        <button onClick={e=>this.handlePortfolioSubmit(e)}>submit</button>
        <p>{this.state.remoteCoinType+":"+this.state.remoteHoldingPercent}</p>
      </div> : null
    );
  }

  handleCoinTypeChange(e){
    this.setState({coinType: e.target.value});
  }

  handleHoldingPercentChange(e){
    this.setState({holdingPercent: e.target.value});
  }

  handlePortfolioSubmit(e){
    this.saveNewPortfolio(this.state.coinType,this.state.holdingPercent);
    this.setState({
      coinType:'Add your CoinType',
      holdingPercent:'0%',
    })
    this.fetchGaiaData()
  }

  saveNewPortfolio(coinType,holdingPercent){
    const {userSession} = this.props

    const newPortfolio = {
      coinType,
      holdingPercent,
      created_at: Date.now()
    }

    const options = {encrypt:true}
    userSession.putFile('portfolio.json',JSON.stringify(newPortfolio),options)
      .then(()=>{
        this.setState({
          newCoinType:newPortfolio.coinType,
          newHoldingPercent:newPortfolio.HoldingPercent,
        })
      })
  }

  fetchGaiaData(){
    const {userSession} = this.props
    const options = { decrypt: true }
    userSession.getFile('portfolio.json', options)
    .then((file) => {
      var portfolio = JSON.parse(file || '[]')
      console.log(portfolio)
      this.setState({
        remoteCoinType:portfolio.coinType,
        remoteHoldingPercent:portfolio.holdingPercent,
      })
    })
    .finally(() => {
      console.log("read over")
    })
  }

  componentDidMount(){
    this.fetchGaiaData()
  }

  componentWillMount() {
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile),
    });
  }
}
