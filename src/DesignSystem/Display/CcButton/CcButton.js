import React from 'react';
import './CcButton.css';
import overridable from 'DesignSystem/overridable';

function CcButton(props) {
  return (
    <button {...props} className={'cc-button '+props.className}/>
  )
}

export default overridable(CcButton);
