import React from 'react';
import { withRouter } from 'react-router-dom';
import './CcObject.css';
import ComhonComponent from 'DesignSystem/Display/ComhonComponent/ComhonComponent';
import ComhonConfig from 'Logic/Config/ComhonConfig';
import PageUtils from 'Page/Utils/PageUtils';
import CcButton from 'DesignSystem/Display/CcButton/CcButton';
import CcProperty from 'DesignSystem/Display/CcProperty/CcProperty';
import CcNull from 'DesignSystem/Display/CcNull/CcNull';
import CcInheritance from 'DesignSystem/Display/CcInheritance/CcInheritance';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/Display/CcSimple/CcSimple';

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
      <div className="cc-property-value" key={propertyName}>
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
        <div className="cc-property-value" key="inheritance-">
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
      ? (this.state.isClickable 
        ? <CcButton onClick={this.handleClick}><CcSimple>{this.props.value.getId()}</CcSimple></CcButton>
        : <CcSimple>{this.props.value.getId()}</CcSimple>)
      : <div className={this.state.isClickable ? 'cc-object cc-clickable' : 'cc-object'} onClick={this.handleClick}>
          {this.getPropertiesComponents(this.props.value)}
        </div>
    );
  }
}

export default withRouter(overridable(CcObject));
