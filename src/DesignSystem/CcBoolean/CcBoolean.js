import React from 'react';
import './CcBoolean.css';
import overridable from 'DesignSystem/overridable';


function CcBoolean(props) {
  return (
    props.value
      ? <span className="cc-boolean cc-true">true</span>
      : <span className="cc-boolean cc-false">false</span>
  )
}

export default overridable(CcBoolean);
