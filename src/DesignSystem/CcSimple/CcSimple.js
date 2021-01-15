import React from 'react';
import './CcSimple.css';
import overridable from 'DesignSystem/overridable';

function CcSimple(props) {
  return (
    <span className={'cc-simple ' + props.className}>{props.children}</span>
  )
}

export default overridable(CcSimple);
