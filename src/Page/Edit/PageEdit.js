import React from 'react';
import './PageEdit.css';
import PageUtils from 'Page/Utils/PageUtils';
import CcLoading from 'DesignSystem/Display/CcLoading/CcLoading';

import { withRouter } from "react-router";
import ComhonComponentEdit from 'DesignSystem/Edit/ComhonComponentEdit/ComhonComponentEdit';

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
          this.setObject(model);
        }
    });
  }

  async setObject(model) {
    const isRequestable = await model.isRequestable();
    if (!isRequestable) {
      this.setState({
        object: null,
        error: 'model not found or not requestable'
      });
      return;
    }
    try {
      const object = await this.retrieveComhonObject();
      if (object === null) {
        this.setState({
          object: null,
          error: PageUtils.getErrorSentence(404)
        });
      } else {
        this.setState({object: object});
      }
    } catch (error) {
      PageUtils.manageError(error, this.props.onUnauthorized);
    }
  }

  async retrieveComhonObject() {
    let id = this.props.match.params.id;
    if (this.state.model.hasUniqueIdProperty && this.state.model.getUniqueIdProperty().getLoadedModel().castValue) {
      id = this.state.model.getUniqueIdProperty().getLoadedModel().castValue(id);
    }
		return this.state.model.loadObject(id);
  }

  render() {
    return (
      <div>
        <h1 className="title">
          {this.props.match.params.pathModel} :
          <span style={{'marginLeft': '15px', color: 'rgba(180, 180, 180)'}}>{this.props.match.params.id}</span>
        </h1>
        {
          this.state.object
          ? <div>
              <ComhonComponentEdit 
                value={this.state.object} 
                model={this.state.model} 
                isRoot={true}
              />
            </div>
          : (this.state.error ? null : <CcLoading/>)
        }
      </div>
    );
  }
}

export default  withRouter(PageDetails);
