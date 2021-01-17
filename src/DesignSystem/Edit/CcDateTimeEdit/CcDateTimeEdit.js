import React from 'react';
import './CcDateTimeEdit.css';
import overridable from 'DesignSystem/overridable';
import Datetime from 'react-datetime';
import CcError from 'DesignSystem/Display/CcError/CcError';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import CcButton from 'DesignSystem/Display/CcButton/CcButton';
import Interval from 'Logic/Model/Restriction/Interval';
import simpleModels from 'Logic/Model/Manager/SimpleModels';
import ModelDateTime from 'Logic/Model/ModelDateTime';
import Utils from 'Logic/Utils/Utils';

const interfacer = new ObjectInterfacer();

class CcDateTimeEdit extends React.Component {

  #interval = null;

  constructor(props) {
    super(props);
    if (props.restrictions) {
      for (let index = 0; index < props.restrictions.length; index++) {
        if (props.restrictions[index] instanceof Interval) {
          this.#interval = props.restrictions[index];
        }
      }
    }
    this.state = {
      error: null,
      value: this.getInitialValue()
    };
    this.setValue = this.setValue.bind(this);
  }

  componentDidMount() {
    if (Utils.isNil(this.props.value)) {
      this.setValue(this.state.value);
    }
  }

  getInitialValue() {
    if (!Utils.isNil(this.props.value)) {
      return this.props.value;
    }
    let value;
    if (!Utils.isNil(this.props.default)) {
      value = new Date(this.props.default.getTime());
    } else if (this.#interval && this.#interval.getLeftEndPoint() !== null) {
      if (this.#interval.isLeftClosed()) {
        value = new Date(this.#interval.getLeftEndPoint().getTime());
      } else {
        value = new Date(this.#interval.getLeftEndPoint().getTime() + 1000);
      }
    } else if (this.#interval && this.#interval.getRightEndPoint() !== null) {
      if (this.#interval.isRightClosed()) {
        value = new Date(this.#interval.getRightEndPoint().getTime());
      } else {
        value = new Date(this.#interval.getRightEndPoint().getTime() - 1000);
      }
    } else {
      value = '';
    }
    
    return value;
  }

  setValue(moment) {
    let stringDatetime = null;
    try {
      stringDatetime = moment.toISOString();
      const value = simpleModels[ModelDateTime.ID].importValue(stringDatetime, interfacer);
      if (this.props.setValue) {
        this.props.setValue(value, this.props.valueKey);
        this.setState({
          error: null
        });
      }
    } catch (error) {
      this.setState({
        error: stringDatetime === null ? 'Invalid Date' : error
      });
    }
  }

  renderInput(props, openCalendar) {
    return (
      <div style={{display:"flex"}}>
        <input  {...props} style={{'borderTopRightRadius':'0rem', 'borderBottomRightRadius':'0rem'}}/>
        <div style={{display:"flex"}}>
          <CcButton style={{'borderTopLeftRadius':'0rem', 'borderBottomLeftRadius':'0rem'}} onClick={openCalendar}>
            <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM8.5 8.5a.5.5 0 0 0-1 0V10H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V11H10a.5.5 0 0 0 0-1H8.5V8.5z"/>
            </svg>
          </CcButton>
        </div>
      </div>
    );
  }

  render() {
    let local = navigator.language === 'fr' || navigator.language.substr(0, 3) === 'fr-' ? 'fr' : 'en';
    return (
      <span>
        <span style={{display: 'inline-block'}}>
          <Datetime 
            initialValue={this.state.value}
            onChange={this.setValue}
            locale={local} 
            inputProps={ { disabled: true } } 
            renderInput={ this.renderInput }
          />
        </span>
        {this.state.error ? <CcError error={this.state.error}/> : null}
      </span>
    );
  }
}

export default overridable(CcDateTimeEdit, true);
