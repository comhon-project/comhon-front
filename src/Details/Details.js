import React from 'react';
import { withRouter } from 'react-router-dom';
import 'Details/Details.css';
import ComponentGenerator from 'ComponentGenerator/ComponentGenerator';
import ApiModelNameManager from 'Logic/Model/Manager/ApiModelNameManager';
import PageUtils from 'Page/Utils/PageUtils';

class Details extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isClickable: false
    };
    this.getComponentList = this.getComponentList.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setIsClickable();
  }

  async setIsClickable() {
    if (this.props.isAggregation) {
      this.setState({isClickable: true});
      return;
    }
    if (!this.props.isForeign || this.props.isRoot || !this.props.object.getModel().hasIdProperties()) {
      return;
    }
    if (await PageUtils.isRequestable(this.props.object.getModel())) {
        this.setState({isClickable: true});
    }
  }

  getValueComponent(object, propertyName) {
    const value = object.getValue(propertyName);
    const propertyModel = object.getModel().getProperty(propertyName).getLoadedModel();

    return (
      <div className="value" key={propertyName}>
        <span className="property">{propertyName} :</span>
        {ComponentGenerator.generate(value, propertyModel)}
      </div>
    );
  }

  getComponentList(object) {
    const list = [];
    for (const keyAndvalue of object) {
      list.push(this.getValueComponent(object, keyAndvalue[0]));
    }
    if (object.getModel() !== this.props.componentModel) {
      list.push(
        <div className="value" key="inheritance-">
          <span className="property">inheritance :</span>
          <span className="simple inheritance">{object.getModel().getName()}</span>
        </div>
      );
    }

    return list;
  }

  handleClick(event) {
    event.stopPropagation();
    if (!this.state.isClickable) {
      return;
    }
    let apiModelName = ApiModelNameManager.getApiModelName(this.props.object.getModel().getName());
    apiModelName = apiModelName ?? this.props.object.getModel().getName();
    const newPath = '/'+apiModelName+'/'+this.props.object.getId();
    if (!this.props.isRoot && this.props.location.pathname !== newPath) {
      this.props.history.push(newPath);
    }
  }

  render() {
    return (
      this.props.isForeign
      ? <span className={this.state.isClickable ? 'foreign simple clickable' : 'foreign simple'} onClick={this.handleClick}>{this.props.object.getId()}</span>
      : <div className={this.state.isClickable ? 'details clickable' : 'details'} onClick={this.handleClick}>
          {this.getComponentList(this.props.object)}
        </div>
    );
  }
}

export default withRouter(Details);
