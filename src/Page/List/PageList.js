import React from 'react';
import { withRouter } from "react-router";
import 'Page/List/PageList.css';
import PageObject from 'Page/Object/PageObject';
import PageFilter from 'Page/Filter/PageFilter';
import PageUtils from 'Page/Utils/PageUtils';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';


class PageList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      model: null,
      error: false
    };
  }

  componentDidMount() {
    PageUtils.getModelWithApiModelName(this.props.match.params.pathModel, true, this.props.onUnauthorized)
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
        <h1 className="title">list {this.props.match.params.pathModel}</h1>
        {
          this.state.model
          ? <div>
              <PageFilter model={this.state.model} onUnauthorized={this.props.onUnauthorized}/>
              <PageObject model={this.state.model} onUnauthorized={this.props.onUnauthorized}/>
            </div>
          : (this.state.error ? null : <CcLoading/>)
        }
      </div>
    );
  }
}

export default withRouter(PageList);
