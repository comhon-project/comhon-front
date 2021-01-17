import React from 'react';
import './CcBooleanEdit.css';
import overridable from 'DesignSystem/overridable';

class CcBooleanEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.value === true
    };
    this.setValue = this.setValue.bind(this);
  }

  setValue() {
    this.setState({
      checked: !this.state.checked
    });
    if (this.props.setValue) {
      this.props.setValue(this.state.checked, this.props.valueKey);
    }
  }

  render() {
    return (
      <input type="checkbox" onChange={this.setValue} checked={this.state.checked}/>
    )
  }
}

export default overridable(CcBooleanEdit, true);
