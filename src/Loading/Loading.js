import React from 'react';
import 'Loading/Loading.css';

class Loading extends React.Component {


  render() {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
}

export default Loading;
