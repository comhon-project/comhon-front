import React from 'react';
import './CcInteger.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/Display/CcSimple/CcSimple';

function CcInteger(props) {
  return (
    <CcSimple>{props.value}</CcSimple>
  )
}

export default overridable(CcInteger);
