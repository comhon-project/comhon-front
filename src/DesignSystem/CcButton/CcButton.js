import React from 'react';
import './CcButton.css';
import overridable from 'DesignSystem/overridable';

function CcButton(props) {
  return (
    <button className='cc-button' {...props}>
      {props.children}
    </button>
  )
}

export default overridable(CcButton);
