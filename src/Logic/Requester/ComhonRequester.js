/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Requester from 'Logic/Requester/Requester';
import ApiModelNameManager from 'Logic/Model/Manager/ApiModelNameManager';
import InterfacerFactory from 'Logic/Interfacer/InterfacerFactory';
import ModelArray from 'Logic/Model/ModelArray';
import Model from 'Logic/Model/Model';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';
import ComhonException from 'Logic/Exception/ComhonException';

class ComhonRequester extends Requester {

  /**
   * load comhon object from server
   *
   * @async
   * @param {ComhonObject} object the object to load (id must be set)
   * @param {string[]} propertiesFilter
	 * @throws {ComhonException}
	 * @throws {HTTPException}
	 * @returns {Promise<boolean>} promise that return true if success
   */
  async loadObject(object, propertiesFilter = null) {
		let success = false;
    if (!object.getModel().hasIdProperties()) {
			throw new ComhonException('Cannot load model without id into file');
		}
		if (!object.hasCompleteId()) {
			throw new ComhonException('Cannot load object, object id is not complete');
		}
    let apiModelName = ApiModelNameManager.getApiModelName(object.getModel().getName());
    apiModelName = apiModelName ?? object.getModel().getName();
    const queryParams = Array.isArray(propertiesFilter)
      ? {'-properties': propertiesFilter}
      : null;
    const xhr = await this.get(apiModelName+'/'+object.getId(), null, null, queryParams);

    if (xhr.status === 200) {
      const interfacer = InterfacerFactory.getInstance(xhr.getResponseHeader('Content-Type'));
      interfacer.setValidate(!Array.isArray(propertiesFilter));
      interfacer.setFlagValuesAsUpdated(false);
      await object.fill(JSON.parse(xhr.responseText), interfacer);
      success = true;
    } else if (xhr.status !== 404) {
      throw new HTTPException(xhr);
    }
		return success;
  }

  /**
   * load comhon object from server
   *
   * @async
   * @param {Model|ModelArray} model
   * @param {string[]} propertiesFilter
	 * @throws {HTTPException}
	 * @returns {Promise<Array.ComhonObject>}
   */
  async loadObjects(model, propertiesFilter = null) {
    let modelArray;
    if (model instanceof ModelArray) {
      modelArray = model;
      model = await model.getModel();
    } else if (model instanceof Model) {
      modelArray = new ModelArray(model, false, model.getShortName(), [], [], false, true);
    }
    if (!(model instanceof Model)) {
			throw new ComhonException(
        'invalid argument 1, it must be instance of Model or instance of ModelArray that contain model instance of Model'
      );
    }
    let apiModelName = ApiModelNameManager.getApiModelName(model.getName());
    apiModelName = apiModelName ?? model.getName();
    const queryParams = {};
    if (Array.isArray(propertiesFilter)) {
      queryParams['-properties'] = propertiesFilter;
    }
		const xhr = await this.get(apiModelName, null, null, queryParams);

    if (xhr.status === 200) {
      const interfacer = InterfacerFactory.getInstance(xhr.getResponseHeader('Content-Type'));
      interfacer.setValidate(!Array.isArray(propertiesFilter));
      interfacer.setFlagValuesAsUpdated(false);
      return await modelArray.import(JSON.parse(xhr.responseText), interfacer);
    } else {
      throw new HTTPException(xhr);
    }
  }

  /**
   * get pettern regex from server
   *
   * @async
   * @param {string} name pattern name
	 * @throws {HTTPException}
	 * @returns {Promise<string>} promise that return regex
   */
  async getPattern(name) {
    const xhr = await this.get('pattern/'+name);
    if (xhr.status !== 200) {
      throw new HTTPException(xhr, `error when trying to retrieve pattern '${name}'`);
    }
    return xhr.responseText;
  }

}

export default new ComhonRequester();
