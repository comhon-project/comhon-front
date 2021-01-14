import React from 'react';
import './CcForeign.css';
import ComhonComponent from 'DesignSystem/ComhonComponent/ComhonComponent';
import overridable from 'DesignSystem/overridable';

function CcForeign(props) {
  return (
    <ComhonComponent {...props} model={props.model.getLoadedModel()} isForeign={true} />
  )
}

export default overridable(CcForeign);
