import React from 'react';
import './CcProperty.css';
import overridable from 'DesignSystem/overridable';

function CcProperty(props) {
  return (
    <span className='cc-property'>{props.name} :</span>
  )
}

export default overridable(CcProperty);
