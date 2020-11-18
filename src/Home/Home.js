import React from 'react';
import './Home.css';
import Account from '../Account/Account';
import DatetimePicker from '../DatetimePicker/DatetimePicker';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    return (
      <div className="Home" style={{textAlign: 'center'}}>
        <h1>Welcome{Account.getUsername() ? ' '+Account.getUsername() : ''} !</h1>
      </div>
    );
  }
}

export default Home;
