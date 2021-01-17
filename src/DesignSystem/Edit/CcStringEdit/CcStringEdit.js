import React from 'react';
import './CcStringEdit.css';
import overridable from 'DesignSystem/overridable';
import CcError from 'DesignSystem/Display/CcError/CcError';
import CcEnumEdit from '../CcEnumEdit/CcEnumEdit';
import Enum from 'Logic/Model/Restriction/Enum';
import Utils from 'Logic/Utils/Utils';

class CcStringEdit extends React.Component {

  #enum;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      value: this.getInitialValue()
    };
    if (props.restrictions) {
      for (let index = 0; index < props.restrictions.length; index++) {
        if (props.restrictions[index] instanceof Enum) {
          this.#enum = props.restrictions[index].getEnum();
        }
      }
    }
    this.setValue = this.setValue.bind(this);
  }

  componentDidMount() {
    if (Utils.isNil(this.props.value)) {
      this.setValue({target: {value: this.state.value}});
    }
  }

  getInitialValue() {
    if (!Utils.isNil(this.props.value)) {
      return this.props.value;
    }
    return Utils.isNil(this.props.default) ? '' : this.props.default;
  }

  setValue(event) {
    try {
      this.setState({
        value: event.target.value,
        error: null
      });
      if (this.props.setValue) {
        this.props.setValue(event.target.value, this.props.valueKey);
      }
    } catch (error) {
      this.setState({
        error: error
      });
    }
  }

  render() {
    return (
      this.#enum
      ? <CcEnumEdit enum={this.#enum} {...this.props}/>
      : <span>
        <input 
          type="text" 
          onChange={this.setValue} 
          value={this.state.value} 
        />
        {this.state.error ? <CcError error={this.state.error}/> : null}
      </span>
    )
  }
}

export default overridable(CcStringEdit, true);
