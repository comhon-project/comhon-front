import React from 'react';
import './CcForeignLocalObjectEdit.css';
import overridable from 'DesignSystem/overridable';
import MainObjectCollection from 'Logic/Object/Collection/MainObjectCollection';
import CcError from 'DesignSystem/Display/CcError/CcError';
import ComhonException from 'Logic/Exception/ComhonException';
import ObjectCollection from 'Logic/Object/Collection/ObjectCollection';

class CcForeignLocalObjectEdit extends React.Component {

  #objectCollection;
  static #invalidKey = 'not-valid-key-7531594562580';

  constructor(props) {
    super(props);
    if (!this.props.model) {
      throw new ComhonException('missing required props.model');
    }
    this.#objectCollection = this.props.model.isMain() ? MainObjectCollection : this.props.objectCollection;
    this.state = {
      id: this.props.value ? this.props.value.getId() : null,
      existsRef: this.props.value && this.#objectCollection.hasObject(this.props.value.getId(), this.props.model)
    };
    this.setValue = this.setValue.bind(this);
  }

  get invalidKey() {
    return CcForeignLocalObjectEdit.#invalidKey;
  }

  setValue(event) {
    if (event.target.key !== this.invalidKey) {
      const value = this.props.model.hasUniqueIdProperty() && this.props.model.getUniqueIdProperty().getLoadedModel().castValue
        ? this.props.model.getUniqueIdProperty().getLoadedModel().castValue(event.target.value)
        : event.target.value;
      
      const object = this.#objectCollection.getObject(value, this.props.model);
      if (object === null) {
        alert('something goes wrong, object not found in collection');
        this.setState({
          id: event.target.value,
          existsRef: false
        });
      } else {
        if (this.props.setValue) {
          this.props.setValue(object, this.props.valueKey);
        }
        this.setState({
          id: object.getId(),
          existsRef: true
        });
      }
    }
  }

  render() {
    const model = ObjectCollection.getModelKey(this.props.model);
    const iterator = this.#objectCollection.getObjectsIterator(model.getName());
    const list = [];
    let error = null;
    
    if (!this.state.existsRef) {
      if (this.state.id !== null) {
        const id = this.props.value.getId();
        list.push(<option key={this.invalidKey} value={id}>{id}</option>);
        error = <CcError error={'reference doesn\'t exists'}/>
      } else {
        list.push(<option key={this.invalidKey} value=""></option>);
        error = <CcError error={'no selected value'}/>
      }
    }
    
    if (iterator !== null) {
      for (const object of iterator) {
        list.push(<option key={object.getId()} value={object.getId()}>{object.getId()}</option>);
      }
    }

    return (
      <span>
        <select onChange={this.setValue} defaultValue={this.state.id}>
          {list}
        </select>
        {error}
      </span>
    )
  }
}

export default overridable(CcForeignLocalObjectEdit, true);
