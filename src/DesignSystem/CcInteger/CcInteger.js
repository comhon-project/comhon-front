import React from 'react';
import './CcInteger.css';
import overridable from 'DesignSystem/overridable';

function CcInteger(props) {
  return (
    <span className='cc-integer'>{props.value}</span>
  )
}

export default overridable(CcInteger);
