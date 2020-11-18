import React from 'react';
import 'Page/Details/PageDetails.css';
import PageObject from 'Page/Object/PageObject';
import PageUtils from 'Page/Utils/PageUtils';
import Loading from 'Loading/Loading';

import { withRouter } from "react-router";

class PageDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      model: null,
      error: false
    };
  }

  componentDidMount() {
    PageUtils.getModelWithApiModelName(this.props.match.params.pathModel, false, this.props.onUnauthorized)
    .then(model => {
        if (model === null) {
          this.setState({error: true});
        } else {
          this.setState({model: model});
        }
    });
  }

  render() {
    return (
      <div>
        <h1 className="title">
          {this.props.match.params.pathModel} :
          <span style={{'marginLeft': '15px', color: 'rgba(180, 180, 180)'}}>{this.props.match.params.id}</span>
        </h1>
        {
          this.state.model
          ? <div>
              <PageObject model={this.state.model} id={this.props.match.params.id} onUnauthorized={this.props.onUnauthorized}/>
            </div>
          : (this.state.error ? null : <Loading/>)
        }
      </div>
    );
  }
}

export default  withRouter(PageDetails);
