import React from 'react';
import './CcNullAbleEdit.css';
import overridable from 'DesignSystem/overridable';
import ComhonComponentEdit from '../ComhonComponentEdit/ComhonComponentEdit';
import CcButtonActive from 'DesignSystem/Display/CcButtonActive/CcButtonActive';
import ComhonException from 'Logic/Exception/ComhonException';
import ComhonArray from 'Logic/Object/ComhonArray';
import ComhonObject from 'Logic/Object/ComhonObject';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';
import SimpleModel from 'Logic/Model/SimpleModel';
import ModelForeign from 'Logic/Model/ModelForeign';
import Model from 'Logic/Model/Model';

class CcNullAbleEdit extends React.Component {

  #value;
  #model;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isInitialized: false,
      isNull: props.isNull === true
    };
    if (props.model) {
      this.#model = props.model;
    }
    this.#value = props.value;
    this.toggle = this.toggle.bind(this);
    this.setModel = this.setModel.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  async componentDidMount() {
    if (!this.#model && !this.state.isNull) {
      await this.setModel();
    }
    this.setState({
      isInitialized: true
    });
  }

  async setModel() {
    // if props.value is null, model may not be loaded
    if (this.props.parent) {
      if (this.props.parent instanceof ComhonArray) {
        this.#model =  await this.props.parent.getModel().getModel();
      } else if (this.props.parent instanceof ComhonObject) {
        if (!this.props.valueKey) {
          throw new ComhonException('missing required props.valueKey');
        }
        if (!this.props.parent.getModel().hasProperty(this.props.valueKey)) {
          throw new ComhonException(`props.valueKey '${this.props.valueKey}' is not a property name of parent object`);
        }
        this.#model = await this.props.parent.getModel().getProperty(this.props.valueKey).getModel();
      } else {
        throw new ComhonException(
          'invalid props.parent, must be ComhonArray or ComhonObject'
        );
      }
    } else {
      throw new ComhonException('missing required props.model or props.parent');
    }
  }

  async toggle() {
    if (this.props.setValue) {
      if (this.state.isNull) {
        this.props.setValue(this.#value, this.props.valueKey);
      } else {
        this.props.setValue(null, this.props.valueKey);
      }
    }
    // value will be set (not null) so we have to ensure that model is loaded
    if (!this.#model) {
      await this.setModel();
    }
    this.setState({
      isNull: !this.state.isNull
    });
  }

  setValue(value, key) {
    this.#value = value;
    if (this.props.setValue) {
      this.props.setValue(value, key)
    }
  }

  render() {
    if (!this.state.isInitialized) {
      return <CcLoading/>;
    }
    if (this.state.isNull) {
      return (
        <CcButtonActive isActivated={this.state.isNull} onClick={this.toggle}>
          null
        </CcButtonActive>
      );
    }
    let before = null;
    let after = null;
    const nullButton = <CcButtonActive isActivated={this.state.isNull} onClick={this.toggle}>
      null
    </CcButtonActive>

    if (
      this.#model instanceof SimpleModel 
      || (
        this.#model instanceof ModelForeign
        && this.#model.getContainedModelClassName() === 'Model'
      ) || (
        this.#model instanceof Model
        && this.props.isForeign
      )
    ) {
      after = nullButton;
    } else {
      before = nullButton;
    }
    
    return (
      <span>
        {before}
        <ComhonComponentEdit
          {...this.props}
          setValue={this.setValue}
          model={this.#model}
          value={this.#value}
          isNullable={false}
        />
        {after}
      </span>
    )
  }
}

export default overridable(CcNullAbleEdit, true);
