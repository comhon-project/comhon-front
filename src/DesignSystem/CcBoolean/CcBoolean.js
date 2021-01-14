import React from 'react';
import './CcBoolean.css';
import overridable from 'DesignSystem/overridable';
import CcSimple from 'DesignSystem/CcSimple/CcSimple';


function CcBoolean(props) {
  return (
    props.value
      ? <CcSimple className="cc-true">true</CcSimple>
      : <CcSimple className="cc-false">false</CcSimple>
  )
}

export default overridable(CcBoolean);
