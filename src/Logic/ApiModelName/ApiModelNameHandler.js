/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Requester from 'Logic/Requester/ComhonRequester';
import HTTPException from 'Logic/Exception/HTTP/HTTPException';

class ApiModelNameHandler {


  /**
   * @var {Array}
   */
  #apiModels = [];

  /**
   * @var {Object}
   */
  #apiToComhon = {};

  /**
   * @var {Object}
   */
  #comhonToApi = {};



  /**
   * get fully qualified model name according given API model name
   *
   * @param {string} apiModelName API model name
   * @returns {string} fully qualified model name
   */
  getModelName(apiModelName) {
      return  this.#apiToComhon[apiModelName] ? this.#apiToComhon[apiModelName] : null;
  }

  /**
   * get API model name according given fully qualified model name
   *
   * @param {string} modelName fully qualified model name
   * @returns {string} API model name
   */
  getApiModelName(modelName) {
      return  this.#comhonToApi[modelName] ? this.#comhonToApi[modelName] : null;
  }

  /**
   * get list, from server, that contain model names and their API model names
   *
   * @async
   * @param {boolean} allowUnauthorized if false and server response status is 401, an exception is thrown
   * @returns {Array.Object} retrieved manifest
   */
  async getApiModelNames(allowUnauthorized = true) {
    const xhr = await Requester.get('models');
    if (xhr.status === 401) {
      if (!allowUnauthorized) {
        throw new HTTPException(xhr, 'Unauthorized to retrieve models list');
      }
      return this.#apiModels;
    }
    if (xhr.status !== 200) {
      throw new HTTPException(xhr, 'unknown server error when trying retrieve models list');
    }
    this.#apiModels = JSON.parse(xhr.responseText);
    this.#apiToComhon = {};
    this.#comhonToApi = {};
    for (const apiModel of this.#apiModels) {
      if (apiModel.api_model_name) {
        this.#apiToComhon[apiModel.api_model_name] = apiModel.comhon_model_name;
        this.#comhonToApi[apiModel.comhon_model_name] = apiModel.api_model_name;
      } else {
        this.#apiToComhon[apiModel.comhon_model_name] = apiModel.comhon_model_name;
        this.#comhonToApi[apiModel.comhon_model_name] = apiModel.comhon_model_name;
      }
    }
    return this.#apiModels;
  }

}

export default new ApiModelNameHandler();
