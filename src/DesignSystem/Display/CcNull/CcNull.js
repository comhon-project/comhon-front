import React from 'react';
import './CcNull.css';
import overridable from 'DesignSystem/overridable';

function CcNull(props) {
  return (
    <span className='cc-null'>{'<null>'}</span>
  )
}

export default overridable(CcNull);
