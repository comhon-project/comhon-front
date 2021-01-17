import React from 'react';
import './CcForeignEdit.css';
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';
import overridable from 'DesignSystem/overridable';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';

class CcForeignEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false
    };
  }

  async componentDidMount() {
    await this.props.model.getModel();
    this.setState({
      isInitialized: true
    });
  }

  render() {
    return (
      this.state.isInitialized
      ? <ComhonComponentEdit {...this.props} model={this.props.model.getLoadedModel()} isForeign={true} />
      : <CcLoading/>
    )
  }
}

export default overridable(CcForeignEdit, true);
