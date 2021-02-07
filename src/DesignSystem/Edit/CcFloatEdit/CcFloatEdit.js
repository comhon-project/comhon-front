import React from 'react';
import './CcFloatEdit.css';
import overridable from 'DesignSystem/overridable';
import CcNumberEdit from 'DesignSystem/Edit/CcNumberEdit/CcNumberEdit';

class CcFloatEdit extends React.Component {

  render() {
    return (
      <CcNumberEdit {...this.props} />
    )
  }
}

export default overridable(CcFloatEdit, true);
