import React, { Component } from 'react'
import sha3 from 'solidity-sha3'
import { keccak256 } from 'js-sha3'
import { Button } from 'react-bootstrap';
import '../css/oswald.css'
import '../css/Token.css'
import '../Listings.css'
import Tokens from '../contracts/Tokens'

class TokenDetail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      file: '',
      imagePreviewUrl: ''
    }
  }
  
  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  getOffers(props) {
    let offers = []
    for (var i in this.props.proposedSwaps) {
      let proposedSwap = this.props.proposedSwaps[i]
      if (proposedSwap.askToken == this.props.match.params.tokenAddress &&
          proposedSwap.askTokenId == this.props.match.params.tokenId)
      {
        console.log('PROPOSED SWAP: ', proposedSwap)

        let askHash = sha3(proposedSwap.askToken, parseInt(proposedSwap.askTokenId))
        let offerHash = sha3(proposedSwap.offerToken, parseInt(proposedSwap.offerTokenId))

        console.log('ASK HASH: ', askHash)
        console.log('OFFER HASH: ', offerHash)

        offers.push({
          tokenAddress: proposedSwap.offerToken,
          id: proposedSwap.offerTokenId,
          img: Tokens[proposedSwap.offerToken].img,
          askTokenHash: askHash,
          offerTokenHash: offerHash,
          proposalHash: proposedSwap.proposalHash
          /*proposalHash: sha3(
            askHash,
            offerHash
          )*/
        })
      }
    }
    return JSON.stringify(offers)
  }

  render() {

    const offers = JSON.parse(this.getOffers())
    const offerComponents = offers.map((offer) => {
      return (
        <OfferItem
          tokenAddress={offer.tokenAddress}
          id={offer.id}
          img={offer.img}
          proposalHash={offer.proposalHash}
          nftExchange={this.props.nftExchange}
          accounts={this.props.accounts}
          askTokenHash={offer.askTokenHash}
          offerTokenHash={offer.offerTokenHash} />
      )
    })

    return (
      <div className="Token">       
        <div className="container">
          <div className="row token-info-row">
            <div className="col-md col-home-left">
                <img className="happymoogle" src={Tokens[this.props.match.params.tokenAddress].img}/>
                <div className="token-column">
                    <h3 className="token-name">
                      {Tokens[this.props.match.params.tokenAddress].name}
                    </h3>
                    <h2 className="token-id">#{this.props.match.params.tokenId}</h2>
                    <Button className="offer-button" bsStyle="primary btn-home">
                      <a href={`/make-offer/${this.props.match.params.tokenAddress}/${this.props.match.params.tokenId}`}>
                        Make an Offer
                      </a>
                    </Button>  
                </div>
            </div>
            <div className="col-md col-home-right">
                <h3 className="bio-header">Bio</h3>
                <div className="bio-text">{Tokens[this.props.match.params.tokenAddress].bio}</div>
                <h3 className="features-header">Features</h3>
                <div className="features-text">{Tokens[this.props.match.params.tokenAddress].features}</div>            
            </div>
          </div>
          <div>
            <h2>Offers</h2>
            {offerComponents}
          </div>
        </div>
      </div>
    );
  }
}

class OfferItem extends Component {
  constructor(props) {
    super(props)
  }

  acceptOffer() {
    console.log(`accepting swap ${this.props.proposalHash}`)

    /* this.props.nftExchange._proposedSwaps(this.props.proposalHash)
      .then((swap) => console.log(swap))
      .catch((err) => console.log(err))

      this.props.nftExchange._tokens(this.props.askTokenHash)
        .then((res) => console.log(res))
        .catch((err) => console.log(err))

        this.props.nftExchange._tokens(this.props.offerTokenHash)
          .then((res) => console.log(res))
          .catch((err) => console.log(err)) */

    this.props.nftExchange.acceptSwap(
      this.props.proposalHash,
      { from: this.props.accounts[0] }
    )
    .then((acceptSwapTx) => {
      console.log('PROPOSE SWAP TX: ', acceptSwapTx)
    })
    .catch((err) => {
      console.log('Error acceptSwap: ', err)
    })
  }

  render() {
    // TODO: check if address[0] is the owner
    const isOwner = true

    const acceptButton = isOwner ? (
      <Button className="offer-button" bsStyle="primary btn-home" onClick={this.acceptOffer.bind(this)}>
        Accept
      </Button>
    ) : null

    return (
      <div className='listing-item'>
        <a href={`/token/${this.props.tokenAddress}/${this.props.id}`}>
          <div className='row'>
            <div className='col'>
              <img className='token-image' src={this.props.img}/>
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <p className='token-id'>{`ID ${this.props.id}`}</p>
            </div>
            <div className='col'>
              <p>{Tokens[this.props.tokenAddress].name}</p>
            </div>
          </div>
        </a>
        <div>
          {acceptButton} 
        </div>
      </div>
    )
  }
}

export default TokenDetail
