import React from 'react';
import './CcInheritance.css';
import overridable from 'DesignSystem/overridable';

function CcInheritance(props) {
  return (
    <span className='cc-inheritance'>{props.model.getName()}</span>
  )
}

export default overridable(CcInheritance);
