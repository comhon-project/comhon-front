import React from 'react';
import './CcString.css';
import CcEmpty from 'DesignSystem/CcEmpty/CcEmpty';
import overridable from 'DesignSystem/overridable';

function CcString(props) {
  return (
    props.value !== ''
    ? <span className='cc-string'>{props.value}</span>
    : <CcEmpty/>
  )
}

export default overridable(CcString);
