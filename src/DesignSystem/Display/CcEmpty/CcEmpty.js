import React from 'react';
import './CcEmpty.css';
import overridable from 'DesignSystem/overridable';

function CcEmpty(props) {
  return (
    <span className='cc-empty'>{'<empty>'}</span>
  )
}

export default overridable(CcEmpty);
