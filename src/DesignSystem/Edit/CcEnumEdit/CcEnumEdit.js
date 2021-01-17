import React from 'react';
import './CcEnumEdit.css';
import overridable from 'DesignSystem/overridable';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import ComhonException from 'Logic/Exception/ComhonException';

const interfacer = new ObjectInterfacer();

class CcEnumEdit extends React.Component {

  constructor(props) {
    super(props);
    if (!props.enum) {
      throw new ComhonException('missing required props.enum');
    }
    if (!props.model) {
      throw new ComhonException('missing required props.model');
    }
    this.state = {
      value: this.getInitialValue()
    };
    this.setValue = this.setValue.bind(this);
  }

  componentDidMount() {
    if (this.props.value === null || this.props.value === undefined) {
      this.setValue({target: {value: this.state.value}});
    }
  }

  getInitialValue() {
    if (this.props.value !== null && this.props.value !== undefined) {
      return this.props.value;
    }
    
    return this.props.default === null || this.props.default !== undefined ? this.props.enum[0] : this.props.default;
  }

  setValue(event) {
    try {
      const value = this.props.model.importValue(event.target.value, interfacer);
      if (this.props.setValue) {
        this.props.setValue(value, this.props.valueKey);
      }
      this.setState({value: value});
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const selectedValue = this.state.value;
    return (
      <select onChange={this.setValue} defaultValue={selectedValue}>
        {this.props.enum.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    )
  }
}

export default overridable(CcEnumEdit, true);
