import React from 'react';
import './CcPercentage.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/Display/CcSimple/CcSimple';

function CcPercentage(props) {
  return (
    <CcSimple>{(props.value * 100) + ' %'}</CcSimple>
  )
}

export default overridable(CcPercentage);
