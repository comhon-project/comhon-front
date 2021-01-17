import React from 'react';
import './CcInheritanceEdit.css';
import overridable from 'DesignSystem/overridable';

function CcInheritanceEdit(props) {
  return (
    <span className='cce-inheritance'>{props.model.getName()}</span>
  )
}

export default overridable(CcInheritanceEdit, true);
