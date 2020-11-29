import React from 'react';
import './PageObject.css';
import ModelArray from 'Logic/Model/ModelArray';
import Model from 'Logic/Model/Model';
import ObjectInterfacer from 'Logic/Interfacer/ObjectInterfacer';
import Requester from 'Logic/Requester/ComhonRequester';
import ComponentGenerator from 'ComponentGenerator/ComponentGenerator';
import Loading from 'Loading/Loading';
import PageUtils from 'Page/Utils/PageUtils';
import ApiModelNameManager from 'Logic/Model/Manager/ApiModelNameManager';
import ComhonException from 'Logic/Exception/ComhonException';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

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
    let apiModelName = ApiModelNameManager.getApiModelName(this.props.model.getLoadedModel().getName());
    apiModelName = apiModelName ?? this.props.model.getName();
		const xhr = await Requester.get(apiModelName);
    if (xhr.status === 200) {
      return await this.props.model.import(JSON.parse(xhr.responseText), new ObjectInterfacer());
    } else {
      throw new HTTPException(xhr);
    }
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
            ? ComponentGenerator.generate(this.state.object, this.props.model, false, isAggregation, true)
            : (this.state.error ? this.state.error : <Loading />)
        }
      </div>
    );
  }
}

export default PageObject;
