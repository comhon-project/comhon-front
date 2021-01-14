import React from 'react';
import './CcFloat.css';
import overridable from 'DesignSystem/overridable';

function CcFloat(props) {
  return (
    <span className='cc-float'>{props.value}</span>
  )
}

export default overridable(CcFloat);
