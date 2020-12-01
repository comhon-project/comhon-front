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
import ModelManager from 'Logic/Model/Manager/ModelManager';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';
import ComhonException from 'Logic/Exception/ComhonException';
import UnknownServerException from 'Logic/Exception/HTTP/UnknownServerException';

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
      await object.fill(this._getParsedBodyWithInterfacer(xhr, interfacer), interfacer);
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
      return await modelArray.import(this._getParsedBodyWithInterfacer(xhr, interfacer), interfacer);
    } else {
      throw new HTTPException(xhr);
    }
  }

  /**
   * get parsed body according interfacer
   *
   * @param {XMLHttpRequest} xhr
   * @param {Interfacer} interfacer
	 * @returns {*}
   */
  _getParsedBodyWithInterfacer(xhr, interfacer) {
    if (interfacer.getMediaType() === 'application/xml') {
      return xhr.responseXML.childNodes.item(0);
    }
    return interfacer.fromString(xhr.responseText);
  }

	/**
	 * retrieve manifest from server according model name
	 *
	 * @async
	 * @param {string} modelName
	 * @returns {Promise<*>}
	 */
  async getManifest(modelName) {
		const xhr = await this.get('manifest/'+modelName);

		if (xhr.status !== 200) {
			throw new HTTPException(xhr);
		}
    const interfacer = InterfacerFactory.getInstance(xhr.getResponseHeader('Content-Type'));
		const manifest = this._getParsedBodyWithInterfacer(xhr, interfacer);
		if (manifest === null || typeof manifest !== 'object') {
			throw new ComhonException('invalid manifest from server response');
		}
		return manifest;
  }

  /**
	 * get options related to given model
	 *
	 * @async
	 * @param {string} modelName
	 * @returns {Promise<ComhonObject>} promise that return regex
	 */
  async getModelOptions(modelName) {
    let options = null;
    const optionsModel = await ModelManager.getInstance().getInstanceModel('Comhon\\Options');
    const apiModelName = ApiModelNameManager.getApiModelName(modelName) ?? modelName;
    const [collectionXhr, collectionAllowHeader] = await this._execPathOptionsRequest(apiModelName);

    if (collectionXhr && collectionXhr.status === 200 && collectionXhr.response !== '') {
      const interfacer = InterfacerFactory.getInstance(collectionXhr.getResponseHeader('Content-Type'));
      options = await optionsModel.import(this._getParsedBodyWithInterfacer(collectionXhr, interfacer), interfacer);
    } else {
      // simulate unique request by puting a random id '1'
      const uniqueResult = await this._execPathOptionsRequest(apiModelName+'/1');

      const collectionAllow = collectionAllowHeader === null ? [] : collectionAllowHeader.replace(/\s/g, '').split(',');
  		const uniqueAllow = uniqueResult[1] === null ? [] : uniqueResult[1].replace(/\s/g, '').split(',');

  		options = optionsModel.getObjectInstance(true);
  		options.setValue('name', modelName);
  		const collection = await options.initValue('collection');
  		const collectionAllowed = await collection.initValue('allowed_methods');
  		for (const allow of collectionAllow) {
  			collectionAllowed.pushValue(allow);
  		}
  		const unique = await options.initValue('unique');
  		const uniqueAllowed = await unique.initValue('allowed_methods');
  		for (const allow of uniqueAllow) {
  			uniqueAllowed.pushValue(allow);
  		}
    }
    return options;
  }

  /**
   * execute options request on given path
   *
   * @async
   * @param {string} path
   * @returns {Promise<Array>} first array element is An XMLHttpRequest,
   *                           seconde element is Allow header value (null if no Allow header)
   */
  async _execPathOptionsRequest(path) {
    let xhr, allowHeader = null;
    try {
      xhr = await this.options(path);
      if (xhr.status === 200) {
        allowHeader = xhr.getResponseHeader('Allow');
      } else if (xhr.status !== 404) {
        throw new HTTPException(xhr);
      }
    } catch (e) {
      // UnknownServerException may happened due to CORS that block request OPTIONS
      // that may return 404 (the exact error is not catchable)
      // (if model does't exist or is not requestable, 404 is returned on OPTIONS request)
      if (!(e instanceof UnknownServerException)) {
        throw e;
      }
    }
    return [xhr, allowHeader];
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
