import React from 'react';
import Datetime from 'react-datetime';
import "moment/locale/fr";

class DatetimePicker extends React.Component {
  renderInput(props, openCalendar) {
    function clear(){
      props.onChange({target: {value: ''}});
    }
    return (
      <div className="input-group">
        <input className="form-control" {...props} />
        <div className="input-group-append">
          <button className="btn btn-secondary" onClick={openCalendar}>
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-calendar-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM8.5 8.5a.5.5 0 0 0-1 0V10H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V11H10a.5.5 0 0 0 0-1H8.5V8.5z"/>
            </svg>
          </button>
          <button className="btn btn-secondary" onClick={clear}>
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  render() {
    let local = navigator.language === 'fr' || navigator.language.substr(0, 3) === 'fr-' ? 'fr' : 'en';
    return (
      <div style={{width: '300px'}}>
        <Datetime locale={local} inputProps={ { disabled: true } } renderInput={ this.renderInput } />
      </div>
    );
  }
}

export default DatetimePicker;
