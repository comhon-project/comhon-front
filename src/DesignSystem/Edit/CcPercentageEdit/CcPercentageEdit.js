import React from 'react';
import './CcPercentageEdit.css';
import overridable from 'DesignSystem/overridable';
import CcNumberEdit from 'DesignSystem/Edit/CcNumberEdit/CcNumberEdit';

class CcPercentageEdit extends React.Component {

  render() {
    return (
      <CcNumberEdit {...this.props} />
    )
  }
}

export default overridable(CcPercentageEdit, true);
