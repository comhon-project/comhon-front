import 'ComhonComponent/ComhonComponent.css';
import React from 'react';
import Details from 'Details/Details';
import List from 'List/List';

class ComhonComponent extends React.Component {

  static defaultProps = {
    isRoot: false,
    isForeign: false,
    isAggregation: false,
  };

  render() {
    if (this.props.value === null) {
      return <span className="simple null">null</span>
    }
    
    switch (this.props.model.getClassName()) {
      case 'ModelForeign':
        return <ComhonComponent {...this.props} model={this.props.model.getLoadedModel()} isForeign={true} />
      case 'Model':
        return <Details {...this.props}/>;
      case 'ModelArray':
        return <List {...this.props}/>;
      case 'integer':
      case 'index':
      case 'float':
      case 'string':
        return <span className="simple">{this.props.value}</span>
      case 'percentage':
        return <span className="simple">{(this.props.value * 100) + ' %'}</span>
      case 'dateTime':
        return <span className="simple">{this.props.value.toLocaleDateString() + ' at ' + this.props.value.toLocaleTimeString()}</span>
      case 'boolean':
        return this.props.value
          ? <span className="simple true">true</span>
          : <span className="simple false">false</span>
      default:
        throw new Error('invalid model '+this.props.model.getClassName());
    }
  }
}

export default ComhonComponent;
