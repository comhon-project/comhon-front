import React from 'react';
import './CcArray.css';
import overridable from 'DesignSystem/overridable';
import ComhonArray from 'Logic/Object/ComhonArray';
import Model from 'Logic/Model/Model';
import ModelArray from 'Logic/Model/ModelArray';
import ComhonComponent from 'DesignSystem/Display/ComhonComponent/ComhonComponent';
import CcEmpty from 'DesignSystem/Display/CcEmpty/CcEmpty';

class CcArray extends React.Component {

  constructor(props) {
    super(props);
    this.getComponentList = this.getComponentList.bind(this);
    this.getValueComponent = this.getValueComponent.bind(this);
  }

  getValueComponent(object, key, useKeyId) {
    const value = object.getValue(key);
    const elementModel = object.getModel().getLoadedModel();
    const componentKey = useKeyId && value.getId() !== null ? value.getId() : key;
    const isComplex = elementModel instanceof ModelArray || elementModel instanceof Model;

    return (
      <div key={componentKey}>
        {isComplex ? <div className="separator"/> : null}
        {isComplex ? null : (object.getModel().isAssociative() ? `${key} : ` : '- ')}
        <ComhonComponent value={value} model={elementModel} isForeign={this.props.isForeign} isAggregation={this.props.isAggregation}/>
      </div>
    );
  }

  getComponentList(object) {
    const useKeyId = object instanceof ComhonArray && object.getModel().getLoadedModel() instanceof Model
      && object.getModel().getLoadedModel().hasIdProperties();
    const list = [];
    for (const keyAndvalue of object) {
      list.push(this.getValueComponent(object, keyAndvalue[0], useKeyId));
    }

    return list;
  }

  render() {
    const isComplex = this.props.value
      && (this.props.value.getModel().getLoadedModel() instanceof ModelArray
      || this.props.value.getModel().getLoadedModel() instanceof Model);

    return (
      this.props.value.count() > 0
      ? <div className={isComplex ? 'complexList' : 'simpleList'}>
          {this.getComponentList(this.props.value)}
        </div>
      : (this.props.isRoot
          ? <span style={{fontSize: '30px'}}>no results</span>
          : <CcEmpty/>
        )
    );
  }
}

export default overridable(CcArray);
