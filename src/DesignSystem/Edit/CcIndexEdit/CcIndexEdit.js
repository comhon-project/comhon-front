import React from 'react';
import './CcIndexEdit.css';
import overridable from 'DesignSystem/overridable';
import CcNumberEdit from '../CcNumberEdit/CcNumberEdit';

class CcIndexEdit extends React.Component {

  render() {
    return (
      <CcNumberEdit {...this.props} />
    )
  }
}

export default overridable(CcIndexEdit, true);
