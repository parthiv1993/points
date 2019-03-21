import React, { Component } from 'react';
import {Navbar,Nav,Form,FormControl,Button, Dropdown} from 'react-bootstrap';
import Axios from 'axios';
import Constants from './Constants';
import { getJwtToken, getHeaderObject } from './util';
import { toast } from 'react-toastify';
import './navigation.css'

class Navigation extends Component {
    constructor(props){
        super(props);
        this.state = {
            isExtendedMenuOption :false
        }
    }

    logOut(){
        const userName = localStorage.getItem('user1') || 'User';
        if((userName=='Parthiv' || userName=='Nikhil' ) && !this.state.isExtendedMenuOption) {
            this.setState({isExtendedMenuOption:true});
            setTimeout(()=>this.setState({isExtendedMenuOption:false}),10000);
        }else{
            localStorage.clear();
            window.location.reload();
        }
    }

    componentWillUnmount() {
        localStorage.clear();
    }

    startAuctionHandler(){
        this.startAuctionRequest().then(
            (res)=>{
                toast.success('Auction started. Enjoy the auction!!');
            },
            (err)=>{

            }
        )
    }

    startAuctionRequest(){
        return Axios.get(Constants.BASE_URL +'/resetAuction',getHeaderObject());
    }

    timerHandler(){
        Axios.get(Constants.BASE_URL +'/toggleTimerEnabled',getHeaderObject()).then(
            (res)=>{
                toast.success(res.data);
            },(err)=>{

            }
        )
    }

    pauseTimerNow(){
        Axios.get(Constants.BASE_URL +'/pauseTimer',getHeaderObject()).then(
            (res)=>{
                toast.success(res.data);
            },(err)=>{

            }
        )
    }

    startTimerNow(){
        Axios.get(Constants.BASE_URL +'/startTimer',getHeaderObject()).then(
            (res)=>{
                toast.success(res.data);
            },(err)=>{

            }
        )
    }

    changeTimerWaitForSold(){
        Axios.post(Constants.BASE_URL +'/changeTimerWaitForSold',{timeWait:this.inputText*1000},getHeaderObject()).then(
            (res)=>{
                toast.success(res.data);
            },(err)=>{

            }
        )
    }

    changeTimerWaitForNextPlayer(){
        Axios.post(Constants.BASE_URL +'/changeTimerWaitForNextPlayer',{timeWait:this.inputText*1000},getHeaderObject()).then(
            (res)=>{
                toast.success(res.data);
            },(err)=>{

            }
        )
    }

    getStatus(){
        Axios.get(Constants.BASE_URL +'/getStatus',getHeaderObject()).then(
            (res)=>{
                if(res.data){
                    try{
                        Object.keys(res.data).map(
                            key=>
                                {toast.info(
                                    [key]+' : ' +(JSON.stringify(res.data[key],null,4).replace(/\,/g,'___').replace(/\:/g,'=')
                                ),{
                                    autoClose:false,
                                    className:'statusNotification',
                                    position : toast.POSITION.TOP_CENTER
                                }
                                )
                            }
                        )
                    }
                    catch(e){

                    }
                }
                toast.info(res.data,{
                    autoClose: false
                  });
            },(err)=>{

            }
        )
    }

    renderOtherOptions(){
        return (
            <div>
                
                <Dropdown>
                    <Dropdown.Toggle variant="outline-info" id="dropdown-basic">
                        Other Options
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item  >
                            <Button size="sm" variant="outline-info" onClick={this.pauseTimerNow.bind(this)}>Pause Timer now</Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <Button size="sm" variant="outline-info" onClick={this.startTimerNow.bind(this)}>Start Timer for current player</Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <Button size="sm" variant="outline-info" onClick={this.timerHandler.bind(this)}>Enable / Disable Timer</Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                                <Button size="sm" variant="outline-info" onClick={this.changeTimerWaitForSold.bind(this)}>Change Time to Sold</Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                                <Button size="sm" variant="outline-info" onClick={this.changeTimerWaitForNextPlayer.bind(this)}>Change Time to Next player</Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                                <Button size="sm" variant="outline-info" onClick={this.getStatus.bind(this)}>Get Status</Button>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        ) 
    }

    render() {
        const userName = localStorage.getItem('user1') || 'User';
        return(
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#home">{`Hi ${userName}`}</Navbar.Brand>
                <Nav className="mr-auto">
                {/* <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#features">Features</Nav.Link>
                <Nav.Link href="#pricing">Pricing</Nav.Link> */}
                </Nav>
                {
                    (userName=='Parthiv' || userName=='Nikhil') &&
                    <Button variant="outline-info" onClick={this.timerHandler.bind(this)}>Enable / Disable Timer</Button>
                }
                &nbsp;
                {
                    (userName=='Parthiv' ) && this.state.isExtendedMenuOption && 
                    <input onChange={(e)=>{this.inputText = parseInt(e.target.value)}}></input>
                }
                &nbsp;
                {
                    (userName=='Parthiv' ) && this.state.isExtendedMenuOption && 
                    this.renderOtherOptions()
                }
                &nbsp;
                {
                    (userName=='Parthiv' || userName=='Nikhil') &&
                    <Button variant="outline-info" onClick={this.startAuctionHandler.bind(this)}>Start Auction</Button>
                }
                &nbsp;

                
                <Button variant="outline-info" onClick={this.logOut.bind(this)}>Log Out</Button>
            </Navbar>
                    
        )
    }
}

export default Navigation;
