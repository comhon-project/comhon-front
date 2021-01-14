import React from 'react';
import './CcIndex.css';
import overridable from 'DesignSystem/overridable';

function CcIndex(props) {
  return (
    <span className='cc-index'>{props.value}</span>
  )
}

export default overridable(CcIndex);
