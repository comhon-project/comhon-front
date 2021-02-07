import React from 'react';
import './CcStringEdit.css';
import overridable from 'DesignSystem/overridable';
import CcError from 'DesignSystem/Display/CcError/CcError';
import CcEnumEdit from 'DesignSystem/Edit/CcEnumEdit/CcEnumEdit';
import Enum from 'Logic/Model/Restriction/Enum';

class CcStringEdit extends React.Component {

  #enum;
  timer = null;

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
    if (this.props.value === null || this.props.value === undefined) {
      this.setValue({target: {value: this.state.value}});
    }
  }

  getInitialValue() {
    if (this.props.value !== null && this.props.value !== undefined) {
      return this.props.value;
    }
    return this.props.default === null || this.props.default === undefined ? '' : this.props.default;
  }

  setValue(event) {
    const value = event.target.value;
    this.props.delay ? this.setValueAsync(value, this.props.delay) : this.setValueSync(value);
  }

  setValueSync(value) {
    try {
      this.setState({
        value: value,
        error: null
      });
      if (this.props.setValue) {
        this.props.setValue(value, this.props.valueKey);
      }
    } catch (error) {
      this.setState({
        error: error
      });
    }
  }

  async setValueAsync(value, delay) {
    try {
      this.setState({
        value: value,
        error: null
      });
      if (this.props.setValue) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.props.setValue(value, this.props.valueKey);
        }, delay);
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
