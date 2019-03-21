import React, { Component } from 'react';
import Constants from './Constants';
import { Button, Row, Col, Table ,Card} from 'react-bootstrap';
import Axios from 'axios';
import { getJwtToken, getHeaderObject } from './util';
import _ from 'lodash';
import { toast } from 'react-toastify';

class LiveAuction extends Component {
    constructor(props){
        super(props);
        this.state = {
            currentAuctionInfo : null,
            bidAmt : 5
        }
    }

    componentDidMount(){
        this.getLiveAuctionInfo();
        this.interval = setInterval(()=>{
            this.getLiveAuctionInfo();
        },Constants.LIVE_POLL_TIME)
    }
    componentWillUnmount(){
        window.clearInterval(this.interval);
    }
    
    getLiveAuctionInfo(){
        Axios.get(Constants.BASE_URL + '/liveAuctionInfo',getHeaderObject()).then(
            (res)=>{
                if(!_.isEqual(res.data,this.state.currentAuctionInfo)){
                    const bidAmt = res.data.bids && res.data.bids[0] && res.data.bids[0].bidAmt+5 || 5
                    this.setState({currentAuctionInfo:res.data,bidAmt})
                }
            },(err)=>{
                if(err && err.response && err.response.data && err.response.data.message){
                    toast.error(err.response.data.message);
                  }
                console.error(err); 
            }
        )
    }

    startAuction(e){
        e.preventDefault();
    }

    roundOff(amt){
        const bidAmt = Math.ceil(parseInt(amt.target.value)/5)*5;
        this.setState({bidAmt});
    }

    handleBidInputChange(e){
        this.setState({bidAmt:e.target.value});
    }


    bid(){
        if(this.state.bidAmt && this.state.bidAmt>0){
            const userName = localStorage.getItem('user1') || 'User';
            const playerId =this.state.currentAuctionInfo.playerId;
            this.doBidRequest(playerId,this.state.bidAmt,userName).then(
                (res)=>{
                    // toast.success('Bid Successfully Placed');
                    this.getLiveAuctionInfo()
                },(err)=>{
                    if(err && err.response && err.response.data && err.response.data.message){
                        toast.error(err.response.data.message);
                      }
                    console.error(err); 
                }
            )
        }
    }

    doBidRequest(playerId,bidAmt,bidBy){
        return Axios.post(Constants.BASE_URL +'/addBid',{playerId,bidAmt,bidBy},getHeaderObject())
    }

    markPlayerSoldHandler(){
        this.markPlayerSoldRequest(this.state.currentAuctionInfo.playerId).then(
            (res)=>{
                if(res.data && res.data.message){
                    toast.success(res.data.message)
                }
                this.getLiveAuctionInfo();
            },(err)=>{
                if(err && err.response && err.response.data && err.response.data.message){
                    toast.error(err.response.data.message);
                  }
                console.error(err);
            }
        )
    }

    markPlayerSoldRequest(playerId){
        return Axios.post(Constants.BASE_URL +'/markAsSold',{playerId},getHeaderObject());
    }
    
    bringNextPlayerHandler(){
        this.bringNextPlayerRequest().then(
            res=>{
                this.getLiveAuctionInfo();
            },err=>{
                if(err && err.response && err.response.data && err.response.data.message){
                    toast.error(err.response.data.message);
                  }
                console.err(err);
            }
        )
    }
    bringNextPlayerRequest(){
        return Axios.get(Constants.BASE_URL +'/bringNextPlayer',getHeaderObject());
    }

    onRefreshHandler(){
        this.getLiveAuctionInfo();
    }

    render() {
        const userName = localStorage.getItem('user1') || 'User';
        const currentPlayer = this.state.currentAuctionInfo;
        const bidsPresent = currentPlayer && currentPlayer.bids && currentPlayer.bids.length && currentPlayer.bids.length>0 ? true : false;
        const soldButtonName = bidsPresent ? 'Mark as Sold' : 'Mark as Unsold';
        if(currentPlayer){
            return(
                <Card>
                    <Card.Header>
                        Current/ Last Player
                        <Button variant="dark" size='sm' style={{float:'right'}} onClick={this.onRefreshHandler.bind(this)}>Refresh</Button>
                    </Card.Header>
                    <Card.Body>
                        <Row style={{margin:'0px'}}>
                            <Col sm={12}>
                                {`PlayerId : ${currentPlayer.playerId}`}
                            </Col>
                            <Col sm={12}>
                                {`Player Name : ${currentPlayer.name}`}
                            </Col>
                            <Col sm={12}>
                                {`Team : ${currentPlayer.team}`}
                            </Col>
                            <Col sm={12}>
                                {`Grade : ${currentPlayer.grade}`}
                            </Col>
                            <Col sm={12}>
                                {`Nationality : ${currentPlayer.nationality}`}
                            </Col>
                            <Col sm={12}> 
                                {`Time Left : ${currentPlayer.timeLeft ? currentPlayer.timeLeft/1000-3: 'null'} Seconds`}
                            </Col>
                            {
                                currentPlayer.soldTo &&
                                    <span>
                                        <Col sm={12}>
                                            {`Sold to : ${currentPlayer.soldTo}`}
                                        </Col>
                                        <Col sm={12}>
                                            {`Sold for : ${currentPlayer.soldAt} points`}
                                        </Col>
                                        
                                    </span>
                            }
                            {!currentPlayer.soldTo &&
                                <Col sm={12}>
                                    <input style={{margin : '15px',marginLeft:'0px'}} type='number' step='5' 
                                        value={this.state.bidAmt }
                                        placeholder='Bid Amount'
                                        onBlur={this.roundOff.bind(this)}
                                        onChange={this.handleBidInputChange.bind(this)}/>
                                    {userName != 'readOnly' && <Button size='sm' onClick={this.bid.bind(this)}>Bid</Button>}
                                </Col>
                            }
                            {!currentPlayer.soldTo && (userName === 'Parthiv' || userName ==='Nikhil') && 
                                    <Col sm={12}>
                                        <Button size='sm' variant="danger" 
                                            onClick={this.markPlayerSoldHandler.bind(this)}>{soldButtonName}
                                        </Button>
                                    </Col>
                            }
                            
                            {
                                currentPlayer.soldTo && (userName === 'Parthiv' || userName ==='Nikhil') && 
                                    <Col sm={12}>
                                        <Button size='sm' variant="info" 
                                            onClick={this.bringNextPlayerHandler.bind(this)}>Get Next Player
                                        </Button>
                                    </Col>
                            }
                            <Col sm={12}>
                                {DisplayBids(currentPlayer.bids)}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )
        }
        else{
            return null;
        }
    }
}

const DisplayBids=(bids)=>{
    if(bids && bids.length>0) { 
        return(<div>
            <h4>Previous Bids:</h4>
            <Table striped={true} bordered={true} hover={true} size="sm">
                <thead>
                    <tr>
                        <th>
                            Bid By
                        </th>
                        <th>
                            Bid Amt
                        </th>
                    </tr>
                </thead>
                <tbody>
                {bids.map((bid,index)=><tr key={index}>
                    <td>
                        {bid.bidBy}
                    </td>
                    <td>
                        {bid.bidAmt}
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </div>)
    }
    return (<div>You Can Start Bidding</div>);
}

export default LiveAuction;
