import React from 'react';
import './CcDateTime.css';
import overridable from 'DesignSystem/overridable';

function CcDateTime(props) {
  return (
    <span className="cc-datetime">{props.value.toLocaleDateString() + ' at ' + props.value.toLocaleTimeString()}</span>
  )
}

export default overridable(CcDateTime);
