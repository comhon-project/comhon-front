import ModelManager from 'Logic/Model/Manager/ModelManager';
import ApiModelNameManager from 'Logic/Model/Manager/ApiModelNameManager';
import ModelArray from 'Logic/Model/ModelArray';
import ComhonException from 'Logic/Exception/ComhonException';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

class PageUtils {

  /**
   * get model according givenAPI ModelName
   *
   * @param {string} apiModelName the API model name
   * @param {boolean} collection if true ModelArray is return
   * @param {function} onUnauthorized function to execute on unauthorized request
   *                                  (typically may be a login function)
   */
  async getModelWithApiModelName(apiModelName, collection = false, onUnauthorized = null) {
    try {
      let model;
      let modelName = ApiModelNameManager.getModelName(apiModelName);
      modelName = modelName ?? apiModelName;
      model = await ModelManager.getInstance().getInstanceModel(modelName);
      if (collection) {
        model = new ModelArray(model, false, model.getShortName(), [], [], false, true);
      }
      return model;
    } catch (error) {
      this.manageError(error, onUnauthorized, 'model '+apiModelName);
    }
    return null;
  }

  /**
   * verify if model is requestable.
   * if given model is instance of Model, verify if model is requestable for unique route
   * if given model is instance of ModelArray, verify if model is requestable for collection route
   *
   * @param {Model|ModelArray} model
   */
  async isRequestable(model) {
    let isRequestable = false;
    const uniqueModel = model instanceof ModelArray
      ? model.getLoadedModel() : model;
    const options = await uniqueModel.getOptions();
    const valueName = model instanceof ModelArray ? 'collection' : 'unique';
    const allowedMethods = options.issetValue(valueName) && options.getValue(valueName).issetValue('allowed_methods')
      ? options.getValue(valueName).getValue('allowed_methods')
      : null;

    if (allowedMethods !== null) {
      for (const keyAndValue of allowedMethods) {
        if (keyAndValue[1] === 'GET') {
          isRequestable = true;
          break;
        }
      }
    }
    return isRequestable;
  }

  /**
   * manage error
   *
   * @param {*} error the error to manage
   * @param {function} onUnauthorized function to execute on unauthorized request
   *                                  (typically may be a login function)
   * @param {boolean} sentencePrefix a prefix to concatenate to error sentence
   */
  manageError(error, onUnauthorized = null, sentencePrefix = '') {
    if (error instanceof HTTPException) {
      if (error.getCode() === 401 && onUnauthorized) {
        onUnauthorized();
      } else {
        alert(this.getErrorSentence(error.getCode(), sentencePrefix));
      }
    } else {
      console.log(error);
      if (error instanceof ComhonException) {
        alert(error.getMessage());
      } else {
        alert('unknown server error when trying to retrieve models');
      }
    }
  }

  getErrorSentence(responseStatus, prefix = '', suffix = '') {
    let sentence;
    switch (responseStatus) {
      case 401:
        sentence = 'unauthorized (login and retry)';
        break;
      case 403:
        sentence = 'forbidden';
        break;
      case 404:
        sentence = 'not found';
        break;
      case 405:
        sentence = 'not requestable';
        break;
      default:
        sentence = 'unknown error';
    }
    return `${prefix} ${sentence} ${suffix}`;
  }
}

export default new PageUtils();
