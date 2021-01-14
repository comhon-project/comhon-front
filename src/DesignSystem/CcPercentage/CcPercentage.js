import React from 'react';
import './CcPercentage.css';
import overridable from 'DesignSystem/overridable';

function CcPercentage(props) {
  return (
    <span className='cc-percentage'>{(props.value * 100) + ' %'}</span>
  )
}

export default overridable(CcPercentage);
