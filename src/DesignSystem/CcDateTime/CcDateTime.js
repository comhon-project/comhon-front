import React from 'react';
import './CcDateTime.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/CcSimple/CcSimple';

function CcDateTime(props) {
  return (
    <CcSimple>{props.value.toLocaleDateString() + ' at ' + props.value.toLocaleTimeString()}</CcSimple>
  )
}

export default overridable(CcDateTime);
