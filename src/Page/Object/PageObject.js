import React from 'react';
import './PageObject.css';
import ModelArray from 'Logic/Model/ModelArray';
import Model from 'Logic/Model/Model';
import Requester from 'Logic/Requester/ComhonRequester';
import ComhonComponent from 'DesignSystem/ComhonComponent/ComhonComponent';
import Loading from 'Loading/Loading';
import PageUtils from 'Page/Utils/PageUtils';
import ComhonException from 'Logic/Exception/ComhonException';

class PageObject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      object: null,
      error: null
    };
  }

  componentDidMount() {
    this.initComponent();
  }

  async initComponent() {
    if (!this.props.model) {
      throw new ComhonException('invalid model');
    }
    const isRequestable = await PageUtils.isRequestable(this.props.model);
    if (isRequestable) {
      this.setObject();
    } else {
      this.setState({
        object: null,
        error: 'model not found or not requestable'
      });
    }
  }

  async setObject() {
    try {
      const object = this.props.model instanceof Model
        ? await this.retrieveComhonObject()
        : await this.retrieveComhonArray();
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

  async retrieveComhonArray() {
		return await Requester.loadObjects(this.props.model);
  }

  async retrieveComhonObject() {
    let id = this.props.id;
    if (this.props.model.hasUniqueIdProperty && this.props.model.getUniqueIdProperty().getLoadedModel().castValue) {
      id = this.props.model.getUniqueIdProperty().getLoadedModel().castValue(id);
    }
		return this.props.model.loadObject(id);
  }

  render() {
    const isAggregation = this.props.model && this.props.model instanceof ModelArray;
    return (
      <div>
        {
          this.state.object !== null
            ? <ComhonComponent value={this.state.object} model={this.props.model} isRoot={true} isAggregation={isAggregation}/>
            : (this.state.error ? this.state.error : <Loading />)
        }
      </div>
    );
  }
}

export default PageObject;
