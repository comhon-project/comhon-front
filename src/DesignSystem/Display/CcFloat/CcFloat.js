import React from 'react';
import './CcFloat.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/Display/CcSimple/CcSimple';

function CcFloat(props) {
  return (
    <CcSimple>{props.value}</CcSimple>
  )
}

export default overridable(CcFloat);
