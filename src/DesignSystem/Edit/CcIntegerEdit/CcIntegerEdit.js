import React from 'react';
import './CcIntegerEdit.css';
import overridable from 'DesignSystem/overridable';
import CcNumberEdit from 'DesignSystem/Edit/CcNumberEdit/CcNumberEdit';

class CcIntegerEdit extends React.Component {

  render() {
    return (
      <CcNumberEdit {...this.props} />
    )
  }
}

export default overridable(CcIntegerEdit, true);
