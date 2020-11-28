import 'ComponentGenerator/ComponentGenerator.css';
import Details from 'Details/Details';
import List from 'List/List';
import ModelForeign from 'Logic/Model/ModelForeign';

class ComponentGenerator {

  static generate(value, valueModel, isForeign = false, isAggregation = false, isRoot = false) {
    if (value === null) {
      return <span className="simple null">null</span>
    }
    if (valueModel instanceof ModelForeign) {
      valueModel = valueModel.getLoadedModel();
      isForeign = true;
    }
    switch (valueModel.getClassName()) {
      case 'Model':
        return <Details object={value} componentModel={valueModel} isRoot={isRoot} isForeign={isForeign} isAggregation={isAggregation}/>;
      case 'ModelArray':
        return <List object={value} componentModel={valueModel} isRoot={isRoot} isForeign={isForeign} isAggregation={isAggregation}/>;
      case 'integer':
      case 'index':
      case 'float':
      case 'string':
        return <span className="simple">{value}</span>
      case 'percentage':
        return <span className="simple">{(value * 100) + ' %'}</span>
      case 'dateTime':
        return <span className="simple">{value.toLocaleDateString() + ' at ' + value.toLocaleTimeString()}</span>
      case 'boolean':
        return value
          ? <span className="simple true">true</span>
          : <span className="simple false">false</span>
      default:
        throw new Error('invalid model '+valueModel.getClassName());
    }
  }
}

export default ComponentGenerator;
