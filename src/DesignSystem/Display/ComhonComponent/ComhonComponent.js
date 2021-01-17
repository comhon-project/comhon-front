import './ComhonComponent.css';
import React from 'react';
import CcObject from 'DesignSystem/Display/CcObject/CcObject';
import CcArray from 'DesignSystem/Display/CcArray/CcArray';
import CcString from 'DesignSystem/Display/CcString/CcString';
import CcInteger from 'DesignSystem/Display/CcInteger/CcInteger';
import CcIndex from 'DesignSystem/Display/CcIndex/CcIndex';
import CcFloat from 'DesignSystem/Display/CcFloat/CcFloat';
import CcPercentage from 'DesignSystem/Display/CcPercentage/CcPercentage';
import CcNull from 'DesignSystem/Display/CcNull/CcNull';
import CcBoolean from 'DesignSystem/Display/CcBoolean/CcBoolean';
import CcDateTime from 'DesignSystem/Display/CcDateTime/CcDateTime';
import CcForeign from 'DesignSystem/Display/CcForeign/CcForeign';

class ComhonComponent extends React.Component {

  static defaultProps = {
    isRoot: false,
    isForeign: false,
    isAggregation: false,
  };

  render() {
    if (this.props.value === null) {
      return <CcNull/>
    }
    
    switch (this.props.model.getClassName()) {
      case 'ModelForeign':
        return <CcForeign {...this.props}/>;
      case 'Model':
        return <CcObject {...this.props}/>;
      case 'ModelArray':
        return <CcArray {...this.props}/>;
      case 'integer':
        return <CcInteger {...this.props}/>
      case 'index':
        return <CcIndex {...this.props}/>
      case 'float':
        return <CcFloat {...this.props}/>
      case 'string':
        return <CcString {...this.props}/>
      case 'percentage':
        return <CcPercentage {...this.props}/>
      case 'dateTime':
        return <CcDateTime {...this.props}/>
      case 'boolean':
        return <CcBoolean {...this.props}/>
      default:
        throw new Error('invalid model '+this.props.model.getClassName());
    }
  }
}

export default ComhonComponent;
