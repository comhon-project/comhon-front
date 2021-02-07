import React from 'react';
import './CcForeignObjectEdit.css';
import overridable from 'DesignSystem/overridable';
import ComhonException from 'Logic/Exception/ComhonException';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';
import CcForeignReqObjectEdit from '../CcForeignReqObjectEdit/CcForeignReqObjectEdit';
import CcForeignLocalObjectEdit from '../CcForeignLocalObjectEdit/CcForeignLocalObjectEdit';

class CcForeignObjectEdit extends React.Component {

  #isRequestable;

  constructor(props) {
    super(props);
    if (!this.props.model) {
      throw new ComhonException('missing required props.model');
    }
    this.state = {
      isInitialized: false
    }
  }
  
  async componentDidMount() {
    this.#isRequestable = await this.props.model.isRequestable();
    this.setState({
      isInitialized: true
    });
  }

  render() {
    return (
      this.state.isInitialized
        ? (this.#isRequestable 
          ? <CcForeignReqObjectEdit {...this.props}/> 
          : <CcForeignLocalObjectEdit {...this.props}/>)
        : <CcLoading/>

    )
  }
}

export default overridable(CcForeignObjectEdit, true);
