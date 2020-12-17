import { overridable } from 'DesignSystem/overridable';
import React from 'react';
import './Button.css';

function Button(props) {
  return (
    <button className='co-button'>
      {props.children}
    </button>
  )
}

export default overridable(Button);
