import React from 'react';
import { withRouter } from 'react-router-dom';
import './CcObject.css';
import ComhonComponent from 'DesignSystem/ComhonComponent/ComhonComponent';
import ComhonConfig from 'Logic/Config/ComhonConfig';
import PageUtils from 'Page/Utils/PageUtils';
import CcButton from 'DesignSystem/CcButton/CcButton';
import CcProperty from 'DesignSystem/CcProperty/CcProperty';
import CcNull from 'DesignSystem/CcNull/CcNull';
import CcInheritance from 'DesignSystem/CcInheritance/CcInheritance';
import overridable from 'DesignSystem/overridable';

class CcObject extends React.Component {

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
    let componentValue = null;
    if (value === null) {
      componentValue = <CcNull/>;
    } else {
      const propertyModel = object.getModel().getProperty(propertyName).getLoadedModel();
      componentValue = <ComhonComponent value={value} model={propertyModel} />;
    }

    return (
      <div className="value" key={propertyName}>
        <CcProperty name={propertyName}/>
        {componentValue}
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
          <CcProperty name="inheritance"/>
          <CcInheritance model={object.getModel()}/>
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
      ? <CcButton className={this.state.isClickable ? 'foreign clickable' : 'foreign'} onClick={this.handleClick}>{this.props.value.getId()}</CcButton>
      : <div className={this.state.isClickable ? 'cc-object clickable' : 'cc-object'} onClick={this.handleClick}>
          {this.getPropertiesComponents(this.props.value)}
        </div>
    );
  }
}

export default withRouter(overridable(CcObject));
