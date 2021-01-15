import React from 'react';
import './CcString.css';
import CcEmpty from 'DesignSystem/CcEmpty/CcEmpty';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/CcSimple/CcSimple';

function CcString(props) {
  return (
    props.value !== ''
    ? <CcSimple>{props.value}</CcSimple>
    : <CcEmpty/>
  )
}

export default overridable(CcString);
