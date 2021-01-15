import React from 'react';
import './CcIndex.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/CcSimple/CcSimple';

function CcIndex(props) {
  return (
    <CcSimple>{props.value}</CcSimple>
  )
}

export default overridable(CcIndex);
