import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import $ from 'jquery';

import './App.css';
import Account from 'Account/Account';
import Home from 'Home/Home';
import Login from 'Login/Login';
import NavBar from 'NavBar/NavBar';
import PageList from 'Page/List/PageList';
import PageDetails from 'Page/Details/PageDetails';
import PageEdit from 'Page/Edit/PageEdit';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';
import Cookie from 'Cookie/Cookie';
import ApiModelNameHandler from 'Logic/ApiModelName/ApiModelNameHandler';
import ComhonConfig from 'Logic/Config/ComhonConfig';
import ComhonException from 'Logic/Exception/ComhonException';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logged: false,
      appInitialized: false,
      models: [],
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.showLoginModal = this.showLoginModal.bind(this);
  }

  componentDidMount() {
    ComhonConfig.initialize({
      basePathURI : 'http://localhost:8000/api/comhon/',
      apiModelNameHandler : ApiModelNameHandler
    });

    let token = Cookie.getCookie('token');
    if (token !== "") {
      Account.validateToken(token).then(xhr => {
        if (xhr.status === 200) {
          // if token is valid, we must initilize app as logged
          Account.importToken(token, false);
          this.initApp(true);
        } else if (xhr.status === 401) {
          // if token is not valid, we must initilize app as not logged
          this.initApp(false);
        } else {
            alert('unknown server error when trying to initialize application');
        }
      }).catch(error => {
        if (error instanceof ComhonException) {
          alert(error.getMessage());
        } else {
          alert('unknown error during token validation');
        }
      });
    } else {
      // if there is no token, we must initilize app as not logged
      this.initApp(false);
    }
  }

  async initApp(islogged) {
    try {
      const models = await ApiModelNameHandler.getApiModelNames(!islogged);
      this.setState({
        models: models,
        appInitialized: true,
        logged: islogged
      });
    } catch (error) {
      if (error instanceof ComhonException) {
        if (error instanceof HTTPException && error.getCode === 401 && !islogged) {
          this.setState({
            appInitialized: true,
            logged: islogged
          });
        } else {
          alert(error.getMessage());
        }
      } else {
        console.log(error);
        alert('unknown error during application initialization');
      }
    }
  }

  async handleLogin() {
    await this.initApp(true);
    if (this.props.location.pathname === '/login' || this.props.location.pathname === '/login/') {
      this.props.history.push('/home');
    } else {
      $(document.getElementById('loginModal')).modal('hide');
    }
  }

  showLoginModal() {
    $(document.getElementById('loginModal')).modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  render() {
    return (
      <div>
        <NavBar logged={this.state.logged} appInitialized={this.state.appInitialized} models={this.state.models} />
        <div className="App">
          {this.state.appInitialized
            ? <Switch>
                <Route exact path='/' component={Home} />
                <Route exact path='/home' component={Home} />
                <Route exact path='/login' component={() => <Login onLogin={this.handleLogin} />} />
                <Route path='/:pathModel/:id/edit' component={() => <PageEdit key={Date.now()} onUnauthorized={this.showLoginModal} />} />
                <Route path='/:pathModel/:id' component={() => <PageDetails key={Date.now()} onUnauthorized={this.showLoginModal} />} />
                <Route path='/:pathModel' component={() => <PageList key={Date.now()} onUnauthorized={this.showLoginModal} />} />
              </Switch>
            : <CcLoading />
          }
        </div>
        <div id="loginModal" className="modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login</h5>
              </div>
              <Login onLogin={this.handleLogin} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
