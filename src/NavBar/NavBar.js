import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';
import Account from '../Account/Account.js';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.getListModels = this.getListModels.bind(this);
  }

  getListModels(parent, childrenMap) {
    let children = [];
    var i = 0;
    if (parent === null) {
      childrenMap = {};
      for (i = 0; i < this.props.models.length; i++) {
        let currentModel = this.props.models[i];
        if (typeof currentModel.extends !== 'undefined') {
          for (var j = 0; j < currentModel.extends.length; j++) {
            if (typeof childrenMap[currentModel.extends[j]] === 'undefined') {
              childrenMap[currentModel.extends[j]] = [];
            }
            childrenMap[currentModel.extends[j]].push(i);
          }
        } else {
          children.push(i);
        }
      }
    } else {
      children = childrenMap[parent];
    }
    let list = [];
    for (i = 0; i < children.length; i++) {
      let modelIndex = children[i];
      let modelInfos = this.props.models[modelIndex];
      if (typeof childrenMap[modelInfos.comhon_model_name] !== 'undefined') {
        list.push(
          <li className="dropdown-submenu dropright" key={modelInfos.comhon_model_name}>
            <div>
                <Link className="dropdown-item" to={"/"+modelInfos.api_model_name}>{modelInfos.api_model_name}</Link>
            </div>
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              {this.getListModels(modelInfos.comhon_model_name, childrenMap)}
            </ul>
          </li>
        );
      } else {
          list.push(
            <li key={modelInfos.comhon_model_name}>
              <Link className="dropdown-item" to={"/"+modelInfos.api_model_name}>{modelInfos.api_model_name}</Link>
            </li>
          );
      }
    }
    return list;
  }

  render() {
    const dropDownModelsClass = this.props.appInitialized ? "nav-link dropdown-toggle" : "nav-link dropdown-toggle disabled";
    return (
      <div>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
        <span className="navbar-brand">Comhon!</span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            <li className="nav-item dropdown">
              <div className={dropDownModelsClass} id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Models
              </div>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                {this.getListModels(null, null)}
              </ul>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              {this.props.logged ? <span className="nav-link">{Account.getUsername()}</span> : <Link className="nav-link" to="/login">Login</Link>}
            </li>
          </ul>
        </div>
      </nav>
      </div>
    );
  }
}

export default NavBar;
