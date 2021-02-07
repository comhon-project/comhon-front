import React from 'react';
import './CcButtonActive.css';
import overridable from 'DesignSystem/overridable';
import CcButton from 'DesignSystem/Display/CcButton/CcButton';

class CcButtonActive extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isActivated: this.props.isActivated === true
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isActivated: !this.state.isActivated
    });
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const {isActivated, ...rest} = this.props;
    const className = this.state.isActivated 
      ? 'cc-button-active cc-button-active-activated ' + this.props.className
      : 'cc-button-active ' + this.props.className
    return (
      <CcButton {...rest} className={className} onClick={this.toggle}/>
    )
  }
}

export default overridable(CcButtonActive);
