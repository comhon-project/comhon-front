import React from 'react';
import './CcArrayEdit.css';
import overridable from 'DesignSystem/overridable';
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';
import CcError from 'DesignSystem/Display/CcError/CcError';
import CcButtonPlus from 'DesignSystem/Display/CcButtonPlus/CcButtonPlus';
import ComhonException from 'Logic/Exception/ComhonException';
import CcArrayKeyValueEdit from 'DesignSystem/Edit/CcArrayKeyValueEdit/CcArrayKeyValueEdit';
import CcProperty from 'DesignSystem/Display/CcProperty/CcProperty';

class CcArrayEdit extends React.Component {

  #currentKey = 0;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      comhonArray: this.props.value ?? this.props.model.getObjectInstance(),
      components: new Map(),
      isAdding: false
    };
    this.state.error = this.validate();

    this.getComponentList = this.getComponentList.bind(this);
    this.getValueComponent = this.getValueComponent.bind(this);
    this.getValueToAddComponent = this.getValueToAddComponent.bind(this);
    this.addElement = this.addElement.bind(this);
    this.validate = this.validate.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.setElementValue = this.setElementValue.bind(this);
    this.unsetElementValue = this.unsetElementValue.bind(this);
  }

  componentDidMount() {
    // if this.props.value is null we must set value on parent
    if (!this.props.value && this.props.setValue) {
      this.props.setValue(this.state.comhonArray, this.props.valueKey);
    }
  }

  validate() {
    let error = null;
    try {
      this.state.comhonArray.validate();
    } catch (e) {
      error = e;
    }
    return error;
  }

  setElementValue(value, key) {
    if (key === null) {
      if (this.state.comhonArray.getModel().isAssociative()) {
        throw new ComhonException('missing key, cannot set ComhonArray value');
      }
      this.state.comhonArray.pushValue(value);
      this.validate();
      this.setState({
        error: this.validate(),
        isAdding: false
      });
    } else {
      const resetAdding = !this.state.comhonArray.hasValue(key);
      this.state.comhonArray.setValue(key, value);
      if (resetAdding) {
        this.setState({
          error: this.validate(),
          isAdding: false
        });
      }
    }
  }

  unsetElementValue(key) {
    this.state.comhonArray.unsetValue(key);
    this.setState({
      error: this.validate()
    });
  }

  getValueComponent(object, valueKey) {
    const value = object.getValue(valueKey);
    const elementModel = object.getModel().isNotNullElement() ? object.getModel().getLoadedModel() : null;

    return <ComhonComponentEdit 
      value={value} 
      model={elementModel} 
      isForeign={this.props.isForeign} 
      isAggregation={this.props.isAggregation}
      parent={object} 
      valueKey={valueKey}
      setValue={this.setElementValue}
      unsetValue={this.unsetElementValue}
      isNull={value === null && object.hasValue(valueKey)} 
      isNullable={!object.getModel().isNotNullElement()}
      isIsolated={object.getModel().isIsolatedElement()}
      default={null}
      restrictions={object.getModel().getElementRestrictions()}
      objectCollection={this.props.objectCollection}
      refresh={this.props.refresh}
    />
  }

  validateKey(value) {
    if (typeof value !== 'string') {
      throw new ComhonException(`key must be a string, ${typeof value} given`);
    }
    if (value === '') {
      throw new ComhonException(`key must be not empty`);
    }
    if (this.state.comhonArray.hasValue(value)) {
      throw new ComhonException(`key '${value}' already exists`);
    }
    
    return true;
  }

  getValueToAddComponent(object) {
    const elementModel = object.getModel().getLoadedModel();

    const isComplex = !object.getModel().isContainedModelSimple();
    const isAssociative = object.getModel().isAssociative();
    const componentKey = --this.#currentKey;
    let component;

    if (isAssociative) {
      component = <CcArrayKeyValueEdit
        validateKey={this.validateKey} 
        model={elementModel} 
        isForeign={this.props.isForeign} 
        isAggregation={this.props.isAggregation}
        parent={object} 
        setValue={this.setElementValue}
        isNull={false} 
        isNullable={!object.getModel().isNotNullElement()}
        isIsolated={object.getModel().isIsolatedElement()}
        default={null}
        restrictions={object.getModel().getElementRestrictions()}
        objectCollection={this.props.objectCollection}
        refresh={this.props.refresh}
      />
    } else {
      component = <div>
        <span>. </span>
        {this.getValueComponent(object, null)}
      </div>
    }
    
    return <div key={componentKey}>
      {isComplex ? <div className="separator"/> : null}
      {component}
    </div>
  }

  getComponentList(object) {
    const isComplex = !object.getModel().isContainedModelSimple();
    const isAssociative = object.getModel().isAssociative();
    const list = [];
    
    for (const [key, value] of object) {
      const componentKey = isComplex && value ? value.getOid() : --this.#currentKey;
      
      list.push(
        <div key={componentKey}>
          {isComplex ? <div className="separator"/> : null}
          {isComplex ? null : (isAssociative ? <CcProperty name={key}/> : '. ')}
          {this.getValueComponent(object, key)}
        </div>
      );
    }

    return list;
  }

  async addElement() {
    // ensure model is loaded
    await this.props.model.getModel();
    this.setState({
      isAdding: true
    });
  }

  render() {
    if (this.state.comhonArray === null) {
      return <span>Loading...</span>;
    }
    const isComplex = !this.state.comhonArray.getModel().isContainedModelSimple();

    return (
      <div>
        <div className={isComplex ? 'complexList' : 'simpleList'}>
          {this.getComponentList(this.state.comhonArray)}
          {this.state.isAdding
            ? this.getValueToAddComponent(this.state.comhonArray)
            : <CcButtonPlus onClick={this.addElement}/>}
        </div>
        {this.state.error ? <CcError error={this.state.error}/> : null}
      </div>
    );
  }
}

export default overridable(CcArrayEdit, true);
