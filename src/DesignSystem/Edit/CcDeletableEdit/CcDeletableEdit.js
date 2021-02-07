import React from 'react';
import './CcDeletableEdit.css';
import overridable from 'DesignSystem/overridable';
import CcButtonX from 'DesignSystem/Display/CcButtonX/CcButtonX';
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';
import SimpleModel from 'Logic/Model/SimpleModel';
import AbstractComhonObject from 'Logic/Object/AbstractComhonObject';
import ComhonArray from 'Logic/Object/ComhonArray';
import ForeignProperty from 'Logic/Model/Property/ForeignProperty';
import ModelForeign from 'Logic/Model/ModelForeign';
import Model from 'Logic/Model/Model';

class CcDeletableEdit extends React.Component {

  #isMultiLineDisplay;

  constructor(props) {
    super(props);
    this.#isMultiLineDisplay = this.isMultiLine();
    this.unsetValue = this.unsetValue.bind(this);
  }

  unsetValue() {
    if (this.props.unsetValue) {
      this.props.unsetValue(this.props.valueKey);
    }
  }

  isMultiLine() {
    if (this.props.model) {
      return !((this.props.model instanceof SimpleModel) 
          || ((this.props.model instanceof ModelForeign) 
              && (this.props.model.getContainedModelClassName() === 'Model'))
          || ((this.props.model instanceof Model) 
             && this.props.isForeign));
    }
    if (this.props.value !== null && this.props.value !== undefined) {
      if (this.props.value instanceof AbstractComhonObject) {
        if (this.props.value instanceof ComhonArray) {
          return true;
        } else {
          return !this.props.isForeign;
        }
      }
      return false;
    }
    if (this.props.parent) {
      if (this.props.parent instanceof ComhonArray) {
        return  !(
          this.props.parent.getModel().isContainedModelSimple()
          || (this.props.parent.getModel().getContainedModelClassName() === 'Model' && this.props.isForeign)
        );
      }
      if (this.props.valueKey) {
        const property = this.props.parent.getModel().getProperty(this.props.valueKey);
        if (!property.isComplex()) {
          return false;
        }
        if (property instanceof ForeignProperty && property.getLoadedModel().getContainedModelClassName() === 'Model') {
          return false;
        }
        return true;
      }
      
    }
    return false;
  }

  render() {
    let before = null;
    let after = null;

    if (this.#isMultiLineDisplay) {
      before = <CcButtonX onClick={this.unsetValue} />;
    } else {
      after = <CcButtonX onClick={this.unsetValue} />;
    }

    return (
      <span>
        {before}
        <ComhonComponentEdit {...this.props} unsetValue={undefined}/>
        {after}
      </span>
    );
  }
}

export default overridable(CcDeletableEdit, true);
