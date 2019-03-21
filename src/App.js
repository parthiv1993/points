import React, { Component } from 'react';
import { checkForJwt, saveJwt } from './util';
import Login from './Login';
import HomePage from './HomePage';
import axios from 'axios';
import constants from './Constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {

  login(nickName){
    axios.post(constants.BASE_URL+'/login',{nickName}).then((res)=>{
      saveJwt(res.data.token)
      this.forceUpdate();
    },(err)=>{
        if(err && err.response && err.response.data && err.response.data.message){
          toast.error(err.response.data.message);
        }
      console.log(err.response);
    })
  }

  render() {
    const isAuthorized = checkForJwt();
    return (
      <div>{isAuthorized?<HomePage/>:<Login onLogin={this.login.bind(this)}/>}<ToastContainer /></div>
    );
  }
}

export default App;
