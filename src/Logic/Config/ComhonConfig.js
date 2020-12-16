/*
 * This file is part of the comhon-front package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ComhonException from 'Logic/Exception/ComhonException';
import Requester from 'Logic/Requester/ComhonRequester';

class ComhonConfig {

  #basePathURI = null;


  #apiModelNameHandler = null;

  /**
   * @param {Object} config some configurations
   * @param {string} config.basePathURI the base URI used with ComhonRequest
   */
  initialize(config) {
    if (config.basePathURI) {
      this.#basePathURI = config.basePathURI;
      Requester.registerBasePath(this.#basePathURI);
    }
    if (config.apiModelNameHandler) {
      if (typeof config.apiModelNameHandler.getModelName !== 'function') {
        throw new ComhonException(
          'invalid apiModelNameHandler, it must contain function called "getModelName"'
        );
      }
      if (typeof config.apiModelNameHandler.getApiModelName !== 'function') {
        throw new ComhonException(
          'invalid apiModelNameHandler, it must contain function called "getApiModelName"'
        );
      }
      this.#apiModelNameHandler = config.apiModelNameHandler;
    }
  }

  /**
   * @returns {boolean}
   */
  hasBasePathURI() {
    return this.#basePathURI !== null && this.#basePathURI !== '';
  }

  /**
   * @returns {string|void}
   */
  getBasePathURI() {
    return this.#basePathURI;
  }

  /**
   * @returns {boolean}
   */
  hasApiModelNameHandler() {
    return this.#apiModelNameHandler !== null;
  }

  /**
   * @returns {Object}
   */
  getApiModelNameHandler() {
    return this.#apiModelNameHandler;
  }

}

export default new ComhonConfig();
