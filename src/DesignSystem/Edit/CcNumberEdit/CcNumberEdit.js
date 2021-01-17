import React from 'react';
import './CcNumberEdit.css';
import overridable from 'DesignSystem/overridable';
import Interval from 'Logic/Model/Restriction/Interval';
import ModelInteger from 'Logic/Model/ModelInteger';
import Enum from 'Logic/Model/Restriction/Enum';
import CcEnumEdit from '../CcEnumEdit/CcEnumEdit';
import CcError from 'DesignSystem/Display/CcError/CcError';


class CcNumberEdit extends React.Component {

  #step = 1;
  #interval = null;
  #enum = null;

  constructor(props) {
    super(props);
    if (props.restrictions) {
      for (let index = 0; index < props.restrictions.length; index++) {
        if (props.restrictions[index] instanceof Interval) {
          this.setNumberSettings(props.restrictions[index], props.model);
        }
        if (props.restrictions[index] instanceof Enum) {
          this.#enum = props.restrictions[index].getEnum();
        }
      }
    }
    this.state = {
      error: null,
      value: this.getInitialValue()
    };
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
    let value;
    if (this.props.default !== null && this.props.default !== undefined) {
      value = this.props.default;
    } else if (this.#interval && this.#interval.getLeftEndPoint() !== null) {
      value = this.#interval.getLeftEndPoint();
      if (!this.#interval.isLeftClosed()) {
        value += this.#step;
      }
    } else if (this.#interval && this.#interval.getRightEndPoint() !== null) {
      value = this.#interval.getRightEndPoint();
      if (!this.#interval.isRightClosed()) {
        value += this.#step;
      }
    } else {
      value = 0;
    }
    return value;
  }

  setNumberSettings(interval, model) {
    this.#interval = interval;
    if (this.#interval.getLeftEndPoint() !== null && this.#interval.getRightEndPoint() !== null) {
      const value = Math.abs(this.#interval.getRightEndPoint() - this.#interval.getLeftEndPoint());
      let temp = value;
      while (temp >= 10) {
        this.#step *=10;
        temp /=10;
      }
      while (temp < 1) {
        this.#step /=10;
        temp *=10;
      }
      this.#step /=10;
      if (this.#step < 1 && model instanceof ModelInteger) {
        this.#step = 1;
      }
    }
  }

  setValue(event) {
    try {
      const castedValue = Number(event.target.value);
      this.setState({
        value: castedValue,
        error: null
      });
      if (this.props.setValue) {
        this.props.setValue(castedValue, this.props.valueKey);
      }
    } catch (error) {
      this.setState({
        error: error
      });
    }
  }

  render() {
    const min = this.#interval ? this.#interval.getLeftEndPoint() : null;
    const max = this.#interval ? this.#interval.getRightEndPoint() : null;
    return (
      this.#enum
      ? <CcEnumEdit enum={this.#enum} {...this.props}/>
      : <span>
        <input 
          type="number" 
          onChange={this.setValue} 
          value={this.state.value} 
          min={min} 
          max={max} 
          step={this.#step} 
        />
        {this.state.error ? <CcError error={this.state.error}/> : null}
      </span>
    )
  }
}

export default overridable(CcNumberEdit, true);
