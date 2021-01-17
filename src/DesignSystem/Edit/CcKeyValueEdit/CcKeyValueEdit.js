import React from 'react';
import './CcKeyValueEdit.css';
import overridable from 'DesignSystem/overridable';
import CcError from 'DesignSystem/Display/CcError/CcError';
import CcStringEdit from '../CcStringEdit/CcStringEdit';
import CcButtonCheck from 'DesignSystem/Display/CcButtonCheck/CcButtonCheck';
import ComhonComponentEdit from '../ComhonComponentEdit/ComhonComponentEdit';
import CcProperty from 'DesignSystem/Display/CcProperty/CcProperty';

class CcKeyValueEdit extends React.Component {

  #key = '';
  #value;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isValidated: false,
    };
    this.validateKey = this.validateKey.bind(this);
    this.setKey = this.setKey.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  validateKey(updateValidatedStatus = true) {
    try {
      this.props.validateKey(this.#key);
      this.setState({
        error: null,
        isValidated: updateValidatedStatus ? true : this.state.isValidated,
      });
      if (this.props.setValue && updateValidatedStatus) {
        this.props.setValue(this.#value, this.#key);
      }
    } catch (error) {
      this.setState({
        error: error
      });
    }
  }

  setKey(key) {
    this.#key = key;
    if (this.#key !== '') {
      this.validateKey(false);
    }
  }

  setValue(value) {
    this.#value = value;
    if (this.state.isValidated) {
      if (this.props.setValue) {
        this.props.setValue(this.#value, this.#key)
      }
    } else if (this.props.parent) {
      this.props.parent.getModel().verifElementValue(this.#value);
    }
  }

  render() {
    return (
      <span>
        {this.state.isValidated
          ? <CcProperty name={this.#key}/>
          : <span>
            <CcStringEdit
              setValue={this.setKey}
            />
            <CcButtonCheck onClick={this.validateKey}/>
            {this.state.error ? <CcError error={this.state.error}/> : null}
            : 
          </span>}
        <ComhonComponentEdit {...this.props} setValue={this.setValue}/>
      </span>
    )
  }
}

export default overridable(CcKeyValueEdit, true);
