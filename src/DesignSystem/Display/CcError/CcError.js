import React from 'react';
import './CcError.css';
import overridable from 'DesignSystem/overridable';
import ComhonException from 'Logic/Exception/ComhonException';

function CcError(props) {
  let error;

  if (props.error instanceof ComhonException) {
    error = props.error.getMessage();
  } else if (typeof props.error === 'string') {
    error = props.error;
  } else {
    console.log(props.error);
    error = 'unknown error';
  }
  return (
    <span className={'cc-error ' + props.className}>
      {error}
    </span>
  )
}

export default overridable(CcError);
