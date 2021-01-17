import React from 'react';
import { withRouter } from 'react-router-dom';
import './CcObjectEdit.css';
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';
import CcProperty from 'DesignSystem/Display/CcProperty/CcProperty';
import overridable from 'DesignSystem/overridable';
import ObjectCollectionBuilder from 'Logic/Object/Collection/ObjectCollectionBuilder';
import ComhonObject from 'Logic/Object/ComhonObject';
import CcError from 'DesignSystem/Display/CcError/CcError';
import CcButtonPlus from 'DesignSystem/Display/CcButtonPlus/CcButtonPlus';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';

class CcObjectEdit extends React.Component {

  #objectCollection;
  #refresh;
  #valuesToAddRef;

  constructor(props) {
    super(props);

    this.state = {
      initialized: false,
      error: null,
      object: this.props.value ?? new ComhonObject(this.props.model),
      ccValues: new Map()
    };
    this.state.error = this.validate();

    if (this.props.isRoot === true || this.props.isIsolated === true) {
      this.#objectCollection = ObjectCollectionBuilder.build(this.state.object);
      this.#refresh = this.refresh;
    } else {
      this.#objectCollection = this.props.objectCollection;
      this.#refresh = this.props.refresh;
    }
    this.#valuesToAddRef = React.createRef();

    this.getPropertiesComponents = this.getPropertiesComponents.bind(this);
    this.refresh = this.refresh.bind(this);
    this.setPropertyValue = this.setPropertyValue.bind(this);
    this.unsetPropertyValue = this.unsetPropertyValue.bind(this);
    this.getValuesToAddComponnent = this.getValuesToAddComponnent.bind(this);
    this.addValue = this.addValue.bind(this);
    this.validate = this.validate.bind(this);
  }

  async componentDidMount() {
    if (!this.props.value && this.props.setValue) {
      this.props.setValue(this.state.object, this.props.valueKey);
    }
    if (this.props.model.getRequiredProperties().length > 0) {
      const promises = [];
      for (const property of this.props.model.getRequiredProperties()) {
        if (!property.isContainedModelLoaded()) {
          promises.push(property.getModel());
        }
      }
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }
    this.setState({
      initialized: true
    });

    this.setState({
      ccValues: this.getPropertiesComponents(this.state.object),
      initialized: true
    });
  }

  validate() {
    let error = null;
    try {
      this.state.object.validate();
    } catch (e) {
      error = e;
    }
    return error;
  }

  getValueComponent(object, propertyName) {
    const value = object.getValue(propertyName);
    const property = object.getModel().getProperty(propertyName);
    const propertyModel = property.isNotNull() 
      ? object.getModel().getProperty(propertyName).getLoadedModel() 
      : null;
    
    const componentValue = <ComhonComponentEdit 
      value={value} 
      model={propertyModel}
      parent={object} 
      valueKey={propertyName}
      setValue={this.setPropertyValue}
      unsetValue={property.isRequired() ? undefined : this.unsetPropertyValue}
      isNullable={!property.isNotNull()}
      isForeign={property.isForeign()}
      isNull={value === null && object.hasValue(propertyName)} 
      isIsolated={property.isIsolated()}
      default={property.getDefaultValue()}
      restrictions={property.getRestrictions()}
      objectCollection={this.#objectCollection}
      refresh={this.#refresh}
    />;

    return (
      <div className="cce-property-value" key={propertyName}>
        <CcProperty name={propertyName}/>
        {componentValue}
      </div>
    );
  }

  getPropertiesComponents(object) {
    const ccValues = new Map();
    for (const keyAndvalue of object) {
      ccValues.set(keyAndvalue[0], this.getValueComponent(object, keyAndvalue[0]));
    }
    for (const property of object.getModel().getProperties()) {
      if (property.isRequired() && !object.hasValue(property.getName())) {
        ccValues.set(property.getName(), this.getValueComponent(object, property.getName()));
      }
    }

    return ccValues;
  }

  getValuesToAddComponnent() {
    if (this.state.ccValues.size === this.state.object.getModel().getProperties().length) {
      return null;
    }
    const names = [];
    for (const property of this.state.object.getModel().getProperties()) {
      if (!this.state.ccValues.has(property.getName())) {
        names.push(property.getName());
      }
    }

    return <div>
      <select onChange={this.setValue} defaultValue={names[0]} ref={this.#valuesToAddRef}>
        {names.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <CcButtonPlus onClick={this.addValue}/>
    </div>
  }
            
  async addValue() {
    // ensure model property is loaded if value is not nullable
    const property = this.state.object.getModel().getProperty(this.#valuesToAddRef.current.value)
    if (property.isNotNull()) {
      await property.getModel();
    }
    this.state.ccValues.set(
      property.getName(), 
      this.getValueComponent(this.state.object, property.getName())
    );
    this.setState({
      ccValues: this.state.ccValues
    });
  }

  setPropertyValue(value, propertyName) {
    const refresh = !this.state.object.hasValue(propertyName);
    this.state.object.setValue(propertyName, value);

    if (refresh) {
      const error = this.validate();
      if (this.state.error !== error) {
        this.setState({
          error: error
        });
      }
    }
  }

  unsetPropertyValue(propertyName) {
    this.state.object.unsetValue(propertyName);
    this.state.ccValues.delete(propertyName);

    this.setState({
      error: this.validate()
    });
  }

  refresh() {
    this.setState({object: this.state.object});
  }

  render() {
    // TODO display inheritance and handle cast
    if (!this.state.initialized) {
      return <CcLoading/>
    }
    const list = [];
    for (const keyAndValue of this.state.ccValues) {
      list.push(keyAndValue[1]);
    }
    return (
      this.props.isForeign
        ? <span>{this.state.object.getId()}...</span>
        : <div className="cce-object">
            {list}
            {this.state.error ? <CcError error={this.state.error}/> : null}
            {this.getValuesToAddComponnent()}
          </div>
    );
  }
}

export default withRouter(overridable(CcObjectEdit, true));
