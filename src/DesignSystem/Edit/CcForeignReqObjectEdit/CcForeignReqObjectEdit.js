import React from 'react';
import './CcForeignReqObjectEdit.css';
import overridable from 'DesignSystem/overridable';
import ComhonException from 'Logic/Exception/ComhonException';
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';
import CcStringEdit from '../CcStringEdit/CcStringEdit';
import ComhonRequester from 'Logic/Requester/ComhonRequester';
import MainObjectCollection from 'Logic/Object/Collection/MainObjectCollection';
import ComhonObject from 'Logic/Object/ComhonObject';
import CcError from 'DesignSystem/Display/CcError/CcError';

class CcForeignReqObjectEdit extends React.Component {

  constructor(props) {
    super(props);
    if (!this.props.model) {
      throw new ComhonException('missing required props.model');
    }
    this.state = {
      id: this.props.value ? this.props.value.getId() : null,
      error: null
    }
    this.setValue = this.setValue.bind(this);
  }

  async setValue(value) {
    let object = this.props.model.isMain() ? MainObjectCollection.getObject(value, this.props.model) : null;
    let removeOnFailure = false;
    if (object === null) {
      object = new ComhonObject(this.props.model);
      object.setId(value);
      removeOnFailure = object.getModel().isMain();
    }
    try {
      if (await ComhonRequester.loadObject(object)) {
        this.props.setValue(object, this.props.valueKey);
        this.setState({
          error: null
        });
      } else {
        if (removeOnFailure) {
          MainObjectCollection.removeObject(object);
        }
        this.setState({
          error: 'Not Found'
        });
      }
    } catch (error) {
      if (removeOnFailure) {
        MainObjectCollection.removeObject(object);
      }
      this.setState({
        error: error
      });
    }
  }

  render() {
    return (
      <span>
        {this.props.model.getIdProperties().length > 1
          ? <CcStringEdit value={this.state.id} setValue={this.setValue} delay={800}/>
          : <ComhonComponentEdit 
              value={this.state.id} 
              setValue={this.setValue}
              model={this.props.model.getUniqueIdProperty().getLoadedModel()}
              delay={800}
            />
        }
        {this.state.error ? <CcError error={this.state.error}/> : null}
      </span>
    )
  }
}

export default overridable(CcForeignReqObjectEdit, true);
