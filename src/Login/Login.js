import React from 'react';
import { withRouter } from 'react-router-dom';
import Account from '../Account/Account.js';
import Requester from 'Logic/Requester/Requester';
import './Login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      errorMessage: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  async handleSubmit(event) {
    event.preventDefault();
    var data = new FormData();
    data.set('username', this.state.username);
    data.set('password', this.state.password);

    const requester = new Requester();
    try {
      const xhr = await requester.post('http://localhost:8000/api/login', null, data);
      if (xhr.status === 200) {
        Account.importToken( xhr.responseText, true);
        this.props.onLogin();
      } else if (xhr.status === 404) {
        this.setState({errorMessage: xhr.responseText});
      } else {
        alert('unknown server error when trying to login');
      }
    } catch (e) {
      alert('unknown server error when trying to login');
    }
  }

  render() {
    return (
      <form className="login" onSubmit={this.handleSubmit}>
        <div className="error">{this.state.errorMessage}</div>
        <label>User name:
          <input type="text" value={this.state.username} onChange={this.handleChange} id="username" name="username" />
        </label>
        <br />
        <label>Password:
          <input type="password" value={this.state.password} onChange={this.handleChange} id="password" name="password" />
        </label>
        <br />
        <input type="submit" value="Envoyer" />
      </form>
    );
  }
}

export default withRouter(Login);
