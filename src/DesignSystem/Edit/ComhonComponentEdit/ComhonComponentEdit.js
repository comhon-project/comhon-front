import './ComhonComponentEdit.css';
import React from 'react';
import CcObjectEdit from 'DesignSystem/Edit/CcObjectEdit/CcObjectEdit';
import CcArrayEdit from 'DesignSystem/Edit/CcArrayEdit/CcArrayEdit';
import CcStringEdit from 'DesignSystem/Edit/CcStringEdit/CcStringEdit';
import CcIntegerEdit from 'DesignSystem/Edit/CcIntegerEdit/CcIntegerEdit';
import CcIndexEdit from 'DesignSystem/Edit/CcIndexEdit/CcIndexEdit';
import CcFloatEdit from 'DesignSystem/Edit/CcFloatEdit/CcFloatEdit';
import CcPercentageEdit from 'DesignSystem/Edit/CcPercentageEdit/CcPercentageEdit';
import CcBooleanEdit from 'DesignSystem/Edit/CcBooleanEdit/CcBooleanEdit';
import CcDateTimeEdit from 'DesignSystem/Edit/CcDateTimeEdit/CcDateTimeEdit';
import CcForeignEdit from 'DesignSystem/Edit/CcForeignEdit/CcForeignEdit';
import CcNullAbleEdit from 'DesignSystem/Edit/CcNullAbleEdit/CcNullAbleEdit';
import CcDeletableEdit from 'DesignSystem/Edit/CcDeletableEdit/CcDeletableEdit';
import CcForeignObjectEdit from 'DesignSystem/Edit/CcForeignObjectEdit/CcForeignObjectEdit';

class ComhonComponentEdit extends React.Component {

  static defaultProps = {
    isRoot: false,
    isForeign: false,
    isAggregation: false,
  };

  render() {
    if (this.props.unsetValue) {
      return <CcDeletableEdit {...this.props}/>;
    }
    if (this.props.isNullable) {
      return <CcNullAbleEdit {...this.props}/>;
    }
    switch (this.props.model.getClassName()) {
      case 'ModelForeign':
        return <CcForeignEdit {...this.props}/>;
      case 'Model':
        return this.props.isForeign
          ? <CcForeignObjectEdit {...this.props}/>
          : <CcObjectEdit {...this.props}/>;
      case 'ModelArray':
        return <CcArrayEdit {...this.props}/>;
      case 'integer':
        return <CcIntegerEdit {...this.props}/>
      case 'index':
        return <CcIndexEdit {...this.props}/>
      case 'float':
        return <CcFloatEdit {...this.props}/>
      case 'string':
        return <CcStringEdit {...this.props}/>
      case 'percentage':
        return <CcPercentageEdit {...this.props}/>
      case 'dateTime':
        return <CcDateTimeEdit {...this.props}/>
      case 'boolean':
        return <CcBooleanEdit {...this.props}/>
      default:
        throw new Error('invalid model '+this.props.model.getClassName());
    }
  }
}

export default ComhonComponentEdit;
