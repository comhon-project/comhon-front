import React from 'react';
import { withRouter } from 'react-router-dom';
import 'Details/Details.css';
import ComhonComponent from 'ComhonComponent/ComhonComponent';
import ComhonConfig from 'Logic/Config/ComhonConfig';
import PageUtils from 'Page/Utils/PageUtils';
import Button from 'DesignSystem/Button/Button';

class Details extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isClickable: false
    };
    this.getPropertiesComponents = this.getPropertiesComponents.bind(this);
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
    if (!this.props.isForeign || this.props.isRoot || !this.props.value.getModel().hasIdProperties()) {
      return;
    }
    if (await PageUtils.isRequestable(this.props.value.getModel())) {
        this.setState({isClickable: true});
    }
  }

  getValueComponent(object, propertyName) {
    const value = object.getValue(propertyName);
    const propertyModel = object.getModel().getProperty(propertyName).getLoadedModel();

    return (
      <div className="value" key={propertyName}>
        <span className="property">{propertyName} :</span>
        <ComhonComponent value={value} model={propertyModel} />
      </div>
    );
  }

  getPropertiesComponents(object) {
    const list = [];
    for (const keyAndvalue of object) {
      list.push(this.getValueComponent(object, keyAndvalue[0]));
    }
    if (object.getModel() !== this.props.model) {
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
    const apiModelName = ComhonConfig.hasApiModelNameHandler() 
      ? ComhonConfig.getApiModelNameHandler().getApiModelName(this.props.value.getModel().getName())
      : this.props.value.getModel().getName();
    const newPath = '/'+apiModelName+'/'+this.props.value.getId();
    if (!this.props.isRoot && this.props.location.pathname !== newPath) {
      this.props.history.push(newPath);
    }
  }

  render() {
    return (
      this.props.isForeign
      ? <Button className={this.state.isClickable ? 'foreign simple clickable' : 'foreign simple'} onClick={this.handleClick}>{this.props.value.getId()}</Button>
      : <div className={this.state.isClickable ? 'details clickable' : 'details'} onClick={this.handleClick}>
          {this.getPropertiesComponents(this.props.value)}
        </div>
    );
  }
}

export default withRouter(Details);
